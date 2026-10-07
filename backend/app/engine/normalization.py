from typing import List, Dict
from app.models.domain import CandidateRoute, ScoreBreakdown

def normalize_sub_scores(routes: List[CandidateRoute]) -> Dict[str, ScoreBreakdown]:
    """
    Computes normalized 0-100 sub-scores for candidate routes relative to the cohort.
    If only 1 candidate exists, default normalized scores are computed against typical baseline scales.
    """
    if not routes:
        return {}

    # Extract raw metrics across routes
    durations = [r.total_duration_minutes for r in routes]
    costs = [r.estimated_cost for r in routes]
    walkings = [r.walking_distance_meters for r in routes]
    transfers = [r.transfer_count for r in routes]
    buffers = [r.arrival_buffer_minutes for r in routes]

    min_dur, max_dur = min(durations), max(durations)
    min_cost, max_cost = min(costs), max(costs)
    min_walk, max_walk = min(walkings), max(walkings)
    min_trans, max_trans = min(transfers), max(transfers)
    min_buf, max_buf = min(buffers), max(buffers)

    scores_map: Dict[str, ScoreBreakdown] = {}

    for route in routes:
        # Time score: shorter duration -> higher score (20 - 100)
        if max_dur == min_dur:
            time_score = 90.0
        else:
            time_score = 100.0 - ((route.total_duration_minutes - min_dur) / (max_dur - min_dur)) * 80.0

        # Cost score: lowest cost gets 100. Higher cost drops based on relative and cohort scale
        if max_cost == min_cost:
            cost_score = 90.0
        else:
            cohort_penalty = ((route.estimated_cost - min_cost) / (max_cost - min_cost)) * 50.0
            relative_penalty = ((route.estimated_cost - min_cost) / max(min_cost, 1.0)) * 100.0
            cost_score = max(10.0, 100.0 - (cohort_penalty + relative_penalty))

        # Walking score: less walking -> higher score (20 - 100)
        if max_walk == min_walk:
            walking_score = 95.0 if route.walking_distance_meters <= 500 else 70.0
        else:
            walking_score = 100.0 - ((route.walking_distance_meters - min_walk) / (max_walk - min_walk)) * 70.0

        # Transfer score: fewer transfers -> higher score
        # 0 transfers -> 100, 1 -> 85, 2 -> 65, 3+ -> 40
        transfer_deduction = route.transfer_count * 18.0
        transfer_score = max(25.0, 100.0 - transfer_deduction)

        # Buffer score: buffer >= 40m -> 98, 30m -> 85, 15m -> 65, <0 -> 10
        if route.arrival_buffer_minutes >= 40:
            buffer_score = 98.0
        elif route.arrival_buffer_minutes >= 30:
            buffer_score = 85.0
        elif route.arrival_buffer_minutes >= 15:
            buffer_score = 65.0
        elif route.arrival_buffer_minutes >= 0:
            buffer_score = 45.0
        else:
            buffer_score = max(5.0, 30.0 + route.arrival_buffer_minutes)

        # Reliability score: based on mode reliability, buffer, and active disruptions
        base_reliability = 82.0
        if "train" in route.mode_summary.lower():
            base_reliability += 12.0  # dedicated rail corridor
        elif "metro" in route.mode_summary.lower():
            base_reliability += 10.0
        elif "cab" in route.mode_summary.lower() or "driving" in route.mode_summary.lower():
            base_reliability += 0.0  # road traffic variability

        # Extra reliability boost for safe arrival buffer
        if route.arrival_buffer_minutes >= 40:
            base_reliability += 5.0

        # Penalty for disruptions
        disruption_penalty = sum(
            25.0 if d.severity == "high" else 12.0 if d.severity == "medium" else 5.0
            for d in route.disruption_signals
        )
        reliability_score = max(10.0, min(100.0, base_reliability - disruption_penalty))

        # Risk score: inverse of risk exposure (100 = minimal risk)
        risk_score = 100.0  # Will be adjusted by risk engine

        scores_map[route.id] = ScoreBreakdown(
            time_score=round(time_score, 1),
            cost_score=round(cost_score, 1),
            walking_score=round(walking_score, 1),
            transfer_score=round(transfer_score, 1),
            buffer_score=round(buffer_score, 1),
            reliability_score=round(reliability_score, 1),
            risk_score=round(risk_score, 1),
        )

    return scores_map
