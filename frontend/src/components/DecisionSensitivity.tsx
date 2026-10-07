import React from 'react';
import { HelpCircle, ArrowUpRight, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <div className="p-1.5 rounded-lg bg-brand-cyan/20 text-brand-cyan">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-white">What Could Change This Decision?</h3>
          <p className="text-xs text-slate-400">
            Deterministic tipping-point thresholds that trigger an alternative recommendation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sensitivityThresholds.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-navy-950/70 border border-white/5 space-y-2 hover:border-brand-cyan/30 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-brand-cyan font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{item.condition}</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-navy-900 text-slate-400">
                Tipping Point
              </span>
            </div>

            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>{item.result}</span>
            </p>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-1.5">
              {item.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
