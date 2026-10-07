import React, { useState, useEffect, useRef } from 'react';
import {
  JourneyRequest,
  OptimizationResult,
  CandidateRoute,
  ReoptimizeResult,
} from './types/journey';
import {
  optimizeJourney,
  reoptimizeJourney,
  simulateWhatIf,
} from './services/api';
import { Navbar } from './components/Navbar';
import { PlanYourJourney } from './components/PlanYourJourney';
import { RightResultsDashboard } from './components/RightResultsDashboard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DecisionSensitivity } from './components/DecisionSensitivity';
import { ReoptimizeBanner } from './components/ReoptimizeBanner';
import { ReoptimizePipelineModal } from './components/ReoptimizePipelineModal';
import { EvidenceModal } from './components/EvidenceModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { Sparkles, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  const [request, setRequest] = useState<JourneyRequest>({
    origin: 'Dadar, Mumbai',
    destination: 'Hinjawadi Phase 1, Pune',
    arrival_deadline: '10:10 AM',
    max_budget: 1500,
    max_walking_distance_meters: 1000,
    max_transfers: 2,
    intent: 'interview',
    weights: {
      time: 0.30,
      cost: 0.20,
      reliability: 0.40,
      comfort: 0.10,
      walking: 0.10,
    },
  });

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CandidateRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);
  const [reoptimizeData, setReoptimizeData] = useState<ReoptimizeResult | null>(null);
  const [hasDisruption, setHasDisruption] = useState<boolean>(false);
  const [apiConnected] = useState<boolean>(true);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Initial optimization on mount
  useEffect(() => {
    handleRunOptimize();
  }, []);

  const handleRunOptimize = async () => {
    setIsLoading(true);
    try {
      const res = await optimizeJourney(request);
      setOptimizationResult(res);
      if (res.recommended_route) {
        setSelectedRoute(res.recommended_route);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerReoptimize = () => {
    setIsPipelineOpen(true);
  };

  const handlePipelineCompleted = async () => {
    setIsPipelineOpen(false);
    const nextDisruption = !hasDisruption;
    setHasDisruption(nextDisruption);
    setIsLoading(true);

    try {
      if (nextDisruption) {
        const prevId = selectedRoute?.id || 'route-rail-lastmile';
        const reopt = await reoptimizeJourney(request, prevId);
        setReoptimizeData(reopt);
        setOptimizationResult(reopt.optimization_result);
        if (reopt.new_recommended_route) {
          setSelectedRoute(reopt.new_recommended_route);
        }
      } else {
        setReoptimizeData(null);
        await handleRunOptimize();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatIfSimulation = async (adjustments: any) => {
    try {
      const res = await simulateWhatIf(request, adjustments);
      setOptimizationResult(res.optimization_result);
      if (res.optimization_result.recommended_route) {
        setSelectedRoute(res.optimization_result.recommended_route);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentRoute = selectedRoute || optimizationResult?.recommended_route;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#FF7A1A]/20 selection:text-slate-900">
      {/* 1. Header Navigation Bar */}
      <Navbar
        apiConnected={apiConnected}
        onRefresh={() => handleRunOptimize()}
        isDemoActive={isDemoActive}
        onToggleDemo={() => setIsDemoActive(!isDemoActive)}
      />

      {/* Main Split-Column Container */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Re-optimization Alert Banner (when disruption triggered) */}
        {reoptimizeData && (
          <ReoptimizeBanner
            previousRoute={reoptimizeData.previous_route}
            newRoute={reoptimizeData.new_recommended_route}
            cause={reoptimizeData.disruption_cause}
            changeSummary={reoptimizeData.change_summary}
            onDismiss={() => setReoptimizeData(null)}
          />
        )}

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Plan your journey */}
          <div className="lg:col-span-5 xl:col-span-4">
            <PlanYourJourney
              request={request}
              onChangeRequest={setRequest}
              onOptimize={handleRunOptimize}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Best Journey + Alternatives + 3 Bottom Cards */}
          <div className="lg:col-span-7 xl:col-span-8" ref={resultsRef}>
            {currentRoute && optimizationResult ? (
              <RightResultsDashboard
                request={request}
                optimizationResult={optimizationResult}
                selectedRoute={currentRoute}
                onSelectRoute={(r) => setSelectedRoute(r)}
                onOpenSignalsModal={() => setIsEvidenceOpen(true)}
                onOpenScoreModal={() => setIsEvidenceOpen(true)}
              />
            ) : (
              /* Loading Skeleton */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl mx-auto" />
                <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                <div className="h-48 bg-slate-100 rounded-xl mt-6" />
              </div>
            )}
          </div>
        </div>

        {/* Optional Advanced Decision Tools Drawer */}
        <div className="pt-4 border-t border-slate-200/80">
          <button
            onClick={() => setShowAdvancedTools(!showAdvancedTools)}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Advanced Decision Engine: What-If Simulation & Sensitivity Radar
                </h4>
                <p className="text-xs text-slate-500">
                  Simulate rain delays, road blockages, and test decision stability boundaries
                </p>
              </div>
            </div>
            {showAdvancedTools ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAdvancedTools && currentRoute && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <DecisionSensitivity route={currentRoute} />
              <WhatIfSimulator
                request={request}
                onSimulate={handleWhatIfSimulation}
              />
            </div>
          )}
        </div>
      </main>

      {/* Disruption Evidence Modal */}
      {currentRoute && (
        <EvidenceModal
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          disruptions={currentRoute.disruption_signals}
          riskFactors={currentRoute.risk_factors}
        />
      )}

      {/* Re-Optimization 6-Stage Pipeline Modal */}
      <ReoptimizePipelineModal
        isOpen={isPipelineOpen}
        onComplete={handlePipelineCompleted}
      />

      {/* Safety Notice & Footer */}
      <DisclaimerFooter />
    </div>
  );
};

export default App;
