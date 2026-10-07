import React, { useState, useEffect, useRef } from 'react';
import {
  CandidateRoute,
  OptimizationResult,
  JourneyRequest,
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
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Radio,
  FileText,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Play,
  RotateCw,
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

export const CenterDashboard: React.FC<CenterDashboardProps> = ({
  request,
  optimizationResult,
  selectedRoute,
  onSelectRoute,
  onOpenSignalsModal,
  onOpenScoreModal,
}) => {
  const [activeTab, setActiveTab] = useState<'best' | 'all' | 'signals' | 'places'>('best');
  const [showTraffic, setShowTraffic] = useState(true);
  const [activeModeFilter, setActiveModeFilter] = useState<'all' | 'train' | 'bus' | 'cab' | 'flight'>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const route = selectedRoute || optimizationResult.recommended_route;

  const scoreValue = Math.min(99, Math.max(70, Math.round(route.confidence_score * 100 || route.overall_score || 92)));
  const bufferMins = route.arrival_buffer_minutes || 42;
  const budgetSaved = Math.max(0, request.max_budget - route.estimated_cost);

  // Initialize and update Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.78, 73.35],
        zoom: 9,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    map.eachLayer((l) => {
      if (l instanceof L.Marker || l instanceof L.Polyline) {
        map.removeLayer(l);
      }
    });

    // Segment 1: Rail Corridor (Blue)
    const trainCoords: L.LatLngExpression[] = [
      [19.0178, 72.8478], // Dadar
      [19.033, 73.0297],  // Navi Mumbai
      [18.7525, 73.3718], // Khandala / Lonavala
      [18.5284, 73.8744], // Pune Station
    ];

    L.polyline(trainCoords, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.9,
    }).addTo(map);

    // Segment 2: Road Feeder Corridor (Orange)
    const autoCoords: L.LatLngExpression[] = [
      [18.5284, 73.8744], // Pune Station
      [18.5679, 73.8016], // Baner Road
      [18.5913, 73.7389], // Hinjawadi Phase 1
    ];

    L.polyline(autoCoords, {
      color: '#F97316',
      weight: 5,
      opacity: 0.9,
      dashArray: '3, 6',
    }).addTo(map);

    // Pin: Dadar Origin
    const originIcon = L.divIcon({
      className: 'custom-pin-dadar',
      html: `
        <div style="display:flex; align-items:center; gap:4px; transform:translate(-24px, -12px); white-space:nowrap;">
          <div style="background:#2563EB; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
          <span style="background:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; color:#1E293B; box-shadow:0 1px 4px rgba(0,0,0,0.2);">Dadar, Mumbai</span>
        </div>
      `,
      iconSize: [20, 20],
    });
    L.marker([19.0178, 72.8478], { icon: originIcon }).addTo(map);

    // Pin: Pune Station Transfer
    const transferIcon = L.divIcon({
      className: 'custom-pin-pune',
      html: `
        <div style="display:flex; align-items:center; gap:4px; transform:translate(-10px, -10px); white-space:nowrap;">
          <div style="background:#334155; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
          <span style="background:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; color:#1E293B; box-shadow:0 1px 4px rgba(0,0,0,0.2);">Pune</span>
        </div>
      `,
      iconSize: [16, 16],
    });
    L.marker([18.5284, 73.8744], { icon: transferIcon }).addTo(map);

    // Pin: Hinjawadi Destination
    const destIcon = L.divIcon({
      className: 'custom-pin-dest',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
          <span style="background:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; color:#DC2626; box-shadow:0 1px 4px rgba(0,0,0,0.2); margin-bottom:2px; white-space:nowrap;">Hinjawadi Phase 1, Pune</span>
          <div style="background:#DC2626; width:18px; height:18px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
    });
    L.marker([18.5913, 73.7389], { icon: destIcon }).addTo(map);

    map.fitBounds([
      [19.05, 72.8],
      [18.5, 73.9],
    ]);
  }, [route]);

  // Alternatives cards data
  const candidateCards = [
    {
      badgeText: 'Cheapest',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Bus + Auto',
      price: 640,
      duration: '3h 28m',
      transfers: '1 transfer',
      iconType: 'bus',
      routeObj: optimizationResult.alternative_routes?.[0] || route,
    },
    {
      badgeText: 'Fastest',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      title: 'Cab',
      price: 1450,
      duration: '2h 45m',
      transfers: '0 transfer',
      iconType: 'cab',
      routeObj: optimizationResult.alternative_routes?.[1] || route,
    },
    {
      badgeText: 'Most Reliable',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Train',
      price: 920,
      duration: '3h 05m',
      transfers: '1 transfer',
      iconType: 'train',
      routeObj: optimizationResult.alternative_routes?.[2] || route,
    },
    {
      badgeText: 'Flight (if available)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'Flight',
      price: 3240,
      duration: '1h 55m',
      transfers: '+ ₹320 (local)',
      iconType: 'flight',
      routeObj: optimizationResult.alternative_routes?.[3] || route,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Top Controls Bar: Sub-Tabs & Traffic Checkbox */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'best', label: 'Best Route', icon: Shield },
            { id: 'all', label: 'All Routes', icon: Layers },
            { id: 'signals', label: 'Live Signals', icon: Radio },
            { id: 'places', label: 'Nearby Places', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Show Traffic Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none px-2">
          <input
            type="checkbox"
            checked={showTraffic}
            onChange={(e) => setShowTraffic(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
          />
          <span>Show traffic</span>
        </label>
      </div>

      {/* 2. Interactive Map Card with Floating Mode Bar & Bottom Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden relative">
        {/* Floating Left Mode Selector Bar */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs rounded-xl p-1 border border-slate-200/90 shadow-md flex flex-col gap-1">
          {[
            { id: 'all', label: 'All', icon: Sparkles },
            { id: 'train', label: 'Train', icon: Train },
            { id: 'bus', label: 'Bus', icon: Bus },
            { id: 'cab', label: 'Cab', icon: Car },
            { id: 'flight', label: 'Flight', icon: Plane },
          ].map((m) => {
            const Icon = m.icon;
            const isSel = activeModeFilter === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModeFilter(m.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-72 z-0" />

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-5 divide-x divide-slate-100 bg-white border-t border-slate-100 p-3 text-center">
          <div>
            <div className="text-sm font-black text-slate-900">3h 12m</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total duration</div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">135 km</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total distance</div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">₹820</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Estimated cost</div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">1</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Transfer</div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">340 m</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Walking</div>
          </div>
        </div>
      </div>

      {/* 3. Best Journey for You Card with Real Image Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        {/* Header Bar */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
                  Best Journey for You
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Arrives {bufferMins} minutes before your deadline with low disruption risk.
              </p>
            </div>
          </div>

          {/* RouteWise Score */}
          <div className="text-right">
            <div className="font-heading text-3xl font-black text-emerald-600 tracking-tight">
              {scoreValue} <span className="text-sm font-semibold text-emerald-600/70">/ 100</span>
            </div>
            <button
              onClick={onOpenScoreModal}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-end gap-1 mt-0.5 group"
            >
              <span>RouteWise Score</span>
              <Info className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content Split: Stats + Station Image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Details */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-slate-400 font-bold text-sm">+</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <h4 className="font-heading text-xl font-bold text-slate-900 ml-1">
                  Train + Auto
                </h4>
              </div>

              <button
                onClick={onOpenSignalsModal}
                className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
              >
                View Details
              </button>
            </div>

            {/* 5-Metrics Grid */}
            <div className="grid grid-cols-5 gap-2 py-2 border-y border-slate-100 text-left">
              <div>
                <div className="text-base font-bold text-slate-900">₹820</div>
                <div className="text-[10px] text-slate-400 font-medium">Total cost</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">3h 12m</div>
                <div className="text-[10px] text-slate-400 font-medium">Duration</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">1</div>
                <div className="text-[10px] text-slate-400 font-medium">Transfer</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">340 m</div>
                <div className="text-[10px] text-slate-400 font-medium">Walking</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">8:48 AM</div>
                <div className="text-[10px] text-slate-400 font-medium">Arrival time</div>
              </div>
            </div>

            {/* 4 Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3] text-emerald-600" /> Low risk
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3] text-emerald-600" /> On-time arrival
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3] text-emerald-600" /> ₹380 under budget
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3] text-emerald-600" /> Comfortable walk
              </span>
            </div>
          </div>

          {/* Right Train Photo Preview with Map Trigger */}
          <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 h-36 group">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
              alt="Intercity Transit Rail Corridor"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
              <button
                onClick={() => {
                  if (mapContainerRef.current) {
                    mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-navy-950/80 hover:bg-navy-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-xs border border-white/20 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>View Route on Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Alternatives Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {candidateCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onSelectRoute(card.routeObj)}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs text-left transition-all relative flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${card.badgeColor}`}>
                {card.badgeText}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Mode Icons */}
            <div className="flex items-center gap-1.5 my-1 text-slate-700">
              {card.iconType === 'bus' && (
                <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bus className="w-3.5 h-3.5" />
                </div>
              )}
              {card.iconType === 'cab' && (
                <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Car className="w-3.5 h-3.5" />
                </div>
              )}
              {card.iconType === 'train' && (
                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Train className="w-3.5 h-3.5" />
                </div>
              )}
              {card.iconType === 'flight' && (
                <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Plane className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-bold text-slate-800">{card.title}</span>
            </div>

            {/* Price & Duration */}
            <div className="mt-2">
              <div className="font-heading font-extrabold text-base text-slate-900 tracking-tight">
                ₹{card.price}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span>{card.duration}</span>
                <span>•</span>
                <span>{card.transfers}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 5. Bottom 3-Column Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Why this decision? */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
          <h4 className="font-heading text-sm font-bold text-slate-900 tracking-tight">
            Why this decision?
          </h4>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-800">
                ₹{budgetSaved} below your budget
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-800">
                {bufferMins}-minute arrival buffer
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-800">
                Only {route.transfer_count ?? 1} transfer
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-800">
                {route.walking_distance_meters || 340}m walking (within limit)
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-800">
                Low current disruption exposure
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: RouteWise Score Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
          <h4 className="font-heading text-sm font-bold text-slate-900 tracking-tight">
            RouteWise Score Breakdown
          </h4>

          <div className="space-y-2 text-xs">
            {/* Time: 88 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Time</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '88%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">88</span>
            </div>

            {/* Cost: 94 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Cost</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '94%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">94</span>
            </div>

            {/* Reliability: 91 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Reliability</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '91%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">91</span>
            </div>

            {/* Walking: 90 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Walking</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '90%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">90</span>
            </div>

            {/* Transfers: 92 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Transfers</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '92%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">92</span>
            </div>

            {/* Arrival buffer: 95 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Arrival buffer</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '95%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">95</span>
            </div>

            {/* Disruption risk: 87 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-[11px] w-20">Disruption risk</span>
              <div className="flex-1 mx-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '87%' }} />
              </div>
              <span className="font-bold text-slate-800 text-[11px] w-5 text-right">87</span>
            </div>
          </div>
        </div>

        {/* Card 3: Live Intelligence */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-bold text-slate-900 tracking-tight">
              Live Intelligence
            </h4>
            <button
              onClick={onOpenSignalsModal}
              className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-700 font-medium">Route data (Maps)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 2 min ago</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-slate-900" />
                <span className="text-slate-700 font-medium">Traffic conditions (Search)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 5 min ago</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-slate-700 font-medium">News & incidents (News)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 8 min ago</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-700 font-medium">Nearby places (Maps)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 4 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
