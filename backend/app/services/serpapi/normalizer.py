from typing import List, Dict, Any
from app.models.domain import CandidateRoute, RouteSegment, TransportMode

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
        duration_mins = d.get("duration", {}).get("value", 3600) / 60.0
        distance_meters = d.get("distance", {}).get("value", 50000)

        segments: List[RouteSegment] = []
        raw_legs = d.get("legs", [])
        for leg_idx, leg in enumerate(raw_legs):
            steps = leg.get("steps", [])
            for step_idx, step in enumerate(steps):
                mode_str = step.get("travel_mode", "DRIVING").lower()
                mode = TransportMode.DRIVING
                if "walk" in mode_str:
                    mode = TransportMode.WALKING
                elif "transit" in mode_str or "bus" in mode_str or "train" in mode_str:
                    mode = TransportMode.TRANSIT

                segments.append(
                    RouteSegment(
                        id=f"serp-seg-{idx}-{leg_idx}-{step_idx}",
                        mode=mode,
                        from_name=step.get("start_location", {}).get("address", origin),
                        to_name=step.get("end_location", {}).get("address", destination),
                        duration_minutes=step.get("duration", {}).get("value", 600) / 60.0,
                        distance_meters=step.get("distance", {}).get("value", 2000),
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
                estimated_cost=350.0,
                walking_distance_meters=800.0,
                transfer_count=max(0, len(segments) - 1),
                departure_time="06:30 AM",
                arrival_time="09:15 AM",
                arrival_buffer_minutes=35.0,
                route_type="alternative",
                source="serpapi_live"
            )
        )

    return routes
