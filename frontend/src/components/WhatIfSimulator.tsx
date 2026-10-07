import React, { useState } from 'react';
import { JourneyRequest, PriorityWeights } from '../types/journey';
import { SlidersHorizontal, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface WhatIfSimulatorProps {
  request: JourneyRequest;
  onSimulate: (adjustments: {
    budget?: number;
    walking?: number;
    transfers?: number;
    weights?: PriorityWeights;
  }) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ request, onSimulate }) => {
  const [budget, setBudget] = useState(request.max_budget);
  const [walking, setWalking] = useState(request.max_walking_distance_meters);
  const [transfers, setTransfers] = useState(request.max_transfers);
  const [costWeight, setCostWeight] = useState(Math.round(request.weights.cost * 100));
  const [relWeight, setRelWeight] = useState(Math.round(request.weights.reliability * 100));

  const applyChanges = (newBudget: number, newWalking: number, newTransfers: number, newCost: number, newRel: number) => {
    onSimulate({
      budget: newBudget,
      walking: newWalking,
      transfers: newTransfers,
      weights: {
        ...request.weights,
        cost: newCost / 100,
        reliability: newRel / 100,
      },
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-cyan/20 text-brand-cyan">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <span>What-If Simulator</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan text-[10px] font-extrabold uppercase">
                Interactive Stress Testing
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dynamically manipulate constraints to see the decision engine re-rank alternative journeys in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Slider */}
        <div className="bg-navy-950/70 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Budget Threshold</span>
            <span className="font-extrabold text-brand-emerald">₹{budget}</span>
          </div>
          <input
            type="range"
            min="400"
            max="3000"
            step="100"
            value={budget}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBudget(val);
              applyChanges(val, walking, transfers, costWeight, relWeight);
            }}
            className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>₹400</span>
            <span>₹3,000</span>
          </div>
        </div>

        {/* Walking Slider */}
        <div className="bg-navy-950/70 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Max Walking Limit</span>
            <span className="font-extrabold text-brand-cyan">{walking}m</span>
          </div>
          <input
            type="range"
            min="200"
            max="2500"
            step="100"
            value={walking}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWalking(val);
              applyChanges(budget, val, transfers, costWeight, relWeight);
            }}
            className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>200m</span>
            <span>2.5km</span>
          </div>
        </div>

        {/* Cost vs Reliability Trade-off */}
        <div className="bg-navy-950/70 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Cost Priority Weight</span>
            <span className="font-extrabold text-brand-orange">{costWeight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={costWeight}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCostWeight(val);
              applyChanges(budget, walking, transfers, val, relWeight);
            }}
            className="w-full h-1.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Max Transfers Selector */}
        <div className="bg-navy-950/70 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Transfer Allowance</span>
            <span className="font-extrabold text-white">{transfers} max</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setTransfers(num);
                  applyChanges(budget, walking, num, costWeight, relWeight);
                }}
                className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                  transfers === num
                    ? 'bg-brand-cyan text-navy-950 border-brand-cyan'
                    : 'bg-navy-900 text-slate-300 border-white/5 hover:border-white/20'
                }`}
              >
                {num === 3 ? '3+' : num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
