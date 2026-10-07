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
import { HeroSearch } from './components/HeroSearch';
import { DecisionArchitectureFlow } from './components/DecisionArchitectureFlow';
import { BestJourneyCard } from './components/BestJourneyCard';
import { LiveSignalsFeed } from './components/LiveSignalsFeed';
import { RiskRadar } from './components/RiskRadar';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { InteractiveMap } from './components/InteractiveMap';
import { DecisionSensitivity } from './components/DecisionSensitivity';
import { AlternativesList } from './components/AlternativesList';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ReoptimizeBanner } from './components/ReoptimizeBanner';
import { ReoptimizePipelineModal } from './components/ReoptimizePipelineModal';
import { EvidenceModal } from './components/EvidenceModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';

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
      time: 0.25,
      cost: 0.10,
      reliability: 0.35,
      comfort: 0.10,
      walking: 0.20,
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

  const resultsRef = useRef<HTMLDivElement>(null);

  // Initial optimization on mount
  useEffect(() => {
    handleRunOptimize(false);
  }, []);

  const handleRunOptimize = async (shouldScroll: boolean = true) => {
    setIsLoading(true);
    try {
      const res = await optimizeJourney(request);
      setOptimizationResult(res);
      if (res.recommended_route) {
        setSelectedRoute(res.recommended_route);
      }
      if (shouldScroll && resultsRef.current) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerReoptimize = () => {
    // Open animated pipeline modal first
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
        await handleRunOptimize(false);
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
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-brand-orange selection:text-navy-950">
      {/* Navigation Bar */}
      <Navbar
        apiConnected={apiConnected}
        onRefresh={() => handleRunOptimize(false)}
      />

      <main className="flex-1 space-y-12">
        {/* Landing Page & Journey Input Search Panel */}
        <HeroSearch
          request={request}
          onChangeRequest={setRequest}
          onOptimize={() => handleRunOptimize(true)}
          isLoading={isLoading}
        />

        {/* Primary Results Experience Dashboard */}
        {currentRoute && optimizationResult && (
          <div ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
            {/* Visual Decision Engine Pipeline Flowchart */}
            <DecisionArchitectureFlow />

            {/* Dynamic Re-optimization Notification Banner */}
            {reoptimizeData && (
              <ReoptimizeBanner
                previousRoute={reoptimizeData.previous_route}
                newRoute={reoptimizeData.new_recommended_route}
                cause={reoptimizeData.disruption_cause}
                changeSummary={reoptimizeData.change_summary}
                onDismiss={() => setReoptimizeData(null)}
              />
            )}

            {/* 1. Large RouteWise Confidence Card & 2. Best Journey Showcase */}
            <BestJourneyCard
              route={currentRoute}
              activePreset={optimizationResult.active_preset}
              onViewEvidence={() => setIsEvidenceOpen(true)}
              onTriggerDisruption={handleTriggerReoptimize}
              hasDisruptionTriggered={hasDisruption}
            />

            {/* 6. Live SerpApi Signals Feed */}
            <LiveSignalsFeed hasDisruption={hasDisruption} />

            {/* 7. Journey Risk Radar Breakdown */}
            <RiskRadar route={currentRoute} hasDisruption={hasDisruption} />

            {/* 4. Why This Decision & 5. RouteWise Score Breakdown */}
            <ScoreBreakdown
              route={currentRoute}
              explanation={optimizationResult.explanation}
              budgetCeiling={request.max_budget}
            />

            {/* 3. Live Journey Corridor Interactive Map */}
            <InteractiveMap route={currentRoute} />

            {/* 9. What Could Change This Decision? (Concrete Thresholds) */}
            <DecisionSensitivity route={currentRoute} />

            {/* 12. Competing Alternatives Comparison Grid */}
            {optimizationResult.alternative_routes.length > 0 && (
              <AlternativesList
                routes={[currentRoute, ...optimizationResult.alternative_routes]}
                selectedRouteId={currentRoute.id}
                onSelectRoute={(r) => setSelectedRoute(r)}
              />
            )}

            {/* 10. Interactive What-If Simulator Panel */}
            <WhatIfSimulator
              request={request}
              onSimulate={handleWhatIfSimulation}
            />
          </div>
        )}
      </main>

      {/* 11. Animated 6-Stage Re-Optimization Pipeline Modal */}
      <ReoptimizePipelineModal
        isOpen={isPipelineOpen}
        onComplete={handlePipelineCompleted}
      />

      {/* 8. Disruption Evidence Verification Modal */}
      {currentRoute && (
        <EvidenceModal
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          disruptions={currentRoute.disruption_signals}
          riskFactors={currentRoute.risk_factors}
        />
      )}

      {/* Mandatory Safety Notice & Positioning Footer */}
      <DisclaimerFooter />
    </div>
  );
};

export default App;
