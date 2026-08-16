import React, { useState } from 'react';
import { Booking, User, Trip } from '../types';
import { 
  QrCode, 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  UserCheck,
  Radio,
  ArrowRight
} from 'lucide-react';

interface StudentBoardingPassProps {
  currentUser: User;
  bookings: Booking[];
  trips: Trip[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  onNewBookingClick: () => void;
}

export const StudentBoardingPass: React.FC<StudentBoardingPassProps> = ({
  currentUser,
  bookings,
  trips,
  onCancelBooking,
  onNewBookingClick
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null);

  // Find most recent active confirmed booking
  const sortedBookings = [...bookings].sort((a, b) => {
    const timeA = a.bookedAt ? new Date(a.bookedAt).getTime() : new Date(a.date).getTime();
    const timeB = b.bookedAt ? new Date(b.bookedAt).getTime() : new Date(b.date).getTime();
    return timeB - timeA;
  });
  const activeBooking = sortedBookings.find(b => b.status === 'CONFIRMED');
  const associatedTrip = activeBooking?.tripId ? trips.find(t => t.id === activeBooking.tripId) : undefined;

  const handleCancel = async (id: string) => {
    setCancelError(null);
    setCancellingId(id);
    try {
      await onCancelBooking(id);
      setConfirmModalId(null);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Cancellation Confirmation Modal */}
      {confirmModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Seat Reservation?</h3>
                <p className="text-xs text-slate-400">This will release your allocated bus seat.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              Are you sure you want to cancel your bus seat? If you change your mind later, re-booking will depend on remaining bus capacity.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmModalId(null)}
                disabled={!!cancellingId}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Keep Reservation
              </button>
              <button
                onClick={() => handleCancel(confirmModalId)}
                disabled={!!cancellingId}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
              >
                {cancellingId === confirmModalId ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Seat</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Active Digital Boarding Pass Card */}
      {activeBooking ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pass Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">Digital Boarding Pass</span>
                <h3 className="text-xl font-bold text-white tracking-tight">College Transit Network</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                {activeBooking.status}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {activeBooking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Pass Body (Grid with Details & QR Code) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-800">
            
            {/* Left 2 Cols: Travel Metadata */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Student Name</p>
                  <p className="text-sm font-bold text-white mt-0.5">{activeBooking.studentName}</p>
                  <p className="text-xs text-slate-400 font-mono">{activeBooking.studentRegNo} ({activeBooking.studentDepartment})</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Departure Slot</p>
                  <p className="text-sm font-bold text-indigo-400 mt-0.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeBooking.slotId === 'slot-3pm' ? '3:00 PM Afternoon' : '5:00 PM Evening'}</span>
                  </p>
                  <p className="text-xs text-slate-400">{activeBooking.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Drop-off Bus Stop</p>
                  <p className="text-sm font-bold text-white mt-0.5 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeBooking.stopName}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">Area: Adyar / South Corridor</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Assigned Fleet & Seat</p>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">
                    {activeBooking.busNumber || 'Fleet TN-09-CB-1001'}
                  </p>
                  <p className="text-xs text-slate-300">
                    Seat: <span className="font-bold text-white">#{activeBooking.seatNumber || '01'}</span>
                  </p>
                </div>
              </div>

              {/* Trip Live Progress (if scheduled/in transit) */}
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-slate-300">Trip Status:</span>
                  <span className="font-semibold text-white">
                    {associatedTrip?.status || 'SCHEDULED - BOARDING AT GATE 2'}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  Driver: {associatedTrip?.driverName || 'Murugan S.'}
                </span>
              </div>
            </div>

            {/* Right Col: QR Simulation & Verification Token */}
            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-28 h-28 bg-white rounded-xl p-2 shadow-md flex items-center justify-center">
                {/* Visual SVG QR representation */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="25" height="25" fill="#000" />
                  <rect x="9" y="9" width="17" height="17" fill="#fff" />
                  <rect x="13" y="13" width="9" height="9" fill="#000" />

                  <rect x="70" y="5" width="25" height="25" fill="#000" />
                  <rect x="74" y="9" width="17" height="17" fill="#fff" />
                  <rect x="78" y="13" width="9" height="9" fill="#000" />

                  <rect x="5" y="70" width="25" height="25" fill="#000" />
                  <rect x="9" y="74" width="17" height="17" fill="#fff" />
                  <rect x="13" y="78" width="9" height="9" fill="#000" />

                  <rect x="35" y="10" width="10" height="10" fill="#000" />
                  <rect x="50" y="20" width="15" height="10" fill="#000" />
                  <rect x="35" y="40" width="30" height="20" fill="#000" />
                  <rect x="40" y="70" width="20" height="15" fill="#000" />
                  <rect x="70" y="45" width="20" height="10" fill="#000" />
                  <rect x="75" y="70" width="15" height="20" fill="#000" />
                </svg>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Verification Code</p>
                <p className="text-xs font-mono font-bold text-emerald-400">{activeBooking.boardingPassCode}</p>
              </div>
            </div>

          </div>

          {/* Pass Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 text-xs">
            <p className="text-slate-400">
              Present this digital token to the bus driver before boarding at the campus transport bay.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setConfirmModalId(activeBooking.id)}
                disabled={cancellingId === activeBooking.id}
                className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {cancellingId === activeBooking.id ? 'Cancelling...' : 'Cancel Reservation'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        // No Active Booking Placeholder
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Seat Booking</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You do not have a confirmed bus pass for today. Reserve a seat in the 3:00 PM or 5:00 PM departure slots.
            </p>
          </div>
          <button
            onClick={onNewBookingClick}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center space-x-1.5"
          >
            <span>Book a Bus Seat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Booking History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>My Booking History (Verified Ownership)</span>
          </h3>
          <span className="text-xs text-slate-400">{bookings.length} total records</span>
        </div>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No previous bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Booking No</th>
                  <th className="px-3 py-2">Date & Slot</th>
                  <th className="px-3 py-2">Drop Stop</th>
                  <th className="px-3 py-2">Seat / Pass</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 font-mono font-medium text-white">{b.bookingNumber}</td>
                    <td className="px-3 py-3">
                      <div>{b.date}</div>
                      <div className="text-[11px] text-slate-400">{b.slotId === 'slot-3pm' ? '3:00 PM' : '5:00 PM'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-white">{b.stopName}</div>
                      <div className="text-[10px] text-slate-400">Area: {b.areaId.replace('area-', '')}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-emerald-400 font-mono font-semibold">{b.boardingPassCode}</div>
                      <div className="text-[10px] text-slate-400">Seat #{b.seatNumber || '-'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => setConfirmModalId(b.id)}
                          disabled={cancellingId === b.id}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
