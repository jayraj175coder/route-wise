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
} from 'lucide-react';
import { JourneyRequest } from '../types/journey';
import { parseVoiceInput } from '../services/api';

interface VoiceInputProps {
  onApplyJourney: (parsed: Partial<JourneyRequest>, autoOptimize?: boolean) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onApplyJourney }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English tailored for Mumbai/Pune locales

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access blocked. Click a sample query below to test voice parsing.');
      } else {
        setErrorMsg('Could not detect speech clearly. Try speaking again or use a sample.');
      }
    };

    recognition.onend = async () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleStartListening = () => {
    setErrorMsg(null);
    setParsedData(null);
    if (!isSupported) {
      setErrorMsg('Speech recognition is not supported in this browser. Try the sample speech query below.');
      return;
    }
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn('Recognition already started or error', e);
    }
  };

  const handleStopListening = async () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    if (transcript.trim().length > 3) {
      await processTranscript(transcript);
    }
  };

  const handleUseSample = async (sampleText: string) => {
    setTranscript(sampleText);
    await processTranscript(sampleText);
  };

  const processTranscript = async (text: string) => {
    setIsParsing(true);
    try {
      const parsed = await parseVoiceInput(text);
      setParsedData(parsed);
    } catch (e) {
      setErrorMsg('Error parsing voice query. Please try typing.');
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
    }
  };

  return (
    <div className="space-y-3">
      {/* Prominent Voice Input Card Matching Screenshot */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-md flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}
          >
            <Volume2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
              {isListening ? 'Listening to your journey...' : 'Tell RouteWise where you want to go'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isListening
                ? (transcript || 'Say destination, time & budget...')
                : 'Speak naturally in English or Marathi'}
            </div>
          </div>
        </div>

        {/* Orange Circular Mic Button */}
        {isListening ? (
          <button
            type="button"
            onClick={handleStopListening}
            className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-md flex items-center justify-center transition-all active:scale-95"
            title="Stop listening"
          >
            <MicOff className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartListening}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF4500] hover:from-[#FF6B00] hover:to-[#E63E00] text-white shrink-0 shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Speak your journey"
          >
            <Mic className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Quick Test Samples */}
      {!parsedData && !isListening && (
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
          <span className="text-slate-400 font-medium text-[10px] uppercase shrink-0">Sample:</span>
          <button
            type="button"
            onClick={() =>
              handleUseSample(
                'I need to go from Dadar to Hinjawadi Pune tomorrow morning. I have an interview at 10:30, my budget is 1500 rupees and I do not want to walk more than one kilometer.'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition-colors"
          >
            "Dadar to Hinjawadi for 10:30 interview, budget ₹1500, walk ≤1km"
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parsing Loading State */}
      {isParsing && (
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-800">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Structuring speech constraints into journey fields...</span>
        </div>
      )}

      {/* Confirmation State Modal/Box: "Here's what I understood" */}
      {parsedData && (
        <div className="p-4 rounded-2xl bg-white border-2 border-blue-500 shadow-md space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Here’s what I understood
              </h4>
            </div>
            <button
              onClick={() => setParsedData(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Parsed Fields Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">From</span>
              <span className="font-bold text-slate-900 truncate block">{parsedData.origin}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">To</span>
              <span className="font-bold text-slate-900 truncate block">{parsedData.destination}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">Arrive by</span>
              <span className="font-bold text-slate-900">{parsedData.arrival_deadline}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">Budget</span>
              <span className="font-bold text-emerald-600">₹{parsedData.max_budget}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">Walking Limit</span>
              <span className="font-bold text-slate-900">
                {parsedData.max_walking_distance_meters >= 1000
                  ? `${parsedData.max_walking_distance_meters / 1000} km`
                  : `${parsedData.max_walking_distance_meters} m`}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold block">Detected Purpose</span>
              <span className="font-bold text-blue-600 capitalize">
                {parsedData.intent} mode {parsedData.intent_detected && 'suggested'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleEditFields}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit in Form</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndOptimize}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
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
