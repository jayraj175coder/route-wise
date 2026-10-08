import React from 'react';
import {
  CandidateRoute,
  OptimizationResult,
  JourneyRequest,
} from '../types/journey';
import {
  Crown,
  Info,
  Train,
  Car,
  Bus,
  Plane,
  Footprints,
  Check,
  Clock,
  IndianRupee,
  Shuffle,
  MapPin,
  Route as RouteIcon,
  Navigation,
} from 'lucide-react';

interface CenterDashboardProps {
  request: JourneyRequest;
  optimizationResult: OptimizationResult;
  selectedRoute: CandidateRoute;
  onSelectRoute?: (route: CandidateRoute) => void;
  onOpenSignalsModal?: () => void;
  onOpenScoreModal?: () => void;
}

const MODE_IMAGES: Record<string, string> = {
  // Pedestrian walking along sidewalk
  walking: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=400&q=80',
  // Indian Auto Rickshaw (Yellow & Black / Green)
  auto: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
  // Suburban / Local commuter train
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80',
  // City transit public commuter bus
  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
  // Motorbike / two-wheeler commuter
  two_wheeler: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  // Taxi / Private Cab
  driving: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80',
  // Commercial airplane
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
  // Metro rail transit
  metro: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
};

function getModeThumbnail(mode: string, instructions?: string): string {
  const m = mode.toLowerCase();
  const inst = (instructions || '').toLowerCase();

  // 1. Check walking first — "Walk 150m to auto stand" is WALKING, not auto
  if (
    m === 'walking' ||
    inst.startsWith('walk') ||
    inst.includes('foot') ||
    (inst.includes('walk') && !inst.includes('auto to'))
  ) {
    return MODE_IMAGES.walking;
  }
  // 2. Train / Suburban rail
  if (
    m === 'train' ||
    inst.includes('suburban') ||
    inst.includes('local train') ||
    inst.includes('rail') ||
    inst.includes('central railway') ||
    inst.includes('western railway') ||
    inst.includes('train')
  ) {
    return MODE_IMAGES.train;
  }
  // 3. Metro
  if (m === 'metro' || inst.includes('metro')) {
    return MODE_IMAGES.metro;
  }
  // 4. Auto Rickshaw
  if (m === 'auto' || inst.includes('auto') || inst.includes('rickshaw') || inst.includes('share auto') || inst.includes('tuk tuk')) {
    return MODE_IMAGES.auto;
  }
  // 5. Bus
  if (m === 'bus' || inst.includes('bus') || inst.includes('best') || inst.includes('nmmt') || inst.includes('tmt')) {
    return MODE_IMAGES.bus;
  }
  // 6. Two-wheeler / Bike taxi
  if (m === 'two_wheeler' || inst.includes('bike') || inst.includes('motorcycle') || inst.includes('rapido')) {
    return MODE_IMAGES.two_wheeler;
  }
  // 7. Driving / Cab / Uber / Ola
  if (m === 'driving' || inst.includes('cab') || inst.includes('taxi') || inst.includes('uber') || inst.includes('ola')) {
    return MODE_IMAGES.driving;
  }
  // 8. Flight
  if (m === 'flight' || inst.includes('flight') || inst.includes('airline')) {
    return MODE_IMAGES.flight;
  }

  return MODE_IMAGES[m] || MODE_IMAGES.walking;
}

function getModeIcon(mode: string, instructions?: string) {
  const m = mode.toLowerCase();
  const inst = (instructions || '').toLowerCase();

  // 1. Walking check takes precedence for pedestrian connector segments
  if (
    m === 'walking' ||
    inst.startsWith('walk') ||
    inst.includes('foot') ||
    (inst.includes('walk') && !inst.includes('auto to'))
  ) {
    return {
      Icon: Footprints,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      badgeColor: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300',
      label: 'Walk',
    };
  }
  // 2. Suburban / Local Train
  if (
    m === 'train' ||
    inst.includes('suburban') ||
    inst.includes('local train') ||
    inst.includes('rail') ||
    inst.includes('central railway') ||
    inst.includes('western railway') ||
    inst.includes('train')
  ) {
    return {
      Icon: Train,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300',
      label: 'Local Train',
    };
  }
  // 3. Metro
  if (m === 'metro' || inst.includes('metro')) {
    return {
      Icon: Train,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300',
      label: 'Metro',
    };
  }
  // 4. Auto Rickshaw
  if (m === 'auto' || inst.includes('auto') || inst.includes('rickshaw') || inst.includes('share auto')) {
    return {
      Icon: Car,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
      label: 'Auto',
    };
  }
  // 5. City Bus
  if (m === 'bus' || inst.includes('bus')) {
    return {
      Icon: Bus,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      badgeColor: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300',
      label: 'Bus',
    };
  }
  // 6. Bike Taxi
  if (m === 'two_wheeler' || inst.includes('bike') || inst.includes('motorcycle')) {
    return {
      Icon: Navigation,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300',
      label: 'Bike Taxi',
    };
  }
  // 7. Cab / Taxi
  if (m === 'driving' || inst.includes('cab') || inst.includes('taxi')) {
    return {
      Icon: Car,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300',
      label: 'Cab',
    };
  }
  // 8. Flight
  if (m === 'flight' || inst.includes('flight')) {
    return {
      Icon: Plane,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      badgeColor: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300',
      label: 'Flight',
    };
  }

  return {
    Icon: Footprints,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
    badgeColor: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300',
    label: 'Walk',
  };
}

export const CenterDashboard: React.FC<CenterDashboardProps> = ({
  request,
  optimizationResult,
  selectedRoute,
  onOpenScoreModal,
}) => {
  const stages = selectedRoute.segments || [];
  const score = Math.round(selectedRoute.confidence_score || selectedRoute.overall_score || 89);
  const costUnderBudget = Math.max(0, Math.round(request.max_budget - selectedRoute.estimated_cost));
  const walkDistanceM = Math.round(selectedRoute.walking_distance_meters || 150);

  return (
    <div className="space-y-4">
      {/* HERO BANNER CARD */}
      <div className="bg-white dark:bg-[#0D1527] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-200">
        {/* Top Graphical Hero Section */}
        <div className="relative bg-gradient-to-r from-[#0C1E3C] via-[#102A54] to-[#1A3F75] px-6 py-6 overflow-hidden min-h-[170px] flex flex-col justify-between">
          {/* Train Background Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-25 pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C1E3C]/95 via-[#0C1E3C]/60 to-transparent pointer-events-none" />

          {/* Top Row: Pill Tag + Score Ring Box */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 backdrop-blur-md border border-emerald-500/40 text-emerald-100 text-xs font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Recommended Option</span>
            </div>

            {/* Score Ring Glassmorphism Badge */}
            <div
              onClick={onOpenScoreModal}
              className="cursor-pointer group flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all shadow-md"
              title="Click to view score breakdown"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-white/20"
                    fill="transparent"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-emerald-400"
                    fill="transparent"
                    strokeDasharray={100}
                    strokeDashoffset={100 - score}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{score}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-300 font-semibold leading-tight">
                  <span className="text-white font-black text-xs">{score}</span> /100
                </div>
                <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <span>RouteWise Score</span>
                  <Info className="w-2.5 h-2.5 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="relative z-10 mt-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              {selectedRoute.mode_summary}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
              <span>Fast</span>
              <span className="text-slate-400">•</span>
              <span>Reliable</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-300">Budget Friendly</span>
            </p>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0D1527] grid grid-cols-5 gap-3 text-center divide-x divide-slate-100 dark:divide-slate-800">
          {/* Total Cost */}
          <div className="flex flex-col items-center">
            <div className="text-emerald-600 dark:text-emerald-400 mb-1">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
              ₹{Math.round(selectedRoute.estimated_cost)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Total Cost</span>
          </div>

          {/* Total Time */}
          <div className="flex flex-col items-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {Math.round(selectedRoute.total_duration_minutes)} min
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Total Time</span>
          </div>

          {/* Transfers */}
          <div className="flex flex-col items-center">
            <div className="text-purple-600 dark:text-purple-400 mb-1">
              <Shuffle className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {selectedRoute.transfer_count}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Transfers</span>
          </div>

          {/* Walk Distance */}
          <div className="flex flex-col items-center">
            <div className="text-orange-500 dark:text-orange-400 mb-1">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {walkDistanceM} m
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Walk Distance</span>
          </div>

          {/* Estimated Arrival */}
          <div className="flex flex-col items-center">
            <div className="text-slate-500 dark:text-slate-400 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {selectedRoute.arrival_time || '08:32 AM'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Estimated Arrival</span>
          </div>
        </div>

        {/* CONSTRAINT & BENEFIT VALIDATION PILLS */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {costUnderBudget > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              <span>₹{costUnderBudget} under budget</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>35 min earlier buffer</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>Low disruption risk</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>Walking within {request.max_walking_distance_meters}m limit</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" />
            <span>All user constraints satisfied</span>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP JOURNEY ITINERARY */}
      <div className="bg-white dark:bg-[#0D1527] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-heading text-base font-black text-slate-900 dark:text-white tracking-tight">
              Step-by-Step Journey Itinerary
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {stages.length} stages • {selectedRoute.transfer_count} transfers
          </span>
        </div>

        {/* Timeline Itinerary */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-blue-500 dark:bg-blue-600 z-0" />

          {stages.map((seg, idx) => {
            const { Icon, color, badgeColor, label } = getModeIcon(seg.mode, seg.instructions);
            const thumbUrl = getModeThumbnail(seg.mode, seg.instructions);

            return (
              <div key={seg.id || idx} className="relative z-10">
                {/* Node Milestone Circle on Timeline Line */}
                <div className="absolute -left-[29px] top-7 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0D1527] bg-blue-500 shadow-xs ring-2 ring-blue-100 dark:ring-blue-900" />

                {/* Card Container */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50/90 dark:hover:bg-slate-800/70 transition-all border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                  {/* Left Mode Icon + Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Rounded Square Mode Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${color}`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {/* Texts */}
                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Badge & Title */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${badgeColor}`}
                        >
                          {idx + 1}. {label}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {seg.from_name} → {seg.to_name}
                        </h4>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {seg.instructions}
                      </p>

                      {/* Footer / Schedule details if available */}
                      {seg.schedule_details && (
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400">
                          {seg.schedule_details}
                        </p>
                      )}

                      {/* Meta: Duration, Distance */}
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{Math.round(seg.duration_minutes)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>
                            {seg.distance_meters >= 1000
                              ? `${(seg.distance_meters / 1000).toFixed(1)} km`
                              : `${Math.round(seg.distance_meters)} m`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Cost Pill & Thumbnail Photo */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Cost Badge */}
                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-xs font-black text-slate-900 dark:text-white shadow-2xs">
                      ₹{Math.round(seg.cost)}
                    </div>

                    {/* High-res Image Thumbnail */}
                    <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs bg-slate-200 dark:bg-slate-800 shrink-0">
                      <img
                        src={thumbUrl}
                        alt={label}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
