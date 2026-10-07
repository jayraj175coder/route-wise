from typing import List, Tuple
from app.models.domain import CandidateRoute, RiskFactor, DisruptionSignal

def evaluate_route_risk(route: CandidateRoute) -> Tuple[str, List[RiskFactor], float]:
    """
    Evaluates risk factors for a candidate route.
    Returns:
    - risk_level: "LOW", "MEDIUM", or "HIGH"
    - risk_factors: List[RiskFactor]
    - risk_penalty: float (0.0 - 50.0)
    """
    factors: List[RiskFactor] = []

    # 1. Arrival buffer risk
    if route.arrival_buffer_minutes < 10:
        factors.append(
            RiskFactor(
                factor="Extremely low arrival safety buffer",
                severity="high",
                impact_minutes=20
            )
        )
    elif route.arrival_buffer_minutes < 20:
        factors.append(
            RiskFactor(
                factor="Low arrival buffer (< 20 mins)",
                severity="medium",
                impact_minutes=12
            )
        )

    # 2. Transfer complexity risk
    if route.transfer_count >= 3:
        factors.append(
            RiskFactor(
                factor="High transfer complexity (3+ transfers)",
                severity="high",
                impact_minutes=25
            )
        )
    elif route.transfer_count == 2:
        factors.append(
            RiskFactor(
                factor="Multiple transfers required",
                severity="medium",
                impact_minutes=15
            )
        )

    # 3. Transfer tightness between segments
    for idx in range(len(route.segments) - 1):
        seg1 = route.segments[idx]
        seg2 = route.segments[idx + 1]
        # Check if mode switch between transit lines
        if seg1.mode != seg2.mode:
            # Check tight connection duration if instructions mention tight window
            if "tight" in seg2.instructions.lower() or seg1.duration_minutes > 90:
                factors.append(
                    RiskFactor(
                        factor=f"Tight connection at {seg1.to_name}",
                        severity="medium",
                        impact_minutes=10
                    )
                )

    # 4. Disruption signals risk
    high_disruptions = [d for d in route.disruption_signals if d.severity == "high"]
    med_disruptions = [d for d in route.disruption_signals if d.severity == "medium"]

    for d in high_disruptions:
        factors.append(
            RiskFactor(
                factor=f"Major disruption signal: {d.title}",
                severity="high",
                impact_minutes=d.impact_minutes
            )
        )

    for d in med_disruptions:
        factors.append(
            RiskFactor(
                factor=f"Moderate disruption signal: {d.title}",
                severity="medium",
                impact_minutes=d.impact_minutes
            )
        )

    # 5. Multimodal complexity risk
    modes = set(seg.mode for seg in route.segments)
    if len(modes) >= 3:
        factors.append(
            RiskFactor(
                factor="Multimodal journey coordination risk",
                severity="low",
                impact_minutes=8
            )
        )

    # Compute overall risk level and penalty
    high_count = sum(1 for f in factors if f.severity == "high")
    med_count = sum(1 for f in factors if f.severity == "medium")

    if high_count >= 1 or med_count >= 3:
        risk_level = "HIGH"
        risk_penalty = 35.0 + (high_count * 10.0)
    elif med_count >= 1 or len(factors) >= 2:
        risk_level = "MEDIUM"
        risk_penalty = 18.0 + (med_count * 5.0)
    else:
        risk_level = "LOW"
        risk_penalty = max(0.0, len(factors) * 5.0)

    risk_penalty = min(60.0, risk_penalty)

    return risk_level, factors, risk_penalty
