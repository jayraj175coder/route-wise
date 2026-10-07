from typing import List
from app.models.domain import (
    JourneyRequest,
    CandidateRoute,
    OptimizationResult,
)
from app.engine.constraints import filter_candidate_routes
from app.engine.normalization import normalize_sub_scores
from app.engine.risk import evaluate_route_risk
from app.engine.scoring import resolve_effective_weights, score_route
from app.engine.explanations import generate_route_explanation

def optimize_journey(request: JourneyRequest, candidate_routes: List[CandidateRoute]) -> OptimizationResult:
    """
    Main RouteWise Optimization Pipeline:
    1. Resolve effective weights (Intent preset + User priority controls)
    2. Filter candidate routes through Hard Constraint Engine
    3. Normalize sub-scores relative to candidates
    4. Run Risk Engine to compute risk factors and risk penalties
    5. Score candidates using multi-objective scoring formula
    6. Rank routes & tag route types (best_fit, cheapest, fastest, most_reliable)
    7. Generate deterministic explanation
    """
    effective_weights = resolve_effective_weights(request.intent, request.weights)

    # 1. Hard constraint filtering
    valid_routes, rejected_routes = filter_candidate_routes(candidate_routes, request)

    # If no route satisfies all hard constraints, process rejected routes as closest alternatives
    routes_to_process = valid_routes if valid_routes else candidate_routes

    # 2. Normalize sub-scores
    sub_scores_map = normalize_sub_scores(routes_to_process)

    # 3. Risk Engine & Multi-objective Scoring
    processed_routes: List[CandidateRoute] = []
    for route in routes_to_process:
        risk_level, risk_factors, risk_penalty = evaluate_route_risk(route)
        route.risk_level = risk_level
        route.risk_factors = risk_factors

        sub_scores = sub_scores_map.get(route.id)
        if sub_scores:
            route = score_route(route, sub_scores, effective_weights, risk_penalty, intent=request.intent)

        processed_routes.append(route)

    # Sort processed routes by overall_score descending
    processed_routes.sort(key=lambda r: r.overall_score, reverse=False if not valid_routes else True)

    if valid_routes:
        # Re-sort valid routes by overall_score descending
        valid_routes.sort(key=lambda r: r.overall_score, reverse=True)
        recommended = valid_routes[0]
        recommended.route_type = "best_fit"

        # Tag special alternatives
        alternatives = valid_routes[1:] if len(valid_routes) > 1 else []

        # Find cheapest, fastest, most reliable
        if alternatives:
            cheapest = min(valid_routes, key=lambda r: r.estimated_cost)
            fastest = min(valid_routes, key=lambda r: r.total_duration_minutes)
            reliable = max(valid_routes, key=lambda r: r.confidence_score)

            for r in valid_routes:
                if r.id == cheapest.id and r.route_type != "best_fit":
                    r.route_type = "cheapest"
                elif r.id == fastest.id and r.route_type != "best_fit":
                    r.route_type = "fastest"
                elif r.id == reliable.id and r.route_type != "best_fit":
                    r.route_type = "most_reliable"
                elif r.route_type not in ["best_fit", "cheapest", "fastest", "most_reliable"]:
                    r.route_type = "alternative"

        explanation = generate_route_explanation(recommended, alternatives, rejected_routes, request)

        return OptimizationResult(
            recommended_route=recommended,
            alternative_routes=alternatives,
            rejected_routes=rejected_routes,
            explanation=explanation,
            status="success",
            active_preset=request.intent,
            applied_weights=effective_weights
        )
    else:
        # No route satisfied all constraints
        closest = processed_routes[0] if processed_routes else None
        explanation = generate_route_explanation(None, [], rejected_routes, request)
        if closest and closest.violated_constraints:
            explanation = (
                f"No route satisfies all constraints. "
                f"Closest alternative is '{closest.mode_summary}' (Score: {closest.overall_score:.0f}). "
                f"Constraint to relax: {closest.violated_constraints[0]}."
            )

        return OptimizationResult(
            recommended_route=closest,
            alternative_routes=processed_routes[1:] if len(processed_routes) > 1 else [],
            rejected_routes=rejected_routes,
            explanation=explanation,
            status="no_route_satisfies_constraints",
            active_preset=request.intent,
            applied_weights=effective_weights
        )
