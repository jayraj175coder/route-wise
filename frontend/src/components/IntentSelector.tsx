import React from 'react';
import { JourneyIntent } from '../types/journey';
import { Briefcase, GraduationCap, Plane, AlertTriangle, Users, Wallet, Navigation } from 'lucide-react';

interface IntentSelectorProps {
  selectedIntent: JourneyIntent;
  onSelectIntent: (intent: JourneyIntent) => void;
}

interface IntentOption {
  id: JourneyIntent;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INTENTS: IntentOption[] = [
  { id: 'interview', label: 'Interview', tagline: 'High reliability & safe arrival buffer', icon: Briefcase },
  { id: 'exam', label: 'Exam', tagline: 'Max buffer & minimum stress', icon: GraduationCap },
  { id: 'flight', label: 'Flight', tagline: 'Zero transfer risk & generous lead time', icon: Plane },
  { id: 'emergency', label: 'Emergency', tagline: 'Immediate arrival priority', icon: AlertTriangle },
  { id: 'family', label: 'Family', tagline: 'Minimal walking & low transfers', icon: Users },
  { id: 'budget', label: 'Budget', tagline: 'Lowest cost per journey', icon: Wallet },
  { id: 'general', label: 'General', tagline: 'Balanced time, cost & comfort', icon: Navigation },
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({ selectedIntent, onSelectIntent }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
        Travel Purpose & Intent Profile
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {INTENTS.map((intent) => {
          const isSelected = selectedIntent === intent.id;
          const Icon = intent.icon;
          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => onSelectIntent(intent.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange scale-[1.02]'
                  : 'bg-navy-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg mb-1.5 ${isSelected ? 'bg-brand-orange text-navy-950' : 'bg-navy-800 text-slate-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">{intent.label}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{intent.tagline}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
