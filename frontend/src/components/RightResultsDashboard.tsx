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
} from 'lucide-react';
import L from 'leaflet';

interface RightResultsDashboardProps {
  request: JourneyRequest;
  optimizationResult: OptimizationResult;
  selectedRoute: CandidateRoute;
  onSelectRoute: (route: CandidateRoute) => void;
  onOpenSignalsModal?: () => void;
  onOpenScoreModal?: () => void;
}

export const RightResultsDashboard: React.FC<RightResultsDashboardProps> = ({
  request,
  optimizationResult,
  selectedRoute,
  onSelectRoute,
  onOpenSignalsModal,
  onOpenScoreModal,
}) => {
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const route = selectedRoute || optimizationResult.recommended_route;

  // Format duration into "3h 12m" style
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Safe calculated values matching user's mockup & engine
  const scoreValue = Math.min(99, Math.max(70, Math.round(route.confidence_score * 100 || route.overall_score || 92)));
  const bufferMins = route.arrival_buffer_minutes || 42;
  const budgetSaved = Math.max(0, request.max_budget - route.estimated_cost);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.75, 73.35],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      const layer = L.tileLayer(
        mapMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
      ).addTo(map);

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;
    } else {
      // Switch tile layer if mapMode changed
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newLayer = L.tileLayer(
        mapMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18 }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }

    const map = mapInstanceRef.current;

    // Clear existing polylines and markers
    map.eachLayer((l) => {
      if (l instanceof L.Marker || l instanceof L.Polyline) {
        map.removeLayer(l);
      }
    });

    // 1. Train segment (Dadar to Pune)
    const trainCoords: L.LatLngExpression[] = [
      [19.0178, 72.8478], // Dadar
      [19.033, 73.0297],  // Navi Mumbai
      [18.7525, 73.3718], // Lonavala / Ghat
      [18.5284, 73.8744], // Pune Station
    ];

    L.polyline(trainCoords, {
      color: '#2563EB', // Blue
      weight: 4.5,
      opacity: 0.9,
    }).addTo(map);

    // 2. Auto / Cab segment (Pune to Hinjawadi)
    const autoCoords: L.LatLngExpression[] = [
      [18.5284, 73.8744], // Pune Station
      [18.5679, 73.8016], // Baner
      [18.5913, 73.7389], // Hinjawadi Phase 1
    ];

    L.polyline(autoCoords, {
      color: '#F97316', // Orange
      weight: 4.5,
      opacity: 0.9,
      dashArray: '3, 6',
    }).addTo(map);

    // Pin 1: Dadar Origin
    const originIcon = L.divIcon({
      className: 'custom-pin-dadar',
      html: `
        <div style="display:flex; align-items:center; gap:4px; transform:translate(-20px, -12px); white-space:nowrap;">
          <div style="background:#2563EB; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
          <span style="background:white; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700; color:#1E293B; box-shadow:0 1px 3px rgba(0,0,0,0.2);">Dadar, Mumbai</span>
        </div>
      `,
      iconSize: [20, 20],
    });
    L.marker([19.0178, 72.8478], { icon: originIcon }).addTo(map);

    // Pin 2: Pune Junction Transfer
    const transferIcon = L.divIcon({
      className: 'custom-pin-pune',
      html: `
        <div style="display:flex; align-items:center; gap:4px; transform:translate(-10px, -10px); white-space:nowrap;">
          <div style="background:#334155; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
          <span style="background:white; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700; color:#1E293B; box-shadow:0 1px 3px rgba(0,0,0,0.2);">Pune</span>
        </div>
      `,
      iconSize: [16, 16],
    });
    L.marker([18.5284, 73.8744], { icon: transferIcon }).addTo(map);

    // Pin 3: Hinjawadi Destination
    const destIcon = L.divIcon({
      className: 'custom-pin-dest',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
          <span style="background:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; color:#DC2626; box-shadow:0 1px 4px rgba(0,0,0,0.2); margin-bottom:2px; white-space:nowrap;">Hinjawadi Phase 1, Pune</span>
          <div style="background:#DC2626; width:16px; height:16px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
    });
    L.marker([18.5913, 73.7389], { icon: destIcon }).addTo(map);

    // Fit bounds
    map.fitBounds([
      [19.05, 72.8],
      [18.5, 73.9],
    ]);
  }, [mapMode, route]);

  // Build 4 alternative options matching screenshot
  const allRoutes = [
    route,
    ...(optimizationResult.alternative_routes || []),
  ];

  const candidateCards = [
    {
      type: 'best' as const,
      badgeText: 'Best for you',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Train + Auto',
      price: 820,
      duration: '3h 12m',
      transfers: '1 transfer',
      icons: ['train', 'auto'],
      routeObj: allRoutes[0] || route,
    },
    {
      type: 'cheapest' as const,
      badgeText: 'Cheapest',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Train + Auto',
      price: 760,
      duration: '3h 28m',
      transfers: '1 transfer',
      icons: ['train', 'auto'],
      routeObj: allRoutes[1] || route,
    },
    {
      type: 'fastest' as const,
      badgeText: 'Fastest',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      title: 'Cab',
      price: 1450,
      duration: '2h 45m',
      transfers: '0 transfer',
      icons: ['car'],
      routeObj: allRoutes[2] || route,
    },
    {
      type: 'reliable' as const,
      badgeText: 'Most Reliable',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      title: 'Rail',
      price: 920,
      duration: '3h 10m',
      transfers: '1 transfer',
      icons: ['train'],
      routeObj: allRoutes[3] || route,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Main Best Journey Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        {/* Header Bar */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-5 h-5 fill-blue-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                  Best Journey for You
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
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

        {/* Content Split: Left Summary Metrics + Right Map */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Mode & Stats */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Transport mode icons */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-slate-400 text-sm font-bold">+</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Car className="w-4 h-4" />
                </div>
              </div>

              {/* Title */}
              <h4 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                {route.mode_summary || 'Train + Auto'}
              </h4>
            </div>

            {/* 4 Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100">
              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  ₹{route.estimated_cost || 820}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Total cost</div>
              </div>

              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {formatDuration(route.total_duration_minutes || 192)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Duration</div>
              </div>

              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {route.transfer_count ?? 1}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Transfer</div>
              </div>

              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {route.walking_distance_meters || 340} m
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Walking</div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Arrives {route.arrival_time || '8:48 AM'}</span>
                <span className="text-emerald-700/80 font-normal">
                  {bufferMins} min before deadline
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center gap-1.5 text-xs font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Low risk</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Map */}
          <div className="md:col-span-6 relative rounded-xl overflow-hidden border border-slate-200 min-h-[175px]">
            {/* Map / Satellite Toggle */}
            <div className="absolute top-2.5 right-2.5 z-10 bg-white/90 backdrop-blur-xs rounded-lg p-0.5 border border-slate-200/80 shadow-xs flex items-center text-[10px] font-bold">
              <button
                onClick={() => setMapMode('map')}
                className={`px-2 py-0.5 rounded ${
                  mapMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-2 py-0.5 rounded ${
                  mapMode === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Leaflet container */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[175px] z-0" />
          </div>
        </div>

        {/* Horizontal Timeline Progression Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 relative overflow-x-auto pb-1">
            {/* Departure */}
            <div className="shrink-0 flex items-center gap-2 pr-3">
              <div className="text-left">
                <div className="font-bold text-slate-900">{route.departure_time || '6:05 AM'}</div>
                <div className="text-[11px] text-slate-500">Dadar</div>
                <div className="text-[10px] text-slate-400">Board train</div>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Train className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Segment 1 line */}
            <div className="flex-1 min-w-[120px] mx-2 flex flex-col items-center">
              <div className="text-[10px] text-slate-500 font-semibold mb-1 text-center truncate max-w-full">
                2h 40m
              </div>
              <div className="w-full h-1 bg-blue-600 rounded-full relative">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute right-0 top-1/2 -translate-y-1/2" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                Intercity Train (Dadar → Pune)
              </div>
            </div>

            {/* Transfer Node */}
            <div className="shrink-0 px-2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 text-[9px] mb-0.5">
                ⇄
              </div>
              <div className="text-[10px] text-slate-500 font-bold whitespace-nowrap">1 transfer</div>
              <div className="text-[9px] text-slate-400">12m</div>
            </div>

            {/* Segment 2 line */}
            <div className="flex-1 min-w-[100px] mx-2 flex flex-col items-center">
              <div className="text-[10px] text-slate-500 font-semibold mb-1 text-center truncate max-w-full">
                20m
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full relative">
                <div className="w-full h-full bg-amber-500 rounded-full" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                Auto / Cab (Pune → Hinjawadi)
              </div>
            </div>

            {/* Destination Node */}
            <div className="shrink-0 flex items-center gap-2 pl-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Car className="w-3.5 h-3.5" />
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500 text-white flex items-center justify-center mx-1">
                <MapPin className="w-2 h-2" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">{route.arrival_time || '8:48 AM'}</div>
                <div className="text-[11px] text-slate-500">Hinjawadi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Alternatives Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {candidateCards.map((card, idx) => {
          const isSelected = selectedRoute.id === card.routeObj.id || idx === 0;
          return (
            <button
              key={idx}
              onClick={() => onSelectRoute(card.routeObj)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${card.badgeColor}`}>
                  {card.badgeText}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Mode Icon */}
              <div className="flex items-center gap-1.5 my-1 text-slate-700">
                {card.icons.includes('train') && (
                  <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Train className="w-3.5 h-3.5" />
                  </div>
                )}
                {card.icons.length > 1 && <span className="text-slate-400 text-xs font-bold">+</span>}
                {card.icons.includes('auto') && (
                  <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                )}
                {card.icons.length === 1 && card.icons.includes('car') && (
                  <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Price & Specs */}
              <div className="mt-2">
                <div className="font-heading font-extrabold text-base text-slate-900 tracking-tight">
                  ₹{card.price}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>{card.duration}</span>
                  <span>•</span>
                  <span>{card.transfers}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Bottom 3-Column Section */}
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
            {/* Route data (Maps) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-700 font-medium">Route data (Maps)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 2 min ago</span>
            </div>

            {/* Traffic conditions (Search) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-slate-900" />
                <span className="text-slate-700 font-medium">Traffic conditions (Search)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 5 min ago</span>
            </div>

            {/* News & incidents (News) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-slate-700 font-medium">News & incidents (News)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">Updated 8 min ago</span>
            </div>

            {/* Nearby places (Maps) */}
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
