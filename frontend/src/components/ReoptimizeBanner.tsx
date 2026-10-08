import React from 'react';
import { CandidateRoute } from '../types/journey';
import { ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, X } from 'lucide-react';

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
    <div className="rounded-2xl p-5 border-2 border-orange-500/40 bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-white dark:from-orange-950/40 dark:via-slate-900 dark:to-[#0D1527] shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-200/60 dark:border-orange-900/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-600 text-white shadow-xs">
            <RefreshCw className="w-4 h-4 animate-spin-once" />
          </div>
          <div>
            <span className="font-heading font-black text-sm uppercase tracking-wide text-orange-950 dark:text-orange-200">
              Dynamic Journey Re-Optimization Complete
            </span>
            <span className="ml-2 text-xs text-orange-700 dark:text-orange-300 font-medium">Real-time condition change detected</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Dismiss banner"
        >
          <span>Dismiss</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Old Route Box */}
        <div className="md:col-span-5 bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 opacity-85">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Previous choice</span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">{Math.round(previousRoute.confidence_score)} Confidence</span>
          </div>
          <h4 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">{previousRoute.mode_summary}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-through">
            ₹{previousRoute.estimated_cost} • {previousRoute.arrival_time}
          </p>
        </div>

        {/* Transition Indicator */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-extrabold text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disrupted</span>
          </div>
          <ArrowRight className="w-6 h-6 text-orange-500" />
        </div>

        {/* New Route Box */}
        <div className="md:col-span-5 bg-white dark:bg-[#0D1527] p-4 rounded-xl border-2 border-emerald-500 shadow-sm">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              New recommended journey
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-black">{Math.round(newRoute.confidence_score)} Confidence</span>
          </div>
          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">{newRoute.mode_summary}</h4>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
            ₹{newRoute.estimated_cost} • Arrives {newRoute.arrival_time} (+{newRoute.arrival_buffer_minutes}m buffer)
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-orange-200/70 dark:border-orange-900/50 text-xs space-y-1">
        <p className="font-semibold text-slate-900 dark:text-white">
          <span className="text-orange-600 dark:text-orange-400 font-bold">Why the ranking shifted: </span>
          {changeSummary}
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Trigger event: </span>
          {cause}
        </p>
      </div>
    </div>
  );
};
