import React from 'react';
import { CandidateRoute } from '../types/journey';
import { IndianRupee, Clock, Footprints, Shuffle, ShieldCheck } from 'lucide-react';

interface AlternativesListProps {
  routes: CandidateRoute[];
  selectedRouteId: string;
  onSelectRoute: (route: CandidateRoute) => void;
}

export const AlternativesList: React.FC<AlternativesListProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'cheapest':
        return { label: 'Cheapest', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'fastest':
        return { label: 'Fastest', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'most_reliable':
        return { label: 'Most Reliable', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'best_fit':
        return { label: 'Best For You', color: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30' };
      default:
        return { label: 'Alternative', color: 'bg-slate-700/40 text-slate-300 border-white/10' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-bold text-white">Compare Alternative Options</h3>
        <span className="text-xs text-slate-400">Click any option to preview journey details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => {
          const badge = getBadgeForType(route.route_type);
          const isSelected = route.id === selectedRouteId;
          const hours = Math.floor(route.total_duration_minutes / 60);
          const mins = Math.round(route.total_duration_minutes % 60);

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-navy-900/90 border-brand-orange shadow-glow-orange scale-[1.01]'
                  : 'bg-navy-950/60 border-white/10 hover:border-white/25 hover:bg-navy-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                  {badge.label}
                </span>

                <div className="flex items-center gap-1 text-xs font-extrabold text-brand-orange">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{Math.round(route.confidence_score)} Confidence</span>
                </div>
              </div>

              <h4 className="font-heading text-base font-bold text-white mb-2">{route.mode_summary}</h4>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5 my-2">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <IndianRupee className="w-3.5 h-3.5 text-brand-emerald" />
                  <span className="font-bold text-white">₹{route.estimated_cost.toFixed(0)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Footprints className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.walking_distance_meters}m walk</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{route.transfer_count} transfers</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Buffer: +{route.arrival_buffer_minutes}m</span>
                <span className={route.risk_level === 'HIGH' ? 'text-brand-rose font-bold' : 'text-slate-400'}>
                  {route.risk_level} Risk
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
