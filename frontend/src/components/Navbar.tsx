import React from 'react';
import {
  MapPin,
  Bell,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  apiConnected: boolean;
  activeNavTab?: string;
  onSelectNavTab?: (tab: string) => void;
  onRefresh?: () => void;
  onTogglePreferences?: () => void;
  isPreferencesOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiConnected,
  activeNavTab = 'plan',
  onSelectNavTab,
  onRefresh,
  onTogglePreferences,
  isPreferencesOpen = false,
}) => {
  const navTabs = [
    { id: 'plan', label: 'Plan Journey' },
    { id: 'alternatives', label: 'Alternatives' },
    { id: 'map', label: 'Map' },
    { id: 'signals', label: 'Live Signals' },
    { id: 'score', label: 'Score Breakdown' },
  ];

  return (
    <nav className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between py-2.5">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF4500] flex items-center justify-center text-white shadow-sm">
            <MapPin className="w-5 h-5 fill-white stroke-transparent" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-heading font-black text-2xl tracking-tight text-slate-900">
              Route<span className="text-[#FF7A1A]">Wise</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline-block">
              Risk-Aware Mobility Decision Engine
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs / Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-full border border-slate-200/70">
          {navTabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNavTab && onSelectNavTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1D68FE] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Status Badges & Profile */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* Live Intelligence Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/90 bg-slate-50/60 shadow-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="text-left">
              <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Live Intelligence</div>
              <div className="text-[9px] text-slate-500 font-medium leading-tight">Traffic • Trains • Weather • Risk</div>
            </div>
          </div>

          {/* Notification Bell with Red Badge */}
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center relative shadow-2xs transition-all active:scale-95"
            title="Live Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar Circle (J) */}
          <button
            onClick={onTogglePreferences}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs transition-all active:scale-95 ${
              isPreferencesOpen
                ? 'bg-blue-600 ring-2 ring-blue-300'
                : 'bg-[#0E294B] hover:bg-[#133763]'
            }`}
            title="User Preferences & History"
          >
            J
          </button>
        </div>
      </div>
    </nav>
  );
};
