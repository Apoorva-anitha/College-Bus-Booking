import React, { useState } from 'react';
import { BusStop, RoadEdge, Area, Booking, CandidateRoute } from '../types';
import { INITIAL_STOPS, INITIAL_ROAD_EDGES, INITIAL_AREAS } from '../data/initialData';
import { 
  MapPin, 
  Bus, 
  Navigation, 
  Layers, 
  Info, 
  Eye, 
  Sparkles,
  Compass
} from 'lucide-react';

interface InteractiveRouteMapProps {
  stops?: BusStop[];
  edges?: RoadEdge[];
  bookings?: Booking[];
  activeRoutes?: CandidateRoute[];
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  stops = INITIAL_STOPS,
  edges = INITIAL_ROAD_EDGES,
  bookings = [],
  activeRoutes = []
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>('stop-adyar-signal');
  const [activeCorridorFilter, setActiveCorridorFilter] = useState<string>('ALL');

  // Compute bounding box / coordinate scale for Chennai SVG Canvas
  // Lat: ~12.86 to 13.04 (Height: 0.18)
  // Lng: ~80.07 to 80.28 (Width: 0.21)
  const minLat = 12.86;
  const maxLat = 13.04;
  const minLng = 80.07;
  const maxLng = 80.28;

  const svgWidth = 850;
  const svgHeight = 520;
  const padding = 50;

  const projectCoord = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (svgWidth - 2 * padding);
    // Invert Y because latitude goes north (up) but SVG coordinates go down
    const y = (svgHeight - padding) - ((lat - minLat) / (maxLat - minLat)) * (svgHeight - 2 * padding);
    return { x: Math.round(x), y: Math.round(y) };
  };

  const getStopDemand = (stopId: string) => {
    return bookings.filter(b => b.stopId === stopId && b.status === 'CONFIRMED').length;
  };

  const selectedStop = stops.find(s => s.id === selectedStopId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      
      {/* Map Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Adyar & South Chennai Transit Road Graph</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Topology map showing candidate corridors, student passenger heatmaps, and bus route assignments.
          </p>
        </div>

        {/* Corridor Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-medium">Filter Corridor:</span>
          <select
            aria-label="Filter transit corridor on map"
            value={activeCorridorFilter}
            onChange={(e) => setActiveCorridorFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Chennai Corridors</option>
            <option value="Guindy-Saidapet-Adyar">Guindy - Saidapet - Adyar</option>
            <option value="Velachery-Kasturba-Adyar">Velachery - Kasturba Nagar</option>
            <option value="OMR-Thiruvanmiyur-Adyar">OMR - Thiruvanmiyur - Besant Nagar</option>
          </select>
        </div>
      </div>

      {/* SVG Canvas Map Stage */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[500px] select-none"
        >
          {/* 1. Road Edges */}
          {edges.map((edge) => {
            const fromStop = stops.find(s => s.id === edge.fromStopId);
            const toStop = stops.find(s => s.id === edge.toStopId);
            if (!fromStop || !toStop) return null;

            const p1 = projectCoord(fromStop.latitude, fromStop.longitude);
            const p2 = projectCoord(toStop.latitude, toStop.longitude);

            const isHighlighted = activeCorridorFilter === 'ALL' || edge.corridorName.includes(activeCorridorFilter);

            return (
              <g key={edge.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isHighlighted ? '#334155' : '#1e293b'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isHighlighted ? '#38bdf8' : '#334155'}
                  strokeWidth="2"
                  strokeDasharray={edge.isOneWay ? '4,4' : 'none'}
                  opacity={isHighlighted ? 0.7 : 0.2}
                />
              </g>
            );
          })}

          {/* 2. Active Candidate Route Overlays */}
          {activeRoutes.map((route, rIdx) => {
            const points = route.stops
              .map(st => projectCoord(st.latitude, st.longitude))
              .map(p => `${p.x},${p.y}`)
              .join(' ');

            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
            const strokeColor = colors[rIdx % colors.length];

            return (
              <polyline
                key={`route-poly-${route.id}`}
                points={points}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
                strokeDasharray="6,3"
                className="animate-pulse"
              />
            );
          })}

          {/* 3. Stop Nodes */}
          {stops.map((stop) => {
            const pos = projectCoord(stop.latitude, stop.longitude);
            const demand = getStopDemand(stop.id);
            const isSelected = selectedStopId === stop.id;
            const isOrigin = stop.id === 'stop-college';

            return (
              <g
                key={stop.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedStopId(stop.id)}
              >
                {/* Demand Halo */}
                {demand > 0 && (
                  <circle
                    r={Math.min(22, 10 + demand / 3)}
                    fill="#3b82f6"
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={isOrigin ? 12 : isSelected ? 10 : stop.isMajorJunction ? 8 : 6}
                  fill={isOrigin ? '#ef4444' : isSelected ? '#38bdf8' : stop.isMajorJunction ? '#6366f1' : '#1e293b'}
                  stroke={isSelected ? '#ffffff' : '#475569'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />

                {/* Origin Icon or Demand Badge */}
                {isOrigin ? (
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    H
                  </text>
                ) : demand > 0 ? (
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {demand}
                  </text>
                ) : null}

                {/* Node Label */}
                <text
                  x="0"
                  y={pos.y > svgHeight - 80 ? -14 : 16}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : isOrigin ? '#f87171' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected || isOrigin ? 'bold' : 'normal'}
                  className="pointer-events-none drop-shadow"
                >
                  {stop.name.split(' (')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend in corner */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 text-[11px] space-y-1.5 text-slate-300 pointer-events-none">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-white font-semibold">Campus Origin Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span>Major Junction (Guindy, Adyar Signal, MRTS)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span>Active Student Demand Stop</span>
          </div>
        </div>

      </div>

      {/* Selected Node Details Card */}
      {selectedStop && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedStop.name}</h4>
              <p className="text-slate-400">
                Corridor: <span className="text-slate-300 font-medium">{selectedStop.corridor}</span> • Area: <span className="text-slate-300 font-medium">{selectedStop.areaId.replace('area-', '')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase">From Campus</p>
              <p className="font-bold text-white font-mono">{selectedStop.estimatedDistFromCollegeKm} km (~{selectedStop.estimatedTimeFromCollegeMin} min)</p>
            </div>
            <div className="text-right bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Current Demand</p>
              <p className="font-bold text-emerald-400 font-mono text-sm">{getStopDemand(selectedStop.id)} Students</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
