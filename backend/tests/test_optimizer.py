import pytest
from app.models.domain import JourneyRequest, JourneyIntent, PriorityWeights
from app.engine.risk import evaluate_route_risk
from app.engine.optimizer import optimize_journey
from app.services.demo_data import get_demo_candidate_routes

def test_risk_evaluation_with_disruption():
    # Candidates with expressway disruption
    candidates = get_demo_candidate_routes(has_disruption=True)
    bus_route = next(r for r in candidates if r.id == "demo-route-express-bus")
    
    risk_level, factors, penalty = evaluate_route_risk(bus_route)
    assert risk_level in ["MEDIUM", "HIGH"]
    assert len(factors) > 0
    assert penalty > 15.0

def test_reoptimization_ranking_shift():
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        arrival_deadline="10:10 AM",
        max_budget=2000.0,
        max_walking_distance_meters=1500.0,
        max_transfers=3,
        intent=JourneyIntent.INTERVIEW
    )
    
    # 1. Baseline without disruption
    baseline_candidates = get_demo_candidate_routes(has_disruption=False)
    res_base = optimize_journey(req, baseline_candidates)
    assert res_base.recommended_route.id == "demo-route-train-auto"

    # 2. When disruption occurs, expressway bus becomes invalid or penalized
    disrupted_candidates = get_demo_candidate_routes(has_disruption=True)
    res_disrupt = optimize_journey(req, disrupted_candidates)
    
    # Train route remains safe recommendation
    assert res_disrupt.recommended_route.id == "demo-route-train-auto"
    assert "demo-route-express-bus" in [r.id for r in res_disrupt.rejected_routes]

def test_what_if_budget_expansion():
    # If budget is extremely constrained (₹680), only bus qualifies
    candidates = get_demo_candidate_routes(has_disruption=False)
    req_low = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=680.0,
        max_walking_distance_meters=1500.0,
        max_transfers=3,
        intent=JourneyIntent.GENERAL
    )
    res_low = optimize_journey(req_low, candidates)
    assert res_low.recommended_route.id == "demo-route-express-bus"

    # If user expands budget to ₹3000 and prioritizes time
    req_high = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=3000.0,
        max_walking_distance_meters=1500.0,
        max_transfers=3,
        intent=JourneyIntent.EMERGENCY,
        weights=PriorityWeights(time=0.9, cost=0.02, reliability=0.04, comfort=0.02, walking=0.02)
    )
    res_high = optimize_journey(req_high, candidates)
    # Fastest private cab (190m) wins
    assert res_high.recommended_route.id == "demo-route-private-cab"
