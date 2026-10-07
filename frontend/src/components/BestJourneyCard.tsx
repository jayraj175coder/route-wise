import React from 'react';
import { CandidateRoute, JourneyIntent } from '../types/journey';
import { ShieldCheck, Clock, IndianRupee, Footprints, Shuffle, AlertTriangle, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

interface BestJourneyCardProps {
  route: CandidateRoute;
  activePreset: JourneyIntent;
  onViewEvidence: () => void;
  onTriggerDisruption: () => void;
  hasDisruptionTriggered: boolean;
}

export const BestJourneyCard: React.FC<BestJourneyCardProps> = ({
  route,
  activePreset,
  onViewEvidence,
  onTriggerDisruption,
  hasDisruptionTriggered,
}) => {
  const hours = Math.floor(route.total_duration_minutes / 60);
  const mins = Math.round(route.total_duration_minutes % 60);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-brand-rose/20 text-brand-rose border-brand-rose/40';
      case 'MEDIUM':
        return 'bg-brand-amber/20 text-brand-amber border-brand-amber/40';
      default:
        return 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40';
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden shadow-2xl">
      {/* Top ambient accent glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-orange/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-brand-orange text-navy-950 font-heading font-extrabold text-xs uppercase tracking-wider">
            Best Journey For You
          </span>
          <span className="px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 border border-white/10 text-xs font-semibold uppercase tracking-wider">
            {activePreset} Mode Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getRiskBadgeColor(route.risk_level)}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{route.risk_level} RISK LEVEL</span>
          </span>
        </div>
      </div>

      {/* Main Core Showcase: Route Title & Confidence Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-center">
        {/* Left: Journey Mode Summary & Headline */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{route.mode_summary}</span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Optimized multimodal combination minimizing disruption exposure while guaranteeing safety buffer before your destination deadline.
          </p>

          {/* Key Metric Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">ESTIMATED COST</span>
              <div className="flex items-center gap-0.5 text-xl font-extrabold text-white mt-0.5">
                <IndianRupee className="w-4 h-4 text-brand-emerald" />
                <span>{route.estimated_cost.toFixed(0)}</span>
              </div>
            </div>

            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">TRAVEL TIME</span>
              <div className="flex items-center gap-1 text-xl font-extrabold text-white mt-0.5">
                <Clock className="w-4 h-4 text-brand-cyan" />
                <span>{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</span>
              </div>
            </div>

            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">ARRIVAL TIME</span>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {route.arrival_time}
              </div>
            </div>

            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">SAFETY BUFFER</span>
              <div className="text-xl font-extrabold text-brand-emerald mt-0.5">
                +{route.arrival_buffer_minutes} mins
              </div>
            </div>

            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">WALKING</span>
              <div className="flex items-center gap-1 text-xl font-extrabold text-white mt-0.5">
                <Footprints className="w-4 h-4 text-slate-300" />
                <span>{route.walking_distance_meters}m</span>
              </div>
            </div>

            <div className="bg-navy-950/70 p-3 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block font-medium">TRANSFERS</span>
              <div className="flex items-center gap-1 text-xl font-extrabold text-white mt-0.5">
                <Shuffle className="w-4 h-4 text-slate-300" />
                <span>{route.transfer_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: RouteWise Confidence Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-brand-orange/30 shadow-glow-orange text-center relative">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-orange">
            Proprietary Metric
          </span>

          <div className="my-3 flex items-baseline justify-center">
            <span className="font-heading text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-brand-orange">
              {Math.round(route.confidence_score)}
            </span>
            <span className="text-2xl font-bold text-slate-400 ml-1.5">/100</span>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            RouteWise Confidence Score
          </h3>

          <p className="text-[11px] text-slate-400 mt-2 italic max-w-xs leading-normal">
            “RouteWise Confidence is an internal decision score based on available route and disruption signals. It is not a guaranteed probability of arrival.”
          </p>

          {/* Evidence Button */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={onViewEvidence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-slate-200 border border-white/10 transition-all hover:border-brand-orange/50"
            >
              <Eye className="w-3.5 h-3.5 text-brand-orange" />
              <span>Inspect Disruption Evidence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multimodal Journey Segment Stepper */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Journey Sequence Breakdown
        </span>

        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {route.segments.map((seg, idx) => (
            <div
              key={seg.id}
              className="flex-1 bg-navy-950/60 p-3.5 rounded-xl border border-white/5 relative group hover:border-brand-orange/30 transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 rounded bg-navy-800 text-[10px] font-bold text-slate-300 uppercase">
                  Step {idx + 1}: {seg.mode}
                </span>
                <span className="font-bold text-slate-400">{seg.duration_minutes.toFixed(0)} mins</span>
              </div>
              <p className="text-xs font-semibold text-white mt-1">{seg.instructions}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>{seg.from_name} → {seg.to_name}</span>
                {seg.cost > 0 && <span className="font-bold text-brand-emerald">₹{seg.cost}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Re-optimization & Disruption Trigger Card */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-amber/20 flex items-center justify-center text-brand-amber shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {hasDisruptionTriggered ? 'Disruption Active on Expressway' : 'Live Condition Monitoring'}
            </h4>
            <p className="text-xs text-slate-400">
              {hasDisruptionTriggered
                ? 'System adapted route recommendation away from the blocked corridor.'
                : 'Test how the engine dynamically adapts when transit signals shift.'}
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerDisruption}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orangeHover hover:to-amber-400 text-navy-950 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 shadow-glow-orange shrink-0 flex items-center gap-2"
        >
          <span>Something changed? Re-optimize</span>
        </button>
      </div>
    </div>
  );
};
