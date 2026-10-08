import React, { useState, useEffect } from 'react';
import {
  JourneyRequest,
  JourneyIntent,
  PriorityWeights,
} from '../types/journey';
import {
  Sparkles,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  Footprints,
  IndianRupee,
  Shuffle,
  Briefcase,
  Building,
  GraduationCap,
  Plane,
  AlertTriangle,
  Users,
  SlidersHorizontal,
  X,
  LocateFixed,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { getUserCurrentLocation, DetectedLocation } from '../services/geolocation';

interface PlanYourJourneyProps {
  request: JourneyRequest;
  onChangeRequest: (req: JourneyRequest) => void;
  onOptimize: (customReq?: JourneyRequest) => void;
  isLoading: boolean;
}

const PURPOSE_ITEMS = [
  { id: 'general' as JourneyIntent, label: 'General', icon: Briefcase },
  { id: 'interview' as JourneyIntent, label: 'Interview', icon: Building },
  { id: 'exam' as JourneyIntent, label: 'Exam', icon: GraduationCap },
  { id: 'flight' as JourneyIntent, label: 'Flight', icon: Plane },
  { id: 'emergency' as JourneyIntent, label: 'Emergency', icon: AlertTriangle },
  { id: 'family' as JourneyIntent, label: 'Family', icon: Users },
  { id: 'budget' as JourneyIntent, label: 'Budget', icon: IndianRupee },
  { id: 'custom' as any, label: 'Custom', icon: SlidersHorizontal },
];

export const PlanYourJourney: React.FC<PlanYourJourneyProps> = ({
  request,
  onChangeRequest,
  onOptimize,
  isLoading,
}) => {
  const [showPriorities, setShowPriorities] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);

  // Editable text states to allow free typing (including 4, 5, etc.) without getting stuck
  const [walkingText, setWalkingText] = useState(String(request.max_walking_distance_meters));
  const [budgetText, setBudgetText] = useState(String(Math.round(request.max_budget)));
  const [transfersText, setTransfersText] = useState(String(request.max_transfers));

  useEffect(() => {
    const currentNum = parseInt(walkingText, 10);
    if (!isNaN(currentNum) && currentNum === request.max_walking_distance_meters) {
      return;
    }
    setWalkingText(String(request.max_walking_distance_meters));
  }, [request.max_walking_distance_meters]);

  useEffect(() => {
    const currentNum = parseFloat(budgetText);
    if (!isNaN(currentNum) && currentNum === request.max_budget) {
      return;
    }
    setBudgetText(String(Math.round(request.max_budget)));
  }, [request.max_budget]);

  useEffect(() => {
    const currentNum = parseInt(transfersText, 10);
    if (!isNaN(currentNum) && currentNum === request.max_transfers) {
      return;
    }
    setTransfersText(String(request.max_transfers));
  }, [request.max_transfers]);

  const handleWalkingChange = (val: string) => {
    setWalkingText(val);
    if (val.trim() === '') return;
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeRequest({ ...request, max_walking_distance_meters: parsed });
    }
  };

  const handleWalkingBlur = () => {
    const parsed = parseInt(walkingText, 10);
    if (isNaN(parsed) || parsed < 0) {
      const fallback = request.max_walking_distance_meters || 500;
      setWalkingText(String(fallback));
      onChangeRequest({ ...request, max_walking_distance_meters: fallback });
    } else {
      setWalkingText(String(parsed));
    }
  };

  const handleWalkingDec = () => {
    const curr = parseInt(walkingText, 10) || 0;
    const step = curr <= 10 ? 1 : curr <= 100 ? 10 : 100;
    const nextVal = Math.max(0, curr - step);
    setWalkingText(String(nextVal));
    onChangeRequest({ ...request, max_walking_distance_meters: nextVal });
  };

  const handleWalkingInc = () => {
    const curr = parseInt(walkingText, 10) || 0;
    const step = curr < 10 ? 1 : curr < 100 ? 10 : 100;
    const nextVal = curr + step;
    setWalkingText(String(nextVal));
    onChangeRequest({ ...request, max_walking_distance_meters: nextVal });
  };

  const handleBudgetChange = (val: string) => {
    setBudgetText(val);
    if (val.trim() === '') return;
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeRequest({ ...request, max_budget: parsed });
    }
  };

  const handleBudgetBlur = () => {
    const parsed = parseFloat(budgetText);
    if (isNaN(parsed) || parsed < 0) {
      const fallback = Math.round(request.max_budget) || 10;
      setBudgetText(String(fallback));
      onChangeRequest({ ...request, max_budget: fallback });
    } else {
      setBudgetText(String(Math.round(parsed)));
    }
  };

  const handleBudgetDec = () => {
    const curr = parseFloat(budgetText) || 0;
    const step = curr <= 10 ? 1 : 10;
    const nextVal = Math.max(0, curr - step);
    setBudgetText(String(nextVal));
    onChangeRequest({ ...request, max_budget: nextVal });
  };

  const handleBudgetInc = () => {
    const curr = parseFloat(budgetText) || 0;
    const step = curr < 10 ? 1 : 10;
    const nextVal = curr + step;
    setBudgetText(String(nextVal));
    onChangeRequest({ ...request, max_budget: nextVal });
  };

  const handleTransfersChange = (val: string) => {
    setTransfersText(val);
    if (val.trim() === '') return;
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChangeRequest({ ...request, max_transfers: parsed });
    }
  };

  const handleTransfersBlur = () => {
    const parsed = parseInt(transfersText, 10);
    if (isNaN(parsed) || parsed < 0) {
      const fallback = request.max_transfers ?? 2;
      setTransfersText(String(fallback));
      onChangeRequest({ ...request, max_transfers: fallback });
    } else {
      setTransfersText(String(parsed));
    }
  };

  const handleTransfersDec = () => {
    const curr = parseInt(transfersText, 10) || 0;
    const nextVal = Math.max(0, curr - 1);
    setTransfersText(String(nextVal));
    onChangeRequest({ ...request, max_transfers: nextVal });
  };

  const handleTransfersInc = () => {
    const curr = parseInt(transfersText, 10) || 0;
    const nextVal = curr + 1;
    setTransfersText(String(nextVal));
    onChangeRequest({ ...request, max_transfers: nextVal });
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await getUserCurrentLocation();
      setDetectedLocation(loc);
      const updated = {
        ...request,
        origin: loc.name,
      };
      onChangeRequest(updated);
      onOptimize(updated);
    } catch (err) {
      console.error('Failed to detect current location:', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSwap = () => {
    onChangeRequest({
      ...request,
      origin: request.destination,
      destination: request.origin,
    });
  };

  const handleVoiceApply = (parsed: Partial<JourneyRequest>, autoOptimize?: boolean) => {
    const updated = { ...request, ...parsed };
    onChangeRequest(updated);
    if (autoOptimize) {
      onOptimize(updated);
    }
  };

  const handleSlider = (key: keyof PriorityWeights, val: number) => {
    onChangeRequest({
      ...request,
      weights: { ...request.weights, [key]: val / 100 },
    });
  };

  return (
    <div className="bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 pb-5 transition-colors duration-200">
      {/* Top Blue Hero Card matching Screenshot */}
      <div className="bg-gradient-to-br from-[#0A1B3A] via-[#102752] to-[#193A72] p-5 text-white space-y-4 relative overflow-hidden">
        {/* Subtle decorative background stars */}
        <div className="absolute top-2 right-4 text-blue-300/30 text-lg select-none">✦</div>
        <div className="absolute bottom-6 right-16 text-blue-300/20 text-sm select-none">★</div>
        
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="font-heading text-lg font-black text-white tracking-tight">
              Plan Your Journey
            </h2>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Find the best way to travel based on your time, budget and real-time conditions.
          </p>
        </div>

        {/* Voice Assistant Box */}
        <VoiceInput onApplyJourney={handleVoiceApply} />
      </div>

      {/* Main Form Fields Container */}
      <div className="px-5 space-y-4">
        {/* From / To Inputs with Right Swap Button */}
        <div className="relative space-y-2">
          {/* From Input */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-400 block leading-tight">From</span>
              <input
                type="text"
                value={request.origin}
                onChange={(e) => onChangeRequest({ ...request, origin: e.target.value })}
                placeholder="Origin address or station"
                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none truncate"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* GPS Live Locate Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  isLocating
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:scale-105 active:scale-95'
                }`}
                title="Use current location (GPS / Network)"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
              </button>
              {request.origin && (
                <button
                  type="button"
                  onClick={() => onChangeRequest({ ...request, origin: '' })}
                  className="text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 p-0.5"
                  title="Clear origin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Live Detected Location Badge */}
          {detectedLocation && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                Detected live position: <strong>{detectedLocation.name}</strong> ({detectedLocation.source.toUpperCase()})
              </span>
            </div>
          )}

          {/* Swap Button on Right side */}
          <button
            type="button"
            onClick={handleSwap}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* To Input */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
            <div className="w-5 h-5 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-400 block leading-tight">To</span>
              <input
                type="text"
                value={request.destination}
                onChange={(e) => onChangeRequest({ ...request, destination: e.target.value })}
                placeholder="Destination address or college"
                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none truncate"
              />
            </div>
            {request.destination && (
              <button
                type="button"
                onClick={() => onChangeRequest({ ...request, destination: '' })}
                className="text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 p-0.5"
                title="Clear destination"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date & Time Picker Card */}
        <div className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 block leading-tight">Date & Time</span>
              {isEditingTime ? (
                <input
                  type="text"
                  autoFocus
                  onBlur={() => setIsEditingTime(false)}
                  value={request.arrival_deadline || '10:10 AM'}
                  onChange={(e) => onChangeRequest({ ...request, arrival_deadline: e.target.value })}
                  className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-blue-400 focus:outline-none w-28"
                />
              ) : (
                <span
                  onClick={() => setIsEditingTime(true)}
                  className="text-xs font-extrabold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Today, {request.arrival_deadline || '10:10 AM'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditingTime(!isEditingTime)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Constraints Grid (Walking Limit, Budget, Transfers) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Walking Limit with Direct Edit & Stepper */}
          <div className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/70 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Footprints className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-400 block leading-tight">Walking Limit</span>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={walkingText}
                    onChange={(e) => handleWalkingChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onFocus={(e) => e.target.select()}
                    onBlur={handleWalkingBlur}
                    className="text-xs font-black text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 border border-slate-200/80 dark:border-slate-600 rounded px-1.5 py-0.5 w-14 text-center focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
                    title="Type any walking limit (e.g. 4, 5, 500, 1000)"
                  />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">m</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleWalkingDec}
                    className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                    title="Decrease walking limit"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={handleWalkingInc}
                    className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                    title="Increase walking limit"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Budget with Direct Edit & Stepper */}
          <div className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/70 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-slate-400 block leading-tight">Budget</span>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={budgetText}
                    onChange={(e) => handleBudgetChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onFocus={(e) => e.target.select()}
                    onBlur={handleBudgetBlur}
                    className="text-xs font-black text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 border border-slate-200/80 dark:border-slate-600 rounded px-1.5 py-0.5 w-14 text-center focus:outline-none focus:ring-1.5 focus:ring-emerald-500 transition-colors"
                    title="Type any budget (e.g. 4, 5, 30, 100)"
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleBudgetDec}
                    className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                    title="Decrease budget"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={handleBudgetInc}
                    className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                    title="Increase budget"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transfers with Direct Edit & Stepper (Full Width matching screenshot) */}
          <div className="col-span-2 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Shuffle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block leading-tight">Transfers</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={transfersText}
                    onChange={(e) => handleTransfersChange(e.target.value.replace(/[^0-9]/g, ''))}
                    onFocus={(e) => e.target.select()}
                    onBlur={handleTransfersBlur}
                    className="text-xs font-black text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-700 border border-slate-200/80 dark:border-slate-600 rounded px-1.5 py-0.5 w-10 text-center focus:outline-none focus:ring-1.5 focus:ring-purple-500 transition-colors"
                    title="Type max transfers (e.g. 0, 1, 2, 3)"
                  />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">max</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleTransfersDec}
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                title="Decrease transfers by 1"
              >
                -
              </button>
              <button
                type="button"
                onClick={handleTransfersInc}
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                title="Increase transfers by 1"
              >
                +
              </button>
            </div>
          </div>
        </div>

      {/* Travel Purpose (2x4 Grid) */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider block">
          Travel Purpose
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {PURPOSE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = request.intent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeRequest({ ...request, intent: item.id })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="text-[10px] truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Weights Collapsible */}
      <div className="border border-slate-200/80 dark:border-slate-700 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPriorities(!showPriorities)}
          className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Priority Weights</span>
          </div>
          {showPriorities ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showPriorities && (
          <div className="p-3.5 space-y-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Reliability</span>
                <span>{Math.round(request.weights.reliability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(request.weights.reliability * 100)}
                onChange={(e) => handleSlider('reliability', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Speed</span>
                <span>{Math.round(request.weights.time * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(request.weights.time * 100)}
                onChange={(e) => handleSlider('time', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Budget</span>
                <span>{Math.round(request.weights.cost * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(request.weights.cost * 100)}
                onChange={(e) => handleSlider('cost', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        )}
      </div>

        {/* Big Orange CTA Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onOptimize()}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#FF4500] hover:from-[#FF5E00] hover:to-[#E63E00] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isLoading ? 'Optimizing Routes...' : 'Optimize Journey →'}</span>
        </button>
      </div>
    </div>
  );
};
