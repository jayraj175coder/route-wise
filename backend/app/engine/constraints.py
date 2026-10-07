from typing import List, Tuple
from app.models.domain import CandidateRoute, JourneyRequest

def evaluate_hard_constraints(route: CandidateRoute, request: JourneyRequest) -> Tuple[bool, List[str]]:
    """
    Evaluates hard constraints on a candidate route:
    1. Budget constraint: route cost <= max_budget
    2. Arrival buffer constraint: if deadline specified, arrival_buffer_minutes >= 0
    3. Walking distance constraint: walking_distance_meters <= max_walking_distance_meters
    4. Transfer limit constraint: transfer_count <= max_transfers
    """
    violated = []

    # 1. Budget constraint
    if route.estimated_cost > request.max_budget:
        violated.append(
            f"Cost (₹{route.estimated_cost:.0f}) exceeds maximum budget (₹{request.max_budget:.0f})"
        )

    # 2. Arrival Buffer / Deadline constraint
    if request.arrival_deadline and route.arrival_buffer_minutes < 0:
        violated.append(
            f"Arrival time misses deadline by {abs(route.arrival_buffer_minutes):.0f} minutes"
        )

    # 3. Maximum walking distance constraint
    if route.walking_distance_meters > request.max_walking_distance_meters:
        violated.append(
            f"Walking distance ({route.walking_distance_meters:.0f}m) exceeds limit ({request.max_walking_distance_meters:.0f}m)"
        )

    # 4. Maximum transfers constraint
    if route.transfer_count > request.max_transfers:
        violated.append(
            f"Transfers ({route.transfer_count}) exceed maximum allowed ({request.max_transfers})"
        )

    is_valid = len(violated) == 0
    return is_valid, violated

def filter_candidate_routes(routes: List[CandidateRoute], request: JourneyRequest) -> Tuple[List[CandidateRoute], List[CandidateRoute]]:
    """
    Filters a list of candidate routes into valid routes and rejected routes with explanations.
    """
    valid_routes = []
    rejected_routes = []

    for route in routes:
        is_valid, violated = evaluate_hard_constraints(route, request)
        route.is_valid = is_valid
        route.violated_constraints = violated
        if is_valid:
            valid_routes.append(route)
        else:
            rejected_routes.append(route)

    return valid_routes, rejected_routes
