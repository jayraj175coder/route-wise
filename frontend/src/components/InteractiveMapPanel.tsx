import React, { useEffect, useRef, useState } from 'react';
import { CandidateRoute, JourneyRequest } from '../types/journey';
import L from 'leaflet';
import {
  Map as MapIcon,
  Globe,
  Radio,
  Crosshair,
  Plus,
  Minus,
  Clock,
  IndianRupee,
  Route as RouteIcon,
  Shuffle,
} from 'lucide-react';

interface InteractiveMapPanelProps {
  request: JourneyRequest;
  selectedRoute: CandidateRoute;
}

type MapMode = 'map' | 'satellite' | 'traffic';

const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // Navi Mumbai & Trans-Harbour
  rabale: [19.1363, 72.9984],
  'rabale naka': [19.1350, 72.9970],
  'rabale railway station': [19.1363, 72.9984],
  airoli: [19.1579, 72.9935],
  'digha gaon': [19.1760, 72.9880],
  ghansoli: [19.1245, 72.9987],
  koparkhairane: [19.1026, 73.0035],
  turbhe: [19.0833, 73.0197],
  sanpada: [19.0653, 73.0089],
  vashi: [19.0771, 72.9986],
  'vashi bus station': [19.0750, 72.9950],
  'apna bazar': [19.0740, 72.9960],
  nerul: [19.0330, 73.0169],
  belapur: [19.0195, 73.0397],
  panvel: [18.9894, 73.1175],
  'navi mumbai': [19.0330, 73.0297],

  // Central & Eastern Mumbai
  thane: [19.1972, 72.9722],
  'thane railway station': [19.1860, 72.9754],
  mulund: [19.1726, 72.9565],
  bhandup: [19.1439, 72.9378],
  kanjurmarg: [19.1315, 72.9312],
  vikhroli: [19.1111, 72.9282],
  ghatkopar: [19.0864, 72.9081],
  vidyavihar: [19.0798, 72.8973],
  kurla: [19.0657, 72.8793],
  sion: [19.0434, 72.8633],
  dadar: [19.0178, 72.8478],

  // Harbour Line & Chembur
  mankhurd: [19.0494, 72.9328],
  govandi: [19.0553, 72.9150],
  'govandi railway station': [19.0553, 72.9150],
  chembur: [19.0560, 72.9090],
  'shah & anchor': [19.0560, 72.9090],
  'shah and anchor': [19.0560, 72.9090],
  kutchhi: [19.0560, 72.9090],
  deonar: [19.0600, 72.9180],
  'deonar depot': [19.0610, 72.9190],
  'shatabdi hospital': [19.0580, 72.9140],
  tilaknagar: [19.0667, 72.8980],
  chunabhatti: [19.0514, 72.8767],

  // Western Suburbs & South Mumbai
  andheri: [19.1197, 72.8468],
  bandra: [19.0596, 72.8295],
  bkc: [19.0657, 72.8687],
  borivali: [19.2307, 72.8567],
  csmt: [18.9400, 72.8353],
  cst: [18.9400, 72.8353],
  churchgate: [18.9322, 72.8264],
  mumbai: [18.9220, 72.8347],

  // Pune Corridor
  pune: [18.5204, 73.8567],
  'pune junction': [18.5284, 73.8744],
  hinjawadi: [18.5913, 73.7389],
  wakad: [18.5987, 73.7660],
  baner: [18.5679, 73.8016],
  shivajinagar: [18.5314, 73.8446],
  lonavala: [18.7525, 73.3718],
  khandala: [18.7617, 73.3644],
};

function resolveCoords(name: string): [number, number] | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // 1. Check if coordinates were saved in sessionStorage for user's detected live location
  try {
    const cached = sessionStorage.getItem('routewise_user_coords');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (
        parsed.name &&
        (lower.includes(parsed.name.toLowerCase()) ||
          parsed.name.toLowerCase().includes(lower) ||
          lower.includes('current location') ||
          lower.includes('my location'))
      ) {
        return [parsed.latitude, parsed.longitude];
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }

  // 2. Check if string is direct "lat, lon"
  const commaMatch = lower.match(/^([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)$/);
  if (commaMatch) {
    const lat = parseFloat(commaMatch[1]);
    const lon = parseFloat(commaMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
  }

  // 3. Match against known locality coordinates
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return null;
}

export const InteractiveMapPanel: React.FC<InteractiveMapPanelProps> = ({
  request,
  selectedRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('satellite');
  const [activeBounds, setActiveBounds] = useState<L.LatLngBounds | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.16, 72.98],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Default satellite imagery
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer based on mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newLayer: L.TileLayer;
    if (mapMode === 'satellite') {
      newLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );
    } else if (mapMode === 'traffic') {
      newLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      );
    } else {
      newLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
    }

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // Render Route Polyline & Custom Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRoute) return;

    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const startCoord = resolveCoords(request.origin) || [19.1363, 72.9984];
    const destCoord = resolveCoords(request.destination) || [19.1972, 72.9722];

    const waypoints: [number, number][] = [startCoord];

    if (selectedRoute.segments && selectedRoute.segments.length > 0) {
      selectedRoute.segments.forEach((seg) => {
        const fromC = resolveCoords(seg.from_name);
        const toC = resolveCoords(seg.to_name);
        if (fromC) waypoints.push(fromC);
        if (toC) waypoints.push(toC);
      });
    }

    waypoints.push(destCoord);

    const uniquePoints: [number, number][] = [];
    waypoints.forEach((pt) => {
      if (
        !uniquePoints.some(
          (u) => Math.abs(u[0] - pt[0]) < 0.001 && Math.abs(u[1] - pt[1]) < 0.001
        )
      ) {
        uniquePoints.push(pt);
      }
    });

    if (
      uniquePoints.length === 2 &&
      Math.abs(uniquePoints[0][0] - 19.1363) < 0.05 &&
      Math.abs(uniquePoints[1][0] - 19.1972) < 0.05
    ) {
      uniquePoints.splice(1, 0, [19.1579, 72.9935]); // Airoli
    }

    // Polyline Glow
    L.polyline(uniquePoints, {
      color: '#00D2FF',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Polyline Main
    const routeLine = L.polyline(uniquePoints, {
      color: '#0099FF',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="
            background: #10B981;
            width: 22px;
            height: 22px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            <div style="
              width: 7px;
              height: 7px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
          <div style="
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(4px);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 6px;
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.15);
          ">
            ${request.origin.split(',')[0]}
            <span style="display:block;font-size:9px;color:#94A3B8;font-weight:500;">Origin Station</span>
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 22],
    });

    L.marker(uniquePoints[0], { icon: originIcon }).addTo(map);

    // Intermediate Transit Hub Markers
    for (let i = 1; i < uniquePoints.length - 1; i++) {
      const isRail =
        selectedRoute.mode_summary.toLowerCase().includes('train') ||
        selectedRoute.mode_summary.toLowerCase().includes('rail');

      const waypointIcon = L.divIcon({
        className: 'custom-transit-node',
        html: `
          <div style="
            background: #0284C7;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            color: white;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${
                isRail
                  ? '<rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 10h16"/><path d="M12 4v6"/><path d="m8 18-2 2"/><path d="m16 18 2 2"/>'
                  : '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'
              }
            </svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker(uniquePoints[i], { icon: waypointIcon }).addTo(map);
    }

    // Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="
            background: #EF4444;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(239,68,68,0.6);
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
          <div style="
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(4px);
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.2);
          ">
            ${request.destination.split(',')[0]}
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 24],
    });

    L.marker(uniquePoints[uniquePoints.length - 1], { icon: destIcon }).addTo(map);

    const bounds = routeLine.getBounds();
    setActiveBounds(bounds);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 13,
      animate: true,
    });
  }, [selectedRoute, request]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && activeBounds) {
      mapInstanceRef.current.fitBounds(activeBounds, {
        padding: [50, 50],
        animate: true,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const stagesCount = selectedRoute?.segments?.length || 3;

  return (
    <div className="bg-[#0B1528] dark:bg-[#070E1A] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col relative h-[680px] transition-colors duration-200">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Layer Mode Toggle Pills */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setMapMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'map'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'satellite'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setMapMode('traffic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'traffic'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Traffic</span>
          </button>
        </div>
      </div>

      {/* Right Map Action Controls (Recenter, Zoom) */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/90 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          title="Recenter Map"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Surface */}
      <div
        ref={mapContainerRef}
        className="w-full flex-1 h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating "Total Journey" Card */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
        <div className="bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 dark:border-slate-800">
          <div className="text-xs font-extrabold text-slate-900 dark:text-white mb-2">
            Total Journey
          </div>
          <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
            {/* Total Time */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                {Math.round(selectedRoute.total_duration_minutes)} min
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Time</span>
            </div>

            {/* Total Cost */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                ₹{Math.round(selectedRoute.estimated_cost)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Cost</span>
            </div>

            {/* Stages */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1">
                <RouteIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                {stagesCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Stages</span>
            </div>

            {/* Transfers */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
                <Shuffle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                {selectedRoute.transfer_count}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Transfers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
