import React from 'react';
import { CandidateRoute } from '../types/journey';
import { ShieldAlert, Car, Train, CloudSun, Shuffle, Clock, CheckCircle } from 'lucide-react';

interface RiskRadarProps {
  route: CandidateRoute;
  hasDisruption: boolean;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ route, hasDisruption }) => {
  const radarCategories = [
    {
      label: 'Highway & Road Traffic',
      level: hasDisruption ? 'HIGH RISK' : 'LOW RISK',
      score: hasDisruption ? 85 : 18,
      impact: hasDisruption ? '+60 min delay exposure' : 'Normal flow',
      color: hasDisruption ? 'bg-brand-rose' : 'bg-brand-emerald',
      textColor: hasDisruption ? 'text-brand-rose' : 'text-brand-emerald',
      icon: Car,
    },
    {
      label: 'Transit & Rail Corridor',
      level: 'LOW RISK',
      score: 12,
      impact: 'Dedicated track right-of-way',
      color: 'bg-brand-emerald',
      textColor: 'text-brand-emerald',
      icon: Train,
    },
    {
      label: 'Transfer Tightness',
      level: route.transfer_count > 1 ? 'MODERATE' : 'LOW RISK',
      score: route.transfer_count * 20,
      impact: `${route.transfer_count} platform connection(s)`,
      color: route.transfer_count > 1 ? 'bg-brand-amber' : 'bg-brand-cyan',
      textColor: route.transfer_count > 1 ? 'text-brand-amber' : 'text-brand-cyan',
      icon: Shuffle,
    },
    {
      label: 'Weather & Climate Exposure',
      level: 'LOW RISK',
      score: 15,
      impact: 'Dry clear conditions along corridor',
      color: 'bg-brand-emerald',
      textColor: 'text-brand-emerald',
      icon: CloudSun,
    },
    {
      label: 'Arrival Buffer Margin',
      level: route.arrival_buffer_minutes >= 30 ? 'OPTIMAL' : 'CRITICAL',
      score: Math.max(10, 100 - route.arrival_buffer_minutes * 2),
      impact: `+${route.arrival_buffer_minutes}m safety buffer preserved`,
      color: route.arrival_buffer_minutes >= 30 ? 'bg-brand-emerald' : 'bg-brand-rose',
      textColor: route.arrival_buffer_minutes >= 30 ? 'text-brand-emerald' : 'text-brand-rose',
      icon: Clock,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-rose/20 text-brand-rose">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Journey Risk Radar</h3>
            <p className="text-xs text-slate-400">
              Corridor vulnerability decomposition across 5 uncertainty dimensions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Composite Risk:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
            route.risk_level === 'HIGH' ? 'bg-brand-rose/20 text-brand-rose border border-brand-rose/30' : 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30'
          }`}>
            {route.risk_level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {radarCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div key={idx} className="bg-navy-950/70 p-4 rounded-xl border border-white/5 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className={`text-[10px] font-extrabold tracking-wider ${cat.textColor}`}>
                    {cat.level}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-tight">{cat.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{cat.impact}</p>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Exposure</span>
                  <span className="font-bold text-slate-300">{Math.round(cat.score)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-navy-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
