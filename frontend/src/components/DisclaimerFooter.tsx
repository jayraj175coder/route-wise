import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-navy-950/90 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Safety & Honesty Banner */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-brand-orange/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Info className="w-5 h-5 text-brand-orange shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white">Integrity & Decision Score Notice: </span>
            RouteWise Confidence is an internal decision score based on available route and disruption signals. It is not a guaranteed probability of arrival.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">RouteWise</span>
            <span>—</span>
            <span>Risk-Aware Personal Mobility Decision Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by SerpApi Live Directions & News</span>
            <span>•</span>
            <span>Deterministic Optimization Pipeline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
