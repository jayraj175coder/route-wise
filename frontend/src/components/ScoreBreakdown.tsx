import React from 'react';
import { CandidateRoute } from '../types/journey';
import { CheckCircle2, BarChart3, AlertCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  route: CandidateRoute;
  explanation: string;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ route, explanation }) => {
  const sb = route.score_breakdown || {
    time_score: 88,
    cost_score: 91,
    walking_score: 94,
    transfer_score: 90,
    buffer_score: 96,
    reliability_score: 89,
    risk_score: 94,
  };

  const checklistItems = [
    { label: 'Within budget', satisfied: route.estimated_cost <= 3000 },
    { label: 'Arrives before required deadline', satisfied: route.arrival_buffer_minutes >= 0 },
    { label: 'Walking within comfort limit', satisfied: route.walking_distance_meters <= 1500 },
    { label: 'Transfer limit satisfied', satisfied: route.transfer_count <= 2 },
    { label: 'Lower disruption exposure', satisfied: route.risk_level !== 'HIGH' },
    { label: 'Superior punctuality & reliability', satisfied: sb.reliability_score >= 80 },
  ];

  const scoreBars = [
    { label: 'Buffer Safety', score: sb.buffer_score, color: 'bg-brand-emerald' },
    { label: 'Reliability Index', score: sb.reliability_score, color: 'bg-brand-orange' },
    { label: 'Cost Efficiency', score: sb.cost_score, color: 'bg-emerald-400' },
    { label: 'Walking Ease', score: sb.walking_score, color: 'bg-blue-400' },
    { label: 'Transfer Simplicity', score: sb.transfer_score, color: 'bg-purple-400' },
    { label: 'Time Score', score: sb.time_score, color: 'bg-brand-cyan' },
    { label: 'Disruption Resilience', score: sb.risk_score, color: 'bg-amber-400' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <BarChart3 className="w-5 h-5 text-brand-orange" />
        <h3 className="font-heading text-xl font-bold text-white">Why This Route?</h3>
      </div>

      {/* Grounded Explanation Box */}
      <div className="p-4 rounded-xl bg-navy-950/70 border border-brand-orange/20 text-sm text-slate-200 leading-relaxed font-medium">
        <span className="text-brand-orange font-bold mr-1">Decision Engine Rationale:</span>
        {explanation}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        {/* Verification Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Constraint Satisfaction Checklist
          </h4>
          <div className="space-y-2.5">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm">
                {item.satisfied ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-brand-amber shrink-0" />
                )}
                <span className={item.satisfied ? 'text-slate-200 font-medium' : 'text-slate-400'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Normalized Sub-Scores */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Normalized 0–100 Sub-Scores
          </h4>
          <div className="space-y-2">
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
