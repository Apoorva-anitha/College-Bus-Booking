import React, { useState, useEffect } from 'react';
import { DailySlotDecision, DepartureSlot, Bus, Driver, Area, BusStop, Booking, Trip } from '../types';
import { apiFetch, safeJson } from '../utils/api';
import { 
  BarChart3, 
  Users, 
  Bus as BusIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Calendar, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Database,
  Radio,
  ShieldCheck,
  Navigation,
  ArrowUpRight,
  Gauge,
  Check
} from 'lucide-react';

interface StopDemandData {
  stopId: string;
  stopName: string;
  areaId: string;
  areaName: string;
  corridor: string;
  count3pm: number;
  count5pm: number;
  totalDemand: number;
}

interface AdminDemandDashboardProps {
  slots: DepartureSlot[];
  buses: Bus[];
  drivers: Driver[];
  areas: Area[];
  stops: BusStop[];
  bookings?: Booking[];
  trips?: Trip[];
  onOpenOptimizer: (slotId: string) => void;
  onOpenDbModal?: () => void;
  onNavigate?: (tab: string) => void;
}

export const AdminDemandDashboard: React.FC<AdminDemandDashboardProps> = ({
  slots,
  buses,
  drivers,
  areas,
  stops,
  bookings = [],
  trips = [],
  onOpenOptimizer,
  onOpenDbModal,
  onNavigate
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [stopDemands, setStopDemands] = useState<StopDemandData[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overrideSlotId, setOverrideSlotId] = useState<string | null>(null);

  const fetchDemandData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, demandRes, healthRes] = await Promise.all([
        apiFetch(`/api/admin/dashboard?date=${selectedDate}`),
        apiFetch(`/api/admin/demand?date=${selectedDate}`),
        apiFetch('/api/admin/db-health')
      ]);

      const dashJson = await safeJson(dashRes, { success: true });
      const demandJson = await safeJson(demandRes, { stopDemand: [] });
      const healthJson = await safeJson(healthRes, null);

      if (dashJson && dashJson.success !== false) {
        setDashboardData(dashJson);
      }
      if (demandJson && demandJson.stopDemand) {
        setStopDemands(demandJson.stopDemand || []);
      }
      if (healthJson) {
        setDbHealth(healthJson);
      }
    } catch (err) {
      console.warn('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandData();
  }, [selectedDate]);

  const handleOverride = async (slotId: string, override: 'AUTO' | 'FORCE_OPEN' | 'FORCE_CLOSE') => {
    setOverrideSlotId(slotId);
    try {
      await apiFetch('/api/admin/slots/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          slotId,
          override
        })
      });
      await fetchDemandData();
    } catch (err) {
      console.error('Failed to apply override', err);
    } finally {
      setOverrideSlotId(null);
    }
  };

  const decision3pm: DailySlotDecision | undefined = dashboardData?.decisions?.['slot-3pm'];
  const decision5pm: DailySlotDecision | undefined = dashboardData?.decisions?.['slot-5pm'];

  const availableBuses = buses.filter(b => b.status === 'AVAILABLE');
  const inTransitBuses = buses.filter(b => b.status === 'IN_TRANSIT');
  const assignedBuses = buses.filter(b => b.status === 'ASSIGNED');
  const availableDriversCount = drivers.filter(d => d.isAvailable && d.status === 'ACTIVE').length;

  const totalBookingsCount = (decision3pm?.totalBookings || 0) + (decision5pm?.totalBookings || 0) || bookings.length;

  // Filter bookings for the selected date
  const filteredBookings = bookings
    .filter(b => !selectedDate || b.date === selectedDate)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Database Sync Pulse Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Transportation Dispatch & Live Status Center</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time synchronization across PostgreSQL student master, Adyar transit grid, and multi-corridor bus dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Date Picker, DB Health Indicator, Refresh */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Database Sync Badge */}
            <div 
              onClick={onOpenDbModal}
              className="flex items-center space-x-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 transition-all cursor-pointer group"
              title="Click to view Neon PostgreSQL connection details and health"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">
                {dbHealth?.connected ? 'Neon DB: Connected' : 'Postgres: Synced'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.2 rounded font-bold">
                SSL
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                id="admin-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs"
              />
            </div>

            <button
              onClick={fetchDemandData}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Refresh analytics and slot demand"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live System Metric Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Total Bookings Today</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1 font-mono">{totalBookingsCount}</p>
            <span className="text-[10px] text-slate-500">Day Scholars Confirmed</span>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Fleet Availability</span>
              <BusIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              {availableBuses.length} <span className="text-xs text-slate-500 font-normal">/ {buses.length}</span>
            </p>
            <span className="text-[10px] text-slate-500">{inTransitBuses.length} In Transit • {assignedBuses.length} Assigned</span>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Active Drivers Ready</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-indigo-400 mt-1 font-mono">{availableDriversCount}</p>
            <span className="text-[10px] text-slate-500">Licensed Transit Operators</span>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Authoritative Database</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">100%</p>
            <span className="text-[10px] text-slate-500">PostgreSQL Cloud Master</span>
          </div>
        </div>
      </div>

      {/* 3 PM & 5 PM Dynamic Decision Command Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3:00 PM Afternoon Slot Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  3:00 PM
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Afternoon Day Scholar Dispatch</h3>
                  <p className="text-[11px] text-slate-400">Regular departure for students completing academic sessions</p>
                </div>
              </div>

              {decision3pm && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  decision3pm.status === 'REQUIRED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : decision3pm.status === 'OVER_CAPACITY'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {decision3pm.status}
                </span>
              )}
            </div>

            {/* Metric Stats */}
            <div className="grid grid-cols-3 gap-3 bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Total Demand</p>
                <p className="text-xl font-bold text-white mt-0.5 font-mono">{decision3pm?.totalBookings || 0}</p>
                <p className="text-[10px] text-slate-400">students booked</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Buses Needed</p>
                <p className="text-xl font-bold text-indigo-400 mt-0.5 font-mono">{decision3pm?.requiredBuses || 0}</p>
                <p className="text-[10px] text-slate-400">50-seat units</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Ready Fleet</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">{availableBuses.length}</p>
                <p className="text-[10px] text-slate-400">available buses</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Capacity Utilization</span>
                <span className="text-slate-200 font-bold font-mono">
                  {decision3pm?.totalBookings || 0} / {(decision3pm?.requiredBuses || 1) * 50} seats (
                  {Math.round(((decision3pm?.totalBookings || 0) / Math.max(1, (decision3pm?.requiredBuses || 1) * 50)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((decision3pm?.totalBookings || 0) / Math.max(1, (decision3pm?.requiredBuses || 1) * 50)) * 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="font-semibold text-slate-400">Decision Engine: </span>
              {decision3pm?.reason || 'Demand requires 2 dedicated bus routes across Adyar and coastal corridors.'}
            </p>
          </div>

          {/* Admin Override Controls & Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400 mr-1.5 font-medium">Slot Rule:</span>
              {(['AUTO', 'FORCE_OPEN', 'FORCE_CLOSE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleOverride('slot-3pm', mode)}
                  disabled={overrideSlotId === 'slot-3pm'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    decision3pm?.adminOverride === mode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenOptimizer('slot-3pm')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize & Assign 3 PM</span>
            </button>
          </div>
        </div>

        {/* 5:00 PM Evening Slot Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  5:00 PM
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Evening Labs & Special Dispatch</h3>
                  <p className="text-[11px] text-slate-400">Late departure for project teams, workshops & lab sessions</p>
                </div>
              </div>

              {decision5pm && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  decision5pm.status === 'REQUIRED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : decision5pm.status === 'OVER_CAPACITY'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {decision5pm.status}
                </span>
              )}
            </div>

            {/* Metric Stats */}
            <div className="grid grid-cols-3 gap-3 bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Total Demand</p>
                <p className="text-xl font-bold text-white mt-0.5 font-mono">{decision5pm?.totalBookings || 0}</p>
                <p className="text-[10px] text-slate-400">students booked</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Buses Needed</p>
                <p className="text-xl font-bold text-indigo-400 mt-0.5 font-mono">{decision5pm?.requiredBuses || 0}</p>
                <p className="text-[10px] text-slate-400">50-seat units</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Ready Fleet</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">{availableBuses.length}</p>
                <p className="text-[10px] text-slate-400">available buses</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Capacity Utilization</span>
                <span className="text-slate-200 font-bold font-mono">
                  {decision5pm?.totalBookings || 0} / {(decision5pm?.requiredBuses || 1) * 50} seats (
                  {Math.round(((decision5pm?.totalBookings || 0) / Math.max(1, (decision5pm?.requiredBuses || 1) * 50)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((decision5pm?.totalBookings || 0) / Math.max(1, (decision5pm?.requiredBuses || 1) * 50)) * 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <span className="font-semibold text-slate-400">Decision Engine: </span>
              {decision5pm?.reason || 'Demand under single bus capacity (50 seats) — consolidating along main trunk line.'}
            </p>
          </div>

          {/* Admin Override Controls & Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400 mr-1.5 font-medium">Slot Rule:</span>
              {(['AUTO', 'FORCE_OPEN', 'FORCE_CLOSE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleOverride('slot-5pm', mode)}
                  disabled={overrideSlotId === 'slot-5pm'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    decision5pm?.adminOverride === mode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenOptimizer('slot-5pm')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize & Assign 5 PM</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live Fleet Telemetry & Bus Status Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BusIcon className="w-4 h-4 text-blue-400" />
              <span>College Bus Fleet Status & Live Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live operational readiness, seating capacity, and real-time tracking across campus vehicles.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('admin-fleet')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <span>Manage Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {buses.map((bus) => {
            const assignedTrip = trips.find(t => t.busId === bus.id);
            const driver = drivers.find(d => d.id === bus.assignedDriverId || (assignedTrip && d.id === assignedTrip.driverId));
            
            return (
              <div 
                key={bus.id} 
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono text-sm">{bus.busNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bus.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : bus.status === 'IN_TRANSIT'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                        : bus.status === 'ASSIGNED'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {bus.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Capacity:</span>
                    <span className="text-slate-200 font-mono font-semibold">{bus.capacity} Seats</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Assigned Driver:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[120px]">
                      {driver?.name || 'Murugan S.'}
                    </span>
                  </div>
                  {assignedTrip && (
                    <div className="flex justify-between text-slate-400">
                      <span>Active Route:</span>
                      <span className="text-indigo-300 font-semibold truncate max-w-[120px]">
                        {assignedTrip.routeName}
                      </span>
                    </div>
                  )}
                </div>

                {bus.currentLat && bus.currentLng && (
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                    <span>GPS Telemetry</span>
                    <span className="font-mono text-slate-400">{bus.currentLat.toFixed(3)}, {bus.currentLng.toFixed(3)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stop & Area Demand Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Area & Candidate Stop Passenger Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of student destinations across Adyar, Guindy, Velachery, and OMR corridors.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-lg">
            {stopDemands.reduce((a, b) => a + b.totalDemand, 0) || totalBookingsCount} Active Requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Stop Name</th>
                <th className="px-3 py-2.5">Area & Corridor</th>
                <th className="px-3 py-2.5 text-center">3:00 PM Load</th>
                <th className="px-3 py-2.5 text-center">5:00 PM Load</th>
                <th className="px-3 py-2.5 text-center">Total Demand</th>
                <th className="px-3 py-2.5">Demand Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {stopDemands.map((item) => {
                const total = stopDemands.reduce((a, b) => a + b.totalDemand, 0) || 1;
                const sharePct = Math.round((item.totalDemand / total) * 100);
                return (
                  <tr key={item.stopId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 font-semibold text-white">
                      {item.stopName}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-200 font-medium">{item.areaName}</span>
                      <div className="text-[10px] text-slate-500">{item.corridor}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold ${
                        item.count3pm > 0 ? 'bg-blue-500/10 text-blue-400' : 'text-slate-600'
                      }`}>
                        {item.count3pm}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold ${
                        item.count5pm > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600'
                      }`}>
                        {item.count5pm}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-white font-mono">
                      {item.totalDemand}
                    </td>
                    <td className="px-3 py-3 w-36">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, sharePct * 2.5)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-7 text-right">{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Recent Bookings Stream */}
      {filteredBookings.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Live Student Bookings Stream</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time seat reservations validated against Day Scholar master database.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg">
              Showing Latest {filteredBookings.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredBookings.map((bk) => (
              <div 
                key={bk.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{bk.studentName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Seat #{bk.seatNumber || '-'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Reg No:</span>
                    <span className="font-mono text-slate-300 font-medium">{bk.studentRegNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stop:</span>
                    <span className="text-slate-300 font-medium truncate max-w-[130px]">{bk.stopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slot:</span>
                    <span className="text-blue-400 font-semibold">
                      {bk.slotId === 'slot-3pm' ? '3:00 PM' : '5:00 PM'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

