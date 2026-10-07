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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-slate-900">Disruption & Risk Evidence</h3>
              <p className="text-xs text-slate-500">
                Signals gathered via SerpApi Google Search & Google News intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Disruption Signals */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Disruption Signals Detected ({disruptions.length})</span>
          </h4>

          {disruptions.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No critical news or traffic disruptions detected along this corridor.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {disruptions.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-slate-900 leading-tight">{d.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                        d.severity === 'high'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {d.severity} impact
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Source: <strong className="text-slate-700">{d.source}</strong></span>
                    <span>Location: <strong className="text-slate-700">{d.location}</strong></span>
                    <span>Estimated delay: <strong className="text-rose-600">+{d.impact_minutes} min</strong></span>
                  </div>

                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>Verify original news article</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Factors Assessment */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Corridor Vulnerability Profile</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskFactors.map((rf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="text-slate-700 font-medium">{rf.factor}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rf.severity === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : rf.severity === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rf.severity.toUpperCase()} (+{rf.impact_minutes}m)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
          >
            Close Evidence Window
          </button>
        </div>
      </div>
    </div>
  );
};
