import React from 'react';
import { Compass, RefreshCw, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  apiConnected: boolean;
  onRefresh?: () => void;
  onTogglePreferences?: () => void;
  isPreferencesOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiConnected,
  onRefresh,
  onTogglePreferences,
  isPreferencesOpen = false,
}) => {
  return (
    <nav className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF5500] flex items-center justify-center text-white shadow-xs">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <div className="text-xs font-bold text-slate-800 leading-tight">Live Intelligence</div>
              <div className="text-[10px] text-slate-500 leading-tight">Maps • Search • News • Places</div>
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-slate-400 font-medium hidden lg:inline-block">
            Updated 2 min ago
          </span>

          {/* Refresh Signals CTA */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Refresh</span>
            </button>
          )}

          {/* User Profile / Preferences Toggle */}
          {onTogglePreferences && (
            <button
              onClick={onTogglePreferences}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isPreferencesOpen
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
              }`}
              title="Toggle Traveler Preferences"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
