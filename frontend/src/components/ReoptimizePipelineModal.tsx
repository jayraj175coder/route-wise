import React, { useEffect, useState } from 'react';
import { RefreshCw, Radio, Filter, AlertTriangle, Cpu, CheckCircle2 } from 'lucide-react';

interface ReoptimizePipelineModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const PIPELINE_STEPS = [
  { id: 1, title: 'SIGNAL DETECTED', desc: 'SerpApi News & Traffic alert intercepted on highway corridor', icon: Radio, color: 'text-brand-orange' },
  { id: 2, title: '14 ROUTES ANALYZED', desc: 'Ingested multimodal candidate combinations (Rail, Bus, Cab, Metro)', icon: Cpu, color: 'text-brand-cyan' },
  { id: 3, title: '7 PASS HARD CONSTRAINTS', desc: '7 routes eliminated due to budget, arrival buffer, or walking ceiling', icon: Filter, color: 'text-brand-emerald' },
  { id: 4, title: '3 ELEVATED DISRUPTION RISK', desc: 'Highway routes penalized due to Khandala Ghat +60 min delay exposure', icon: AlertTriangle, color: 'text-brand-rose' },
  { id: 5, title: 'RE-OPTIMIZING PARETO OBJECTIVES', desc: 'Recalculating multi-objective composite weights and confidence scores', icon: RefreshCw, color: 'text-amber-400' },
  { id: 6, title: 'NEW BEST DECISION FINALIZED', desc: 'Pivoting to Deccan Rail + Auto (+42 min arrival safety buffer)', icon: CheckCircle2, color: 'text-brand-emerald' },
];

export const ReoptimizePipelineModal: React.FC<ReoptimizePipelineModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(1);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 6) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
      <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-brand-orange/40 shadow-glow-orange space-y-6 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-extrabold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Deterministic Re-Optimization Pipeline</span>
          </div>
          <h3 className="font-heading text-2xl font-black text-white">
            Processing Condition Shift
          </h3>
          <p className="text-xs text-slate-400">
            Real-time pipeline recalculating mobility trade-offs
          </p>
        </div>

        {/* Animated Stepper Flow */}
        <div className="space-y-3 py-2">
          {PIPELINE_STEPS.map((step) => {
            const isFinished = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            const isPending = activeStep < step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3.5 ${
                  isCurrent
                    ? 'bg-navy-900 border-brand-orange shadow-glow-orange scale-[1.02]'
                    : isFinished
                    ? 'bg-navy-950/80 border-brand-emerald/40 text-slate-300'
                    : 'bg-navy-950/40 border-white/5 opacity-40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-brand-orange text-navy-950 font-black'
                      : isFinished
                      ? 'bg-brand-emerald/20 text-brand-emerald'
                      : 'bg-navy-800 text-slate-500'
                  }`}
                >
                  {isFinished ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-navy-950 animate-pulse' : 'text-slate-400'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold text-brand-orange animate-pulse">
                        EXECUTING...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
