from typing import List, Optional
from app.models.domain import CandidateRoute, JourneyRequest

def generate_route_explanation(
    recommended: Optional[CandidateRoute],
    alternatives: List[CandidateRoute],
    rejected: List[CandidateRoute],
    request: JourneyRequest
) -> str:
    """
    Generates a deterministic, value-grounded explanation comparing the top recommended route
    against candidate alternatives using exact numerical differences.
    """
    if not recommended:
        if rejected:
            reasons = [f"Route '{r.mode_summary}': {', '.join(r.violated_constraints)}" for r in rejected]
            return f"No route satisfied all hard constraints. Violated constraints across candidates: {'; '.join(reasons)}."
        return "No candidate routes were found for the requested origin and destination."

    reasons = []

    # Intent context
    intent_label = request.intent.value.capitalize()
    reasons.append(f"Optimized for {intent_label} mode")

    # Compare against cheapest route
    cheapest = min(alternatives + [recommended], key=lambda r: r.estimated_cost) if alternatives else None
    if cheapest and cheapest.id != recommended.id:
        cost_diff = recommended.estimated_cost - cheapest.estimated_cost
        if cost_diff <= 0:
            reasons.append(f"It is the most cost-effective option at ₹{recommended.estimated_cost:.0f}")
        else:
            time_saved = cheapest.total_duration_minutes - recommended.total_duration_minutes
            if time_saved > 0:
                reasons.append(
                    f"Saves {time_saved:.0f} mins over the cheapest option (₹{cheapest.estimated_cost:.0f}) for a modest cost diff of ₹{cost_diff:.0f}"
                )
            else:
                reasons.append(
                    f"Provides significantly higher reliability ({recommended.confidence_score:.0f} confidence vs {cheapest.confidence_score:.0f}) for ₹{cost_diff:.0f} extra"
                )
    else:
        reasons.append(f"Under your ₹{request.max_budget:.0f} budget at ₹{recommended.estimated_cost:.0f}")

    # Compare against fastest route
    fastest = min(alternatives + [recommended], key=lambda r: r.total_duration_minutes) if alternatives else None
    if fastest and fastest.id != recommended.id:
        dur_diff = recommended.total_duration_minutes - fastest.total_duration_minutes
        if dur_diff <= 0:
            reasons.append(f"is the fastest route at {recommended.total_duration_minutes:.0f} mins")
        else:
            savings = fastest.estimated_cost - recommended.estimated_cost
            if savings > 0:
                reasons.append(f"saves ₹{savings:.0f} while taking only {dur_diff:.0f} extra minutes")
    else:
        reasons.append(f"Fastest total travel time of {recommended.total_duration_minutes:.0f} mins")

    # Buffer & walking safety
    if recommended.arrival_buffer_minutes > 0:
        reasons.append(f"provides a comfortable {recommended.arrival_buffer_minutes:.0f} min safety buffer before deadline")

    if recommended.walking_distance_meters <= request.max_walking_distance_meters:
        reasons.append(f"keeps walking to {recommended.walking_distance_meters:.0f}m (limit: {request.max_walking_distance_meters:.0f}m)")

    # Disruption status
    if recommended.risk_level == "LOW":
        reasons.append("has minimal active disruption risk")
    else:
        reasons.append(f"carries {recommended.risk_level} risk level due to live travel conditions")

    explanation_text = f"{recommended.mode_summary} was selected because it " + ", ".join(reasons) + "."
    return explanation_text
