from typing import List, Optional
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
