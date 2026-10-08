import React, { useState, useEffect } from 'react';
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
  Info,
  Check,
} from 'lucide-react';
import {
  fetchPreferences,
  savePreferences,
  fetchRecentSearches,
  clearRecentSearches,
} from '../services/api';

interface TravelerPreferencesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecentSearch?: (item: any) => void;
  onApplyPreferencesToPlanner?: (prefs: any) => void;
}

export const TravelerPreferencesSidebar: React.FC<TravelerPreferencesSidebarProps> = ({
  isOpen,
  onClose,
  onSelectRecentSearch,
  onApplyPreferencesToPlanner,
}) => {
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [mobilityStyle, setMobilityStyle] = useState('standard');
  const [walkingLimit, setWalkingLimit] = useState(1);
  const [maxTransfers, setMaxTransfers] = useState(2);
  const [quickPrefs, setQuickPrefs] = useState({
    avoidTolls: true,
    preferPublic: true,
    avoidStairs: false,
    showFlights: true,
    safetyNight: true,
  });
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Load from SQLite on mount
  useEffect(() => {
    loadPreferences();
    loadSearches();
  }, []);

  const loadPreferences = async () => {
    const data = await fetchPreferences();
    if (data) {
      setTravelStyle(data.travel_style || 'balanced');
      setMobilityStyle(data.accessibility_mode || 'standard');
      setWalkingLimit(data.walking_limit || 1);
      setMaxTransfers(data.max_transfers ?? 2);
      setQuickPrefs({
        avoidTolls: data.avoid_tolls ?? true,
        preferPublic: data.prefer_public_transport ?? true,
        avoidStairs: data.avoid_stairs ?? false,
        showFlights: data.prefer_flights ?? true,
        safetyNight: data.safety_priority ?? true,
      });
    }
  };

  const loadSearches = async () => {
    const searches = await fetchRecentSearches();
    setRecentSearches(searches || []);
  };

  const handleUpdatePreference = (updatedValues: any) => {
    const newPrefs = {
      travel_style: travelStyle,
      walking_limit: walkingLimit,
      max_transfers: maxTransfers,
      prefer_public_transport: quickPrefs.preferPublic,
      avoid_tolls: quickPrefs.avoidTolls,
      avoid_stairs: quickPrefs.avoidStairs,
      accessibility_mode: mobilityStyle,
      prefer_flights: quickPrefs.showFlights,
      safety_priority: quickPrefs.safetyNight,
      voice_enabled: true,
      ...updatedValues,
    };
    savePreferences(newPrefs);
    if (onApplyPreferencesToPlanner) {
      onApplyPreferencesToPlanner(newPrefs);
    }
  };

  const handleClearSearches = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-[#0D1527] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-6 text-slate-800 dark:text-slate-100 h-fit transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            Traveler Preferences
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Personalize how RouteWise chooses journeys.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section 1: Travel style */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
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
                onClick={() => {
                  setTravelStyle(item.id);
                  handleUpdatePreference({ travel_style: item.id });
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</div>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Mobility & walking */}
      <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
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
                onClick={() => {
                  setMobilityStyle(item.id);
                  handleUpdatePreference({ accessibility_mode: item.id });
                }}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</div>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sliders for walking limit */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Default walking limit</span>
            <span className="font-bold text-slate-900 dark:text-white">{walkingLimit} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={walkingLimit}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWalkingLimit(val);
              handleUpdatePreference({ walking_limit: val });
            }}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Transfers toggle */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-slate-600 dark:text-slate-400 block">Default max transfers</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setMaxTransfers(val);
                  handleUpdatePreference({ max_transfers: val });
                }}
                className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                  maxTransfers === val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {val === 3 ? '3+' : val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Recent searches (Backed by SQLite) */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
            Recent searches
          </label>
          <button
            onClick={handleClearSearches}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-2">
          {recentSearches.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No recent searches yet.</p>
          ) : (
            recentSearches.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRecentSearch && onSelectRecentSearch(item)}
                className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {item.origin} → {item.destination}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {item.created_at || item.deadline}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 4: Quick preferences */}
      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
          Quick preferences
        </label>
        <div className="space-y-1.5 text-xs">
          {[
            { key: 'preferPublic', label: 'Prefer public transport', dbKey: 'prefer_public_transport' },
            { key: 'avoidTolls', label: 'Avoid toll routes', dbKey: 'avoid_tolls' },
            { key: 'avoidStairs', label: 'Avoid stairs', dbKey: 'avoid_stairs' },
            { key: 'safetyNight', label: 'Prioritize safety at night', dbKey: 'safety_priority' },
            { key: 'showFlights', label: 'Prefer flights for long-distance', dbKey: 'prefer_flights' },
          ].map((pref) => {
            const isChecked = quickPrefs[pref.key as keyof typeof quickPrefs];
            return (
              <label
                key={pref.key}
                className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const nextVal = !isChecked;
                    const nextQuick = {
                      ...quickPrefs,
                      [pref.key]: nextVal,
                    };
                    setQuickPrefs(nextQuick);
                    handleUpdatePreference({ [pref.dbKey]: nextVal });
                  }}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-medium">{pref.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom privacy info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        <span>Preferences stored in local SQLite database. No account required.</span>
      </div>
    </div>
  );
};
