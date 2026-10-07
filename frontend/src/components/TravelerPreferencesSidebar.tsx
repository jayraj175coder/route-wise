import React from 'react';
import {
  X,
  Compass,
  Shield,
  Wallet,
  Zap,
  Coffee,
  Footprints,
  Accessibility,
  Clock,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';

interface TravelerPreferencesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecentSearch?: (origin: string, destination: string) => void;
}

export const TravelerPreferencesSidebar: React.FC<TravelerPreferencesSidebarProps> = ({
  isOpen,
  onClose,
  onSelectRecentSearch,
}) => {
  const [travelStyle, setTravelStyle] = React.useState('balanced');
  const [mobilityStyle, setMobilityStyle] = React.useState('standard');
  const [walkingLimit, setWalkingLimit] = React.useState(1);
  const [maxTransfers, setMaxTransfers] = React.useState(2);
  const [quickPrefs, setQuickPrefs] = React.useState({
    avoidTolls: true,
    preferPublic: true,
    showFlights: true,
    safetyNight: true,
  });

  const recentSearches = [
    { origin: 'Dadar, Mumbai', dest: 'Hinjawadi Phase 1, Pune', time: 'Today, 10:10 AM' },
    { origin: 'Thane Station', dest: 'VJTI, Matunga', time: 'Oct 5, 9:00 AM' },
    { origin: 'Andheri West', dest: 'Powai IIT', time: 'Oct 4, 4:30 PM' },
    { origin: 'Dadar', dest: 'CST Mumbai', time: 'Oct 3, 8:00 AM' },
  ];

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-6 text-slate-800 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-heading text-base font-bold text-slate-900">
          Traveler Preferences
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section 1: Travel style */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Travel style
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'balanced', label: 'Balanced', desc: 'Time, cost & comfort', icon: Compass },
            { id: 'reliability', label: 'Reliability first', desc: 'Avoid delays', icon: Shield },
            { id: 'cheapest', label: 'Cheapest', desc: 'Lowest cost', icon: Wallet },
            { id: 'fastest', label: 'Fastest', desc: 'Minimum time', icon: Zap },
            { id: 'comfort', label: 'Comfort', desc: 'Fewer transfers', icon: Coffee },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = travelStyle === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setTravelStyle(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-2xs'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Mobility & walking */}
      <div className="space-y-3 pt-1 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Mobility & walking
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'standard', label: 'Standard', desc: 'Normal walking', icon: Footprints },
            { id: 'less_walking', label: 'Less walking', desc: 'Prefer shorter walks', icon: Footprints },
            { id: 'wheelchair', label: 'Wheelchair accessible', desc: 'Avoid stairs, prefer accessible routes', icon: Accessibility },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = mobilityStyle === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setMobilityStyle(item.id)}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sliders for walking limit */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Default walking limit</span>
            <span className="font-bold text-slate-900">{walkingLimit} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={walkingLimit}
            onChange={(e) => setWalkingLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Transfers toggle */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-slate-600 block">Default max transfers</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMaxTransfers(val)}
                className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                  maxTransfers === val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {val === 3 ? '3+' : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Recent searches */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            Recent searches
          </label>
          <button className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold">
            Clear all
          </button>
        </div>

        <div className="space-y-2">
          {recentSearches.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectRecentSearch && onSelectRecentSearch(item.origin, item.dest)}
              className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                  {item.origin} → {item.dest}
                </div>
                <div className="text-[10px] text-slate-400">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Quick preferences */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          Quick preferences
        </label>
        <div className="space-y-1.5 text-xs">
          {[
            { key: 'avoidTolls', label: 'Avoid toll routes' },
            { key: 'preferPublic', label: 'Prefer public transport' },
            { key: 'showFlights', label: 'Show flight options (if available)' },
            { key: 'safetyNight', label: 'Prioritize safety at night' },
          ].map((pref) => {
            const isChecked = quickPrefs[pref.key as keyof typeof quickPrefs];
            return (
              <label
                key={pref.key}
                className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    setQuickPrefs((prev) => ({
                      ...prev,
                      [pref.key]: !prev[pref.key as keyof typeof quickPrefs],
                    }))
                  }
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-medium">{pref.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom privacy info */}
      <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
        <span>Preferences are saved only in this browser. No account required.</span>
      </div>
    </div>
  );
};
