import React, { useState } from 'react';
import { JourneyRequest, PriorityWeights } from '../types/journey';
import { SlidersHorizontal } from 'lucide-react';

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
    <div className="bg-white dark:bg-[#0D1527] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>What-If Simulator</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase border border-blue-200 dark:border-blue-700">
                Stress Testing
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dynamically manipulate constraints to see the decision engine re-rank alternative journeys in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Slider */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Budget Threshold</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{budget}</span>
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>₹400</span>
            <span>₹3,000</span>
          </div>
        </div>

        {/* Walking Slider */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Max Walking Limit</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">{walking}m</span>
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>200m</span>
            <span>2.5km</span>
          </div>
        </div>

        {/* Cost vs Reliability Trade-off */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Cost Priority Weight</span>
            <span className="font-extrabold text-orange-600 dark:text-orange-400">{costWeight}%</span>
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Max Transfers Selector */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Transfer Allowance</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{transfers} max</span>
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
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
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
