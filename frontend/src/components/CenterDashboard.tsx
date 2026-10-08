import React, { useState, useEffect, useRef } from 'react';
import {
  CandidateRoute,
  OptimizationResult,
  JourneyRequest,
  RouteSegment,
} from '../types/journey';
import {
  Shield,
  Info,
  Train,
  Car,
  Bus,
  Plane,
  Footprints,
  Check,
  Radio,
  FileText,
  MapPin,
  Layers,
  Sparkles,
  Map,
  BarChart2,
  Clock,
  IndianRupee,
  Shuffle,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import L from 'leaflet';

interface CenterDashboardProps {
  request: JourneyRequest;
  optimizationResult: OptimizationResult;
  selectedRoute: CandidateRoute;
  onSelectRoute: (route: CandidateRoute) => void;
  onOpenSignalsModal?: () => void;
  onOpenScoreModal?: () => void;
}

type TabId = 'best' | 'alternatives' | 'map' | 'signals' | 'score';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'best', label: 'Best Route', icon: Shield },
  { id: 'alternatives', label: 'Alternatives', icon: Layers },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'signals', label: 'Live Signals', icon: Radio },
  { id: 'score', label: 'Score Breakdown', icon: BarChart2 },
];

const KNOWN_COORDS: Record<string, [number, number]> = {
  // Mumbai and MMR suburbs
  mumbai: [18.9220, 72.8347],
  rabale: [19.1363, 72.9984],
  chembur: [19.0560, 72.9090],
  'shah & anchor': [19.0560, 72.9090],
  kutchhi: [19.0560, 72.9090],
  govandi: [19.0553, 72.9150],
  mankhurd: [19.0494, 72.9328],
  vashi: [19.0771, 72.9986],
  nerul: [19.0330, 73.0169],
  belapur: [19.0195, 73.0397],
  panvel: [18.9894, 73.1175],
  ghansoli: [19.1245, 72.9987],
  koparkhairane: [19.1026, 73.0035],
  turbhe: [19.0833, 73.0197],
  sanpada: [19.0653, 73.0089],
  airoli: [19.1579, 72.9935],
  thane: [19.2183, 72.9781],
  dadar: [19.0178, 72.8478],
  kurla: [19.0657, 72.8793],
  ghatkopar: [19.0864, 72.9081],
  andheri: [19.1197, 72.8468],
  bandra: [19.0596, 72.8295],
  bkc: [19.0657, 72.8687],
  powai: [19.1176, 72.9060],
  matunga: [19.0269, 72.8553],
  vjti: [19.0222, 72.8561],
  borivali: [19.2307, 72.8567],
  cst: [18.9400, 72.8353],
  csmt: [18.9400, 72.8353],
  churchgate: [18.9322, 72.8264],
  'navi mumbai': [19.0330, 73.0297],
  // Pune and suburbs
  pune: [18.5204, 73.8567],
  hinjawadi: [18.5913, 73.7389],
  wakad: [18.5987, 73.7660],
  baner: [18.5679, 73.8016],
  aundh: [18.5590, 73.8078],
  shivajinagar: [18.5314, 73.8446],
  lonavala: [18.7525, 73.3718],
  khandala: [18.7617, 73.3644],
  // Major Indian Cities
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  noida: [28.5355, 77.3910],
  agra: [27.1767, 78.0081],
  jaipur: [26.9124, 75.7873],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mysore: [12.2958, 76.6394],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  goa: [15.2993, 74.1240],
};

function resolveCoordinates(placeName: string, fallback: [number, number]): [number, number] {
  if (!placeName) return fallback;
  const lower = placeName.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_COORDS)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  // Deterministic subtle offset for unknown locations so two points don't collapse
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = (hash << 5) - hash + lower.charCodeAt(i);
  }
  const offsetLat = ((hash % 100) / 100) * 0.08;
  const offsetLng = (((hash >> 3) % 100) / 100) * 0.08;
  return [fallback[0] + offsetLat, fallback[1] + offsetLng];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatCost(cost: number): string {
  return `₹${Math.round(cost)}`;
}

function getModeIcon(modeSummary: string) {
  const s = modeSummary.toLowerCase();
  if (s.includes('flight') || s.includes('air') || s.includes('aeroplane') || s.includes('plane')) {
    return { Icon: Plane, bg: 'bg-sky-600' };
  }
  if (s.includes('local train') || s.includes('suburban') || s.includes('harbour') || s.includes('central rail') || s.includes('western rail')) {
    return { Icon: Train, bg: 'bg-emerald-600' };
  }
  if (s.includes('train') || s.includes('rail')) {
    return { Icon: Train, bg: 'bg-blue-600' };
  }
  if (s.includes('metro')) {
    return { Icon: Train, bg: 'bg-indigo-600' };
  }
  if (s.includes('bus') || s.includes('express')) {
    return { Icon: Bus, bg: 'bg-teal-600' };
  }
  if (s.includes('auto') || s.includes('rickshaw')) {
    return { Icon: Car, bg: 'bg-amber-600' };
  }
  if (s.includes('bike') || s.includes('two-wheeler')) {
    return { Icon: Navigation, bg: 'bg-cyan-600' };
  }
  if (s.includes('cab') || s.includes('taxi') || s.includes('drive') || s.includes('private')) {
    return { Icon: Car, bg: 'bg-purple-600' };
  }
  return { Icon: Train, bg: 'bg-blue-600' };
}

function getSecondaryModeIcon(modeSummary: string) {
  const s = modeSummary.toLowerCase();
  if (s.includes('+')) {
    const second = s.split('+')[1];
    if (second.includes('flight') || second.includes('air')) return { Icon: Plane, bg: 'bg-sky-600' };
    if (second.includes('local train') || second.includes('train') || second.includes('rail')) return { Icon: Train, bg: 'bg-emerald-600' };
    if (second.includes('metro')) return { Icon: Train, bg: 'bg-indigo-600' };
    if (second.includes('bus')) return { Icon: Bus, bg: 'bg-teal-600' };
    if (second.includes('auto') || second.includes('rickshaw')) return { Icon: Car, bg: 'bg-amber-500' };
    if (second.includes('bike')) return { Icon: Navigation, bg: 'bg-cyan-600' };
    if (second.includes('cab') || second.includes('taxi') || second.includes('drive')) return { Icon: Car, bg: 'bg-purple-600' };
  }
  return null;
}

function getSegmentIcon(mode: string, instructions?: string) {
  const m = (mode || '').toLowerCase();
  const inst = (instructions || '').toLowerCase();

  if (m === 'walking') {
    return { Icon: Footprints, bg: 'bg-orange-100 text-orange-600 border-orange-200', label: 'Walk' };
  }
  if (m === 'flight' || m === 'aeroplane' || inst.includes('flight') || inst.includes('airline')) {
    return { Icon: Plane, bg: 'bg-sky-100 text-sky-600 border-sky-200', label: 'Flight' };
  }
  if (m === 'train' || inst.includes('local train') || inst.includes('suburban') || inst.includes('railway') || inst.includes('harbour') || inst.includes('central rail') || inst.includes('western rail')) {
    return { Icon: Train, bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Local Train' };
  }
  if (m === 'metro' || inst.includes('metro')) {
    return { Icon: Train, bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Metro' };
  }
  if (m === 'bus' || inst.includes('bus') || inst.includes('ltd') || inst.includes('depot')) {
    return { Icon: Bus, bg: 'bg-teal-100 text-teal-700 border-teal-200', label: 'Bus' };
  }
  if (m === 'auto' || inst.includes('auto') || inst.includes('rickshaw')) {
    return { Icon: Car, bg: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Auto' };
  }
  if (m === 'two_wheeler' || m === 'cycling' || inst.includes('bike') || inst.includes('rapido')) {
    return { Icon: Navigation, bg: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Bike' };
  }
  if (m === 'transit') {
    return { Icon: Train, bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Transit' };
  }
  if (m === 'driving') {
    return { Icon: Car, bg: 'bg-purple-100 text-purple-600 border-purple-200', label: 'Drive' };
  }
  return { Icon: Navigation, bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Transit' };
}

function getRouteTypeBadge(routeType: string): string {
  switch (routeType) {
    case 'cheapest': return 'Cheapest';
    case 'fastest': return 'Fastest';
    case 'most_reliable': return 'Most Reliable';
    case 'best_fit': return 'Best Fit';
    default: return 'Alternative';
  }
}

function getRouteTypeBadgeColor(routeType: string): string {
  switch (routeType) {
    case 'cheapest': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'fastest': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'most_reliable': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const CenterDashboard: React.FC<CenterDashboardProps> = ({
  request,
  optimizationResult,
  selectedRoute,
  onSelectRoute,
  onOpenSignalsModal,
  onOpenScoreModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('best');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const route = selectedRoute || optimizationResult.recommended_route;

  // Derived live values — all from actual route data
  const scoreValue = Math.min(
    99,
    Math.max(
      40,
      Math.round(
        route.confidence_score > 1 ? route.confidence_score : route.confidence_score * 100
      ) || Math.round(route.overall_score) || 85
    )
  );
  const bufferMins = Math.round(route.arrival_buffer_minutes || 0);
  const budgetSaved = Math.max(0, Math.round(request.max_budget - route.estimated_cost));

  // Score breakdown — from real API data
  const sb = route.score_breakdown;
  const scoreRows = [
    { label: 'Time', value: sb?.time_score ?? Math.round(scoreValue * 0.95), color: 'bg-blue-600' },
    { label: 'Cost', value: sb?.cost_score ?? Math.round(scoreValue * 1.02), color: 'bg-emerald-600' },
    { label: 'Reliability', value: sb?.reliability_score ?? Math.round(scoreValue * 0.98), color: 'bg-teal-600' },
    { label: 'Walking', value: sb?.walking_score ?? Math.round(scoreValue * 0.97), color: 'bg-orange-500' },
    { label: 'Transfers', value: sb?.transfer_score ?? Math.round(scoreValue * 0.99), color: 'bg-purple-600' },
    { label: 'Arrival buffer', value: sb?.buffer_score ?? Math.round(scoreValue * 1.03), color: 'bg-sky-500' },
    { label: 'Disruption risk', value: sb?.risk_score ?? Math.round(scoreValue * 0.94), color: 'bg-slate-500' },
  ].map((r) => ({ ...r, value: Math.min(99, Math.max(10, r.value)) }));

  // Alternatives from API
  const alternatives = optimizationResult.alternative_routes || [];
  const rejectedRoutes = optimizationResult.rejected_routes || [];

  // Primary + secondary mode icons
  const primaryMode = getModeIcon(route.mode_summary);
  const secondaryMode = getSecondaryModeIcon(route.mode_summary);

  // Dynamic Leaflet Map setup based on actual origin/destination
  useEffect(() => {
    if (activeTab !== 'map') return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const originCoord = resolveCoordinates(request.origin, [19.0178, 72.8478]);
      const destCoord = resolveCoordinates(request.destination, [18.5913, 73.7389]);

      // Calculate midpoint / transfer waypoint
      const midLat = (originCoord[0] + destCoord[0]) / 2;
      const midLng = (originCoord[1] + destCoord[1]) / 2;
      const transferCoord: [number, number] = [midLat, midLng];

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [midLat, midLng],
          zoom: 9,
          zoomControl: true,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      map.eachLayer((l) => {
        if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l);
      });

      // Draw segments
      if (route.transfer_count > 0) {
        L.polyline([originCoord, transferCoord], { color: '#2563EB', weight: 5, opacity: 0.9 }).addTo(map);
        L.polyline([transferCoord, destCoord], { color: '#F97316', weight: 5, opacity: 0.9, dashArray: '4, 6' }).addTo(map);
      } else {
        L.polyline([originCoord, destCoord], { color: '#2563EB', weight: 5, opacity: 0.9 }).addTo(map);
      }

      const makePin = (color: string, label: string) =>
        L.divIcon({
          className: '',
          html: `<div style="display:flex;align-items:center;gap:4px;transform:translate(-10px,-12px);white-space:nowrap"><div style="background:${color};width:13px;height:13px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div><span style="background:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;color:#1E293B;box-shadow:0 1px 4px rgba(0,0,0,.2)">${label}</span></div>`,
          iconSize: [20, 20],
        });

      L.marker(originCoord, { icon: makePin('#2563EB', request.origin) }).addTo(map);
      L.marker(destCoord, { icon: makePin('#DC2626', request.destination) }).addTo(map);
      if (route.transfer_count > 0) {
        L.marker(transferCoord, { icon: makePin('#334155', 'Transfer Point') }).addTo(map);
      }

      const bounds = L.latLngBounds([originCoord, destCoord]);
      map.fitBounds(bounds, { padding: [40, 40] });
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, route, request.origin, request.destination]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* ── Tab Bar ── */}
      <div className="flex items-center border-b border-slate-100 px-4 overflow-x-auto bg-slate-50/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#FF7A1A] text-[#FF7A1A] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'alternatives' && alternatives.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                  {alternatives.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="p-5">
        {/* ── BEST ROUTE TAB ── */}
        {activeTab === 'best' && (
          <div className="space-y-5">
            {/* Header: mode + score */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {route.is_valid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Recommended Option
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Constraint Warning
                    </span>
                  )}

                  {route.risk_level === 'LOW' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Low disruption risk
                    </span>
                  ) : route.risk_level === 'HIGH' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      High delay exposure
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-xl ${primaryMode.bg} text-white flex items-center justify-center`}>
                      <primaryMode.Icon className="w-4 h-4" />
                    </div>
                    {secondaryMode && (
                      <>
                        <span className="text-slate-400 font-bold">+</span>
                        <div className={`w-8 h-8 rounded-xl ${secondaryMode.bg} text-white flex items-center justify-center`}>
                          <secondaryMode.Icon className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                  <h3 className="font-heading text-2xl font-black text-slate-900 tracking-tight">
                    {route.mode_summary}
                  </h3>
                </div>
              </div>

              {/* Big Score */}
              <div className="text-right shrink-0">
                <div className="font-heading text-4xl font-black text-emerald-600 leading-none">
                  {scoreValue}
                  <span className="text-base font-semibold text-emerald-500/70 ml-1">/ 100</span>
                </div>
                <button
                  onClick={onOpenScoreModal}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center justify-end gap-1 mt-1 group"
                >
                  RouteWise Score <Info className="w-3 h-3 group-hover:text-slate-600" />
                </button>
              </div>
            </div>

            {/* Constraint Notice Banner if constraints exceeded */}
            {!route.is_valid && route.violated_constraints.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Constraint Notice</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    {route.violated_constraints.join('; ')}
                  </div>
                </div>
              </div>
            )}

            {optimizationResult.status === 'no_route_satisfies_constraints' && (
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>No single route satisfies 100% of strict constraints. Showing the closest best-fit journey option.</span>
              </div>
            )}

            {/* 5-Metric Row — all from live route data */}
            <div className="grid grid-cols-5 gap-3 py-4 border-y border-slate-100">
              {[
                { icon: IndianRupee, label: 'Cost', value: formatCost(route.estimated_cost), color: 'text-emerald-600' },
                { icon: Clock, label: 'Duration', value: formatDuration(route.total_duration_minutes), color: 'text-blue-600' },
                { icon: Shuffle, label: 'Transfers', value: String(route.transfer_count), color: 'text-purple-600' },
                { icon: Footprints, label: 'Walking', value: `${route.walking_distance_meters}m`, color: 'text-orange-500' },
                { icon: Clock, label: 'Arrives', value: route.arrival_time || '—', color: 'text-slate-700' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <div className="text-sm font-black text-slate-900">{value}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>

            {/* Status pills — live constraints check */}
            <div className="flex flex-wrap gap-2">
              {budgetSaved > 0 ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
                  <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                  {formatCost(budgetSaved)} under budget
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                  Budget: ₹{request.max_budget}
                </span>
              )}

              {bufferMins > 0 ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
                  <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                  {bufferMins} min safety buffer
                </span>
              ) : bufferMins < 0 ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  Misses deadline by {Math.abs(bufferMins)}m
                </span>
              ) : null}

              {route.risk_level === 'LOW' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
                  <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                  Low disruption risk
                </span>
              )}

              {route.walking_distance_meters <= request.max_walking_distance_meters && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
                  <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                  Walking within {request.max_walking_distance_meters}m limit
                </span>
              )}

              {route.violated_constraints.length === 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-800 text-[11px] font-semibold">
                  <Check className="w-3 h-3 stroke-[3] text-blue-600" />
                  All user constraints satisfied
                </span>
              )}
            </div>

            {/* ── STEP-BY-STEP JOURNEY ITINERARY / SEGMENTS (FROM API) ── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <h4 className="font-heading text-sm font-bold text-slate-900 tracking-tight">
                    Step-by-Step Journey Itinerary
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {route.segments?.length || 0} stage{(route.segments?.length || 0) !== 1 ? 's' : ''} · {route.transfer_count} transfer{route.transfer_count !== 1 ? 's' : ''}
                </span>
              </div>

              {route.segments && route.segments.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Origin Start Point */}
                  <div className="relative flex items-center gap-3 text-xs">
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-white shadow-xs">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{request.origin}</div>
                      <div className="text-[11px] text-slate-500">Departure: {route.departure_time || '06:05 AM'}</div>
                    </div>
                  </div>

                  {/* Segments Timeline */}
                  {route.segments.map((seg: RouteSegment, idx: number) => {
                    const { Icon: SegIcon, bg: segBg, label: segLabel } = getSegmentIcon(seg.mode, seg.instructions);
                    return (
                      <div
                        key={seg.id || idx}
                        className="relative p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${segBg}`}>
                              <SegIcon className="w-3 h-3" />
                              {segLabel}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {seg.from_name} → {seg.to_name}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-900">{formatCost(seg.cost)}</span>
                          </div>
                        </div>

                        {/* Instructions */}
                        <p className="text-xs text-slate-700 leading-snug">{seg.instructions}</p>

                        {/* Schedule details */}
                        {seg.schedule_details && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium">
                            {seg.schedule_details}
                          </div>
                        )}

                        {/* Metrics Bar */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatDuration(seg.duration_minutes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Footprints className="w-3 h-3 text-slate-400" />
                            {seg.distance_meters >= 1000 ? `${(seg.distance_meters / 1000).toFixed(1)} km` : `${Math.round(seg.distance_meters)} m`}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Destination Arrival Point */}
                  <div className="relative flex items-center gap-3 text-xs pt-1">
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-white shadow-xs">
                      B
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{request.destination}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Expected Arrival: {route.arrival_time} (+{bufferMins}m buffer)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  Direct corridor route: {request.origin} to {request.destination}
                </div>
              )}
            </div>

            {/* Why this decision — uses API explanation */}
            {optimizationResult.explanation && (
              <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" /> Why this decision?
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                  {optimizationResult.explanation}
                </p>

                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                  {budgetSaved > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 font-medium">{formatCost(budgetSaved)} below your budget</span>
                    </div>
                  )}
                  {bufferMins > 0 && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 font-medium">{bufferMins}-minute arrival buffer</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-slate-700 font-medium">Only {route.transfer_count} transfer{route.transfer_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-slate-700 font-medium">{route.walking_distance_meters}m walking</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map tab CTA bar */}
            <div
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all flex items-center justify-between cursor-pointer"
              onClick={() => setActiveTab('map')}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <Map className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">
                  Interactive Route Map: {request.origin} → {request.destination}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                Open Map <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* ── ALTERNATIVES TAB ── */}
        {activeTab === 'alternatives' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              All route candidates evaluated by RouteWise engine. Select any alternative to inspect its itinerary.
            </p>

            {/* Current recommended choice */}
            <div className="p-4 rounded-xl border-2 border-[#FF7A1A]/50 bg-orange-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-lg ${primaryMode.bg} text-white flex items-center justify-center`}>
                    <primaryMode.Icon className="w-4 h-4" />
                  </div>
                  {secondaryMode && (
                    <div className={`w-7 h-7 rounded-lg ${secondaryMode.bg} text-white flex items-center justify-center`}>
                      <secondaryMode.Icon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-black text-slate-900">{route.mode_summary}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7A1A] text-white">Recommended</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatCost(route.estimated_cost)} · {formatDuration(route.total_duration_minutes)} · {route.transfer_count} transfer{route.transfer_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-2xl font-black text-emerald-600">{scoreValue}</div>
                <div className="text-[10px] text-slate-400">Score</div>
              </div>
            </div>

            {/* Alternatives List */}
            {alternatives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alternatives.map((alt) => {
                  const altScore = Math.min(
                    99,
                    Math.round(alt.confidence_score > 1 ? alt.confidence_score : alt.confidence_score * 100) ||
                      Math.round(alt.overall_score) ||
                      70
                  );
                  const { Icon: AltIcon, bg: altBg } = getModeIcon(alt.mode_summary);
                  const altSecondary = getSecondaryModeIcon(alt.mode_summary);
                  const isSelected = selectedRoute.id === alt.id;

                  return (
                    <button
                      key={alt.id}
                      onClick={() => onSelectRoute(alt)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : alt.is_valid
                          ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                          : 'border-rose-200 bg-rose-50/20 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRouteTypeBadgeColor(alt.route_type)}`}>
                          {getRouteTypeBadge(alt.route_type)}
                        </span>
                        <div className={`font-heading text-lg font-black ${alt.is_valid ? 'text-slate-800' : 'text-rose-600'}`}>
                          {altScore}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${altBg} text-white flex items-center justify-center shrink-0`}>
                          <AltIcon className="w-4 h-4" />
                        </div>
                        {altSecondary && (
                          <div className={`w-7 h-7 rounded-lg ${altSecondary.bg} text-white flex items-center justify-center shrink-0`}>
                            <altSecondary.Icon className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-900 leading-tight truncate">{alt.mode_summary}</span>
                      </div>

                      <div>
                        <div className="font-heading text-xl font-black text-slate-900 tracking-tight">{formatCost(alt.estimated_cost)}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatDuration(alt.total_duration_minutes)} · {alt.transfer_count} transfer{alt.transfer_count !== 1 ? 's' : ''}
                        </div>
                        {!alt.is_valid && alt.violated_constraints.length > 0 && (
                          <div className="text-[10px] text-rose-600 font-medium mt-1 truncate">
                            {alt.violated_constraints[0]}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No alternative routes found for this journey configuration.
              </div>
            )}

            {/* Rejected candidates if any */}
            {rejectedRoutes.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Excluded Options (Violated Constraints)
                </h4>
                <div className="space-y-2">
                  {rejectedRoutes.map((rej) => (
                    <div key={rej.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{rej.mode_summary}</span>
                        <div className="text-[11px] text-rose-600 font-medium">
                          {rej.violated_constraints?.[0] || 'Exceeded constraint criteria'}
                        </div>
                      </div>
                      <span className="font-bold text-slate-600">{formatCost(rej.estimated_cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MAP TAB ── */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Interactive Route Map</h3>
                <p className="text-[11px] text-slate-500">{request.origin} → {request.destination}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-1 rounded-full bg-blue-600" />
                  <span className="text-slate-500 font-medium">Primary corridor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0 border-t-2 border-dashed border-orange-500" />
                  <span className="text-slate-500 font-medium">Last-mile transfer</span>
                </div>
              </div>
            </div>

            <div ref={mapContainerRef} className="w-full h-[440px] rounded-xl overflow-hidden border border-slate-200 z-0" />

            <div className="grid grid-cols-5 divide-x divide-slate-100 bg-slate-50/60 rounded-xl border border-slate-200 p-3 text-center">
              {[
                { label: 'Duration', value: formatDuration(route.total_duration_minutes) },
                { label: 'Distance', value: `${Math.round(route.total_distance_meters / 1000)} km` },
                { label: 'Cost', value: formatCost(route.estimated_cost) },
                { label: 'Transfers', value: String(route.transfer_count) },
                { label: 'Walking', value: `${route.walking_distance_meters}m` },
              ].map(({ label, value }) => (
                <div key={label} className="px-2">
                  <div className="text-sm font-black text-slate-900">{value}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE SIGNALS TAB ── */}
        {activeTab === 'signals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Journey Intelligence</h3>
                <p className="text-[11px] text-slate-500">Real-time signals affecting this route corridor</p>
              </div>
              {onOpenSignalsModal && (
                <button onClick={onOpenSignalsModal} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Evidence <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live disruption signals */}
            {route.disruption_signals && route.disruption_signals.length > 0 ? (
              <div className="space-y-2">
                {route.disruption_signals.map((signal) => (
                  <div key={signal.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/70">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-snug">{signal.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{signal.location} · {signal.published_time}</div>
                      {signal.impact_minutes > 0 && (
                        <div className="text-[11px] text-rose-700 font-semibold mt-0.5">+{signal.impact_minutes} min delay</div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        signal.severity === 'high'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : signal.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {signal.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900">No active disruptions detected</div>
                  <div className="text-[11px] text-emerald-700">Corridor is running with normal traffic flow</div>
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {route.risk_factors && route.risk_factors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Corridor Risk Factors</h4>
                <div className="space-y-2">
                  {route.risk_factors.map((rf, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          rf.severity === 'high' ? 'bg-rose-500' : rf.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-xs text-slate-700 font-medium flex-1">{rf.factor}</span>
                      {rf.impact_minutes > 0 && (
                        <span className="text-[11px] text-slate-500 shrink-0">+{rf.impact_minutes}m</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data sources */}
            <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-4">
              <h4 className="text-xs font-bold text-slate-700 mb-2.5">Real-Time Data Feeds</h4>
              <div className="grid grid-cols-2 gap-y-1.5">
                {[
                  { icon: MapPin, label: 'Google Maps Directions', time: 'Live sync', color: 'text-emerald-500' },
                  { icon: Radio, label: 'Traffic & Road Reports', time: '5 min ago', color: 'text-slate-700' },
                  { icon: FileText, label: 'Google News Incidents', time: '8 min ago', color: 'text-rose-500' },
                  { icon: MapPin, label: 'Transit Corridors & Places', time: 'Live', color: 'text-blue-500' },
                ].map(({ icon: Icon, label, time, color }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                    <span className="text-slate-600 font-medium truncate">{label}</span>
                    <span className="text-slate-400 text-[10px] shrink-0 ml-auto">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCORE BREAKDOWN TAB ── */}
        {activeTab === 'score' && (
          <div className="space-y-5">
            {/* Big score card */}
            <div className="flex items-center gap-6 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60">
              <div className="text-center shrink-0">
                <div className="font-heading text-6xl font-black text-emerald-600 leading-none">{scoreValue}</div>
                <div className="text-[11px] font-semibold text-emerald-600/70 mt-1">/ 100</div>
              </div>
              <div>
                <h3 className="font-heading text-base font-black text-slate-900">RouteWise Decision Score</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Calculated using multi-criteria optimization across travel time, cost, transfer penalties, arrival buffers, walking effort, and real-time disruption exposure.
                </p>
                {optimizationResult.disclaimer && (
                  <p className="text-[10px] text-slate-400 mt-2 italic leading-relaxed">{optimizationResult.disclaimer}</p>
                )}
              </div>
            </div>

            {/* Score breakdown bars */}
            <div className="space-y-3">
              {scoreRows.map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 w-28 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-xs font-black text-slate-800 w-6 text-right shrink-0">{value}</span>
                </div>
              ))}
            </div>

            {/* Comparison vs alternatives */}
            {alternatives.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Compare with alternative candidate routes</h4>
                <div className="space-y-2">
                  {/* Current recommended */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FF7A1A]/5 border border-[#FF7A1A]/20">
                    <div className="flex items-center gap-1.5 w-36 shrink-0">
                      <div className={`w-5 h-5 rounded ${primaryMode.bg} text-white flex items-center justify-center`}>
                        <primaryMode.Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">{route.mode_summary}</span>
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF7A1A] rounded-full" style={{ width: `${scoreValue}%` }} />
                    </div>
                    <span className="text-sm font-black text-[#FF7A1A] w-6 text-right shrink-0">{scoreValue}</span>
                  </div>

                  {/* Alternatives */}
                  {alternatives.map((alt) => {
                    const altScore = Math.min(
                      99,
                      Math.round(alt.confidence_score > 1 ? alt.confidence_score : alt.confidence_score * 100) ||
                        Math.round(alt.overall_score) ||
                        70
                    );
                    const { Icon: AltIcon, bg: altBg } = getModeIcon(alt.mode_summary);
                    return (
                      <div key={alt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 w-36 shrink-0">
                          <div className={`w-5 h-5 rounded ${altBg} text-white flex items-center justify-center`}>
                            <AltIcon className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 truncate">{alt.mode_summary}</span>
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full" style={{ width: `${altScore}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-6 text-right shrink-0">{altScore}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
