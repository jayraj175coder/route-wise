import React, { useState } from 'react';
import { JourneyRequest, JourneyIntent, PriorityWeights } from '../types/journey';
import { IntentSelector } from './IntentSelector';
import { WeightSliders } from './WeightSliders';
import { MapPin, ArrowRightLeft, Clock, Sparkles, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface HeroSearchProps {
  request: JourneyRequest;
  onChangeRequest: (req: JourneyRequest) => void;
  onOptimize: () => void;
  isLoading: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  request,
  onChangeRequest,
  onOptimize,
  isLoading,
}) => {
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);
  const [timeMode, setTimeMode] = useState<'deadline' | 'departure'>('deadline');

  const handleSwap = () => {
    onChangeRequest({
      ...request,
      origin: request.destination,
      destination: request.origin,
    });
  };

  return (
    <div className="w-full relative overflow-hidden pt-6 pb-10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-navy-800/40 via-brand-orange/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Headlines */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-brand-orange/30 text-brand-orange text-xs font-semibold backdrop-blur-md shadow-glow-orange">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Multi-Objective Route Optimization</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Get there on time. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-300 to-brand-cyan">
              Not just on route.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enter your destination and constraints. RouteWise calculates arrival buffers, transfers,
            and real-time disruption risks to recommend the best personalized journey.
          </p>
        </div>

        {/* Main Search Glassmorphic Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
          {/* Origin & Destination Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1">ORIGIN</label>
              <div className="flex items-center bg-navy-950/80 rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-brand-orange transition-all">
                <MapPin className="w-5 h-5 text-brand-emerald mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={request.origin}
                  onChange={(e) => onChangeRequest({ ...request, origin: e.target.value })}
                  placeholder="e.g. Dadar, Mumbai"
                  className="bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none w-full font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 border border-white/10 flex items-center justify-center text-slate-300 hover:text-brand-orange transition-all hover:rotate-180"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5 relative">
              <label className="text-xs font-semibold text-slate-400 block mb-1">DESTINATION</label>
              <div className="flex items-center bg-navy-950/80 rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-brand-orange transition-all">
                <MapPin className="w-5 h-5 text-brand-orange mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={request.destination}
                  onChange={(e) => onChangeRequest({ ...request, destination: e.target.value })}
                  placeholder="e.g. Hinjawadi IT Park, Pune"
                  className="bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none w-full font-medium"
                />
              </div>
            </div>
          </div>

          {/* Timing, Budget, Walking & Transfers Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arrival Deadline vs Departure */}
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">
                  {timeMode === 'deadline' ? 'ARRIVAL DEADLINE' : 'DEPARTURE TIME'}
                </label>
                <button
                  type="button"
                  onClick={() => setTimeMode(timeMode === 'deadline' ? 'departure' : 'deadline')}
                  className="text-[10px] text-brand-orange hover:underline"
                >
                  Switch to {timeMode === 'deadline' ? 'Departure' : 'Deadline'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-cyan shrink-0" />
                <input
                  type="text"
                  value={timeMode === 'deadline' ? (request.arrival_deadline || '10:10 AM') : (request.departure_time || '06:00 AM')}
                  onChange={(e) => {
                    if (timeMode === 'deadline') {
                      onChangeRequest({ ...request, arrival_deadline: e.target.value });
                    } else {
                      onChangeRequest({ ...request, departure_time: e.target.value });
                    }
                  }}
                  className="bg-navy-900 text-white text-sm px-2.5 py-1 rounded-lg border border-white/10 w-full focus:outline-none focus:border-brand-cyan font-medium"
                />
              </div>
            </div>

            {/* Budget Limit */}
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">MAX BUDGET</label>
                <span className="font-bold text-brand-emerald">₹{request.max_budget}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="50"
                value={request.max_budget}
                onChange={(e) => onChangeRequest({ ...request, max_budget: Number(e.target.value) })}
                className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹300 (Transit)</span>
                <span>₹3,000 (Cab)</span>
              </div>
            </div>

            {/* Maximum Walking Distance */}
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">MAX WALKING</label>
                <span className="font-bold text-brand-cyan">{request.max_walking_distance_meters}m</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={request.max_walking_distance_meters}
                onChange={(e) => onChangeRequest({ ...request, max_walking_distance_meters: Number(e.target.value) })}
                className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>200m (Strict)</span>
                <span>3km (Flexible)</span>
              </div>
            </div>

            {/* Maximum Transfers */}
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">MAX TRANSFERS</label>
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChangeRequest({ ...request, max_transfers: num })}
                    className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                      request.max_transfers === num
                        ? 'bg-brand-orange text-navy-950 border-brand-orange'
                        : 'bg-navy-900 text-slate-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {num === 3 ? '3+' : num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Travel Purpose / Intent Profile Selector */}
          <IntentSelector
            selectedIntent={request.intent}
            onSelectIntent={(intent) => onChangeRequest({ ...request, intent })}
          />

          {/* Advanced Objective Weights Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-orange transition-colors"
            >
              <span>{showAdvancedWeights ? 'Hide' : 'Customize'} Advanced Objective Weights</span>
              {showAdvancedWeights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedWeights && (
              <div className="mt-3">
                <WeightSliders
                  weights={request.weights}
                  onChange={(weights: PriorityWeights) => onChangeRequest({ ...request, weights })}
                />
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald" />
              <span>Multi-objective Pareto comparison enabled</span>
            </div>

            <button
              type="button"
              onClick={onOptimize}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange via-amber-500 to-brand-orange hover:from-brand-orangeHover hover:to-amber-400 text-navy-950 font-heading font-extrabold text-base tracking-wide shadow-glow-orange hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Constraints & Risk...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 stroke-[2.5]" />
                  <span>Optimize My Journey</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
