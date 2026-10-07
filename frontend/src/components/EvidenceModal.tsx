import React from 'react';
import { DisruptionSignal, RiskFactor } from '../types/journey';
import { X, ExternalLink, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  disruptions: DisruptionSignal[];
  riskFactors: RiskFactor[];
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  disruptions,
  riskFactors,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
      <div className="glass-card max-w-2xl w-full rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/20 text-brand-orange">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Disruption & Risk Evidence</h3>
              <p className="text-xs text-slate-400">
                Signals gathered via SerpApi Google Search & Google News intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Disruption Signals */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-brand-amber" />
            <span>Disruption Signals Detected ({disruptions.length})</span>
          </h4>

          {disruptions.length === 0 ? (
            <div className="p-4 rounded-xl bg-navy-950/60 border border-white/5 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              <span>No critical news or traffic disruptions detected along this corridor.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {disruptions.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-navy-950/80 border border-brand-amber/30 space-y-2 hover:border-brand-amber transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-white leading-tight">{d.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                        d.severity === 'high'
                          ? 'bg-brand-rose/20 text-brand-rose border border-brand-rose/40'
                          : 'bg-brand-amber/20 text-brand-amber border border-brand-amber/40'
                      }`}
                    >
                      {d.severity} severity
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-500 block">SOURCE</span>
                      <span className="text-slate-200 font-medium">{d.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PUBLISHED</span>
                      <span className="text-slate-200 font-medium">{d.published_time}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">LOCATION</span>
                      <span className="text-slate-200 font-medium">{d.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IMPACT</span>
                      <span className="text-brand-amber font-bold">+{d.impact_minutes}m delay</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      {d.confidence < 0.6 ? (
                        <span className="text-brand-amber italic">Low-confidence signal.</span>
                      ) : (
                        <span>Verified Signal (Confidence: {(d.confidence * 100).toFixed(0)}%)</span>
                      )}
                    </span>

                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-orange hover:underline font-semibold"
                    >
                      <span>View original source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Structural Risk Factors */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-brand-cyan" />
            <span>Journey Complexity & Structural Risk Factors ({riskFactors.length})</span>
          </h4>

          <div className="space-y-2">
            {riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-navy-950/50 border border-white/5 text-xs"
              >
                <span className="text-slate-200 font-medium">{rf.factor}</span>
                <span className="text-slate-400">
                  {rf.impact_minutes > 0 ? `~${rf.impact_minutes} min risk impact` : 'Low exposure'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-bold text-white border border-white/10 transition-all"
          >
            Close Evidence Panel
          </button>
        </div>
      </div>
    </div>
  );
};
