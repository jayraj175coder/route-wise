import React from 'react';
import { HelpCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { CandidateRoute } from '../types/journey';

export const DecisionSensitivity: React.FC<{ route: CandidateRoute }> = ({ route }) => {
  const sensitivityThresholds = [
    {
      condition: 'Train delay > 18 mins',
      result: 'Direct Private Cab becomes the faster journey',
      rationale: 'Current rail buffer of 42m shrinks below cab travel duration.',
      shiftSeverity: 'moderate',
    },
    {
      condition: 'Budget ceiling dropped < ₹650',
      result: 'Highway Express Bus becomes mandatory',
      rationale: 'Rail + Auto combination (₹670) violates the strict budget constraint.',
      shiftSeverity: 'high',
    },
    {
      condition: 'Expressway traffic slowdown > 25%',
      result: 'Rail advantage expands to +55 mins',
      rationale: 'Highway transit enters high-congestion gridlock while rail remains on scheduled track.',
      shiftSeverity: 'low',
    },
    {
      condition: 'Walking tolerance reduced to < 350m',
      result: 'Station feeder connection shifts to direct doorstep auto',
      rationale: 'Walking distance (480m) to station platform violates low-walking constraint.',
      shiftSeverity: 'moderate',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">What Could Change This Decision?</h3>
          <p className="text-xs text-slate-500">
            Deterministic tipping-point thresholds that trigger an alternative recommendation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sensitivityThresholds.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-700 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{item.condition}</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                Tipping Point
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{item.result}</span>
            </p>

            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 pt-1.5">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
