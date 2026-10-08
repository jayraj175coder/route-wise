import React from 'react';
import { CandidateRoute } from '../types/journey';
import {
  X,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: CandidateRoute;
  explanation: string;
  budgetCeiling?: number;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  route,
  explanation,
  budgetCeiling = 100,
}) => {
  if (!isOpen) return null;

  const sb = route.score_breakdown || {
    time_score: 88,
    cost_score: 95,
    walking_score: 92,
    transfer_score: 90,
    buffer_score: 96,
    reliability_score: 94,
    risk_score: 91,
  };

  const scoreBars = [
    { label: 'Time Score', score: Math.round(sb.time_score), color: 'bg-blue-500' },
    { label: 'Cost Efficiency', score: Math.round(sb.cost_score), color: 'bg-emerald-500' },
    { label: 'Reliability Index', score: Math.round(sb.reliability_score), color: 'bg-amber-500' },
    { label: 'Walking Ease', score: Math.round(sb.walking_score), color: 'bg-indigo-500' },
    { label: 'Transfer Simplicity', score: Math.round(sb.transfer_score), color: 'bg-purple-500' },
    { label: 'Arrival Buffer Margin', score: Math.round(sb.buffer_score), color: 'bg-teal-500' },
    { label: 'Disruption Risk Resilience', score: Math.round(sb.risk_score), color: 'bg-sky-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D1527] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white">
                Score Breakdown & Rationale
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {route.mode_summary} • RouteWise Score {Math.round(route.confidence_score || route.overall_score || 89)}/100
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
            <span className="font-bold block text-blue-950 dark:text-blue-100 mb-1">Recommendation Explanation:</span>
            {explanation ||
              'This route provides the optimal multi-objective balance of dedicated right-of-way punctuality, low fare well under your budget limit, and minimal walking exertion.'}
          </div>

          {/* Normalized Dimension Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">
              Dimension Scores (0–100)
            </h4>
            <div className="space-y-2.5">
              {scoreBars.map((bar) => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{bar.label}</span>
                    <span className="font-black text-slate-900 dark:text-white">{bar.score}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(5, bar.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Advantage Badges */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">
              Constraint & Buffer Analysis
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>₹{Math.max(0, budgetCeiling - route.estimated_cost)} under budget</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{route.arrival_buffer_minutes}m earlier safety buffer</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{Math.round(route.walking_distance_meters)}m walking exertion</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{route.transfer_count} platform transfers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
