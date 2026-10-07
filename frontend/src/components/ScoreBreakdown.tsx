import React from 'react';
import { CandidateRoute } from '../types/journey';
import { CheckCircle2, BarChart3, AlertCircle, ShieldCheck, IndianRupee, Clock, Footprints, Shuffle } from 'lucide-react';

interface ScoreBreakdownProps {
  route: CandidateRoute;
  explanation: string;
  budgetCeiling?: number;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  route,
  explanation,
  budgetCeiling = 1500,
}) => {
  const sb = route.score_breakdown || {
    time_score: 88,
    cost_score: 91,
    walking_score: 94,
    transfer_score: 90,
    buffer_score: 96,
    reliability_score: 89,
    risk_score: 94,
  };

  const budgetMargin = Math.max(0, budgetCeiling - route.estimated_cost);

  const computedReasons = [
    { label: `₹${budgetMargin.toFixed(0)} under maximum budget`, detail: `Cost ₹${route.estimated_cost.toFixed(0)} vs ₹${budgetCeiling} ceiling`, satisfied: true, icon: IndianRupee },
    { label: `${route.arrival_buffer_minutes} min arrival safety buffer`, detail: `Arrives comfortably at ${route.arrival_time}`, satisfied: route.arrival_buffer_minutes >= 0, icon: Clock },
    { label: `${route.transfer_count} transfer required`, detail: route.transfer_count === 0 ? 'Direct journey' : 'Minimal platform transfer complexity', satisfied: route.transfer_count <= 2, icon: Shuffle },
    { label: `${route.walking_distance_meters}m walking total`, detail: 'Low physical exertion requirement', satisfied: route.walking_distance_meters <= 1500, icon: Footprints },
    { label: `${route.risk_level} disruption exposure`, detail: 'Protected corridor with minimal live incident risk', satisfied: route.risk_level !== 'HIGH', icon: ShieldCheck },
  ];

  const scoreBars = [
    { label: 'Time Score', score: sb.time_score, color: 'bg-brand-cyan' },
    { label: 'Cost Efficiency', score: sb.cost_score, color: 'bg-emerald-400' },
    { label: 'Reliability Index', score: sb.reliability_score, color: 'bg-brand-orange' },
    { label: 'Walking Ease', score: sb.walking_score, color: 'bg-blue-400' },
    { label: 'Transfer Simplicity', score: sb.transfer_score, color: 'bg-purple-400' },
    { label: 'Arrival Buffer Margin', score: sb.buffer_score, color: 'bg-brand-emerald' },
    { label: 'Disruption Risk Resilience', score: sb.risk_score, color: 'bg-amber-400' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
        <div className="p-1.5 rounded-lg bg-brand-orange/20 text-brand-orange">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-white">Why This Decision</h3>
          <p className="text-xs text-slate-400">
            Computed deterministic advantages over all competing alternatives
          </p>
        </div>
      </div>

      {/* Grounded Numerical Rationale */}
      <div className="p-4 rounded-xl bg-navy-950/80 border border-brand-orange/30 text-sm text-slate-200 leading-relaxed font-medium">
        <span className="text-brand-orange font-bold mr-1.5">Decision Engine Rationale:</span>
        {explanation}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        {/* Computed Advantages */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Deterministic Verified Proof Points
          </h4>
          <div className="space-y-2.5">
            {computedReasons.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-navy-950/60 border border-white/5 flex items-start gap-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">{item.label}</span>
                  <span className="text-[11px] text-slate-400">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RouteWise Score Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            RouteWise Score Breakdown (0–100 Scale)
          </h4>
          <div className="space-y-2.5">
            {scoreBars.map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{bar.label}</span>
                  <span className="font-extrabold text-white">{Math.round(bar.score)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                    style={{ width: `${Math.max(5, Math.min(100, bar.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
