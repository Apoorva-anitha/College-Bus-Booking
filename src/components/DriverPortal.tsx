import React, { useState } from 'react';
import { Trip, TripStatus, User } from '../types';
import { 
  Bus, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Radio, 
  Play, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  QrCode,
  ArrowRight
} from 'lucide-react';

interface DriverPortalProps {
  currentUser: User;
  trips: Trip[];
  onUpdateTripStatus: (tripId: string, status: TripStatus, delayMinutes?: number, delayReason?: string) => Promise<void>;
  onCheckInPassenger: (tripId: string, studentId: string) => Promise<void>;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  currentUser,
  trips,
  onUpdateTripStatus,
  onCheckInPassenger
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [delayReason, setDelayReason] = useState('Heavy traffic at Guindy Kathipara Flyover');
  const [filterQuery, setFilterQuery] = useState('');

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const handleStatusTransition = async (nextStatus: TripStatus) => {
    if (!activeTrip) return;
    await onUpdateTripStatus(activeTrip.id, nextStatus);
  };

  const handleReportDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    await onUpdateTripStatus(activeTrip.id, 'DELAYED', delayMinutes, delayReason);
    setIsDelayModalOpen(false);
  };

  const filteredPassengers = activeTrip?.passengers.filter(p => 
    p.studentName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.studentRegNo.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.stopName.toLowerCase().includes(filterQuery.toLowerCase())
  ) || [];

  const checkedInCount = activeTrip?.passengers.filter(p => p.isCheckedIn).length || 0;
  const totalPassengers = activeTrip?.passengers.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Driver Header Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                {currentUser.driverProfile?.employeeId || 'DRV-101'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Commercial License: <span className="font-mono text-slate-300">{currentUser.driverProfile?.licenseNumber || 'TN-09-2015-0045892'}</span> (Exp: {currentUser.driverProfile?.licenseExpiry})
            </p>
          </div>
        </div>

        {/* Assigned Trips Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Select Trip:</span>
          <select
            aria-label="Select assigned trip to manage"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.tripCode} - {t.slotName} ({t.routeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTrip ? (
        <div className="space-y-6">
          
          {/* Main Trip Card with Status Transitions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                    {activeTrip.tripCode}
                  </span>
                  <h3 className="text-base font-bold text-white">{activeTrip.routeName}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Corridor: <span className="text-slate-300 font-medium">{activeTrip.corridor}</span> • Departure: <span className="text-indigo-400 font-bold">{activeTrip.slotName}</span>
                </p>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                  activeTrip.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : activeTrip.status === 'IN_TRANSIT'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : activeTrip.status === 'DELAYED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{activeTrip.status}</span>
                </span>
              </div>
            </div>

            {/* Vehicle & Boarding Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="text-[10px] uppercase text-slate-400">Assigned Bus</p>
                <p className="text-sm font-bold text-white font-mono mt-0.5">{activeTrip.busNumber}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="text-[10px] uppercase text-slate-400">Boarding Check-In</p>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{checkedInCount} / {totalPassengers} Pax</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="text-[10px] uppercase text-slate-400">Total Route Stops</p>
                <p className="text-sm font-bold text-white font-mono mt-0.5">{activeTrip.stops.length} Stops</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <p className="text-[10px] uppercase text-slate-400">Departure Gate</p>
                <p className="text-sm font-bold text-indigo-400 font-mono mt-0.5">Bay #03 (South)</p>
              </div>
            </div>

            {/* Status Control Actions (Strict state transitions: SCHEDULED -> BOARDING -> DEPARTED -> IN_TRANSIT -> COMPLETED) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 mr-2">Trip Actions:</span>
              
              {activeTrip.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleStatusTransition('BOARDING')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Start Student Boarding</span>
                </button>
              )}

              {activeTrip.status === 'BOARDING' && (
                <button
                  onClick={() => handleStatusTransition('IN_TRANSIT')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Depart Campus (In Transit)</span>
                </button>
              )}

              {activeTrip.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => handleStatusTransition('COMPLETED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Trip Completed</span>
                </button>
              )}

              {activeTrip.status !== 'COMPLETED' && (
                <button
                  onClick={() => setIsDelayModalOpen(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Delay / Issue</span>
                </button>
              )}
            </div>

          </div>

          {/* Passenger Boarding Manifest & Verification Scanner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Student Boarding Manifest ({totalPassengers} Confirmed Passengers)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify digital tokens or click check-in as students board at the transport bay.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search student by name, reg # or stop..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Seat</th>
                    <th className="px-3 py-2.5">Student Details</th>
                    <th className="px-3 py-2.5">Designated Stop</th>
                    <th className="px-3 py-2.5">Boarding Status</th>
                    <th className="px-3 py-2.5 text-right">Check-in Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredPassengers.map((p) => (
                    <tr key={p.studentId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-3 font-mono font-bold text-blue-400">
                        #{p.seatNumber}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-white">{p.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.studentRegNo}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-200">{p.stopName}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isCheckedIn
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.isCheckedIn ? 'BOARDED' : 'WAITING'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => onCheckInPassenger(activeTrip.id, p.studentId)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            p.isCheckedIn
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {p.isCheckedIn ? 'Undo Check-in' : 'Verify & Board'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          No trips currently assigned for your driver profile today.
        </div>
      )}

      {/* Delay Report Modal */}
      {isDelayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Report Trip Delay / Route Issue</span>
            </h3>

            <form onSubmit={handleReportDelay} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Estimated Delay (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Cause / Explanation</label>
                <textarea
                  rows={3}
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDelayModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl"
                >
                  Broadcast Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
