from typing import List, Dict, Any
from app.models.domain import CandidateRoute, RouteSegment, TransportMode

def extract_metric(val: Any, default: float) -> float:
    if isinstance(val, dict):
        return float(val.get("value", default))
    elif isinstance(val, (int, float)):
        return float(val)
    return float(default)

def normalize_serpapi_directions(
    raw_data: Dict[str, Any],
    origin: str,
    destination: str
) -> List[CandidateRoute]:
    """
    Normalizes SerpApi Google Maps Directions responses into RouteWise internal candidate route schema.
    """
    routes: List[CandidateRoute] = []
    if not raw_data or "directions" not in raw_data:
        return routes

    raw_directions = raw_data.get("directions", [])
    for idx, d in enumerate(raw_directions):
        dur_raw = d.get("duration")
        duration_mins = extract_metric(dur_raw, 3600.0) / 60.0

        dist_raw = d.get("distance")
        distance_meters = extract_metric(dist_raw, 50000.0)

        segments: List[RouteSegment] = []
        raw_legs = d.get("legs", [])
        for leg_idx, leg in enumerate(raw_legs):
            steps = leg.get("steps", [])
            for step_idx, step in enumerate(steps):
                mode_str = str(step.get("travel_mode", "DRIVING")).lower()
                mode = TransportMode.DRIVING
                if "walk" in mode_str:
                    mode = TransportMode.WALKING
                elif "transit" in mode_str or "bus" in mode_str or "train" in mode_str:
                    mode = TransportMode.TRANSIT

                step_dur = extract_metric(step.get("duration"), 600.0) / 60.0
                step_dist = extract_metric(step.get("distance"), 2000.0)

                segments.append(
                    RouteSegment(
                        id=f"serp-seg-{idx}-{leg_idx}-{step_idx}",
                        mode=mode,
                        from_name=step.get("start_location", {}).get("address", origin) if isinstance(step.get("start_location"), dict) else origin,
                        to_name=step.get("end_location", {}).get("address", destination) if isinstance(step.get("end_location"), dict) else destination,
                        duration_minutes=step_dur,
                        distance_meters=step_dist,
                        cost=120.0 if mode == TransportMode.TRANSIT else 0.0,
                        instructions=step.get("instructions", f"Travel via {mode.value}")
                    )
                )

        routes.append(
            CandidateRoute(
                id=f"serp-route-{idx}",
                mode_summary="Transit / Drive",
                segments=segments,
                total_duration_minutes=duration_mins,
                total_distance_meters=distance_meters,
                estimated_cost=650.0,
                walking_distance_meters=500.0,
                transfer_count=1,
                departure_time="06:30 AM",
                arrival_time="09:15 AM",
                arrival_buffer_minutes=35,
                route_type="best_fit" if idx == 0 else "alternative",
                source="serpapi_live",
                disruption_signals=[],
                risk_factors=[],
                risk_level="LOW",
                confidence_score=90.0,
                overall_score=88.0,
                violated_constraints=[],
                is_valid=True
            )
        )

    return routes
