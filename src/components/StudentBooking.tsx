import React, { useState } from 'react';
import { User, Area, BusStop, DepartureSlot, Booking } from '../types';
import { apiFetch, safeJson } from '../utils/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentBookingProps {
  currentUser: User;
  slots: DepartureSlot[];
  areas: Area[];
  stops: BusStop[];
  authToken?: string | null;
  onBookingConfirmed: (newBooking: Booking) => void;
  onViewPass: () => void;
}

export const StudentBooking: React.FC<StudentBookingProps> = ({
  currentUser,
  slots,
  areas,
  stops,
  authToken,
  onBookingConfirmed,
  onViewPass
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-3pm');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(currentUser.studentProfile?.areaId || 'area-adyar');
  const [selectedStopId, setSelectedStopId] = useState<string>(currentUser.studentProfile?.preferredStopId || 'stop-adyar-signal');
  const [exactDestination, setExactDestination] = useState<string>(currentUser.studentProfile?.exactDestination || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<Booking | null>(null);

  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const filteredStops = stops.filter(s => s.areaId === selectedAreaId);
  const selectedStop = stops.find(s => s.id === selectedStopId);

  const handleBookSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Simulated-User': currentUser.id
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await apiFetch('/api/student/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          date: selectedDate,
          slotId: selectedSlotId,
          stopId: selectedStopId
        })
      });

      const data = await safeJson<{ success?: boolean; error?: string; message?: string; booking?: Booking }>(res, { success: false, error: 'Network error processing booking' });
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || 'Failed to confirm booking');
      }

      if (!data.booking) {
        throw new Error('No booking returned by server');
      }

      setLastConfirmedBooking(data.booking);
      onBookingConfirmed(data.booking);
      
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during seat reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Student Profile Quick Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
              currentUser.studentProfile?.isHosteller
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-md font-mono">
                  {currentUser.studentProfile?.registrationNumber || '23CSE1045'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.studentProfile?.department} • Year {currentUser.studentProfile?.year} • Pass: {currentUser.studentProfile?.busPassNumber || `BP-${currentUser.studentProfile?.registrationNumber}`}
              </p>
            </div>
          </div>

          <div>
            {currentUser.studentProfile?.isHosteller ? (
              <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 px-3.5 py-1.5 rounded-xl font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Hostel Resident • Not Eligible for Bus Pass</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1.5 rounded-xl font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Day Scholar • Bus Eligible</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentUser.studentProfile?.isHosteller && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-start space-x-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300">Hostel Resident Account Notice</p>
            <p className="text-amber-400/90 leading-relaxed">
              College bus seat reservations are strictly reserved for day-scholar students commuting daily between off-campus residences and campus. Because you are registered in <span className="font-semibold text-white">Campus Hostel</span>, bus booking privileges are inactive. If your residency status has changed, please contact the college transport desk to update your master record.
            </p>
          </div>
        </div>
      )}

      {lastConfirmedBooking ? (
        // Successful Booking Splash Card
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Seat Confirmed Successfully!</h3>
            <p className="text-sm text-slate-400 mt-1">
              Your boarding token for <span className="text-white font-medium">{selectedSlot?.displayTime}</span> on <span className="text-white font-medium">{lastConfirmedBooking.date}</span> is registered.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 border border-slate-700">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Booking Reference:</span>
              <span className="font-mono text-white font-semibold">{lastConfirmedBooking.bookingNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Designated Stop:</span>
              <span className="text-white font-medium">{lastConfirmedBooking.stopName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Boarding Pass Code:</span>
              <span className="font-mono text-emerald-400 font-bold">{lastConfirmedBooking.boardingPassCode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Assigned Seat:</span>
              <span className="text-blue-400 font-semibold">Seat #{lastConfirmedBooking.seatNumber || 'Assigned'}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <button
              id="btn-view-boarding-pass"
              onClick={onViewPass}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <span>View Digital Boarding Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLastConfirmedBooking(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Book Another Date
            </button>
          </div>
        </div>
      ) : (
        // Main Booking Form
        <form onSubmit={handleBookSeat} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Bus className="w-5 h-5 text-blue-400" />
              <span>Reserve Daily Departure Seat</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your travel date, departure slot, and preferred drop-off point. Routes and corridors are dynamically optimized.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Booking Request Failed</p>
                <p className="mt-0.5 text-rose-400">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Date Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Travel Date</span>
              </label>
              <input
                id="input-travel-date"
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* 2. Slot Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Departure Slot</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedSlotId === s.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{s.displayTime}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Closes: {s.bookingCloseTime}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Destination Area (Section 4 & 5 Requirement: Area vs Stop distinction) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destination Area</span>
              </label>
              <select
                id="select-destination-area"
                value={selectedAreaId}
                onChange={(e) => {
                  setSelectedAreaId(e.target.value);
                  const firstStop = stops.find(s => s.areaId === e.target.value);
                  if (firstStop) setSelectedStopId(firstStop.id);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {areas.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.primaryCorridors.length} corridors)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Preferred Stop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Preferred Candidate Stop</span>
              </label>
              <select
                id="select-preferred-stop"
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {filteredStops.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} (~{st.estimatedDistFromCollegeKm} km, {st.estimatedTimeFromCollegeMin} min)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Adyar Multi-Corridor Intelligence Banner */}
          {selectedAreaId === 'area-adyar' && (
            <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4 flex items-start space-x-3 text-xs text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-indigo-300">
                  Dynamic Multi-Corridor Adyar Routing Active
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Adyar is modeled as an area with candidate corridors (via Guindy/Saidapet, Velachery Bypass, or OMR). The optimizer calculates real-time passenger loads across all Adyar stops to dispatch non-conflicting express buses.
                </p>
              </div>
            </div>
          )}

          {/* 5. Exact Drop Destination Note (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Specific Drop Landmark / Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Lattice Bridge signal or Kasturba 3rd Cross"
              value={exactDestination}
              onChange={(e) => setExactDestination(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Atomic seat booking protected by database lock</span>
            </div>

            <button
              id="btn-submit-booking"
              type="submit"
              disabled={isSubmitting || currentUser.studentProfile?.isHosteller}
              className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-2 ${
                currentUser.studentProfile?.isHosteller
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20 cursor-pointer disabled:opacity-50'
              }`}
            >
              {currentUser.studentProfile?.isHosteller ? (
                <span>Hostellers Ineligible for Bus</span>
              ) : isSubmitting ? (
                <span>Confirming Seat...</span>
              ) : (
                <>
                  <span>Confirm Bus Seat</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
