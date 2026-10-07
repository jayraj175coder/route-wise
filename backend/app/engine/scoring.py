from app.models.domain import CandidateRoute, JourneyIntent, PriorityWeights, ScoreBreakdown

INTENT_PRESETS = {
    JourneyIntent.INTERVIEW: {
        "time": 0.10,
        "cost": 0.12,
        "walking": 0.08,
        "transfer": 0.08,
        "buffer": 0.26,
        "reliability": 0.28,
        "risk": 0.15
    },
    JourneyIntent.EXAM: {
        "time": 0.08,
        "cost": 0.10,
        "walking": 0.10,
        "transfer": 0.12,
        "buffer": 0.30,
        "reliability": 0.30,
        "risk": 0.15
    },
    JourneyIntent.FLIGHT: {
        "time": 0.10,
        "cost": 0.08,
        "walking": 0.06,
        "transfer": 0.16,
        "buffer": 0.30,
        "reliability": 0.30,
        "risk": 0.18
    },
    JourneyIntent.EMERGENCY: {
        "time": 0.65,
        "cost": 0.05,
        "walking": 0.05,
        "transfer": 0.05,
        "buffer": 0.05,
        "reliability": 0.15,
        "risk": 0.05
    },
    JourneyIntent.FAMILY: {
        "time": 0.10,
        "cost": 0.15,
        "walking": 0.25,
        "transfer": 0.25,
        "buffer": 0.15,
        "reliability": 0.20,
        "risk": 0.10
    },
    JourneyIntent.BUDGET: {
        "time": 0.10,
        "cost": 0.60,
        "walking": 0.06,
        "transfer": 0.06,
        "buffer": 0.08,
        "reliability": 0.10,
        "risk": 0.05
    },
    JourneyIntent.GENERAL: {
        "time": 0.25,
        "cost": 0.25,
        "walking": 0.10,
        "transfer": 0.10,
        "buffer": 0.15,
        "reliability": 0.15,
        "risk": 0.10
    },
}

def resolve_effective_weights(intent: JourneyIntent, custom_weights: PriorityWeights) -> PriorityWeights:
    """
    Returns effective weights for display and user interaction.
    """
    preset = INTENT_PRESETS.get(intent, INTENT_PRESETS[JourneyIntent.GENERAL])
    
    # Check if custom weights are overridden from defaults
    is_customized = (
        custom_weights.time != 0.35 or
        custom_weights.cost != 0.20 or
        custom_weights.reliability != 0.25
    )

    if not is_customized:
        return PriorityWeights(
            time=preset["time"],
            cost=preset["cost"],
            reliability=preset["reliability"],
            comfort=preset["transfer"],
            walking=preset["walking"]
        )

    # Blend custom sliders with preset
    raw_time = custom_weights.time * 0.7 + preset["time"] * 0.3
    raw_cost = custom_weights.cost * 0.7 + preset["cost"] * 0.3
    raw_rel = custom_weights.reliability * 0.7 + preset["reliability"] * 0.3
    raw_comf = custom_weights.comfort * 0.7 + preset["transfer"] * 0.3
    raw_walk = custom_weights.walking * 0.7 + preset["walking"] * 0.3

    total = raw_time + raw_cost + raw_rel + raw_comf + raw_walk
    if total <= 0:
        total = 1.0

    return PriorityWeights(
        time=round(raw_time / total, 3),
        cost=round(raw_cost / total, 3),
        reliability=round(raw_rel / total, 3),
        comfort=round(raw_comf / total, 3),
        walking=round(raw_walk / total, 3),
    )

def calculate_confidence_score(
    route: CandidateRoute,
    sub_scores: ScoreBreakdown,
    risk_penalty: float
) -> float:
    """
    Calculates the internal RouteWise Confidence Score (0-100).
    Not a statistical probability - an internal decision metric combining:
    - arrival buffer
    - number of transfers
    - transfer tightness
    - journey complexity
    - current disruption signals
    - reliability score
    - risk penalty
    """
    base_confidence = (
        sub_scores.buffer_score * 0.32 +
        sub_scores.reliability_score * 0.30 +
        sub_scores.transfer_score * 0.18 +
        sub_scores.walking_score * 0.10 +
        sub_scores.time_score * 0.10
    )

    # Risk deduction
    confidence = base_confidence - (risk_penalty * 0.45)

    # Hard buffer penalty: buffer < 0 implies missed deadline
    if route.arrival_buffer_minutes < 0:
        confidence -= 35.0

    confidence = max(10.0, min(98.0, confidence))
    return round(confidence, 1)

def score_route(
    route: CandidateRoute,
    sub_scores: ScoreBreakdown,
    weights: PriorityWeights,
    risk_penalty: float,
    intent: JourneyIntent = JourneyIntent.GENERAL
) -> CandidateRoute:
    """
    Applies multi-objective scoring formula:
    overall_score =
      w_time * time_score +
      w_cost * cost_score +
      w_walking * walking_score +
      w_transfer * transfer_score +
      w_buffer * buffer_score +
      w_reliability * reliability_score -
      w_risk * risk_penalty
    """
    preset_dict = INTENT_PRESETS.get(intent, INTENT_PRESETS[JourneyIntent.GENERAL])

    # Dynamic weights taking user custom weights into account
    w_time = weights.time
    w_cost = weights.cost
    w_walking = weights.walking
    w_transfer = weights.comfort
    
    # Scale secondary weights when primary weights are heavily skewed
    scale_factor = max(0.2, 1.0 - weights.cost)
    w_buffer = preset_dict.get("buffer", 0.15) * scale_factor
    w_rel = weights.reliability
    w_risk = preset_dict.get("risk", 0.10) * scale_factor

    # Inverse risk score (100 - risk_penalty)
    sub_scores.risk_score = max(10.0, round(100.0 - risk_penalty, 1))
    route.score_breakdown = sub_scores

    overall = (
        w_time * sub_scores.time_score +
        w_cost * sub_scores.cost_score +
        w_walking * sub_scores.walking_score +
        w_transfer * sub_scores.transfer_score +
        w_buffer * sub_scores.buffer_score +
        w_rel * sub_scores.reliability_score -
        (w_risk * risk_penalty)
    )

    route.overall_score = max(0.0, round(overall, 1))
    route.confidence_score = calculate_confidence_score(route, sub_scores, risk_penalty)
    return route
