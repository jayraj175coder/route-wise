import React, { useState, useEffect } from 'react';
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
import { BestJourneyCard } from './components/BestJourneyCard';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { AlternativesList } from './components/AlternativesList';
import { InteractiveMap } from './components/InteractiveMap';
import { EvidenceModal } from './components/EvidenceModal';
import { ReoptimizeBanner } from './components/ReoptimizeBanner';
import { WhatIfSimulator } from './components/WhatIfSimulator';
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
  const [reoptimizeData, setReoptimizeData] = useState<ReoptimizeResult | null>(null);
  const [hasDisruption, setHasDisruption] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

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

  const handleTriggerDisruptionToggle = async () => {
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
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-brand-orange selection:text-navy-950">
      {/* Direct Production Navigation Bar */}
      <Navbar
        apiConnected={apiConnected}
        onRefresh={handleRunOptimize}
      />

      <main className="flex-1 space-y-10">
        {/* Hero Section & Search Constraints Form */}
        <HeroSearch
          request={request}
          onChangeRequest={setRequest}
          onOptimize={handleRunOptimize}
          isLoading={isLoading}
        />

        {/* Dynamic Re-optimization Notification Banner */}
        {reoptimizeData && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReoptimizeBanner
              previousRoute={reoptimizeData.previous_route}
              newRoute={reoptimizeData.new_recommended_route}
              cause={reoptimizeData.disruption_cause}
              changeSummary={reoptimizeData.change_summary}
              onDismiss={() => setReoptimizeData(null)}
            />
          </div>
        )}

        {/* Journey Results Section */}
        {currentRoute && optimizationResult && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-12">
            {/* Top Recommended Route Card */}
            <BestJourneyCard
              route={currentRoute}
              activePreset={optimizationResult.active_preset}
              onViewEvidence={() => setIsEvidenceOpen(true)}
              onTriggerDisruption={handleTriggerDisruptionToggle}
              hasDisruptionTriggered={hasDisruption}
            />

            {/* Why This Route & Normalized Score Breakdown */}
            <ScoreBreakdown
              route={currentRoute}
              explanation={optimizationResult.explanation}
            />

            {/* Visual Route Corridor Interactive Map */}
            <InteractiveMap route={currentRoute} />

            {/* Alternative Candidate Options Comparison */}
            {optimizationResult.alternative_routes.length > 0 && (
              <AlternativesList
                routes={[currentRoute, ...optimizationResult.alternative_routes]}
                selectedRouteId={currentRoute.id}
                onSelectRoute={(r) => setSelectedRoute(r)}
              />
            )}

            {/* Interactive What-If Simulator Panel */}
            <WhatIfSimulator
              request={request}
              onSimulate={handleWhatIfSimulation}
            />
          </div>
        )}
      </main>

      {/* Disruption & News Evidence Modal */}
      {currentRoute && (
        <EvidenceModal
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          disruptions={currentRoute.disruption_signals}
          riskFactors={currentRoute.risk_factors}
        />
      )}

      {/* Disclaimer and Positioning Footer */}
      <DisclaimerFooter />
    </div>
  );
};

export default App;
