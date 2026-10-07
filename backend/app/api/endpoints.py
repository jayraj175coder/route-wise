from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import copy
from sqlalchemy.orm import Session

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
    PreferencesSchema,
    RecentSearchCreate,
    RecentSearchItem,
    VoiceParseRequest,
    VoiceParseResponse,
)
from app.engine.optimizer import optimize_journey
from app.services.route_generator import generate_multimodal_candidates
from app.services.serpapi.client import SerpApiClient
from app.services.serpapi.disruptions import fetch_live_disruption_signals
from app.services.serpapi.normalizer import normalize_serpapi_directions
from app.services.voice_parser import parse_voice_transcript
from app.db.database import get_db
from app.db.models import Preference, RecentSearch, User

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

@router.get("/serpapi/status")
def check_serpapi_status(serp_client: SerpApiClient = Depends(get_serpapi_client)):
    """Verifies whether SERPAPI_API_KEY is configured and active."""
    return serp_client.test_connection()

@router.post("/journey/optimize", response_model=OptimizationResult)
def optimize_route(request: JourneyRequest, serp_client: SerpApiClient = Depends(get_serpapi_client), db: Session = Depends(get_db)):
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

    # Persist to SQLite recent searches asynchronously/safely
    try:
        new_search = RecentSearch(
            origin=request.origin,
            destination=request.destination,
            deadline=request.arrival_deadline or "10:10 AM",
            budget=request.max_budget,
            walking_limit=request.max_walking_distance_meters,
            max_transfers=request.max_transfers,
            purpose=request.intent.value if hasattr(request.intent, 'value') else str(request.intent),
        )
        db.add(new_search)
        db.commit()
    except Exception as e:
        db.rollback()

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

# --- SQLite Persistence Endpoints for Traveler Preferences ---

@router.get("/preferences", response_model=PreferencesSchema)
def get_preferences(db: Session = Depends(get_db)):
    pref = db.query(Preference).filter(Preference.user_id == "anonymous_user").first()
    if not pref:
        pref = Preference(user_id="anonymous_user")
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return PreferencesSchema(
        travel_style=pref.travel_style,
        walking_limit=pref.walking_limit,
        max_transfers=pref.max_transfers,
        prefer_public_transport=pref.prefer_public_transport,
        avoid_tolls=pref.avoid_tolls,
        avoid_stairs=pref.avoid_stairs,
        accessibility_mode=pref.accessibility_mode,
        prefer_flights=pref.prefer_flights,
        safety_priority=pref.safety_priority,
        voice_enabled=pref.voice_enabled,
    )

@router.put("/preferences", response_model=PreferencesSchema)
def update_preferences(data: PreferencesSchema, db: Session = Depends(get_db)):
    pref = db.query(Preference).filter(Preference.user_id == "anonymous_user").first()
    if not pref:
        pref = Preference(user_id="anonymous_user")
        db.add(pref)

    pref.travel_style = data.travel_style
    pref.walking_limit = data.walking_limit
    pref.max_transfers = data.max_transfers
    pref.prefer_public_transport = data.prefer_public_transport
    pref.avoid_tolls = data.avoid_tolls
    pref.avoid_stairs = data.avoid_stairs
    pref.accessibility_mode = data.accessibility_mode
    pref.prefer_flights = data.prefer_flights
    pref.safety_priority = data.safety_priority
    pref.voice_enabled = data.voice_enabled

    db.commit()
    return data

@router.get("/searches", response_model=List[RecentSearchItem])
def get_recent_searches(db: Session = Depends(get_db)):
    searches = db.query(RecentSearch).filter(RecentSearch.user_id == "anonymous_user").order_by(RecentSearch.created_at.desc()).limit(10).all()
    if not searches:
        # Seed initial realistic corridor searches
        sample_searches = [
            RecentSearch(origin="Dadar, Mumbai", destination="Hinjawadi Phase 1, Pune", deadline="10:10 AM", budget=1500, walking_limit=1000, max_transfers=2, purpose="general"),
            RecentSearch(origin="Thane Station", destination="VJTI, Matunga", deadline="9:00 AM", budget=400, walking_limit=800, max_transfers=1, purpose="exam"),
            RecentSearch(origin="Andheri West", destination="Powai IIT", deadline="4:30 PM", budget=600, walking_limit=600, max_transfers=1, purpose="general"),
            RecentSearch(origin="Dadar", destination="CST Mumbai", deadline="8:00 AM", budget=250, walking_limit=500, max_transfers=0, purpose="interview"),
        ]
        for s in sample_searches:
            db.add(s)
        db.commit()
        searches = sample_searches

    return [
        RecentSearchItem(
            id=s.id or 1,
            origin=s.origin,
            destination=s.destination,
            deadline=s.deadline or "10:10 AM",
            budget=s.budget or 1500.0,
            walking_limit=s.walking_limit or 1000.0,
            max_transfers=s.max_transfers or 2,
            purpose=s.purpose or "general",
            created_at=s.created_at.strftime("%b %d, %I:%M %p") if s.created_at else "Today, 10:10 AM",
        )
        for s in searches
    ]

@router.delete("/searches")
def clear_recent_searches(db: Session = Depends(get_db)):
    db.query(RecentSearch).filter(RecentSearch.user_id == "anonymous_user").delete()
    db.commit()
    return {"status": "cleared", "message": "Recent searches cleared."}

# --- Voice Parsing Endpoint ---

@router.post("/voice/parse", response_model=VoiceParseResponse)
def parse_voice_query(req: VoiceParseRequest):
    """
    Parses conversational user speech into structured journey fields.
    """
    parsed = parse_voice_transcript(req.transcript)
    return VoiceParseResponse(
        origin=parsed["origin"],
        destination=parsed["destination"],
        arrival_deadline=parsed["arrival_deadline"],
        max_budget=parsed["max_budget"],
        max_walking_distance_meters=parsed["max_walking_distance_meters"],
        max_transfers=parsed["max_transfers"],
        intent=parsed["intent"],
        intent_detected=parsed["intent_detected"],
        raw_transcript=parsed["raw_transcript"],
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

@router.post("/demo/run", response_model=DemoRunResponse)
def run_demo_scenario(req: DemoRunRequest):
    """
    Hackathon Demo Mode Runner:
    Runs Mumbai -> Pune scenario with optional disruption injection.
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
