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
} from 'lucide-react';

interface PlanYourJourneyProps {
  request: JourneyRequest;
  onChangeRequest: (req: JourneyRequest) => void;
  onOptimize: () => void;
  isLoading: boolean;
}

const INTENT_CONFIG = [
  { id: 'interview' as JourneyIntent, label: 'Interview', icon: Briefcase, desc: 'Prioritizes reliability and safe arrival with a comfortable buffer.' },
  { id: 'exam' as JourneyIntent, label: 'Exam', icon: GraduationCap, desc: 'Maximum arrival safety buffer with minimal transfer stress.' },
  { id: 'flight' as JourneyIntent, label: 'Flight', icon: Plane, desc: 'Zero transfer risk and generous airport lead times.' },
  { id: 'emergency' as JourneyIntent, label: 'Emergency', icon: AlertTriangle, desc: 'Fastest possible arrival with maximum time weighting.' },
  { id: 'family' as JourneyIntent, label: 'Family', icon: Users, desc: 'Comfort-first journey with low walking and low transfers.' },
  { id: 'budget' as JourneyIntent, label: 'Budget', icon: Wallet, desc: 'Lowest total fare prioritizing economical transit.' },
  { id: 'general' as JourneyIntent, label: 'General', icon: Compass, desc: 'Balanced trade-off between time, cost, and reliability.' },
];

export const PlanYourJourney: React.FC<PlanYourJourneyProps> = ({
  request,
  onChangeRequest,
  onOptimize,
  isLoading,
}) => {
  const [showPriorities, setShowPriorities] = useState(true);

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
      weights: {
        ...request.weights,
        [key]: val / 100,
      },
    });
  };

  const currentIntentObj = INTENT_CONFIG.find((i) => i.id === request.intent) || INTENT_CONFIG[0];
  const CurrentIntentIcon = currentIntentObj.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-black text-slate-900 tracking-tight">
          Plan your journey
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Find the best way to reach based on your time, budget and real-time conditions.
        </p>
      </div>

      {/* Origin & Destination Inputs Box */}
      <div className="space-y-2 relative">
        {/* From Input */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 fill-emerald-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">From</span>
              <input
                type="text"
                value={request.origin}
                onChange={(e) => onChangeRequest({ ...request, origin: e.target.value })}
                placeholder="Origin address or station"
                className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>
          {request.origin && (
            <button
              onClick={() => onChangeRequest({ ...request, origin: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap locations"
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* To Input */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 fill-rose-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">To</span>
              <input
                type="text"
                value={request.destination}
                onChange={(e) => onChangeRequest({ ...request, destination: e.target.value })}
                placeholder="Destination address or office"
                className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>
          {request.destination && (
            <button
              onClick={() => onChangeRequest({ ...request, destination: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Constraint Cards in a Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Arrive by */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Arrive by</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={request.arrival_deadline || '10:10 AM'}
              onChange={(e) => onChangeRequest({ ...request, arrival_deadline: e.target.value })}
              className="text-xs font-extrabold text-slate-900 w-full bg-transparent focus:outline-none"
            />
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Max budget */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Max budget</span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">
            ₹{request.max_budget.toLocaleString()}
          </div>
        </div>

        {/* Max walking */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
            <Footprints className="w-3.5 h-3.5" />
            <span>Max walking</span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">
            {request.max_walking_distance_meters >= 1000
              ? `${(request.max_walking_distance_meters / 1000).toFixed(0)} km`
              : `${request.max_walking_distance_meters} m`}
          </div>
        </div>

        {/* Max transfers */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
            <Shuffle className="w-3.5 h-3.5" />
            <span>Max transfers</span>
          </div>
          <div className="text-xs font-extrabold text-slate-900">
            {request.max_transfers}
          </div>
        </div>
      </div>

      {/* Travel purpose Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-800 block">
          Travel purpose
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {INTENT_CONFIG.map((item) => {
            const isSelected = request.intent === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeRequest({ ...request, intent: item.id })}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Purpose Description Pill */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <CurrentIntentIcon className="w-3 h-3" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-blue-900 block leading-tight">
              {currentIntentObj.label} Mode
            </span>
            <span className="text-[11px] text-blue-800 leading-snug mt-0.5 block">
              {currentIntentObj.desc}
            </span>
          </div>
        </div>
      </div>

      {/* Customize priorities (optional) */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => setShowPriorities(!showPriorities)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          {showPriorities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>Customize priorities (optional)</span>
        </button>

        {showPriorities && (
          <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
            {/* Reliability */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-[170px] text-slate-700 font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Reliability <span className="text-[10px] text-slate-400">(Avoid delays)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.reliability || 0.4) * 100)}
                onChange={(e) => handleSlider('reliability', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-9 text-right font-bold text-slate-800 text-xs">
                {Math.round((request.weights.reliability || 0.4) * 100)}%
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-[170px] text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Time <span className="text-[10px] text-slate-400">(Faster routes)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.time || 0.3) * 100)}
                onChange={(e) => handleSlider('time', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-9 text-right font-bold text-slate-800 text-xs">
                {Math.round((request.weights.time || 0.3) * 100)}%
              </span>
            </div>

            {/* Cost */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-[170px] text-slate-700 font-medium">
                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <span>Cost <span className="text-[10px] text-slate-400">(Lower cost)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.cost || 0.2) * 100)}
                onChange={(e) => handleSlider('cost', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-9 text-right font-bold text-slate-800 text-xs">
                {Math.round((request.weights.cost || 0.2) * 100)}%
              </span>
            </div>

            {/* Less walking */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-[170px] text-slate-700 font-medium">
                <Footprints className="w-3.5 h-3.5 text-slate-500" />
                <span>Less walking</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.walking || 0.1) * 100)}
                onChange={(e) => handleSlider('walking', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-9 text-right font-bold text-slate-800 text-xs">
                {Math.round((request.weights.walking || 0.1) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Big Orange Optimize Button */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onOptimize}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF5500] hover:from-[#FF8A33] hover:to-[#FF6600] text-white font-heading font-black text-base shadow-md shadow-orange-500/25 transition-all hover:shadow-lg hover:shadow-orange-500/35 active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Evaluating Constraints...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Optimize Journey</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Powered by live Google Maps, Search and News intelligence
        </p>
      </div>
    </div>
  );
};
