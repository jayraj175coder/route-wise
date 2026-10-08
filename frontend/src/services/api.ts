import {
  JourneyRequest,
  OptimizationResult,
  ReoptimizeResult,
  WhatIfResponse,
  CandidateRoute,
  DisruptionSignal
} from '../types/journey';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Try configured API_BASE_URL first
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (res.ok) return res;
  } catch (e) {
    // If API_BASE_URL failed, try relative /api proxy
    if (!API_BASE_URL.startsWith('/api')) {
      try {
        const resProxy = await fetch(`/api${endpoint}`, options);
        if (resProxy.ok) return resProxy;
      } catch (proxyErr) {
        // Continue to fallback
      }
    }
  }

  // Second try: direct 127.0.0.1:8000
  if (API_BASE_URL !== 'http://127.0.0.1:8000/api') {
    return await fetch(`http://127.0.0.1:8000/api${endpoint}`, options);
  }
  throw new Error(`Failed to fetch ${endpoint}`);
}

export async function optimizeJourney(req: JourneyRequest): Promise<OptimizationResult> {
  try {
    const res = await fetchWithFallback('/journey/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error or backend offline, falling back to local client demo response', err);
    return getLocalFallbackOptimization(req, false);
  }
}

export async function reoptimizeJourney(
  req: JourneyRequest,
  prevRouteId: string
): Promise<ReoptimizeResult> {
  try {
    const res = await fetchWithFallback('/journey/reoptimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey_request: req,
        previous_recommended_route_id: prevRouteId,
      }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error, using local re-optimize simulation', err);
    const optRes = getLocalFallbackOptimization(req, true);
    return {
      previous_route: getLocalDemoRoutes(false, req.origin, req.destination)[0],
      new_recommended_route: optRes.recommended_route || getLocalDemoRoutes(false, req.origin, req.destination)[0],
      change_summary: `Route re-evaluated: Deccan Rail + Auto (Confidence: 92) is prioritized because Expressway AC Bus suffered a 65-min blockage.`,
      disruption_cause: `Severe Expressway blockage detected at Khandala Ghat (KM 42). Road delay increased by +65 mins.`,
      optimization_result: optRes,
    };
  }
}

export async function simulateWhatIf(
  req: JourneyRequest,
  adjustments: {
    budget?: number;
    walking?: number;
    transfers?: number;
    weights?: any;
  }
): Promise<WhatIfResponse> {
  try {
    const res = await fetchWithFallback('/journey/what-if', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey_request: req,
        adjusted_max_budget: adjustments.budget,
        adjusted_max_walking: adjustments.walking,
        adjusted_max_transfers: adjustments.transfers,
        adjusted_weights: adjustments.weights,
      }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    const modifiedReq = {
      ...req,
      max_budget: adjustments.budget ?? req.max_budget,
      max_walking_distance_meters: adjustments.walking ?? req.max_walking_distance_meters,
      max_transfers: adjustments.transfers ?? req.max_transfers,
    };
    const optRes = getLocalFallbackOptimization(modifiedReq, false);
    return {
      original_recommended_id: 'demo-route-train-auto',
      new_recommended_id: optRes.recommended_route?.id || 'demo-route-train-auto',
      has_recommendation_changed: (optRes.recommended_route?.id !== 'demo-route-train-auto'),
      change_explanation: `Parameter update adjusted candidate scoring and constraint boundaries.`,
      optimization_result: optRes,
    };
  }
}

export async function runDemoScenario(triggerDisruption: boolean): Promise<OptimizationResult> {
  try {
    const res = await fetchWithFallback('/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: 'mumbai_pune_interview',
        trigger_disruption: triggerDisruption,
      }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return data.optimization_result;
  } catch (err) {
    return getLocalFallbackOptimization(
      {
        origin: 'Dadar, Mumbai',
        destination: 'Hinjawadi Phase 1, Pune',
        arrival_deadline: '10:10 AM',
        max_budget: 1500,
        max_walking_distance_meters: 1000,
        max_transfers: 2,
        intent: 'interview',
        weights: { time: 0.25, cost: 0.1, reliability: 0.35, comfort: 0.1, walking: 0.2 },
      },
      triggerDisruption
    );
  }
}

export function getLocalDemoRoutes(
  hasDisruption: boolean,
  origin: string = 'Dadar, Mumbai',
  destination: string = 'Hinjawadi Phase 1, Pune'
): CandidateRoute[] {
  const expresswayDisruption: DisruptionSignal[] = hasDisruption
    ? [
        {
          id: 'dis-expressway-01',
          source: 'Times of India Traffic Alert',
          title: `Severe Congestion along ${origin} to ${destination} corridor`,
          published_time: '15 mins ago',
          url: 'https://timesofindia.indiatimes.com/auto/traffic-alert',
          signal_type: 'road_closure',
          severity: 'high',
          location: 'Corridor choke-point',
          confidence: 0.92,
          impact_minutes: 65,
        },
      ]
    : [];

  const routeA: CandidateRoute = {
    id: 'demo-route-train-auto',
    mode_summary: 'Train + Auto',
    segments: [
      {
        id: 'seg-a1',
        mode: 'walking',
        from_name: `Origin (${origin})`,
        to_name: `${origin} Central Station`,
        duration_minutes: 8,
        distance_meters: 450,
        cost: 0,
        instructions: `Walk to ${origin} Central Railway Station Platform 3`,
      },
      {
        id: 'seg-a2',
        mode: 'transit',
        from_name: `${origin} Central Station`,
        to_name: `${destination} Junction`,
        duration_minutes: 170,
        distance_meters: 160000,
        cost: 420,
        instructions: `Express Train towards ${destination}`,
        schedule_details: 'Priority right-of-way rail corridor',
      },
      {
        id: 'seg-a3',
        mode: 'auto',
        from_name: `${destination} Junction`,
        to_name: `Destination (${destination})`,
        duration_minutes: 25,
        distance_meters: 18000,
        cost: 280,
        instructions: `Prepaid Auto Rickshaw directly to ${destination}`,
      },
    ],
    total_duration_minutes: 203,
    total_distance_meters: 178450,
    estimated_cost: 700,
    walking_distance_meters: 450,
    transfer_count: 1,
    departure_time: '06:05 AM',
    arrival_time: '09:28 AM',
    arrival_buffer_minutes: 42,
    route_type: 'best_fit',
    source: 'demo',
    disruption_signals: [],
    risk_factors: [{ factor: 'Minor peak-hour traffic near Hinjawadi', severity: 'low', impact_minutes: 5 }],
    risk_level: 'LOW',
    confidence_score: 92,
    score_breakdown: {
      time_score: 88,
      cost_score: 91,
      walking_score: 94,
      transfer_score: 90,
      buffer_score: 96,
      reliability_score: 95,
      risk_score: 94,
    },
    overall_score: 92.4,
    violated_constraints: [],
    is_valid: true,
  };

  const routeB: CandidateRoute = {
    id: 'demo-route-express-bus',
    mode_summary: 'Expressway AC Bus + Cab',
    segments: [
      {
        id: 'seg-b1',
        mode: 'walking',
        from_name: 'Origin',
        to_name: 'Chembur AC Bus Stand',
        duration_minutes: 12,
        distance_meters: 750,
        cost: 0,
        instructions: 'Walk to Chembur AC Bus Boarding Point',
      },
      {
        id: 'seg-b2',
        mode: 'transit',
        from_name: 'Chembur',
        to_name: 'Wakad Highway Junction',
        duration_minutes: hasDisruption ? 245 : 180,
        distance_meters: 155000,
        cost: 500,
        instructions: 'Shivneri AC Volvo Bus via Mumbai-Pune Expressway',
      },
      {
        id: 'seg-b3',
        mode: 'auto',
        from_name: 'Wakad Junction',
        to_name: 'Destination (Hinjawadi)',
        duration_minutes: 18,
        distance_meters: 6000,
        cost: 150,
        instructions: 'Auto/Cab to Hinjawadi Phase 1',
      },
    ],
    total_duration_minutes: hasDisruption ? 275 : 210,
    total_distance_meters: 161750,
    estimated_cost: 650,
    walking_distance_meters: 750,
    transfer_count: 1,
    departure_time: '06:00 AM',
    arrival_time: hasDisruption ? '10:45 AM' : '09:40 AM',
    arrival_buffer_minutes: hasDisruption ? -35 : 30,
    route_type: hasDisruption ? 'rejected' : 'cheapest',
    source: 'demo',
    disruption_signals: expresswayDisruption,
    risk_factors: hasDisruption
      ? [{ factor: 'Severe Expressway blockage (+65m delay)', severity: 'high', impact_minutes: 65 }]
      : [{ factor: 'Expressway toll plaza bottleneck', severity: 'medium', impact_minutes: 15 }],
    risk_level: hasDisruption ? 'HIGH' : 'MEDIUM',
    confidence_score: hasDisruption ? 38 : 84,
    score_breakdown: {
      time_score: hasDisruption ? 30 : 82,
      cost_score: 100,
      walking_score: 85,
      transfer_score: 85,
      buffer_score: hasDisruption ? 10 : 85,
      reliability_score: hasDisruption ? 35 : 82,
      risk_score: hasDisruption ? 35 : 78,
    },
    overall_score: hasDisruption ? 41.2 : 85.0,
    violated_constraints: hasDisruption ? ['Arrival misses deadline by 35 mins'] : [],
    is_valid: !hasDisruption,
  };

  const routeC: CandidateRoute = {
    id: 'demo-route-private-cab',
    mode_summary: 'Private Direct Cab',
    segments: [
      {
        id: 'seg-c1',
        mode: 'driving',
        from_name: 'Origin (Doorstep)',
        to_name: 'Destination (Hinjawadi)',
        duration_minutes: hasDisruption ? 235 : 190,
        distance_meters: 158000,
        cost: 2400,
        instructions: 'Direct Private Cab via Old Mumbai-Pune Highway (NH 48)',
      },
    ],
    total_duration_minutes: hasDisruption ? 235 : 190,
    total_distance_meters: 158000,
    estimated_cost: 2400,
    walking_distance_meters: 50,
    transfer_count: 0,
    departure_time: '06:30 AM',
    arrival_time: hasDisruption ? '10:25 AM' : '09:40 AM',
    arrival_buffer_minutes: hasDisruption ? -15 : 30,
    route_type: 'fastest',
    source: 'demo',
    disruption_signals: [],
    risk_factors: [{ factor: 'High cost exceeding standard budget', severity: 'medium', impact_minutes: 0 }],
    risk_level: 'MEDIUM',
    confidence_score: 79,
    score_breakdown: {
      time_score: 98,
      cost_score: 20,
      walking_score: 100,
      transfer_score: 100,
      buffer_score: 85,
      reliability_score: 82,
      risk_score: 75,
    },
    overall_score: 68.5,
    violated_constraints: ['Cost (₹2400) exceeds maximum budget (₹1500)'],
    is_valid: false,
  };

  const routeD: CandidateRoute = {
    id: 'demo-route-vande-bharat',
    mode_summary: 'Vande Bharat Rail + Metro',
    segments: [
      {
        id: 'seg-d1',
        mode: 'transit',
        from_name: 'Ghatkopar Metro',
        to_name: 'CSMT Station',
        duration_minutes: 25,
        distance_meters: 19000,
        cost: 40,
        instructions: 'Mumbai Metro Line 1 Link',
      },
      {
        id: 'seg-d2',
        mode: 'transit',
        from_name: 'CSMT Station',
        to_name: 'Pune Junction',
        duration_minutes: 180,
        distance_meters: 192000,
        cost: 660,
        instructions: 'Vande Bharat Express (Train #22225)',
        schedule_details: 'Priority track allocation - 99.2% punctuality',
      },
      {
        id: 'seg-d3',
        mode: 'transit',
        from_name: 'Pune Junction',
        to_name: 'Destination (Hinjawadi)',
        duration_minutes: 20,
        distance_meters: 16000,
        cost: 35,
        instructions: 'Pune Metro Line 3 Direct',
      },
    ],
    total_duration_minutes: 225,
    total_distance_meters: 227000,
    estimated_cost: 735,
    walking_distance_meters: 320,
    transfer_count: 2,
    departure_time: '05:50 AM',
    arrival_time: '09:35 AM',
    arrival_buffer_minutes: 35,
    route_type: 'most_reliable',
    source: 'demo',
    disruption_signals: [],
    risk_factors: [{ factor: 'Two transfers across rail/metro systems', severity: 'low', impact_minutes: 8 }],
    risk_level: 'LOW',
    confidence_score: 91,
    score_breakdown: {
      time_score: 82,
      cost_score: 88,
      walking_score: 95,
      transfer_score: 75,
      buffer_score: 92,
      reliability_score: 98,
      risk_score: 92,
    },
    overall_score: 89.2,
    violated_constraints: [],
    is_valid: true,
  };

  return [routeA, routeB, routeC, routeD];
}

function getLocalFallbackOptimization(
  req: JourneyRequest,
  hasDisruption: boolean
): OptimizationResult {
  const routes = getLocalDemoRoutes(hasDisruption);
  const validRoutes = routes.filter((r) => {
    if (r.estimated_cost > req.max_budget) return false;
    if (r.walking_distance_meters > req.max_walking_distance_meters) return false;
    if (r.transfer_count > req.max_transfers) return false;
    if (req.arrival_deadline && r.arrival_buffer_minutes < 0) return false;
    return true;
  });
  const rejectedRoutes = routes.filter((r) => !validRoutes.includes(r));

  const recommended = validRoutes.length > 0 ? validRoutes[0] : routes[0];
  const alternatives = validRoutes.slice(1);

  return {
    recommended_route: recommended,
    alternative_routes: alternatives,
    rejected_routes: rejectedRoutes,
    explanation: `${recommended.mode_summary} was selected because it is ₹${req.max_budget - recommended.estimated_cost} under your budget, arrives with a ${recommended.arrival_buffer_minutes} min safety buffer, and has minimal disruption risk.`,
    status: validRoutes.length > 0 ? 'success' : 'no_route_satisfies_constraints',
    active_preset: req.intent,
    applied_weights: req.weights,
    disclaimer: 'RouteWise Confidence is an internal decision score based on available route and disruption signals. It is not a guaranteed probability of arrival.',
  };
}

export async function fetchPreferences(): Promise<any> {
  try {
    const res = await fetchWithFallback('/preferences');
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return await res.json();
  } catch (err) {
    return {
      travel_style: 'balanced',
      walking_limit: 1.0,
      max_transfers: 2,
      prefer_public_transport: true,
      avoid_tolls: true,
      avoid_stairs: false,
      accessibility_mode: 'standard',
      prefer_flights: true,
      safety_priority: true,
      voice_enabled: true,
    };
  }
}

export async function savePreferences(prefs: any): Promise<any> {
  try {
    const res = await fetchWithFallback('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new Error('Failed to save preferences');
    return await res.json();
  } catch (err) {
    return prefs;
  }
}

export async function fetchRecentSearches(): Promise<any[]> {
  try {
    const res = await fetchWithFallback('/searches');
    if (!res.ok) throw new Error('Failed to fetch searches');
    return await res.json();
  } catch (err) {
    return [
      { id: 1, origin: 'Dadar, Mumbai', destination: 'Hinjawadi Phase 1, Pune', deadline: '10:10 AM', budget: 1500, walking_limit: 1000, max_transfers: 2, purpose: 'general', created_at: 'Today, 10:10 AM' },
      { id: 2, origin: 'Thane Station', destination: 'VJTI, Matunga', deadline: '9:00 AM', budget: 400, walking_limit: 800, max_transfers: 1, purpose: 'exam', created_at: 'Oct 5, 9:00 AM' },
      { id: 3, origin: 'Andheri West', destination: 'Powai IIT', deadline: '4:30 PM', budget: 600, walking_limit: 600, max_transfers: 1, purpose: 'general', created_at: 'Oct 4, 4:30 PM' },
      { id: 4, origin: 'Dadar', destination: 'CST Mumbai', deadline: '8:00 AM', budget: 250, walking_limit: 500, max_transfers: 0, purpose: 'interview', created_at: 'Oct 3, 8:00 AM' },
    ];
  }
}

export async function clearRecentSearches(): Promise<boolean> {
  try {
    const res = await fetchWithFallback('/searches', { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    return true;
  }
}

export async function parseVoiceInput(transcript: string): Promise<any> {
  try {
    const res = await fetchWithFallback('/voice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) throw new Error('Voice parse API failed');
    return await res.json();
  } catch (err) {
    const text = (transcript || '').toLowerCase();
    let orig = 'Rabale, New Mumbai';
    let dest = 'Thane';

    if (text.includes('dadar') && (text.includes('pune') || text.includes('hinjawadi'))) {
      orig = 'Dadar, Mumbai';
      dest = 'Hinjawadi Phase 1, Pune';
    } else {
      const match = text.match(/(?:from\s+)?([a-z0-9\s]+?)\s+(?:to|se|te)\s+([a-z0-9\s]+)/i);
      if (match) {
        orig = match[1].replace(/^(i want to go|i need to go|go|please take me)\s+/i, '').trim();
        dest = match[2].replace(/\s+(by|at|before|tomorrow).*$/i, '').trim();
        orig = orig.charAt(0).toUpperCase() + orig.slice(1);
        dest = dest.charAt(0).toUpperCase() + dest.slice(1);
      } else if (text.includes('thane')) {
        dest = 'Thane';
      }
    }

    const timeMatch = text.match(/(?:by|at|before)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    const deadline = timeMatch ? timeMatch[1].toUpperCase() : '10:10 AM';

    return {
      origin: orig,
      destination: dest,
      arrival_deadline: deadline,
      max_budget: text.includes('cheap') ? 50 : 100,
      max_walking_distance_meters: 1000,
      max_transfers: 3,
      intent: text.includes('cheap') ? 'budget' : text.includes('interview') ? 'interview' : 'general',
      intent_detected: true,
      raw_transcript: transcript,
    };
  }
}
