import React from 'react';
import { ArrowRight, Layers, ShieldCheck, Cpu, Sliders, CheckCircle } from 'lucide-react';

export const DecisionArchitectureFlow: React.FC = () => {
  const pipelineNodes = [
    { title: 'SERPAPI DATA', desc: 'Google Maps Directions, News & Search', color: 'border-brand-orange text-brand-orange' },
    { title: 'ROUTE NORMALIZATION', desc: 'Convert into multimodal segments', color: 'border-brand-cyan text-brand-cyan' },
    { title: 'HARD CONSTRAINTS', desc: 'Filter budget, buffer, walking & transfers', color: 'border-brand-emerald text-brand-emerald' },
    { title: 'RISK ANALYSIS', desc: 'Disruption signals & transfer tightness', color: 'border-amber-400 text-amber-400' },
    { title: 'MULTI-OBJECTIVE SCORING', desc: '7-parameter weighted Pareto ranking', color: 'border-purple-400 text-purple-400' },
    { title: 'PERSONALIZED DECISION', desc: 'Optimal route with explainable proof', color: 'border-brand-emerald text-white' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-navy-800 text-brand-orange">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-heading text-sm font-extrabold uppercase tracking-wider text-white">
            Deterministic Decision Engine Pipeline
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Auditable multi-objective optimization (Zero black-box hallucinations)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {pipelineNodes.map((node, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl bg-navy-950/70 border ${node.color} flex flex-col justify-between relative group hover:scale-[1.02] transition-all`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>0{idx + 1}</span>
                <CheckCircle className="w-3 h-3 text-slate-400" />
              </div>
              <h5 className="font-heading text-xs font-black leading-tight text-white">{node.title}</h5>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-normal">{node.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
