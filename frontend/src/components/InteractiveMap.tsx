import React, { useEffect, useRef } from 'react';
import { CandidateRoute } from '../types/journey';
import L from 'leaflet';

interface InteractiveMapProps {
  route: CandidateRoute;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ route }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Coordinate waypoints for Mumbai -> Pune corridor
  const waypoints = [
    { name: 'Dadar, Mumbai (Origin)', lat: 19.0178, lng: 72.8478, type: 'origin' },
    { name: 'Khandala Ghat Corridor', lat: 18.7525, lng: 73.3718, type: 'waypoint' },
    { name: 'Pune Junction Rail Hub', lat: 18.5284, lng: 73.8744, type: 'transfer' },
    { name: 'Hinjawadi IT Park (Destination)', lat: 18.5913, lng: 73.7389, type: 'destination' },
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.75, 73.35],
        zoom: 9,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous route layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Style colors per mode
    const isRail = route.mode_summary.toLowerCase().includes('train') || route.mode_summary.toLowerCase().includes('rail');
    const pathColor = isRail ? '#00F2FE' : '#FF8C42';

    // Segment 1: Origin to Ghat
    const polyline1 = L.polyline(
      [
        [19.0178, 72.8478],
        [18.7525, 73.3718],
      ],
      {
        color: pathColor,
        weight: 5,
        opacity: 0.85,
        dashArray: isRail ? undefined : '6, 8',
      }
    ).addTo(map);

    // Segment 2: Ghat to Pune Junction
    const polyline2 = L.polyline(
      [
        [18.7525, 73.3718],
        [18.5284, 73.8744],
      ],
      {
        color: isRail ? '#00F2FE' : '#10B981',
        weight: 5,
        opacity: 0.9,
      }
    ).addTo(map);

    // Segment 3: Pune Junction to Hinjawadi
    const polyline3 = L.polyline(
      [
        [18.5284, 73.8744],
        [18.5913, 73.7389],
      ],
      {
        color: '#FFA05C',
        weight: 4,
        opacity: 0.8,
        dashArray: '4, 6',
      }
    ).addTo(map);

    // Add waypoint markers
    waypoints.forEach((wp) => {
      const isEndpoint = wp.type === 'origin' || wp.type === 'destination';
      const markerColor =
        wp.type === 'origin'
          ? '#10B981'
          : wp.type === 'destination'
          ? '#FF8C42'
          : '#00F2FE';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${markerColor};
            width: ${isEndpoint ? '18px' : '14px'};
            height: ${isEndpoint ? '18px' : '14px'};
            border-radius: 50%;
            border: 3px solid #071A3D;
            box-shadow: 0 0 12px ${markerColor};
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([wp.lat, wp.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${wp.name}</b><br/>Journey Node: ${wp.type.toUpperCase()}`);
    });

    map.fitBounds([
      [19.05, 72.8],
      [18.5, 73.9],
    ]);
  }, [route]);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">Visual Journey Corridor</h3>
          <p className="text-xs text-slate-400">
            Multimodal progression: {route.mode_summary}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
            <span className="text-slate-300">Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
            <span className="text-slate-300">Rail / Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
            <span className="text-slate-300">Destination</span>
          </div>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-xl overflow-hidden border border-white/10 shadow-inner z-0"
      />
    </div>
  );
};
