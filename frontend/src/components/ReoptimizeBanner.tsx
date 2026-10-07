import React from 'react';
import { CandidateRoute } from '../types/journey';
import { ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReoptimizeBannerProps {
  previousRoute: CandidateRoute;
  newRoute: CandidateRoute;
  cause: string;
  changeSummary: string;
  onDismiss: () => void;
}

export const ReoptimizeBanner: React.FC<ReoptimizeBannerProps> = ({
  previousRoute,
  newRoute,
  cause,
  changeSummary,
  onDismiss,
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-brand-orange/40 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 shadow-glow-orange space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-orange/20 text-brand-orange">
            <RefreshCw className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm uppercase tracking-wider text-brand-orange">
            Dynamic Journey Re-Optimization Complete
          </span>
        </div>

        <button
          onClick={onDismiss}
          className="text-xs text-slate-400 hover:text-white"
        >
          Dismiss Alert
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Old Route Box */}
        <div className="md:col-span-5 bg-navy-950/80 p-4 rounded-xl border border-white/10 opacity-75">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 font-semibold uppercase">PREVIOUS CHOICE</span>
            <span className="text-slate-400 font-bold">{Math.round(previousRoute.confidence_score)} Confidence</span>
          </div>
          <h4 className="font-heading font-bold text-base text-slate-300">{previousRoute.mode_summary}</h4>
          <p className="text-xs text-slate-400 mt-1 line-through">
            ₹{previousRoute.estimated_cost} • {previousRoute.arrival_time}
          </p>
        </div>

        {/* Transition Indicator */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-brand-amber font-extrabold text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disruption</span>
          </div>
          <ArrowRight className="w-6 h-6 text-brand-orange" />
        </div>

        {/* New Route Box */}
        <div className="md:col-span-5 bg-navy-950/90 p-4 rounded-xl border border-brand-emerald/40 shadow-glow-emerald">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-brand-emerald font-extrabold uppercase">NEW RECOMMENDED JOURNEY</span>
            <span className="text-brand-emerald font-extrabold">{Math.round(newRoute.confidence_score)} Confidence</span>
          </div>
          <h4 className="font-heading font-bold text-base text-white">{newRoute.mode_summary}</h4>
          <p className="text-xs text-brand-emerald font-medium mt-1">
            ₹{newRoute.estimated_cost} • Arrives {newRoute.arrival_time} (+{newRoute.arrival_buffer_minutes}m buffer)
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-navy-950/90 border border-white/5 text-xs text-slate-300 space-y-1">
        <p className="font-semibold text-white">
          <span className="text-brand-orange">Why the ranking shifted: </span>
          {changeSummary}
        </p>
        <p className="text-slate-400">
          <span className="text-slate-300 font-medium">Trigger event: </span>
          {cause}
        </p>
      </div>
    </div>
  );
};
