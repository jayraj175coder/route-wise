export type JourneyIntent =
  | 'interview'
  | 'exam'
  | 'flight'
  | 'emergency'
  | 'family'
  | 'budget'
  | 'general';

export type TransportMode =
  | 'walking'
  | 'transit'
  | 'driving'
  | 'two_wheeler'
  | 'cycling'
  | 'flight'
  | 'auto';

export interface PriorityWeights {
  time: number;
  cost: number;
  reliability: number;
  comfort: number;
  walking: number;
}

export interface JourneyRequest {
  origin: string;
  destination: string;
  departure_time?: string;
  arrival_deadline?: string;
  max_budget: number;
  max_walking_distance_meters: number;
  max_transfers: number;
  intent: JourneyIntent;
  weights: PriorityWeights;
}

export interface RouteSegment {
  id: string;
  mode: TransportMode;
  from_name: string;
  to_name: string;
  duration_minutes: number;
  distance_meters: number;
  cost: number;
  instructions: string;
  schedule_details?: string;
}

export interface DisruptionSignal {
  id: string;
  source: string;
  title: string;
  published_time: string;
  url: string;
  signal_type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  confidence: number;
  impact_minutes: number;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  impact_minutes: number;
}

export interface ScoreBreakdown {
  time_score: number;
  cost_score: number;
  walking_score: number;
  transfer_score: number;
  buffer_score: number;
  reliability_score: number;
  risk_score: number;
}

export interface CandidateRoute {
  id: string;
  mode_summary: string;
  segments: RouteSegment[];
  total_duration_minutes: number;
  total_distance_meters: number;
  estimated_cost: number;
  walking_distance_meters: number;
  transfer_count: number;
  departure_time: string;
  arrival_time: string;
  arrival_buffer_minutes: number;
  route_type: 'best_fit' | 'cheapest' | 'fastest' | 'most_reliable' | 'alternative' | 'rejected';
  source: string;
  disruption_signals: DisruptionSignal[];
  risk_factors: RiskFactor[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence_score: number;
  score_breakdown?: ScoreBreakdown;
  overall_score: number;
  violated_constraints: string[];
  is_valid: boolean;
}

export interface OptimizationResult {
  recommended_route?: CandidateRoute;
  alternative_routes: CandidateRoute[];
  rejected_routes: CandidateRoute[];
  explanation: string;
  status: 'success' | 'no_route_satisfies_constraints';
  active_preset: JourneyIntent;
  applied_weights: PriorityWeights;
  disclaimer: string;
}

export interface ReoptimizeResult {
  previous_route: CandidateRoute;
  new_recommended_route: CandidateRoute;
  change_summary: string;
  disruption_cause: string;
  optimization_result: OptimizationResult;
}

export interface WhatIfResponse {
  original_recommended_id: string;
  new_recommended_id: string;
  has_recommendation_changed: boolean;
  change_explanation: string;
  optimization_result: OptimizationResult;
}
