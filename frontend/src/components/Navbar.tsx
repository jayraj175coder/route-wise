import React from 'react';
import { Compass, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  apiConnected: boolean;
  onRefresh?: () => void;
  isDemoActive?: boolean;
  onToggleDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiConnected,
  onRefresh,
  isDemoActive = false,
  onToggleDemo,
}) => {
  return (
    <nav className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF5500] flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5 -rotate-45 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline">
            <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
              Route<span className="text-[#FF7A1A]">Wise</span>
            </span>
            <span className="text-xs text-slate-500 font-medium ml-3 pl-3 border-l border-slate-200 hidden md:inline-block">
              Risk-Aware Mobility Decision Engine
            </span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Intelligence Indicator */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/70 bg-slate-50/60">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <div className="text-xs font-bold text-slate-800 leading-tight">Live Intelligence</div>
              <div className="text-[10px] text-slate-500 leading-tight">Maps • Search • News</div>
            </div>
          </div>

          {/* Refresh Signals CTA */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <div className="text-left">
                <div className="leading-tight">Refresh Signals</div>
                <div className="text-[10px] text-slate-400 font-normal leading-tight">Updated just now</div>
              </div>
            </button>
          )}

          {/* Demo Mode Toggle */}
          {onToggleDemo && (
            <button
              onClick={onToggleDemo}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                isDemoActive
                  ? 'border-blue-500 bg-blue-50/80 text-blue-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Demo Mode</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
