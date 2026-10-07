import React from 'react';
import { Compass, ShieldCheck, Activity } from 'lucide-react';

interface NavbarProps {
  apiConnected: boolean;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ apiConnected, onRefresh }) => {
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${apiConnected ? 'bg-brand-emerald animate-pulse' : 'bg-brand-amber'}`} />
            <span className="font-medium">{apiConnected ? 'Optimization Engine Online' : 'Local Engine Ready'}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-bold text-slate-200 border border-white/10 transition-all hover:border-brand-orange/50"
            >
              <Activity className="w-3.5 h-3.5 text-brand-orange" />
              <span>Refresh Signals</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
