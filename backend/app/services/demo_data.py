from typing import List
from app.models.domain import (
    CandidateRoute,
    RouteSegment,
    TransportMode,
    DisruptionSignal,
    RiskFactor,
)

def get_demo_candidate_routes(has_disruption: bool = False) -> List[CandidateRoute]:
    """
    Returns deterministic preloaded candidate routes for Mumbai -> Pune demo scenario.
    Covers multimodal routes (Train + Auto, Express Highway Bus, Private Cab, Metro + Intercity Express).
    If has_disruption is True, updates Expressway Bus route with severe traffic delay.
    """
    # 1. Route A: Train + Auto (Deccan Express + Last-mile Auto)
    route_a_segments = [
        RouteSegment(
            id="seg-a1",
            mode=TransportMode.WALKING,
            from_name="Origin (Dadar)",
            to_name="Dadar Station",
            duration_minutes=8.0,
            distance_meters=450.0,
            cost=0.0,
            instructions="Walk to Dadar Railway Station Platform 3"
        ),
        RouteSegment(
            id="seg-a2",
            mode=TransportMode.TRANSIT,
            from_name="Dadar Station",
            to_name="Pune Junction",
            duration_minutes=170.0,
            distance_meters=160000.0,
            cost=420.0,
            instructions="Deccan Express Train (Express Rail #11007)",
            schedule_details="Departs 06:15 AM - Dedicated right-of-way railway line"
        ),
        RouteSegment(
            id="seg-a3",
            mode=TransportMode.AUTO,
            from_name="Pune Junction",
            to_name="Destination (Hinjawadi IT Park)",
            duration_minutes=25.0,
            distance_meters=18000.0,
            cost=280.0,
            instructions="Prepaid Auto Rickshaw via Aundh-Hinjawadi Main Road"
        )
    ]

    route_a = CandidateRoute(
        id="demo-route-train-auto",
        mode_summary="Train + Auto",
        segments=route_a_segments,
        total_duration_minutes=203.0,  # ~3h 23m
        total_distance_meters=178450.0,
        estimated_cost=700.0,
        walking_distance_meters=450.0,
        transfer_count=1,
        departure_time="06:05 AM",
        arrival_time="09:28 AM",
        arrival_buffer_minutes=42.0,  # Goal deadline: 10:10 AM
        route_type="best_fit",
        source="demo",
        disruption_signals=[],
        risk_factors=[
            RiskFactor(factor="Minor peak-hour traffic near Hinjawadi", severity="low", impact_minutes=5)
        ]
    )

    # 2. Route B: Express Highway AC Bus + Cab
    expressway_disruption = []
    bus_duration = 210.0
    bus_cost = 650.0
    bus_arrival = "09:40 AM"
    bus_buffer = 30.0

    if has_disruption:
        bus_duration = 275.0  # +65 mins delay!
        bus_arrival = "10:45 AM"
        bus_buffer = -35.0  # Misses deadline!
        expressway_disruption = [
            DisruptionSignal(
                id="dis-expressway-01",
                source="Times of India Traffic Alert",
                title="Severe Congestion on Mumbai-Pune Expressway at Khandala Ghat",
                published_time="15 mins ago",
                url="https://timesofindia.indiatimes.com/auto/traffic-alert-mumbai-pune-expressway",
                signal_type="road_closure",
                severity="high",
                location="Khandala Ghat section (KM 42)",
                confidence=0.92,
                impact_minutes=65.0
            )
        ]

    route_b_segments = [
        RouteSegment(
            id="seg-b1",
            mode=TransportMode.WALKING,
            from_name="Origin",
            to_name="Maitri Park Bus Stop Chembur",
            duration_minutes=12.0,
            distance_meters=750.0,
            cost=0.0,
            instructions="Walk to Chembur AC Bus Boarding Point"
        ),
        RouteSegment(
            id="seg-b2",
            mode=TransportMode.TRANSIT,
            from_name="Chembur Bus Stop",
            to_name="Wakad Highway Junction",
            duration_minutes=bus_duration - 30.0,
            distance_meters=155000.0,
            cost=500.0,
            instructions="Shivneri AC Volvo Bus via Mumbai-Pune Expressway"
        ),
        RouteSegment(
            id="seg-b3",
            mode=TransportMode.AUTO,
            from_name="Wakad Junction",
            to_name="Destination (Hinjawadi)",
            duration_minutes=18.0,
            distance_meters=6000.0,
            cost=150.0,
            instructions="Cab/Auto to Hinjawadi Phase 1"
        )
    ]

    route_b = CandidateRoute(
        id="demo-route-express-bus",
        mode_summary="Expressway AC Bus + Cab",
        segments=route_b_segments,
        total_duration_minutes=bus_duration,
        total_distance_meters=161750.0,
        estimated_cost=bus_cost,
        walking_distance_meters=750.0,
        transfer_count=1,
        departure_time="06:00 AM",
        arrival_time=bus_arrival,
        arrival_buffer_minutes=bus_buffer,
        route_type="cheapest" if not has_disruption else "rejected",
        source="demo",
        disruption_signals=expressway_disruption,
        risk_factors=[
            RiskFactor(factor="Expressway toll plaza bottleneck", severity="medium", impact_minutes=15)
        ] if not has_disruption else [
            RiskFactor(factor="Severe Expressway blockage (65m delay)", severity="high", impact_minutes=65)
        ]
    )

    # 3. Route C: Private Direct Taxi / Cab
    route_c_segments = [
        RouteSegment(
            id="seg-c1",
            mode=TransportMode.DRIVING,
            from_name="Origin (Doorstep)",
            to_name="Destination (Hinjawadi)",
            duration_minutes=190.0 if not has_disruption else 235.0,
            distance_meters=158000.0,
            cost=2400.0,
            instructions="Door-to-door Private Taxi via Old Mumbai-Pune Highway (NH 48)"
        )
    ]

    route_c = CandidateRoute(
        id="demo-route-private-cab",
        mode_summary="Private Direct Cab",
        segments=route_c_segments,
        total_duration_minutes=190.0 if not has_disruption else 235.0,
        total_distance_meters=158000.0,
        estimated_cost=2400.0,
        walking_distance_meters=50.0,
        transfer_count=0,
        departure_time="06:30 AM",
        arrival_time="09:40 AM" if not has_disruption else "10:25 AM",
        arrival_buffer_minutes=30.0 if not has_disruption else -15.0,
        route_type="fastest",
        source="demo",
        disruption_signals=[],
        risk_factors=[
            RiskFactor(factor="High cost exceeding standard budget", severity="medium", impact_minutes=0)
        ]
    )

    # 4. Route D: Metro + Intercity Vande Bharat Express + Metro
    route_d_segments = [
        RouteSegment(
            id="seg-d1",
            mode=TransportMode.TRANSIT,
            from_name="Ghatkopar Metro Station",
            to_name="CSMT Station",
            duration_minutes=25.0,
            distance_meters=19000.0,
            cost=40.0,
            instructions="Mumbai Metro Line 1 to Suburban Rail Link"
        ),
        RouteSegment(
            id="seg-d2",
            mode=TransportMode.TRANSIT,
            from_name="CSMT Station",
            to_name="Pune Junction",
            duration_minutes=180.0,
            distance_meters=192000.0,
            cost=660.0,
            instructions="Vande Bharat Express (Train #22225) Premium Rail",
            schedule_details="Priority track allocation - 99.2% historical punctuality"
        ),
        RouteSegment(
            id="seg-d3",
            mode=TransportMode.TRANSIT,
            from_name="Pune Railway Station",
            to_name="Destination (Hinjawadi)",
            duration_minutes=20.0,
            distance_meters=16000.0,
            cost=35.0,
            instructions="Pune Line 3 Metro Direct to IT Park"
        )
    ]

    route_d = CandidateRoute(
        id="demo-route-vande-bharat",
        mode_summary="Vande Bharat Rail + Metro",
        segments=route_d_segments,
        total_duration_minutes=225.0,
        total_distance_meters=227000.0,
        estimated_cost=735.0,
        walking_distance_meters=320.0,
        transfer_count=2,
        departure_time="05:50 AM",
        arrival_time="09:35 AM",
        arrival_buffer_minutes=35.0,
        route_type="most_reliable",
        source="demo",
        disruption_signals=[],
        risk_factors=[
            RiskFactor(factor="Two transfers across rail/metro systems", severity="low", impact_minutes=8)
        ]
    )

    return [route_a, route_b, route_c, route_d]
