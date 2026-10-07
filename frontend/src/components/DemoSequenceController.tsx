import React from 'react';
import { Play, Check, ChevronRight, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

interface DemoSequenceControllerProps {
  currentStep: number;
  onNextStep: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const STEPS = [
  { step: 1, title: 'Interview Context', desc: 'Mumbai → Pune deadline at 10:10 AM with ₹1,500 budget.' },
  { step: 2, title: 'Multi-Objective Optimization', desc: 'Evaluate constraints, sub-scores, and baseline confidence.' },
  { step: 3, title: 'Explainability & Rationale', desc: 'Inspect Why This Route and grounded numerical comparison.' },
  { step: 4, title: 'Expressway Disruption Alert', desc: 'Simulate sudden Khandala Ghat blockage (+65m delay exposure).' },
  { step: 5, title: 'Dynamic Re-optimization', desc: 'System automatically pivots to Deccan Rail with +42m safety buffer.' },
  { step: 6, title: 'What-If Simulation', desc: 'Adjust constraints interactively to demonstrate algorithm adaptability.' },
];

export const DemoSequenceController: React.FC<DemoSequenceControllerProps> = ({
  currentStep,
  onNextStep,
  onReset,
  isRunning,
}) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-brand-orange/30 bg-navy-950/90 shadow-glow-orange space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-navy-950 font-black">
            <Sparkles className="w-4 h-4 fill-navy-950" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-extrabold text-white">
              3-Minute Hackathon Demo Controller
            </h4>
            <p className="text-xs text-slate-400">
              Interactive guided pitch sequence for judges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-slate-300 border border-white/10"
          >
            Reset Flow
          </button>
          <button
            onClick={onNextStep}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orangeHover text-navy-950 text-xs font-extrabold transition-all hover:scale-105 shadow-sm"
          >
            <span>{currentStep === 6 ? 'Restart Demo' : `Step ${currentStep + 1}: Next`}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Steps Progress Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {STEPS.map((s) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <div
              key={s.step}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange'
                  : isDone
                  ? 'bg-navy-900/80 border-brand-emerald/40 text-slate-300'
                  : 'bg-navy-950/50 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase mb-1">
                <span>Step {s.step}</span>
                {isDone && <Check className="w-3 h-3 text-brand-emerald" />}
              </div>
              <div className="text-xs font-bold leading-tight line-clamp-1">{s.title}</div>
              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
