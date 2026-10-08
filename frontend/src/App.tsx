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
import { InteractiveMapPanel } from './components/InteractiveMapPanel';
import { AlternativesModal } from './components/AlternativesModal';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { TravelerPreferencesSidebar } from './components/TravelerPreferencesSidebar';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DecisionSensitivity } from './components/DecisionSensitivity';
import { ReoptimizeBanner } from './components/ReoptimizeBanner';
import { ReoptimizePipelineModal } from './components/ReoptimizePipelineModal';
import { EvidenceModal } from './components/EvidenceModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  // Default request matching screenshot scenario
  const [request, setRequest] = useState<JourneyRequest>({
    origin: 'Rabale, New Mumbai',
    destination: 'Thane',
    arrival_deadline: '10:10 AM',
    max_budget: 100,
    max_walking_distance_meters: 1000,
    max_transfers: 3,
    intent: 'general',
    weights: {
      reliability: 0.35,
      time: 0.35,
      cost: 0.20,
      walking: 0.05,
      comfort: 0.05,
    },
  });

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CandidateRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>('plan');

  // Modals state
  const [isAlternativesOpen, setIsAlternativesOpen] = useState<boolean>(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [reoptimizeData, setReoptimizeData] = useState<ReoptimizeResult | null>(null);
  const [hasDisruption, setHasDisruption] = useState<boolean>(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState<boolean>(false);

  // Dark mode state with persistence in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('routewise-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('routewise-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('routewise-theme', 'light');
    }
  }, [isDarkMode]);

  const requestRef = useRef(request);
  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  // Initial optimization on mount
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      handleRunOptimize();
    }
  }, []);

  const handleRunOptimize = useCallback(async (customReq?: JourneyRequest) => {
    const reqToRun = customReq ?? requestRef.current;
    setIsLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 850));
    try {
      const [res] = await Promise.all([optimizeJourney(reqToRun), minDelay]);
      setOptimizationResult(res);
      if (res.recommended_route) {
        setSelectedRoute(res.recommended_route);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNavTabSelect = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'alternatives') {
      setIsAlternativesOpen(true);
    } else if (tab === 'signals') {
      setIsEvidenceOpen(true);
    } else if (tab === 'score') {
      setIsScoreModalOpen(true);
    } else if (tab === 'map') {
      const mapEl = document.getElementById('map-panel-container');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePipelineCompleted = async () => {
    setIsPipelineOpen(false);
    const nextDisruption = !hasDisruption;
    setHasDisruption(nextDisruption);
    setIsLoading(true);

    try {
      if (nextDisruption) {
        const prevId = selectedRoute?.id || 'route-local-suburban-train';
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
      max_budget: item.budget || 100,
      max_walking_distance_meters: item.walking_limit || 1000,
      max_transfers: item.max_transfers ?? 3,
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
  const allRoutes = optimizationResult
    ? [
        ...(optimizationResult.recommended_route ? [optimizationResult.recommended_route] : []),
        ...optimizationResult.alternative_routes,
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-[#FF7A1A]/20 selection:text-slate-900 transition-colors duration-200">
      {/* Navbar with exact tabs */}
      <Navbar
        apiConnected={true}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleNavTabSelect}
        onRefresh={() => handleRunOptimize()}
        onTogglePreferences={() => setIsPreferencesOpen(!isPreferencesOpen)}
        isPreferencesOpen={isPreferencesOpen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main 3-Column Layout */}
      <main className="flex-1 flex flex-col w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-5 gap-4">
        {/* Re-optimization Alert Banner */}
        {reoptimizeData && (
          <ReoptimizeBanner
            previousRoute={reoptimizeData.previous_route}
            newRoute={reoptimizeData.new_recommended_route}
            cause={reoptimizeData.disruption_cause}
            changeSummary={reoptimizeData.change_summary}
            onDismiss={() => setReoptimizeData(null)}
          />
        )}

        {/* 3-PANEL SIDE-BY-SIDE SPLIT */}
        <div className="flex flex-col lg:flex-row gap-5 items-start flex-1">
          {/* 1. LEFT PANEL — Plan Your Journey */}
          <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 sticky top-[76px] z-10">
            <PlanYourJourney
              request={request}
              onChangeRequest={setRequest}
              onOptimize={(customReq) => handleRunOptimize(customReq)}
              isLoading={isLoading}
            />
          </aside>

          {/* 2. CENTER PANEL — Route Hero & Timeline */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
            {currentRoute && optimizationResult ? (
              <CenterDashboard
                request={request}
                optimizationResult={optimizationResult}
                selectedRoute={currentRoute}
                onSelectRoute={(r) => setSelectedRoute(r)}
                onOpenSignalsModal={() => setIsEvidenceOpen(true)}
                onOpenScoreModal={() => setIsScoreModalOpen(true)}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl mx-auto" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mx-auto" />
                <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-6" />
              </div>
            )}

            {/* Advanced Decision Tools Collapsible */}
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-1">
              <button
                onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Advanced: What-If Stress Testing & Sensitivity Radar
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-[#0D1527] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <DecisionSensitivity route={currentRoute} />
                  <WhatIfSimulator
                    request={request}
                    onSimulate={handleWhatIfSimulation}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. RIGHT PANEL — Interactive Map with Satellite/Map/Traffic */}
          <div
            id="map-panel-container"
            className="w-full lg:w-[380px] xl:w-[410px] 2xl:w-[440px] shrink-0 sticky top-[76px] z-10"
          >
            {currentRoute && (
              <InteractiveMapPanel
                request={request}
                selectedRoute={currentRoute}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>

      {/* Alternatives Modal */}
      <AlternativesModal
        isOpen={isAlternativesOpen}
        onClose={() => setIsAlternativesOpen(false)}
        routes={allRoutes}
        selectedRouteId={currentRoute?.id || ''}
        onSelectRoute={(r) => setSelectedRoute(r)}
      />

      {/* Score Breakdown Modal */}
      {currentRoute && optimizationResult && (
        <ScoreBreakdownModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          route={currentRoute}
          explanation={optimizationResult.explanation}
          budgetCeiling={request.max_budget}
        />
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

      {/* Traveler Preferences Slide-Over */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPreferencesOpen(false)}
          />
          <div className="relative z-50 w-full max-w-sm bg-white dark:bg-[#0D1527] shadow-2xl h-full overflow-y-auto border-l border-slate-200 dark:border-slate-800">
            <TravelerPreferencesSidebar
              isOpen={isPreferencesOpen}
              onClose={() => setIsPreferencesOpen(false)}
              onSelectRecentSearch={handleSelectRecentSearch}
              onApplyPreferencesToPlanner={handleApplyPreferencesToPlanner}
            />
          </div>
        </div>
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
