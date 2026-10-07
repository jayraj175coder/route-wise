import React from 'react';
import { PriorityWeights } from '../types/journey';
import { Sliders } from 'lucide-react';

interface WeightSlidersProps {
  weights: PriorityWeights;
  onChange: (weights: PriorityWeights) => void;
}

export const WeightSliders: React.FC<WeightSlidersProps> = ({ weights, onChange }) => {
  const handleSlider = (key: keyof PriorityWeights, value: number) => {
    onChange({
      ...weights,
      [key]: value / 100,
    });
  };

  const fields: { key: keyof PriorityWeights; label: string; color: string }[] = [
    { key: 'time', label: 'Time Priority', color: 'accent-cyan-400' },
    { key: 'cost', label: 'Cost Priority', color: 'accent-emerald-400' },
    { key: 'reliability', label: 'Reliability', color: 'accent-brand-orange' },
    { key: 'comfort', label: 'Comfort / Few Transfers', color: 'accent-purple-400' },
    { key: 'walking', label: 'Low Walking', color: 'accent-blue-400' },
  ];

  return (
    <div className="bg-navy-900/40 p-4 rounded-xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-brand-orange" />
          <span>Advanced Objective Weights</span>
        </div>
        <span className="text-[11px] text-slate-400">Deterministic scoring parameters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {fields.map((field) => {
          const val = Math.round((weights[field.key] || 0) * 100);
          return (
            <div key={field.key} className="bg-navy-950/60 p-2.5 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">{field.label}</span>
                <span className="font-bold text-brand-orange">{val}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={val}
                onChange={(e) => handleSlider(field.key, Number(e.target.value))}
                className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
