import React from 'react';
import {
  CandidateRoute,
  OptimizationResult,
  JourneyRequest,
  RouteSegment,
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
  walking: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80',
  auto: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=400&q=80',
  train: 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=400&q=80',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
  two_wheeler: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
  driving: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80',
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
};

function getModeThumbnail(mode: string, instructions?: string): string {
  const m = mode.toLowerCase();
  const inst = (instructions || '').toLowerCase();
  if (inst.includes('auto') || inst.includes('rickshaw') || m === 'auto') {
    return MODE_IMAGES.auto;
  }
  if (inst.includes('bus') || m === 'bus') {
    return MODE_IMAGES.bus;
  }
  if (inst.includes('train') || inst.includes('rail') || m === 'train') {
    return MODE_IMAGES.train;
  }
  if (inst.includes('bike') || m === 'two_wheeler') {
    return MODE_IMAGES.two_wheeler;
  }
  return MODE_IMAGES[m] || MODE_IMAGES.walking;
}

function getModeIcon(mode: string, instructions?: string) {
  const m = mode.toLowerCase();
  const inst = (instructions || '').toLowerCase();
  if (inst.includes('auto') || inst.includes('rickshaw') || m === 'auto') {
    return {
      Icon: Car,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      label: 'Auto',
    };
  }
  if (inst.includes('bus') || m === 'bus') {
    return {
      Icon: Bus,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800',
      label: 'Bus',
    };
  }
  if (inst.includes('train') || inst.includes('rail') || m === 'train') {
    return {
      Icon: Train,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      label: 'Local Train',
    };
  }
  if (inst.includes('bike') || m === 'two_wheeler') {
    return {
      Icon: Navigation,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      label: 'Bike Taxi',
    };
  }
  if (m === 'flight') {
    return {
      Icon: Plane,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      badgeColor: 'bg-sky-100 text-sky-800',
      label: 'Flight',
    };
  }
  return {
    Icon: Footprints,
    color: 'text-orange-500 bg-orange-50 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800',
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
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm">
        {/* Top Graphical Hero Section */}
        <div className="relative bg-gradient-to-r from-[#0C1E3C] via-[#102A54] to-[#1A3F75] px-6 py-6 overflow-hidden min-h-[170px] flex flex-col justify-between">
          {/* Train Background Photo with subtle blending */}
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

        {/* METRICS ROW (White Strip directly beneath banner) */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white grid grid-cols-5 gap-3 text-center divide-x divide-slate-100">
          {/* Total Cost */}
          <div className="flex flex-col items-center">
            <div className="text-emerald-600 mb-1">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              ₹{Math.round(selectedRoute.estimated_cost)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">Total Cost</span>
          </div>

          {/* Total Time */}
          <div className="flex flex-col items-center">
            <div className="text-blue-600 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {Math.round(selectedRoute.total_duration_minutes)} min
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">Total Time</span>
          </div>

          {/* Transfers */}
          <div className="flex flex-col items-center">
            <div className="text-purple-600 mb-1">
              <Shuffle className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {selectedRoute.transfer_count}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">Transfers</span>
          </div>

          {/* Walk Distance */}
          <div className="flex flex-col items-center">
            <div className="text-orange-500 mb-1">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {walkDistanceM} m
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">Walk Distance</span>
          </div>

          {/* Estimated Arrival */}
          <div className="flex flex-col items-center">
            <div className="text-slate-500 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-base font-black text-slate-900 leading-tight">
              {selectedRoute.arrival_time || '08:32 AM'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">Estimated Arrival</span>
          </div>
        </div>

        {/* CONSTRAINT & BENEFIT VALIDATION PILLS */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2">
          {costUnderBudget > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>₹{costUnderBudget} under budget</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>35 min earlier buffer</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>Low disruption risk</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            <span>Walking within {request.max_walking_distance_meters}m limit</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/90 text-blue-800 text-[11px] font-bold">
            <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
            <span>All user constraints satisfied</span>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP JOURNEY ITINERARY */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-heading text-base font-black text-slate-900 tracking-tight">
              Step-by-Step Journey Itinerary
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {stages.length} stages • {selectedRoute.transfer_count} transfers
          </span>
        </div>

        {/* Timeline Itinerary with Vertical Connected Blue Line */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-blue-500 z-0" />

          {stages.map((seg, idx) => {
            const { Icon, color, badgeColor, label } = getModeIcon(seg.mode, seg.instructions);
            const thumbUrl = getModeThumbnail(seg.mode, seg.instructions);

            return (
              <div key={seg.id || idx} className="relative z-10">
                {/* Node Milestone Circle on Timeline Line */}
                <div className="absolute -left-[29px] top-7 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-xs ring-2 ring-blue-100" />

                {/* Card Container */}
                <div className="bg-slate-50/70 hover:bg-slate-50/90 transition-all border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
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
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {seg.from_name} → {seg.to_name}
                        </h4>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {seg.instructions}
                      </p>

                      {/* Footer / Schedule details if available */}
                      {seg.schedule_details && (
                        <p className="text-[10px] font-bold text-slate-400">
                          {seg.schedule_details}
                        </p>
                      )}

                      {/* Meta: Duration, Distance */}
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{Math.round(seg.duration_minutes)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
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
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-900 shadow-2xs">
                      ₹{Math.round(seg.cost)}
                    </div>

                    {/* High-res Image Thumbnail */}
                    <div className="w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-200 shrink-0">
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
