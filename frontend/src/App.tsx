import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { CenterDashboard } from './components/CenterDashboard';
import { TravelerPreferencesSidebar } from './components/TravelerPreferencesSidebar';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DecisionSensitivity } from './components/DecisionSensitivity';
import { ReoptimizeBanner } from './components/ReoptimizeBanner';
import { ReoptimizePipelineModal } from './components/ReoptimizePipelineModal';
import { EvidenceModal } from './components/EvidenceModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  const [request, setRequest] = useState<JourneyRequest>({
    origin: 'Dadar, Mumbai',
    destination: 'Hinjawadi Phase 1, Pune',
    arrival_deadline: '10:10 AM',
    max_budget: 1500,
    max_walking_distance_meters: 1000,
    max_transfers: 2,
    intent: 'general',
    weights: {
      reliability: 0.30,
      time: 0.30,
      cost: 0.20,
      walking: 0.10,
      comfort: 0.10,
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
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  // Always-fresh ref so closures never see stale request
  const requestRef = useRef(request);
  useEffect(() => { requestRef.current = request; }, [request]);

  // Initial optimization on mount — runs once
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      handleRunOptimize();
    }
  }, []);

  const handleRunOptimize = useCallback(async (customReq?: JourneyRequest) => {
    // Always use the explicitly passed req, or fall back to the ref (never stale)
    const reqToRun = customReq ?? requestRef.current;
    setIsLoading(true);
    try {
      const res = await optimizeJourney(reqToRun);
      setOptimizationResult(res);
      if (res.recommended_route) {
        setSelectedRoute(res.recommended_route);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleSelectRecentSearch = (item: any) => {
    const updatedReq: JourneyRequest = {
      ...request,
      origin: item.origin,
      destination: item.destination,
      arrival_deadline: item.deadline || '10:10 AM',
      max_budget: item.budget || 1500,
      max_walking_distance_meters: item.walking_limit || 1000,
      max_transfers: item.max_transfers ?? 2,
      intent: (item.purpose || 'general') as any,
    };
    setRequest(updatedReq);
    handleRunOptimize(updatedReq);
  };

  const handleApplyPreferencesToPlanner = (prefs: any) => {
    let updatedWeights = { ...request.weights };
    if (prefs.travel_style === 'reliability') {
      updatedWeights = { reliability: 0.50, time: 0.20, cost: 0.15, walking: 0.10, comfort: 0.05 };
    } else if (prefs.travel_style === 'cheapest') {
      updatedWeights = { reliability: 0.20, time: 0.15, cost: 0.50, walking: 0.10, comfort: 0.05 };
    } else if (prefs.travel_style === 'fastest') {
      updatedWeights = { reliability: 0.25, time: 0.50, cost: 0.10, walking: 0.10, comfort: 0.05 };
    } else if (prefs.travel_style === 'comfort') {
      updatedWeights = { reliability: 0.25, time: 0.15, cost: 0.15, walking: 0.15, comfort: 0.30 };
    }

    const updated = {
      ...request,
      max_walking_distance_meters: (prefs.walking_limit || 1.0) * 1000,
      max_transfers: prefs.max_transfers ?? request.max_transfers,
      weights: updatedWeights,
    };
    setRequest(updated);
  };

  const currentRoute = selectedRoute || optimizationResult?.recommended_route;

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 flex flex-col font-sans selection:bg-[#FF7A1A]/20 selection:text-slate-900">
      {/* Navbar */}
      <Navbar
        apiConnected={apiConnected}
        onRefresh={() => handleRunOptimize()}
        onTogglePreferences={() => setIsPreferencesOpen(!isPreferencesOpen)}
        isPreferencesOpen={isPreferencesOpen}
      />

      {/* Main Layout */}
      <main className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5 gap-4">

        {/* Re-optimization Banner */}
        {reoptimizeData && (
          <ReoptimizeBanner
            previousRoute={reoptimizeData.previous_route}
            newRoute={reoptimizeData.new_recommended_route}
            cause={reoptimizeData.disruption_cause}
            changeSummary={reoptimizeData.change_summary}
            onDismiss={() => setReoptimizeData(null)}
          />
        )}

        {/* Two-Panel Split */}
        <div className="flex gap-5 items-start flex-1">

          {/* LEFT PANEL — Input Sidebar */}
          <aside className="w-[320px] xl:w-[340px] shrink-0 sticky top-[72px]">
            <PlanYourJourney
              request={request}
              onChangeRequest={setRequest}
              onOptimize={(customReq) => handleRunOptimize(customReq)}
              isLoading={isLoading}
            />
          </aside>

          {/* RIGHT PANEL — Results */}
          <div className="flex-1 min-w-0 flex flex-col gap-4" ref={resultsRef}>
            {currentRoute && optimizationResult ? (
              <CenterDashboard
                request={request}
                optimizationResult={optimizationResult}
                selectedRoute={currentRoute}
                onSelectRoute={(r) => setSelectedRoute(r)}
                onOpenSignalsModal={() => setIsEvidenceOpen(true)}
                onOpenScoreModal={() => setIsEvidenceOpen(true)}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl mx-auto" />
                <div className="h-5 bg-slate-200 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                <div className="h-72 bg-slate-100 rounded-xl mt-6" />
              </div>
            )}

            {/* Advanced Decision Tools — Collapsible */}
            <div className="border-t border-slate-200/60 pt-1">
              <button
                onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:bg-slate-50 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Advanced: What-If Stress Testing & Sensitivity Radar
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Simulate rain delays, road blockages, and test decision stability
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
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <DecisionSensitivity route={currentRoute} />
                  <WhatIfSimulator
                    request={request}
                    onSimulate={handleWhatIfSimulation}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Traveler Preferences Sidebar — Slide-over */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsPreferencesOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white shadow-2xl h-full overflow-y-auto">
            <TravelerPreferencesSidebar
              isOpen={isPreferencesOpen}
              onClose={() => setIsPreferencesOpen(false)}
              onSelectRecentSearch={handleSelectRecentSearch}
              onApplyPreferencesToPlanner={handleApplyPreferencesToPlanner}
            />
          </div>
        </div>
      )}

      {/* Disruption Evidence Modal */}
      {currentRoute && (
        <EvidenceModal
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          disruptions={currentRoute.disruption_signals}
          riskFactors={currentRoute.risk_factors}
        />
      )}

      {/* Re-Optimization Pipeline Modal */}
      <ReoptimizePipelineModal
        isOpen={isPipelineOpen}
        onComplete={handlePipelineCompleted}
      />

      <DisclaimerFooter />
    </div>
  );
};

export default App;
