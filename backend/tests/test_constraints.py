import pytest
from app.models.domain import JourneyRequest, CandidateRoute, JourneyIntent
from app.engine.constraints import evaluate_hard_constraints, filter_candidate_routes
from app.services.demo_data import get_demo_candidate_routes

def test_budget_constraint_enforced():
    candidates = get_demo_candidate_routes(has_disruption=False)
    # Cab is ₹2400. Set max_budget to ₹1000
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=1000.0,
        max_walking_distance_meters=2000.0,
        max_transfers=5,
        intent=JourneyIntent.GENERAL
    )
    valid, rejected = filter_candidate_routes(candidates, req)
    
    # Private cab should be rejected due to budget
    rejected_ids = [r.id for r in rejected]
    assert "demo-route-private-cab" in rejected_ids
    cab = next(r for r in rejected if r.id == "demo-route-private-cab")
    assert any("budget" in v.lower() for v in cab.violated_constraints)

def test_walking_constraint_enforced():
    candidates = get_demo_candidate_routes(has_disruption=False)
    # Set max walking to 400m
    # Bus has 750m walking, Train has 450m walking
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=3000.0,
        max_walking_distance_meters=400.0,
        max_transfers=5,
        intent=JourneyIntent.GENERAL
    )
    valid, rejected = filter_candidate_routes(candidates, req)
    rejected_ids = [r.id for r in rejected]
    assert "demo-route-express-bus" in rejected_ids

def test_transfer_constraint_enforced():
    candidates = get_demo_candidate_routes(has_disruption=False)
    # Route D (Vande Bharat + Metro) has 2 transfers
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        max_budget=3000.0,
        max_walking_distance_meters=2000.0,
        max_transfers=1,
        intent=JourneyIntent.GENERAL
    )
    valid, rejected = filter_candidate_routes(candidates, req)
    rejected_ids = [r.id for r in rejected]
    assert "demo-route-vande-bharat" in rejected_ids

def test_deadline_arrival_buffer_enforced():
    candidates = get_demo_candidate_routes(has_disruption=True)
    # With disruption, express bus arrives at 10:45 AM and has buffer of -35m
    req = JourneyRequest(
        origin="Mumbai",
        destination="Pune",
        arrival_deadline="10:10 AM",
        max_budget=3000.0,
        max_walking_distance_meters=2000.0,
        max_transfers=5,
        intent=JourneyIntent.INTERVIEW
    )
    valid, rejected = filter_candidate_routes(candidates, req)
    rejected_ids = [r.id for r in rejected]
    assert "demo-route-express-bus" in rejected_ids
