from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.domain import (
    JourneyRequest,
    OptimizationResult,
    CandidateRoute,
    DisruptionSignal,
    ReoptimizeRequest,
    ReoptimizeResult,
    PriorityWeights,
)

class WhatIfRequest(BaseModel):
    journey_request: JourneyRequest
    adjusted_max_budget: Optional[float] = None
    adjusted_max_walking: Optional[float] = None
    adjusted_max_transfers: Optional[int] = None
    adjusted_weights: Optional[PriorityWeights] = None

class WhatIfResponse(BaseModel):
    original_recommended_id: str
    new_recommended_id: str
    has_recommendation_changed: bool
    change_explanation: str
    optimization_result: OptimizationResult

class DemoRunRequest(BaseModel):
    scenario: str = "mumbai_pune_interview"
    trigger_disruption: bool = False

class DemoRunResponse(BaseModel):
    step: int
    title: str
    description: str
    optimization_result: OptimizationResult

class PreferencesSchema(BaseModel):
    travel_style: str = "balanced"
    walking_limit: float = 1.0
    max_transfers: int = 2
    prefer_public_transport: bool = True
    avoid_tolls: bool = True
    avoid_stairs: bool = False
    accessibility_mode: str = "standard"
    prefer_flights: bool = True
    safety_priority: bool = True
    voice_enabled: bool = True

class RecentSearchCreate(BaseModel):
    origin: str
    destination: str
    deadline: str = "10:10 AM"
    budget: float = 1500.0
    walking_limit: float = 1000.0
    max_transfers: int = 2
    purpose: str = "general"

class RecentSearchItem(BaseModel):
    id: int
    origin: str
    destination: str
    deadline: str
    budget: float
    walking_limit: float
    max_transfers: int
    purpose: str
    created_at: str

class VoiceParseRequest(BaseModel):
    transcript: str

class VoiceParseResponse(BaseModel):
    origin: str
    destination: str
    arrival_deadline: str
    max_budget: float
    max_walking_distance_meters: float
    max_transfers: int
    intent: str
    intent_detected: bool
    raw_transcript: str
