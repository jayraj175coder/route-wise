import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1527] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand info */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <div className="w-5 h-5 rounded-full bg-[#FF7A1A] flex items-center justify-center text-white">
            <Compass className="w-3 h-3 -rotate-45" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">RouteWise</span>
          <span>•</span>
          <span>Risk-Aware Mobility Decision Engine</span>
        </div>

        {/* Center/Right: Subtle notice */}
        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px] text-center sm:text-right">
          <span>Leaflet & OpenStreetMap Vector Engine (No API Key Required)</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Internal Pareto Decision Model</span>
        </div>
      </div>
    </footer>
  );
};
