from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class JourneyIntent(str, Enum):
    INTERVIEW = "interview"
    EXAM = "exam"
    FLIGHT = "flight"
    EMERGENCY = "emergency"
    FAMILY = "family"
    BUDGET = "budget"
    GENERAL = "general"

class TransportMode(str, Enum):
    WALKING = "walking"
    TRANSIT = "transit"
    DRIVING = "driving"
    TWO_WHEELER = "two_wheeler"
    CYCLING = "cycling"
    FLIGHT = "flight"
    AUTO = "auto"
    TRAIN = "train"
    METRO = "metro"
    BUS = "bus"

class PriorityWeights(BaseModel):
    time: float = Field(0.35, ge=0.0, le=1.0)
    cost: float = Field(0.20, ge=0.0, le=1.0)
    reliability: float = Field(0.25, ge=0.0, le=1.0)
    comfort: float = Field(0.10, ge=0.0, le=1.0)
    walking: float = Field(0.10, ge=0.0, le=1.0)

class JourneyRequest(BaseModel):
    origin: str
    destination: str
    departure_time: Optional[str] = None
    arrival_deadline: Optional[str] = None
    max_budget: float = Field(2000.0, ge=0.0)
    max_walking_distance_meters: float = Field(1500.0, ge=0.0)
    max_transfers: int = Field(3, ge=0)
    intent: JourneyIntent = JourneyIntent.GENERAL
    weights: PriorityWeights = Field(default_factory=PriorityWeights)

class RouteSegment(BaseModel):
    id: str
    mode: TransportMode
    from_name: str
    to_name: str
    duration_minutes: float
    distance_meters: float
    cost: float
    instructions: str
    schedule_details: Optional[str] = None

class DisruptionSignal(BaseModel):
    id: str
    source: str
    title: str
    published_time: str
    url: str
    signal_type: str
    severity: str  # low, medium, high
    location: str
    confidence: float  # 0.0 - 1.0
    impact_minutes: float

class RiskFactor(BaseModel):
    factor: str
    severity: str  # low, medium, high
    impact_minutes: float

class ScoreBreakdown(BaseModel):
    time_score: float
    cost_score: float
    walking_score: float
    transfer_score: float
    buffer_score: float
    reliability_score: float
    risk_score: float

class CandidateRoute(BaseModel):
    id: str
    mode_summary: str
    segments: List[RouteSegment]
    total_duration_minutes: float
    total_distance_meters: float
    estimated_cost: float
    walking_distance_meters: float
    transfer_count: int
    departure_time: str
    arrival_time: str
    arrival_buffer_minutes: float
    route_type: str  # best_fit, cheapest, fastest, most_reliable
    source: str  # serpapi_live, demo
    disruption_signals: List[DisruptionSignal] = Field(default_factory=list)
    risk_factors: List[RiskFactor] = Field(default_factory=list)
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH
    confidence_score: float = 0.0
    score_breakdown: Optional[ScoreBreakdown] = None
    overall_score: float = 0.0
    violated_constraints: List[str] = Field(default_factory=list)
    is_valid: bool = True

class OptimizationResult(BaseModel):
    recommended_route: Optional[CandidateRoute] = None
    alternative_routes: List[CandidateRoute] = Field(default_factory=list)
    rejected_routes: List[CandidateRoute] = Field(default_factory=list)
    explanation: str
    status: str  # success, no_route_satisfies_constraints
    active_preset: JourneyIntent
    applied_weights: PriorityWeights
    disclaimer: str = "RouteWise Confidence is an internal decision score based on available route and disruption signals. It is not a guaranteed probability of arrival."

class ReoptimizeRequest(BaseModel):
    journey_request: JourneyRequest
    previous_recommended_route_id: str
    disruption_event_trigger: Optional[str] = None

class ReoptimizeResult(BaseModel):
    previous_route: CandidateRoute
    new_recommended_route: CandidateRoute
    change_summary: str
    disruption_cause: str
    optimization_result: OptimizationResult
