import React from 'react';
import { Radio, Newspaper, Search, Map, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface SignalItem {
  source: string;
  engine: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'active' | 'incident_detected' | 'clear';
  statusText: string;
  details: string;
  timestamp: string;
}

export const LiveSignalsFeed: React.FC<{ hasDisruption: boolean }> = ({ hasDisruption }) => {
  const signals: SignalItem[] = [
    {
      source: 'Google Maps Directions',
      engine: 'google_maps_directions via SerpApi',
      icon: Map,
      status: 'active',
      statusText: 'Synchronized',
      details: 'Ingested road travel matrices, train right-of-way schedules, and walking links.',
      timestamp: '2s ago',
    },
    {
      source: 'Google News Monitor',
      engine: 'google_news via SerpApi',
      icon: Newspaper,
      status: hasDisruption ? 'incident_detected' : 'clear',
      statusText: hasDisruption ? 'Disruption Detected' : 'No Critical Incidents',
      details: hasDisruption
        ? 'Active report: Severe Khandala Ghat blockage on Expressway (+65m delay exposure).'
        : 'Scanned 14 local news feeds for railway strikes, track faults, and road closures.',
      timestamp: hasDisruption ? 'Just now' : '3m ago',
    },
    {
      source: 'Google Web Search Advisories',
      engine: 'google via SerpApi',
      icon: Search,
      status: 'clear',
      statusText: 'Corridor Clear',
      details: 'Validated official traffic police and highway authority construction advisories.',
      timestamp: '8m ago',
    },
    {
      source: 'Local Transit Headways',
      engine: 'google_maps local hub query',
      icon: Radio,
      status: 'active',
      statusText: 'Operational',
      details: 'Platform connection windows & feeder auto-rickshaw availability verified.',
      timestamp: 'Active',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-ping" />
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <span>Live SerpApi Intelligence Signals</span>
            <span className="px-2 py-0.5 rounded-full bg-navy-800 text-[10px] font-bold text-brand-cyan border border-white/10">
              4 Engines Active
            </span>
          </h3>
        </div>
        <span className="text-xs text-slate-400">Continuous background polling</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {signals.map((sig, idx) => {
          const Icon = sig.icon;
          const isIncident = sig.status === 'incident_detected';
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isIncident
                  ? 'bg-brand-rose/10 border-brand-rose/40 shadow-glow-orange'
                  : 'bg-navy-950/60 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Icon className={`w-4 h-4 ${isIncident ? 'text-brand-rose' : 'text-brand-orange'}`} />
                  <span>{sig.source}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isIncident
                      ? 'bg-brand-rose/20 text-brand-rose border border-brand-rose/30'
                      : 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30'
                  }`}
                >
                  {sig.statusText}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {sig.details}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
                <span className="font-mono text-slate-400 truncate max-w-[130px]">{sig.engine}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{sig.timestamp}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
