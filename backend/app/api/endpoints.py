from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import copy

from app.models.domain import (
    JourneyRequest,
    OptimizationResult,
    CandidateRoute,
    DisruptionSignal,
    ReoptimizeRequest,
    ReoptimizeResult,
    JourneyIntent,
)
from app.api.schemas import (
    WhatIfRequest,
    WhatIfResponse,
    DemoRunRequest,
    DemoRunResponse,
)
from app.engine.optimizer import optimize_journey
from app.services.route_generator import generate_multimodal_candidates
from app.services.serpapi.client import SerpApiClient
from app.services.serpapi.disruptions import fetch_live_disruption_signals
from app.services.serpapi.normalizer import normalize_serpapi_directions

router = APIRouter()

# In-memory storage for journey cache
JOURNEY_STORE: Dict[str, OptimizationResult] = {}
CANDIDATE_STORE: Dict[str, CandidateRoute] = {}

def get_serpapi_client() -> SerpApiClient:
    return SerpApiClient()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RouteWise Personal Mobility Decision Engine",
        "version": "1.0.0"
    }

@router.post("/journey/optimize", response_model=OptimizationResult)
def optimize_route(request: JourneyRequest, serp_client: SerpApiClient = Depends(get_serpapi_client)):
    # 1. Fetch live SerpApi directions & disruption signals if configured
    candidates: List[CandidateRoute] = []
    
    if serp_client.is_available():
        raw_dirs = serp_client.search_google_directions(request.origin, request.destination)
        if raw_dirs:
            candidates = normalize_serpapi_directions(raw_dirs, request.origin, request.destination)
            live_signals = fetch_live_disruption_signals(request.origin, request.destination, serp_client)
            for c in candidates:
                c.disruption_signals.extend(live_signals)

    # 2. Dynamic multimodal generation tailored to user's exact origin and destination
    if not candidates:
        candidates = generate_multimodal_candidates(request.origin, request.destination, has_disruption=False)

    result = optimize_journey(request, candidates)

    # Store candidates in cache
    for route in (result.alternative_routes + ([result.recommended_route] if result.recommended_route else [])):
        CANDIDATE_STORE[route.id] = route

    if result.recommended_route:
        JOURNEY_STORE[result.recommended_route.id] = result

    return result

@router.post("/journey/reoptimize", response_model=ReoptimizeResult)
def reoptimize_route(req: ReoptimizeRequest):
    """
    Dynamic Re-optimization:
    'Something changed' -> re-evaluates routes with newly injected/updated disruption event.
    """
    # Load candidate routes with active disruption triggered
    candidates_with_disruption = generate_multimodal_candidates(
        req.journey_request.origin, req.journey_request.destination, has_disruption=True
    )
    new_result = optimize_journey(req.journey_request, candidates_with_disruption)

    # Find previous route info
    prev_route = CANDIDATE_STORE.get(req.previous_recommended_route_id)
    if not prev_route:
        prev_route = candidates_with_disruption[0]

    new_recommended = new_result.recommended_route or prev_route

    cause = (
        f"Severe highway delay detected on the {req.journey_request.origin} to {req.journey_request.destination} corridor (+60 min delay exposure)."
    )
    change_summary = (
        f"Route re-evaluated: {new_recommended.mode_summary} (Confidence: {new_recommended.confidence_score:.0f}) "
        f"is now prioritized over previous choices due to real-time delay exposure."
    )

    return ReoptimizeResult(
        previous_route=prev_route,
        new_recommended_route=new_recommended,
        change_summary=change_summary,
        disruption_cause=cause,
        optimization_result=new_result
    )

@router.post("/journey/what-if", response_model=WhatIfResponse)
def what_if_simulation(req: WhatIfRequest):
    """
    Interactive What-If Simulator:
    Changes constraints or priority weights and recalculates rankings instantly.
    """
    modified_request = copy.deepcopy(req.journey_request)
    if req.adjusted_max_budget is not None:
        modified_request.max_budget = req.adjusted_max_budget
    if req.adjusted_max_walking is not None:
        modified_request.max_walking_distance_meters = req.adjusted_max_walking
    if req.adjusted_max_transfers is not None:
        modified_request.max_transfers = req.adjusted_max_transfers
    if req.adjusted_weights is not None:
        modified_request.weights = req.adjusted_weights

    candidates = generate_multimodal_candidates(
        req.journey_request.origin, req.journey_request.destination, has_disruption=False
    )
    original_result = optimize_journey(req.journey_request, candidates)
    new_result = optimize_journey(modified_request, candidates)

    orig_rec_id = original_result.recommended_route.id if original_result.recommended_route else "none"
    new_rec_id = new_result.recommended_route.id if new_result.recommended_route else "none"
    changed = orig_rec_id != new_rec_id

    if changed:
        explanation = (
            f"Constraint adjustment shifted the top recommendation to '{new_result.recommended_route.mode_summary}' "
            f"because it aligns better with the updated parameters."
        )
    else:
        explanation = (
            f"'{new_result.recommended_route.mode_summary}' remains the optimal choice even under modified parameters."
        )

    return WhatIfResponse(
        original_recommended_id=orig_rec_id,
        new_recommended_id=new_rec_id,
        has_recommendation_changed=changed,
        change_explanation=explanation,
        optimization_result=new_result
    )

@router.get("/journey/{route_id}", response_model=CandidateRoute)
def get_journey_by_id(route_id: str):
    route = CANDIDATE_STORE.get(route_id)
    if not route:
        candidates = generate_multimodal_candidates("Origin", "Destination", has_disruption=False)
        for c in candidates:
            if c.id == route_id:
                return c
        raise HTTPException(status_code=404, detail="Journey route ID not found")
    return route

@router.get("/journey/{route_id}/evidence", response_model=List[DisruptionSignal])
def get_journey_evidence(route_id: str):
    route = CANDIDATE_STORE.get(route_id)
    if not route:
        demo_candidates = get_demo_candidate_routes(has_disruption=True)
        for c in demo_candidates:
            if c.id == route_id:
                return c.disruption_signals
        return []
    return route.disruption_signals

@router.post("/demo/run", response_model=DemoRunResponse)
def run_demo_scenario(req: DemoRunRequest):
    """
    Hackathon Demo Mode Runner:
    Runs Mumbai -> Pune interview scenario with optional disruption injection.
    """
    journey_req = JourneyRequest(
        origin="Dadar, Mumbai",
        destination="Hinjawadi Phase 1, Pune",
        arrival_deadline="10:10 AM",
        max_budget=1500.0,
        max_walking_distance_meters=1000.0,
        max_transfers=2,
        intent=JourneyIntent.INTERVIEW
    )

    candidates = generate_multimodal_candidates(
        journey_req.origin, journey_req.destination, has_disruption=req.trigger_disruption
    )
    result = optimize_journey(journey_req, candidates)

    step_num = 2 if req.trigger_disruption else 1
    title = "Disruption Detected & Re-optimized" if req.trigger_disruption else "Baseline Interview Optimization"
    desc = (
        "Expressway blocked: System rerouted to Deccan Express rail with 42 min safety buffer."
        if req.trigger_disruption
        else "Evaluated 4 candidate multimodal journeys under strict interview arrival deadline."
    )

    return DemoRunResponse(
        step=step_num,
        title=title,
        description=desc,
        optimization_result=result
    )
