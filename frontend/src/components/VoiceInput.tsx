import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Check,
  Edit2,
  X,
  Volume2,
  AlertCircle,
  ArrowRight,
  Clock,
  IndianRupee,
  Footprints,
  MapPin,
  Languages,
  RotateCcw,
} from 'lucide-react';
import { JourneyRequest } from '../types/journey';
import { parseVoiceInput } from '../services/api';

interface VoiceInputProps {
  onApplyJourney: (parsed: Partial<JourneyRequest>, autoOptimize?: boolean) => void;
}

type SpeechLang = 'en-IN' | 'mr-IN' | 'hi-IN';

export const VoiceInput: React.FC<VoiceInputProps> = ({ onApplyJourney }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<SpeechLang>('en-IN');
  const [isManualEditing, setIsManualEditing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    // CRITICAL: continuous = true prevents the browser from automatically cutting off after 2 seconds
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = speechLang;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setErrorMsg(null);
    };

    recognition.onresult = (event: any) => {
      // Clear any pending silence timeout whenever user continues speaking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      let interim = '';
      let final = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const fullText = (final + interim).trim();
      if (fullText) {
        setTranscript(fullText);
        transcriptRef.current = fullText;

        // Auto-finalize if user paused for 3.5 seconds after speaking a meaningful query
        if (fullText.split(/\s+/).length >= 2) {
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              handleStopAndProcess();
            }
          }, 3500);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'no-speech') {
        // Do NOT abort if no-speech fired; user might be about to speak
        return;
      }

      if (event.error === 'not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
        setErrorMsg('Microphone access was blocked. Please grant microphone permission in your browser or type your query.');
      } else if (event.error === 'network') {
        setErrorMsg('Network issue connecting to speech recognition. You can type or use the sample below.');
      }
    };

    recognition.onend = () => {
      // If user was actively listening, check if we captured speech to process
      if (isListeningRef.current) {
        setIsListening(false);
        isListeningRef.current = false;
        if (transcriptRef.current.trim().length >= 3) {
          processTranscript(transcriptRef.current);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognition.stop();
      } catch (e) {
        // ignore cleanup error
      }
    };
  }, [speechLang]);

  const handleStartListening = () => {
    setErrorMsg(null);
    setParsedData(null);
    setTranscript('');
    transcriptRef.current = '';

    if (!isSupported) {
      setErrorMsg('Speech recognition is not supported in this browser. Try Chrome/Edge or type your journey below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
      }
    } catch (e) {
      console.warn('Recognition already active or restart error:', e);
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
          setIsListening(true);
          isListeningRef.current = true;
        }, 150);
      } catch (err) {
        // ignore
      }
    }
  };

  const handleStopAndProcess = async () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isListeningRef.current = false;
    setIsListening(false);

    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }

    const textToProcess = transcriptRef.current || transcript;
    if (textToProcess.trim().length >= 2) {
      await processTranscript(textToProcess);
    } else {
      setErrorMsg('No speech detected. Please speak clearly or click a sample query.');
    }
  };

  const handleUseSample = async (sampleText: string) => {
    setTranscript(sampleText);
    transcriptRef.current = sampleText;
    await processTranscript(sampleText);
  };

  const processTranscript = async (text: string) => {
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const parsed = await parseVoiceInput(text);
      setParsedData(parsed);
    } catch (e) {
      setErrorMsg('Could not parse voice query. Please verify in the form.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAndOptimize = () => {
    if (parsedData) {
      onApplyJourney(
        {
          origin: parsedData.origin,
          destination: parsedData.destination,
          arrival_deadline: parsedData.arrival_deadline,
          max_budget: parsedData.max_budget,
          max_walking_distance_meters: parsedData.max_walking_distance_meters,
          max_transfers: parsedData.max_transfers,
          intent: parsedData.intent,
        },
        true // Trigger immediate optimization
      );
      setParsedData(null);
      setTranscript('');
      transcriptRef.current = '';
    }
  };

  const handleEditFields = () => {
    if (parsedData) {
      onApplyJourney(
        {
          origin: parsedData.origin,
          destination: parsedData.destination,
          arrival_deadline: parsedData.arrival_deadline,
          max_budget: parsedData.max_budget,
          max_walking_distance_meters: parsedData.max_walking_distance_meters,
          max_transfers: parsedData.max_transfers,
          intent: parsedData.intent,
        },
        false // Do not trigger optimize, let user edit in form
      );
      setParsedData(null);
      setTranscript('');
      transcriptRef.current = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Prominent Voice Input Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-md flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-200 dark:ring-rose-900/50'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}
          >
            <Volume2 className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate flex items-center gap-2">
              <span>{isListening ? 'Listening (Speak now)...' : 'Tell RouteWise where you want to go'}</span>
              {isListening && (
                <span className="inline-flex gap-0.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isListening
                ? (transcript || 'Say destination, e.g. "Rabale to Thane by 10:10"')
                : 'Speak naturally in English, Marathi or Hindi'}
            </div>
          </div>
        </div>

        {/* Right Controls: Language Selector & Mic Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Language Toggle Pill */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setSpeechLang('en-IN')}
              className={`px-1.5 py-0.5 rounded ${
                speechLang === 'en-IN'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Indian English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSpeechLang('mr-IN')}
              className={`px-1.5 py-0.5 rounded ${
                speechLang === 'mr-IN'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="मराठी (Marathi)"
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setSpeechLang('hi-IN')}
              className={`px-1.5 py-0.5 rounded ${
                speechLang === 'hi-IN'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="हिंदी (Hindi)"
            >
              हिंदी
            </button>
          </div>

          {/* Big Orange Mic Button */}
          {isListening ? (
            <button
              type="button"
              onClick={handleStopAndProcess}
              className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-md flex items-center justify-center transition-all active:scale-95 animate-pulse"
              title="Done speaking — Process route"
            >
              <MicOff className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartListening}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF4500] hover:from-[#FF6B00] hover:to-[#E63E00] text-white shrink-0 shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Click and speak naturally"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Listening Bubble & Transcript Display */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Recording live audio...
            </span>
            <button
              type="button"
              onClick={handleStopAndProcess}
              className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] hover:bg-blue-700"
            >
              Done Speaking →
            </button>
          </div>
          <p className="text-slate-800 dark:text-slate-100 font-semibold italic bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-blue-100 dark:border-blue-900 min-h-[36px]">
            "{transcript || 'Listening to your voice...'}"
          </p>
        </div>
      )}

      {/* Manual Type / Edit Query Option */}
      {isManualEditing && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Type your journey sentence</span>
            <button
              type="button"
              onClick={() => setIsManualEditing(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                transcriptRef.current = e.target.value;
              }}
              placeholder='e.g. "Rabale to Thane by 10:10 budget 100"'
              className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => processTranscript(transcript)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 hover:bg-blue-700"
            >
              Parse
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsManualEditing(true)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 underline shrink-0"
          >
            Type instead
          </button>
        </div>
      )}

      {/* Parsing Loading State */}
      {isParsing && (
        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Structuring speech constraints into journey fields...</span>
        </div>
      )}

      {/* Confirmation State Box: "Here's what I understood" */}
      {parsedData && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-md space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Understood from Speech
              </h4>
            </div>
            <button
              onClick={() => setParsedData(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Parsed Fields Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">From</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">{parsedData.origin}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">To</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">{parsedData.destination}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Arrive by</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsedData.arrival_deadline}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Budget</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{parsedData.max_budget}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Walking Limit</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {parsedData.max_walking_distance_meters >= 1000
                  ? `${parsedData.max_walking_distance_meters / 1000} km`
                  : `${parsedData.max_walking_distance_meters} m`}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Purpose</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                {parsedData.intent}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleEditFields}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit in Form</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndOptimize}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF4500] hover:from-[#FF5E00] hover:to-[#E63E00] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>Optimize Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
