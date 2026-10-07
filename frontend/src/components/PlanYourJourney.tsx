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
  Layers,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface PlanYourJourneyProps {
  request: JourneyRequest;
  onChangeRequest: (req: JourneyRequest) => void;
  onOptimize: () => void;
  isLoading: boolean;
}

const INTENT_CARDS = [
  { id: 'general' as JourneyIntent, label: 'General', desc: 'Balanced time, cost & comfort', icon: Compass },
  { id: 'interview' as JourneyIntent, label: 'Interview', desc: 'Reliable & safe arrival', icon: Briefcase },
  { id: 'exam' as JourneyIntent, label: 'Exam', desc: 'On-time with buffer', icon: GraduationCap },
  { id: 'flight' as JourneyIntent, label: 'Flight', desc: 'Minimize transfer risk', icon: Plane },
  { id: 'emergency' as JourneyIntent, label: 'Emergency', desc: 'Fastest feasible route', icon: AlertTriangle },
  { id: 'family' as JourneyIntent, label: 'Family', desc: 'Comfortable for everyone', icon: Users },
  { id: 'budget' as JourneyIntent, label: 'Budget', desc: 'Lowest cost journey', icon: Wallet },
  { id: 'custom' as any, label: 'Custom', desc: 'Set your own priorities', icon: SlidersHorizontal },
];

export const PlanYourJourney: React.FC<PlanYourJourneyProps> = ({
  request,
  onChangeRequest,
  onOptimize,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'results' | 'about'>('plan');
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

  const handleResetPriorities = () => {
    onChangeRequest({
      ...request,
      weights: {
        reliability: 0.30,
        time: 0.30,
        cost: 0.20,
        walking: 0.10,
        comfort: 0.10,
      },
    });
  };

  const handleVoiceApply = (parsed: Partial<JourneyRequest>, autoOptimize?: boolean) => {
    const updated = {
      ...request,
      ...parsed,
    };
    onChangeRequest(updated);
    if (autoOptimize) {
      setTimeout(() => onOptimize(), 100);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      {/* 1. Top Panel Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'plan'
              ? 'text-[#FF7A1A] bg-orange-50/80 border border-orange-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Plan Journey</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'results'
              ? 'text-[#FF7A1A] bg-orange-50/80 border border-orange-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Results</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'about'
              ? 'text-[#FF7A1A] bg-orange-50/80 border border-orange-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>About</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="font-heading text-xl font-black text-slate-900 tracking-tight">
          Where do you want to go?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Find the best journey based on time, budget and real-time conditions.
        </p>
      </div>

      {/* 2. Interactive Voice Input Section */}
      <VoiceInput onApplyJourney={handleVoiceApply} />

      {/* 3. Origin & Destination Inputs Box */}
      <div className="space-y-1.5 relative">
        {/* From Input */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 fill-emerald-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">From</span>
              <input
                type="text"
                value={request.origin}
                onChange={(e) => onChangeRequest({ ...request, origin: e.target.value })}
                placeholder="Origin address or station"
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>
          {request.origin && (
            <button
              onClick={() => onChangeRequest({ ...request, origin: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Clear origin"
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
            className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* To Input */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 fill-rose-500 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">To</span>
              <input
                type="text"
                value={request.destination}
                onChange={(e) => onChangeRequest({ ...request, destination: e.target.value })}
                placeholder="Destination address or office"
                className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none truncate"
              />
            </div>
          </div>
          {request.destination && (
            <button
              onClick={() => onChangeRequest({ ...request, destination: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Clear destination"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. FOUR FULLY EDITABLE CONSTRAINT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Card 1: Arrive by (Fully Editable) */}
        <div className="p-2 rounded-xl border border-slate-200 bg-white space-y-0.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>Arrive by</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={request.arrival_deadline || '10:10 AM'}
              onChange={(e) => onChangeRequest({ ...request, arrival_deadline: e.target.value })}
              className="text-xs font-black text-slate-900 w-full bg-transparent focus:outline-none"
              placeholder="e.g. 10:10 AM"
            />
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Card 2: Max budget (Fully Editable Number Input) */}
        <div className="p-2 rounded-xl border border-slate-200 bg-white space-y-0.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
            <IndianRupee className="w-3 h-3 text-emerald-500" />
            <span>Max budget</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-black text-slate-400 mr-0.5">₹</span>
            <input
              type="number"
              min="100"
              max="10000"
              step="50"
              value={request.max_budget}
              onChange={(e) =>
                onChangeRequest({ ...request, max_budget: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              className="text-xs font-black text-slate-900 w-full bg-transparent focus:outline-none"
              placeholder="1500"
            />
          </div>
        </div>

        {/* Card 3: Max walking (Fully Editable Number in meters/km) */}
        <div className="p-2 rounded-xl border border-slate-200 bg-white space-y-0.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
            <Footprints className="w-3 h-3 text-orange-500" />
            <span>Max walking</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={request.max_walking_distance_meters}
              onChange={(e) =>
                onChangeRequest({
                  ...request,
                  max_walking_distance_meters: Math.max(100, parseInt(e.target.value) || 100),
                })
              }
              className="text-xs font-black text-slate-900 w-full bg-transparent focus:outline-none"
              placeholder="1000"
            />
            <span className="text-[10px] font-bold text-slate-400 ml-0.5 shrink-0">
              {request.max_walking_distance_meters >= 1000
                ? `${(request.max_walking_distance_meters / 1000).toFixed(1)}km`
                : 'm'}
            </span>
          </div>
        </div>

        {/* Card 4: Max transfers (Fully Editable with Stepper Controls) */}
        <div className="p-2 rounded-xl border border-slate-200 bg-white space-y-0.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
            <Shuffle className="w-3 h-3 text-purple-500" />
            <span>Max transfers</span>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="0"
              max="5"
              value={request.max_transfers}
              onChange={(e) =>
                onChangeRequest({
                  ...request,
                  max_transfers: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className="text-xs font-black text-slate-900 w-8 bg-transparent focus:outline-none"
              placeholder="2"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onChangeRequest({ ...request, max_transfers: Math.max(0, request.max_transfers - 1) })
                }
                className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold"
                title="Decrease transfers"
              >
                -
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeRequest({ ...request, max_transfers: request.max_transfers + 1 })
                }
                className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold"
                title="Increase transfers"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Travel Purpose (Default is GENERAL: Balanced time, cost & comfort) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
          <span>Travel purpose</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INTENT_CARDS.map((item) => {
            const isSelected =
              request.intent === item.id || (item.id === 'custom' && request.intent === ('custom' as any));
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeRequest({ ...request, intent: item.id as JourneyIntent })}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[72px] ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500/30 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight block">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Journey priorities (optional) with Reset Button */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPriorities(!showPriorities)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            {showPriorities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Journey priorities (optional)</span>
          </button>
          <button
            type="button"
            onClick={handleResetPriorities}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            Reset
          </button>
        </div>

        {showPriorities && (
          <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 text-xs">
            {/* Reliability */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[150px] text-slate-700 font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Reliability <span className="text-[10px] text-slate-400">(Avoid delays)</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.reliability || 0.3) * 100)}
                onChange={(e) => handleSlider('reliability', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-7 text-right font-bold text-slate-800 text-[11px]">
                {Math.round((request.weights.reliability || 0.3) * 100)}%
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[150px] text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
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
              <span className="w-7 text-right font-bold text-slate-800 text-[11px]">
                {Math.round((request.weights.time || 0.3) * 100)}%
              </span>
            </div>

            {/* Cost */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[150px] text-slate-700 font-medium">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
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
              <span className="w-7 text-right font-bold text-slate-800 text-[11px]">
                {Math.round((request.weights.cost || 0.2) * 100)}%
              </span>
            </div>

            {/* Less walking */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[150px] text-slate-700 font-medium">
                <Footprints className="w-3.5 h-3.5 text-slate-400" />
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
              <span className="w-7 text-right font-bold text-slate-800 text-[11px]">
                {Math.round((request.weights.walking || 0.1) * 100)}%
              </span>
            </div>

            {/* Fewer transfers */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-[150px] text-slate-700 font-medium">
                <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                <span>Fewer transfers</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round((request.weights.comfort || 0.1) * 100)}
                onChange={(e) => handleSlider('comfort', Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-7 text-right font-bold text-slate-800 text-[11px]">
                {Math.round((request.weights.comfort || 0.1) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 7. Big Orange Optimize Button */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onOptimize}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF5500] hover:from-[#FF8A33] hover:to-[#FF6600] text-white font-heading font-black text-sm shadow-md shadow-orange-500/25 transition-all hover:shadow-lg hover:shadow-orange-500/35 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

        <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>We'll compare journey options using maps, search and live intelligence.</span>
        </p>
      </div>
    </div>
  );
};
