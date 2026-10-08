import React, { useState } from 'react';
import {
  JourneyRequest,
  JourneyIntent,
  PriorityWeights,
} from '../types/journey';
import {
  MapPin,
  ArrowUpDown,
  Clock,
  IndianRupee,
  Footprints,
  Shuffle,
  Briefcase,
  GraduationCap,
  Plane,
  AlertTriangle,
  Users,
  Wallet,
  Compass,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  Calendar,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface PlanYourJourneyProps {
  request: JourneyRequest;
  onChangeRequest: (req: JourneyRequest) => void;
  onOptimize: (customReq?: JourneyRequest) => void;
  isLoading: boolean;
}

const INTENT_CARDS = [
  { id: 'general' as JourneyIntent, label: 'General', icon: Compass, color: 'text-blue-600 bg-blue-50' },
  { id: 'interview' as JourneyIntent, label: 'Interview', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'exam' as JourneyIntent, label: 'Exam', icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
  { id: 'flight' as JourneyIntent, label: 'Flight', icon: Plane, color: 'text-sky-600 bg-sky-50' },
  { id: 'emergency' as JourneyIntent, label: 'Emergency', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
  { id: 'family' as JourneyIntent, label: 'Family', icon: Users, color: 'text-pink-600 bg-pink-50' },
  { id: 'budget' as JourneyIntent, label: 'Budget', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'custom' as any, label: 'Custom', icon: SlidersHorizontal, color: 'text-slate-600 bg-slate-100' },
];

const WEIGHT_ROWS = [
  { key: 'reliability' as keyof PriorityWeights, label: 'Reliability', defaultVal: 0.3, icon: Shield, accent: 'accent-blue-600' },
  { key: 'time' as keyof PriorityWeights, label: 'Speed', defaultVal: 0.3, icon: Clock, accent: 'accent-indigo-600' },
  { key: 'cost' as keyof PriorityWeights, label: 'Low cost', defaultVal: 0.2, icon: IndianRupee, accent: 'accent-emerald-600' },
  { key: 'walking' as keyof PriorityWeights, label: 'Less walking', defaultVal: 0.1, icon: Footprints, accent: 'accent-orange-500' },
  { key: 'comfort' as keyof PriorityWeights, label: 'Fewer transfers', defaultVal: 0.1, icon: Shuffle, accent: 'accent-purple-600' },
];

export const PlanYourJourney: React.FC<PlanYourJourneyProps> = ({
  request,
  onChangeRequest,
  onOptimize,
  isLoading,
}) => {
  const [showPriorities, setShowPriorities] = useState(false);

  const handleSwap = () => {
    onChangeRequest({
      ...request,
      origin: request.destination,
      destination: request.origin,
    });
  };

  const handleSlider = (key: keyof PriorityWeights, val: number) => {
    onChangeRequest({
      ...request,
      weights: { ...request.weights, [key]: val / 100 },
    });
  };

  const handleResetPriorities = () => {
    onChangeRequest({
      ...request,
      weights: { reliability: 0.30, time: 0.30, cost: 0.20, walking: 0.10, comfort: 0.10 },
    });
  };

  const handleVoiceApply = (parsed: Partial<JourneyRequest>, autoOptimize?: boolean) => {
    const updated = { ...request, ...parsed };
    onChangeRequest(updated);
    if (autoOptimize) {
      onOptimize(updated);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <h2 className="font-heading text-lg font-black text-slate-900 tracking-tight">Plan your journey</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Find the best way to reach based on your time, budget and real-time conditions.
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Voice Input */}
        <VoiceInput onApplyJourney={handleVoiceApply} />

        {/* Origin & Destination */}
        <div className="space-y-1 relative">
          {/* From */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 fill-emerald-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight tracking-wide">From</span>
              <input
                type="text"
                value={request.origin}
                onChange={(e) => onChangeRequest({ ...request, origin: e.target.value })}
                placeholder="Origin"
                className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
            {request.origin && (
              <button onClick={() => onChangeRequest({ ...request, origin: '' })} className="p-0.5 text-slate-300 hover:text-slate-500 rounded shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Swap */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* To */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 fill-rose-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight tracking-wide">To</span>
              <input
                type="text"
                value={request.destination}
                onChange={(e) => onChangeRequest({ ...request, destination: e.target.value })}
                placeholder="Destination"
                className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
            {request.destination && (
              <button onClick={() => onChangeRequest({ ...request, destination: '' })} className="p-0.5 text-slate-300 hover:text-slate-500 rounded shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Constraint Pills — 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Arrive by */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase text-slate-400 leading-tight block tracking-wide">Arrive by</span>
              <input
                type="text"
                value={request.arrival_deadline || '10:10 AM'}
                onChange={(e) => onChangeRequest({ ...request, arrival_deadline: e.target.value })}
                className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none w-full"
                placeholder="10:10 AM"
              />
            </div>
          </div>

          {/* Max budget */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase text-slate-400 leading-tight block tracking-wide">Budget</span>
              <div className="flex items-center">
                <span className="text-xs text-slate-400 font-bold mr-0.5">₹</span>
                <input
                  type="number"
                  min="100" max="10000" step="50"
                  value={request.max_budget}
                  onChange={(e) => onChangeRequest({ ...request, max_budget: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Max walking */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <Footprints className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase text-slate-400 leading-tight block tracking-wide">Walking</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="100" max="5000" step="100"
                  value={request.max_walking_distance_meters}
                  onChange={(e) => onChangeRequest({ ...request, max_walking_distance_meters: Math.max(100, parseInt(e.target.value) || 100) })}
                  className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none w-full"
                />
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {request.max_walking_distance_meters >= 1000 ? `${(request.max_walking_distance_meters / 1000).toFixed(1)}km` : 'm'}
                </span>
              </div>
            </div>
          </div>

          {/* Transfers */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 transition-all">
            <Shuffle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold uppercase text-slate-400 leading-tight block tracking-wide">Transfers</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{request.max_transfers} max</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onChangeRequest({ ...request, max_transfers: Math.max(0, request.max_transfers - 1) })}
                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-black transition-colors"
                  >-</button>
                  <button
                    type="button"
                    onClick={() => onChangeRequest({ ...request, max_transfers: request.max_transfers + 1 })}
                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-black transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Purpose — compact icon row */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Travel purpose</span>
          <div className="grid grid-cols-4 gap-1.5">
            {INTENT_CARDS.map((item) => {
              const isSelected = request.intent === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeRequest({ ...request, intent: item.id as JourneyIntent })}
                  title={item.label}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-blue-400 bg-blue-50 shadow-sm ring-1 ring-blue-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? item.color : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Weights — collapsed by default */}
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPriorities(!showPriorities)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wide transition-colors"
            >
              {showPriorities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Priority weights
            </button>
            {showPriorities && (
              <button
                type="button"
                onClick={handleResetPriorities}
                className="text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {showPriorities && (
            <div className="mt-2.5 space-y-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
              {WEIGHT_ROWS.map(({ key, label, defaultVal, icon: Icon, accent }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium w-24 shrink-0 truncate">{label}</span>
                  <input
                    type="range"
                    min="0" max="100" step="5"
                    value={Math.round((request.weights[key] ?? defaultVal) * 100)}
                    onChange={(e) => handleSlider(key, Number(e.target.value))}
                    className={`flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer ${accent}`}
                  />
                  <span className="w-7 text-right font-bold text-slate-700 text-[11px] shrink-0">
                    {Math.round((request.weights[key] ?? defaultVal) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optimize Button */}
        <button
          type="button"
          onClick={() => onOptimize()}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF5500] hover:from-[#FF8A33] hover:to-[#FF6600] text-white font-heading font-black text-sm shadow-md shadow-orange-500/30 transition-all hover:shadow-lg hover:shadow-orange-500/40 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Optimize Journey</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          Analyses routes using live maps, search &amp; news data.
        </p>
      </div>
    </div>
  );
};
