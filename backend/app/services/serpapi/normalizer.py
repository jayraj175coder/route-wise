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
    Handles:
    1. Transit responses (Local Train / Suburban Rail, Metro, City Buses, Walk)
    2. Driving / Cab responses
    """
    routes: List[CandidateRoute] = []
    if not raw_data or "directions" not in raw_data:
        return routes

    raw_directions = raw_data.get("directions", [])

    for idx, d in enumerate(raw_directions):
        travel_mode_str = str(d.get("travel_mode", "")).lower()
        dur_raw = d.get("duration")
        duration_mins = extract_metric(dur_raw, 3600.0) / 60.0

        dist_raw = d.get("distance")
        distance_meters = extract_metric(dist_raw, 50000.0)
        dist_km = distance_meters / 1000.0

        via_summary = d.get("via", "")
        raw_trips = d.get("trips", [])

        # Check if this is a Transit direction (trips list of dicts)
        is_transit = travel_mode_str == "transit" or (
            raw_trips and isinstance(raw_trips, list) and isinstance(raw_trips[0], dict)
        )

        segments: List[RouteSegment] = []
        has_local_train = False
        has_metro = False
        has_bus = False
        bus_name = ""
        train_name = ""
        total_walking_meters = 0.0
        transit_count = 0
        total_fare = 0.0

        if is_transit and raw_trips and isinstance(raw_trips[0], dict):
            # Parse step-by-step transit itinerary
            for step_idx, step in enumerate(raw_trips):
                step_mode = str(step.get("travel_mode", "Transit")).lower()
                step_dur = extract_metric(step.get("duration"), 300.0) / 60.0
                step_dist = extract_metric(step.get("distance"), 800.0)
                step_icon = str(step.get("icon", "")).lower()
                step_title = step.get("title", "")
                service_info = step.get("service_run_by", {})
                service_name = service_info.get("name", "") if isinstance(service_info, dict) else ""
                start_stop = step.get("start_stop", {})
                end_stop = step.get("end_stop", {})
                
                # Check next or previous transit stop for walking steps
                if "walk" in step_mode:
                    if step_idx == 0 and len(raw_trips) > 1:
                        next_stop_name = raw_trips[1].get("start_stop", {}).get("name")
                        start_name = origin
                        end_name = next_stop_name or f"{origin} Transit Stop"
                    elif step_idx == len(raw_trips) - 1 and len(raw_trips) > 1:
                        prev_stop_name = raw_trips[step_idx - 1].get("end_stop", {}).get("name")
                        start_name = prev_stop_name or f"{destination} Transit Stop"
                        end_name = destination
                    else:
                        start_name = origin
                        end_name = destination
                else:
                    start_name = start_stop.get("name", origin) if isinstance(start_stop, dict) else origin
                    end_name = end_stop.get("name", destination) if isinstance(end_stop, dict) else destination

                stops = step.get("stops", [])
                stops_count = len(stops) if isinstance(stops, list) else 0

                if "walk" in step_mode:
                    seg_mode = TransportMode.WALKING
                    seg_cost = 0.0
                    total_walking_meters += step_dist
                    inst = f"Walk {step.get('formatted_distance', f'{int(step_dist)}m')} ({step.get('formatted_duration', f'{int(step_dur)} min')})"
                    sched = None
                else:
                    # Transit: Identify whether Train, Metro, or Bus
                    lower_all = f"{step_title} {service_name}".lower()

                    # 1. Bus detection: icon contains bus, known bus operators, or bus keywords in title/service
                    is_bus = (
                        "bus" in step_icon
                        or any(b in service_name.upper() for b in ["BEST", "NMMT", "TMT", "KDMT", "MSRTC", "PMPML", "DTC", "BMTC", "MTC", "KSRTC"])
                        or "bus" in lower_all
                        or "depot" in lower_all
                        or "ltd" in lower_all
                    )

                    # 2. Metro detection: explicit metro line / subway
                    is_metro = (
                        not is_bus
                        and ("metro" in step_icon or "subway" in step_icon or "metro" in lower_all or "metro line" in lower_all)
                    )

                    # 3. Train detection: railway / suburban local train / superfast
                    is_train = (
                        not is_bus
                        and not is_metro
                        and (
                            "train" in step_icon
                            or "rail" in step_icon
                            or any(k in lower_all for k in ["local train", "central railway", "western railway", "harbour line", "trans-harbour", "indian railways", "superfast", "express train", "emu", "demu", "memu", "slow local", "fast local"])
                        )
                    )

                    if is_train:
                        seg_mode = TransportMode.TRAIN
                        train_name = step_title
                        transit_count += 1

                        if dist_km < 60.0:
                            has_local_train = True
                            seg_cost = 10.0  # Mumbai/Indian suburban local single ticket
                            inst = f"Board Suburban Local Train: {step_title} from {start_name} to {end_name} ({stops_count} intermediate stops)"
                            sched = f"{service_name or 'Suburban Railway'} • Punctual Right-of-Way Corridor"
                        else:
                            has_local_train = False
                            seg_cost = round(min(2600.0, max(280.0, dist_km * 1.25)), 0)
                            inst = f"Board Intercity Superfast Rail: {step_title} from {start_name} to {end_name} ({stops_count} intermediate stops)"
                            sched = f"{service_name or 'Indian Railways'} • Reserved Express Coach"
                    elif is_metro:
                        seg_mode = TransportMode.METRO
                        has_metro = True
                        seg_cost = 25.0
                        transit_count += 1
                        inst = f"Board Metro Line: {step_title} from {start_name} to {end_name}"
                        sched = "High-frequency urban rapid transit"
                    else:
                        seg_mode = TransportMode.BUS
                        has_bus = True
                        bus_name = step_title
                        transit_count += 1
                        if dist_km < 60.0:
                            seg_cost = 20.0  # BEST / NMMT city bus fare
                            inst = f"Take City Bus: {step_title} from {start_name} to {end_name}"
                            sched = f"{service_name or 'City Transit'} • Scheduled municipal bus route"
                        else:
                            seg_cost = round(min(1600.0, max(250.0, dist_km * 0.95)), 0)
                            inst = f"Board Intercity Highway Bus: {step_title} from {start_name} to {end_name}"
                            sched = f"{service_name or 'State Transit'} • Outstation Highway Bus"

                total_fare += seg_cost
                segments.append(
                    RouteSegment(
                        id=f"serp-transit-{idx}-{step_idx}",
                        mode=seg_mode,
                        from_name=start_name,
                        to_name=end_name,
                        duration_minutes=max(1.0, round(step_dur, 1)),
                        distance_meters=max(50.0, round(step_dist, 1)),
                        cost=seg_cost,
                        instructions=inst,
                        schedule_details=sched,
                    )
                )

            # If initial walk to station/depot exceeds 600m, commuters take local auto
            has_first_auto = False
            if segments and segments[0].mode == TransportMode.WALKING and segments[0].distance_meters > 600:
                first_walk = segments[0]
                orig_dist = first_walk.distance_meters
                orig_dur = first_walk.duration_minutes
                first_walk.distance_meters = 150.0
                first_walk.duration_minutes = 2.0
                first_walk.instructions = f"Walk 150m to local auto / cab stand"
                total_walking_meters -= (orig_dist - 150.0)
                duration_mins = max(10.0, duration_mins - orig_dur + 6.0)

                segments.insert(1,
                    RouteSegment(
                        id=f"serp-transit-{idx}-auto-firstmile",
                        mode=TransportMode.AUTO,
                        from_name=first_walk.from_name,
                        to_name=first_walk.to_name,
                        duration_minutes=4.0,
                        distance_meters=orig_dist - 150.0,
                        cost=20.0,
                        instructions=f"Quick Auto / Share Cab to {first_walk.to_name}",
                    )
                )
                total_fare += 20.0
                has_first_auto = True

            # If final walk from station to destination exceeds 600m, commuters take local auto
            has_last_auto = False
            if segments and segments[-1].mode == TransportMode.WALKING and segments[-1].distance_meters > 600:
                last_walk = segments[-1]
                orig_dist = last_walk.distance_meters
                orig_dur = last_walk.duration_minutes
                last_walk.distance_meters = 150.0
                last_walk.duration_minutes = 2.0
                last_walk.instructions = f"Walk 150m from platform to station exit auto stand"
                total_walking_meters -= (orig_dist - 150.0)
                duration_mins = max(10.0, duration_mins - orig_dur + 6.0)

                segments.append(
                    RouteSegment(
                        id=f"serp-transit-{idx}-auto-lastmile",
                        mode=TransportMode.AUTO,
                        from_name=last_walk.from_name,
                        to_name=destination,
                        duration_minutes=4.0,
                        distance_meters=orig_dist - 150.0,
                        cost=25.0,
                        instructions=f"Quick Auto / Share Cab directly to {destination}",
                    )
                )
                total_fare += 25.0
                has_last_auto = True

            # Generate mode summary
            if dist_km < 60.0:
                has_any_auto = has_first_auto or has_last_auto
                if has_local_train and has_any_auto:
                    mode_summary = "Mumbai Suburban Local Train + Auto"
                elif has_local_train:
                    mode_summary = "Mumbai Suburban Local Train + Walk"
                elif has_metro and has_bus:
                    mode_summary = "Metro Rapid Transit + Feeder Bus"
                elif has_metro and has_any_auto:
                    mode_summary = "Metro Rapid Transit + Auto"
                elif has_metro:
                    mode_summary = "Metro Rapid Transit + Walk"
                elif has_bus and has_any_auto:
                    mode_summary = f"City Transit Bus ({bus_name[:24]}) + Auto" if bus_name else "City Transit Bus + Auto"
                elif has_bus:
                    mode_summary = f"City Transit Bus ({bus_name[:24]}) + Walk" if bus_name else "City Transit Bus + Walk"
                else:
                    mode_summary = "Public Transit Corridor"
            else:
                if any(s.mode == TransportMode.TRAIN for s in segments):
                    mode_summary = "Intercity Superfast Rail + Station Transfer"
                elif has_bus:
                    mode_summary = "Intercity AC Highway Bus + Station Transfer"
                else:
                    mode_summary = "Intercity Public Transit"

            transfer_count = max(0, transit_count - 1)
            estimated_cost = max(10.0, round(total_fare, 0))
            confidence_score = 94.0 if has_local_train else (88.0 if has_metro else 78.0)
            route_type = "best_fit" if has_local_train else ("cheapest" if has_bus else "alternative")

        else:
            # Driving / Cab mode
            mode_summary = f"App Cab / Drive via {via_summary}" if via_summary else "Direct Doorstep Cab / Drive"
            # Calculate cab / driving cost: ₹50 base + ₹14/km
            dist_km = distance_meters / 1000.0
            estimated_cost = round(max(50.0, 50.0 + dist_km * 14.0), 0)
            total_walking_meters = 40.0
            transfer_count = 0
            confidence_score = 80.0
            route_type = "fastest"

            # Create clean driving segments
            segments = [
                RouteSegment(
                    id=f"serp-drive-{idx}-0",
                    mode=TransportMode.DRIVING,
                    from_name=origin,
                    to_name=destination,
                    duration_minutes=max(5.0, round(duration_mins, 1)),
                    distance_meters=max(500.0, round(distance_meters, 1)),
                    cost=estimated_cost,
                    instructions=f"Direct cab/car drive via {via_summary or 'main city highway'} directly to {destination}",
                    schedule_details="Doorstep pickup • Real-time traffic routing"
                )
            ]

        dep_time = "08:15 AM"
        arr_h = 8 + int((duration_mins + 15) // 60)
        arr_m = int((duration_mins + 15) % 60)
        ampm = "AM" if arr_h < 12 else "PM"
        arr_h_fmt = arr_h if arr_h <= 12 else arr_h - 12
        arr_time = f"{arr_h_fmt:02d}:{arr_m:02d} {ampm}"

        routes.append(
            CandidateRoute(
                id=f"serp-route-{idx}",
                mode_summary=mode_summary,
                segments=segments,
                total_duration_minutes=round(duration_mins, 1),
                total_distance_meters=round(distance_meters, 1),
                estimated_cost=estimated_cost,
                walking_distance_meters=round(total_walking_meters, 1),
                transfer_count=transfer_count,
                departure_time=dep_time,
                arrival_time=arr_time,
                arrival_buffer_minutes=35.0,
                route_type=route_type,
                source="serpapi_live",
                disruption_signals=[],
                risk_factors=[],
                risk_level="LOW" if has_local_train else "MEDIUM",
                confidence_score=confidence_score,
                overall_score=88.0,
                violated_constraints=[],
                is_valid=True
            )
        )

    return routes
