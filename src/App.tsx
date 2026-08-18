import React, { useState, useEffect } from 'react';
import { User, Area, BusStop, DepartureSlot, Bus, Driver, Booking, Trip } from './types';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { StudentBooking } from './components/StudentBooking';
import { StudentBoardingPass } from './components/StudentBoardingPass';
import { AdminDemandDashboard } from './components/AdminDemandDashboard';
import { AdminOptimizerView } from './components/AdminOptimizerView';
import { AdminFleetManagement } from './components/AdminFleetManagement';
import { InteractiveRouteMap } from './components/InteractiveRouteMap';
import { DriverPortal } from './components/DriverPortal';
import { AuditLogsViewer } from './components/AuditLogsViewer';
import { StudentMasterManager } from './components/StudentMasterManager';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { INITIAL_USERS, INITIAL_DEPARTURE_SLOTS, INITIAL_AREAS, INITIAL_STOPS, INITIAL_BUSES, INITIAL_DRIVERS } from './data/initialData';
import { safeStorage } from './utils/storage';
import { apiFetch, safeJson } from './utils/api';

export function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('student-book');
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  const [slots, setSlots] = useState<DepartureSlot[]>(INITIAL_DEPARTURE_SLOTS);
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [stops, setStops] = useState<BusStop[]>(INITIAL_STOPS);
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [optimizerSlotId, setOptimizerSlotId] = useState<string>('slot-3pm');
  const [demand3pm, setDemand3pm] = useState<number>(0);
  const [demand5pm, setDemand5pm] = useState<number>(0);

  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Synchronize state from backend
  const refreshAppData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const authHeaders: Record<string, string> = {
        'X-Simulated-User': currentUser.id
      };
      if (authToken) {
        authHeaders['Authorization'] = `Bearer ${authToken}`;
      }

      // Always fetch public student endpoints + user-scoped bookings & trips
      const fetchPromises: Promise<Response>[] = [
        apiFetch(`/api/student/slots?date=${today}`),
        apiFetch('/api/student/areas'),
        apiFetch('/api/student/stops'),
        apiFetch('/api/student/bookings', { headers: authHeaders }),
        apiFetch('/api/driver/trips', { headers: authHeaders })
      ];

      // If admin, also fetch administrative datasets
      const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'DISPATCHER';
      if (isAdmin) {
        fetchPromises.push(
          apiFetch('/api/admin/buses', { headers: authHeaders }),
          apiFetch('/api/admin/drivers', { headers: authHeaders }),
          apiFetch(`/api/admin/dashboard?date=${today}`, { headers: authHeaders })
        );
      }

      const results = await Promise.all(fetchPromises);
      const slotsJson = await safeJson(results[0], { slots: [] });
      const areasJson = await safeJson(results[1], { areas: [] });
      const stopsJson = await safeJson(results[2], { stops: [] });
      const bookingsJson = await safeJson(results[3], { bookings: [] });
      const tripsJson = await safeJson(results[4], { trips: [] });

      if (slotsJson?.slots && Array.isArray(slotsJson.slots)) {
        setSlots(slotsJson.slots);
        const slot3 = slotsJson.slots.find((s: any) => s.id === 'slot-3pm');
        const slot5 = slotsJson.slots.find((s: any) => s.id === 'slot-5pm');
        if (slot3 && typeof slot3.dailyDemand === 'number') setDemand3pm(slot3.dailyDemand);
        if (slot5 && typeof slot5.dailyDemand === 'number') setDemand5pm(slot5.dailyDemand);
      }
      if (areasJson?.areas && Array.isArray(areasJson.areas)) setAreas(areasJson.areas);
      if (stopsJson?.stops && Array.isArray(stopsJson.stops)) setStops(stopsJson.stops);
      if (bookingsJson?.bookings && Array.isArray(bookingsJson.bookings)) setBookings(bookingsJson.bookings);
      if (tripsJson?.trips && Array.isArray(tripsJson.trips)) setTrips(tripsJson.trips);

      if (isAdmin && results.length >= 8) {
        const busesJson = await safeJson(results[5], { buses: [] });
        const driversJson = await safeJson(results[6], { drivers: [] });
        const dashJson = await safeJson(results[7], { decisions: {} });

        if (busesJson?.buses && Array.isArray(busesJson.buses)) setBuses(busesJson.buses);
        if (driversJson?.drivers && Array.isArray(driversJson.drivers)) setDrivers(driversJson.drivers);
        if (dashJson?.decisions) {
          setDemand3pm(dashJson.decisions['slot-3pm']?.totalBookings || 0);
          setDemand5pm(dashJson.decisions['slot-5pm']?.totalBookings || 0);
        }
      }
    } catch (err) {
      console.error('Error synchronizing app state', err);
    }
  };

  // Setup Server-Sent Events (SSE) Live Feed + Fallback Polling
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshAppData();

    // 1. Establish SSE Connection for instant real-time pushes
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      
      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          if (parsed.type === 'BUS_TELEMETRY' && Array.isArray(parsed.data)) {
            // Live smooth telemetry update for buses
            setBuses(prevBuses => {
              const updated = [...prevBuses];
              for (const update of parsed.data) {
                const busIdx = updated.findIndex(b => b.id === update.busId);
                if (busIdx !== -1) {
                  updated[busIdx] = {
                    ...updated[busIdx],
                    currentLat: update.lat,
                    currentLng: update.lng,
                    status: update.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : updated[busIdx].status
                  };
                }
              }
              return updated;
            });
          } else if (parsed.type === 'DELAY_ALERT') {
            refreshAppData();
          } else {
            // Instant data refresh on mutations
            refreshAppData();
          }
        } catch (err) {
          console.error('Error parsing SSE event', err);
        }
      };

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (err) {
      console.warn('SSE not available in environment, using fallback polling');
    }

    // 2. Resilient Background Auto-Poll (Every 5 seconds)
    const pollInterval = setInterval(() => {
      refreshAppData();
    }, 5000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, [currentUser, isAuthenticated, authToken]);

  // Handle successful login
  const handleLoginSuccess = (user: User, token?: string) => {
    setCurrentUser(user);
    if (token) {
      setAuthToken(token);
      safeStorage.setItem('auth_token', token);
    }
    safeStorage.setItem('auth_user', JSON.stringify(user));
    setIsAuthenticated(true);

    if (user.role === 'STUDENT') {
      setActiveTab('student-book');
    } else if (user.role === 'ADMIN') {
      setActiveTab('admin-demand');
    } else if (user.role === 'DRIVER') {
      setActiveTab('driver-trip');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    safeStorage.removeItem('auth_token');
    safeStorage.removeItem('auth_user');
  };

  // Handle switching user & role
  const handleSwitchUser = (u: User) => {
    setCurrentUser(u);
    safeStorage.setItem('auth_user', JSON.stringify(u));
    if (u.role === 'STUDENT') {
      setActiveTab('student-book');
    } else if (u.role === 'ADMIN') {
      setActiveTab('admin-demand');
    } else if (u.role === 'DRIVER') {
      setActiveTab('driver-trip');
    }
  };

  // Student booking actions
  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);
    refreshAppData();
  };

  const handleCancelBooking = async (bookingId: string) => {
    const res = await apiFetch(`/api/student/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 
        'X-Simulated-User': currentUser.id,
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to cancel booking');
    }
    await refreshAppData();
  };

  // Admin Fleet actions
  const handleAddBus = async (busData: Partial<Bus>) => {
    await apiFetch('/api/admin/buses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(busData)
    });
    await refreshAppData();
  };

  const handleUpdateBusStatus = async (busId: string, status: any) => {
    await apiFetch(`/api/admin/buses/${busId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await refreshAppData();
  };

  const handleAddDriver = async (driverData: Partial<Driver>) => {
    await apiFetch('/api/admin/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData)
    });
    await refreshAppData();
  };

  // Driver actions
  const handleUpdateTripStatus = async (tripId: string, status: any, delayMinutes?: number, delayReason?: string) => {
    await apiFetch(`/api/driver/trips/${tripId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, delayMinutes, delayReason })
    });
    await refreshAppData();
  };

  const handleCheckInPassenger = async (tripId: string, studentId: string) => {
    await apiFetch(`/api/driver/trips/${tripId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    });
    await refreshAppData();
  };

  const handleOpenOptimizer = (slotId: string) => {
    setOptimizerSlotId(slotId);
    setActiveTab('admin-optimizer');
  };

  // Render Login Portal if not logged in
  if (!isAuthenticated) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        slots={slots}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        slotDemand3pm={demand3pm}
        slotDemand5pm={demand5pm}
        isLiveConnected={isLiveConnected}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
      />

      {/* Database Connection & Health Diagnostic Modal */}
      <DatabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        authToken={authToken || undefined}
        onReconnected={refreshAppData}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* STUDENT VIEWS */}
        {activeTab === 'student-book' && (
          <StudentBooking
            currentUser={currentUser}
            slots={slots}
            areas={areas}
            stops={stops}
            authToken={authToken}
            onBookingConfirmed={handleBookingConfirmed}
            onViewPass={() => setActiveTab('student-pass')}
          />
        )}

        {activeTab === 'student-pass' && (
          <StudentBoardingPass
            currentUser={currentUser}
            bookings={bookings}
            trips={trips}
            onCancelBooking={handleCancelBooking}
            onNewBookingClick={() => setActiveTab('student-book')}
          />
        )}

        {/* ADMIN VIEWS */}
        {activeTab === 'admin-demand' && (
          <AdminDemandDashboard
            slots={slots}
            buses={buses}
            drivers={drivers}
            areas={areas}
            stops={stops}
            bookings={bookings}
            trips={trips}
            onOpenOptimizer={handleOpenOptimizer}
            onOpenDbModal={() => setIsDbModalOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'admin-optimizer' && (
          <AdminOptimizerView
            initialSlotId={optimizerSlotId}
            slots={slots}
            onSolutionApproved={refreshAppData}
          />
        )}

        {activeTab === 'admin-fleet' && (
          <AdminFleetManagement
            buses={buses}
            drivers={drivers}
            onAddBus={handleAddBus}
            onUpdateBusStatus={handleUpdateBusStatus}
            onAddDriver={handleAddDriver}
          />
        )}

        {activeTab === 'admin-students' && (
          <StudentMasterManager
            onSwitchUser={handleSwitchUser}
          />
        )}

        {activeTab === 'admin-audit' && (
          <AuditLogsViewer />
        )}

        {/* DRIVER VIEW */}
        {activeTab === 'driver-trip' && (
          <DriverPortal
            currentUser={currentUser}
            trips={trips}
            onUpdateTripStatus={handleUpdateTripStatus}
            onCheckInPassenger={handleCheckInPassenger}
          />
        )}

        {/* GLOBAL MAP & GRAPH VIEW */}
        {activeTab === 'map-view' && (
          <InteractiveRouteMap
            stops={stops}
            bookings={bookings}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>St. Joseph's College of Engineering • Transport & Bus Booking Portal</span>
          <span className="font-medium text-slate-400">Demand-Driven Transit System • Connected to Central Fleet Engine</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
