from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_optimize_journey():
    payload = {
        "origin": "Dadar, Mumbai",
        "destination": "Hinjawadi, Pune",
        "arrival_deadline": "10:10 AM",
        "max_budget": 1500.0,
        "max_walking_distance_meters": 1000.0,
        "max_transfers": 2,
        "intent": "interview",
        "weights": {
            "time": 0.25,
            "cost": 0.1,
            "reliability": 0.35,
            "comfort": 0.1,
            "walking": 0.2
        }
    }
    res = client.post("/api/journey/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["recommended_route"] is not None
    assert "RouteWise Confidence" in data["disclaimer"]

def test_api_demo_run():
    res = client.post("/api/demo/run", json={"scenario": "mumbai_pune_interview", "trigger_disruption": False})
    assert res.status_code == 200
    data = res.json()
    assert data["step"] == 1
    assert data["optimization_result"]["recommended_route"]["id"] == "demo-route-train-auto"

def test_api_what_if():
    payload = {
        "journey_request": {
            "origin": "Mumbai",
            "destination": "Pune",
            "max_budget": 700.0,
            "max_walking_distance_meters": 1000.0,
            "max_transfers": 2,
            "intent": "budget"
        },
        "adjusted_max_budget": 2500.0
    }
    res = client.post("/api/journey/what-if", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "optimization_result" in data
