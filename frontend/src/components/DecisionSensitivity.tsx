import React from 'react';
import { HelpCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { CandidateRoute } from '../types/journey';

export const DecisionSensitivity: React.FC<{ route: CandidateRoute }> = ({ route }) => {
  const walkingToStation = Math.round(route.walking_distance_meters * 1.2);
  const cabCostBuffer = Math.round(route.estimated_cost * 1.35);
  const budgetTipPoint = Math.round(route.estimated_cost - 20);

  const sensitivityThresholds = [
    {
      condition: `Transit delay > ${Math.round(route.arrival_buffer_minutes * 0.4)} mins`,
      result: 'Direct Private Cab becomes the faster journey',
      rationale: `Current buffer of ${route.arrival_buffer_minutes}m shrinks below cab travel duration — triggering a mode switch.`,
      shiftSeverity: 'moderate',
    },
    {
      condition: `Budget ceiling dropped < ₹${budgetTipPoint}`,
      result: 'Highway Express Bus or cheaper alternative becomes mandatory',
      rationale: `Current combination (₹${Math.round(route.estimated_cost)}) would violate the strict budget constraint.`,
      shiftSeverity: 'high',
    },
    {
      condition: 'Expressway traffic slowdown > 25%',
      result: `Rail advantage expands to +${Math.round(route.arrival_buffer_minutes * 1.3)} mins`,
      rationale: 'Highway transit enters high-congestion gridlock while rail remains on scheduled right-of-way.',
      shiftSeverity: 'low',
    },
    {
      condition: `Walking tolerance reduced to < ${Math.round(route.walking_distance_meters * 0.7)}m`,
      result: 'Station feeder connection shifts to direct doorstep cab',
      rationale: `Walking distance (${route.walking_distance_meters}m) to boarding point violates the tighter walking constraint.`,
      shiftSeverity: 'moderate',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">What Could Change This Decision?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic tipping-point thresholds that trigger an alternative recommendation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sensitivityThresholds.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-700 dark:text-blue-400 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{item.condition}</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Tipping Point
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              <span>{item.result}</span>
            </p>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
