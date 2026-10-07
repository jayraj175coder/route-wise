import React from 'react';
import { Compass, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  onRunDemo: () => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunDemo, apiConnected }) => {
  return (
    <nav className="w-full border-b border-white/10 bg-navy-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-400 flex items-center justify-center shadow-glow-orange">
            <Compass className="w-6 h-6 text-navy-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Route<span className="text-brand-orange">Wise</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                Decision Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Risk-aware multimodal journey optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-white/5 text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-brand-emerald animate-pulse' : 'bg-brand-amber'}`} />
            <span>{apiConnected ? 'SerpApi Engine Active' : 'Deterministic Demo Mode'}</span>
          </div>

          <button
            onClick={onRunDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-brand-orange border border-brand-orange/40 text-sm font-semibold transition-all hover:scale-105 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-brand-orange" />
            <span>3-Min Hackathon Demo</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
