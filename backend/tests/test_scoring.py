import pytest
from app.models.domain import JourneyRequest, JourneyIntent, PriorityWeights
from app.engine.scoring import resolve_effective_weights, calculate_confidence_score, score_route
from app.engine.normalization import normalize_sub_scores
from app.engine.optimizer import optimize_journey
from app.services.demo_data import get_demo_candidate_routes

def test_intent_presets_weights():
    weights = resolve_effective_weights(JourneyIntent.BUDGET, PriorityWeights())
    assert weights.cost > weights.time
    assert weights.cost > weights.walking

    weights_interview = resolve_effective_weights(JourneyIntent.INTERVIEW, PriorityWeights())
    assert weights_interview.reliability > weights_interview.cost

def test_confidence_score_bounds_and_disclaimer():
    candidates = get_demo_candidate_routes(has_disruption=False)
    sub_scores = normalize_sub_scores(candidates)
    
    for c in candidates:
        ss = sub_scores[c.id]
        conf = calculate_confidence_score(c, ss, risk_penalty=10.0)
        assert 0.0 <= conf <= 100.0

def test_cheapest_wins_budget_mode():
    candidates = get_demo_candidate_routes(has_disruption=False)
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=3000.0,
        max_walking_distance_meters=2000.0,
        max_transfers=5,
        intent=JourneyIntent.BUDGET,
        weights=PriorityWeights(time=0.1, cost=0.8, reliability=0.05, comfort=0.02, walking=0.03)
    )
    result = optimize_journey(req, candidates)
    assert result.recommended_route is not None
    # Cheapest route is expressway bus (₹650)
    assert result.recommended_route.id == "demo-route-express-bus"

def test_reliable_wins_interview_mode():
    candidates = get_demo_candidate_routes(has_disruption=False)
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=3000.0,
        max_walking_distance_meters=2000.0,
        max_transfers=5,
        intent=JourneyIntent.INTERVIEW
    )
    result = optimize_journey(req, candidates)
    assert result.recommended_route is not None
    # Train + Auto provides high punctuality, 42 min safety buffer, 1 transfer
    assert result.recommended_route.id == "demo-route-train-auto"
