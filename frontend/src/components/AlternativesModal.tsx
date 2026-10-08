import React from 'react';
import { CandidateRoute } from '../types/journey';
import {
  X,
  IndianRupee,
  Clock,
  Footprints,
  Shuffle,
  Train,
  Bus,
  Car,
  Navigation,
} from 'lucide-react';

interface AlternativesModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: CandidateRoute[];
  selectedRouteId: string;
  onSelectRoute: (route: CandidateRoute) => void;
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({
  isOpen,
  onClose,
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  if (!isOpen) return null;

  const getModeIcon = (summary: string) => {
    const s = summary.toLowerCase();
    if (s.includes('train') || s.includes('rail')) return Train;
    if (s.includes('bus')) return Bus;
    if (s.includes('bike') || s.includes('rapido')) return Navigation;
    return Car;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D1527] rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white">
              Alternative Route Options
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare transit, cost, and travel times across all generated options
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {routes.map((route, idx) => {
            const isSelected = route.id === selectedRouteId;
            const Icon = getModeIcon(route.mode_summary);

            return (
              <div
                key={`${route.id}-${idx}`}
                onClick={() => {
                  onSelectRoute(route);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {route.mode_summary}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>₹{Math.round(route.estimated_cost)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round(route.total_duration_minutes)} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>{route.transfer_count} transfers</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Footprints className="w-3.5 h-3.5" />
                        <span>{Math.round(route.walking_distance_meters)}m walk</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Score: {Math.round(route.confidence_score || route.overall_score || 85)}/100
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                      {route.risk_level} Risk
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
