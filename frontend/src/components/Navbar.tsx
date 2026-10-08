import React from 'react';
import {
  MapPin,
  Bell,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  apiConnected: boolean;
  activeNavTab?: string;
  onSelectNavTab?: (tab: string) => void;
  onRefresh?: () => void;
  onTogglePreferences?: () => void;
  isPreferencesOpen?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiConnected,
  activeNavTab = 'plan',
  onSelectNavTab,
  onRefresh,
  onTogglePreferences,
  isPreferencesOpen = false,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const navTabs = [
    { id: 'plan', label: 'Plan Journey' },
    { id: 'alternatives', label: 'Alternatives' },
    { id: 'map', label: 'Map' },
    { id: 'signals', label: 'Live Signals' },
    { id: 'score', label: 'Score Breakdown' },
  ];

  return (
    <nav className="w-full bg-white dark:bg-[#0D1527] border-b border-slate-200/90 dark:border-slate-800/80 sticky top-0 z-50 shadow-2xs transition-colors duration-200">
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between py-2.5">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF7A1A] to-[#FF4500] flex items-center justify-center text-white shadow-sm shrink-0">
            <MapPin className="w-5 h-5 fill-white stroke-transparent" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-heading font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Route<span className="text-[#FF7A1A]">Wise</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline-block">
              Risk-Aware Mobility Decision Engine
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs / Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/70 dark:border-slate-700/60">
          {navTabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNavTab && onSelectNavTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1D68FE] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Intelligence Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-750 bg-slate-50/60 dark:bg-slate-800/60 shadow-2xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div className="text-left">
              <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-tight">
                Live Intelligence
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                Traffic • Trains • Weather • Risk
              </div>
            </div>
          </div>

          {/* Notification Bell with Red Badge */}
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center relative shadow-2xs transition-all active:scale-95"
            title="Live Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800" />
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 flex items-center justify-center shadow-2xs transition-all active:scale-95"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Settings Button (In place of 'J' avatar) */}
          <button
            onClick={onTogglePreferences}
            className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-xs transition-all active:scale-95 ${
              isPreferencesOpen
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-300 dark:ring-blue-700'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Traveler Preferences & Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
