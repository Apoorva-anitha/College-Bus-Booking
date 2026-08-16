export type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN' | 'DISPATCHER';

export type BusStatus = 'AVAILABLE' | 'ASSIGNED' | 'IN_TRIP' | 'IN_TRANSIT' | 'MAINTENANCE' | 'INACTIVE';

export type BusType = 'STANDARD_50' | 'MINI_32' | 'HEAVY_60';

export type SlotDemandStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'OVER_CAPACITY';

export type AdminSlotOverride = 'AUTO' | 'FORCE_OPEN' | 'FORCE_CLOSE';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'BOARDED' | 'CANCELLED' | 'EXPIRED' | 'NO_SHOW';

export type TripStatus = 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'IN_TRANSIT' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export interface StudentRecord {
  id: string;
  studentId: string;
  userId?: string;
  registrationNumber: string; // UNIQUE e.g. 23CSE1045
  name: string;
  email: string;
  department: string;
  year: number;
  section: string;
  isHosteller: boolean;
  hostelName?: string;
  areaId?: string;
  preferredStopId?: string;
  exactDestination?: string;
  phone?: string;
  active: boolean;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  studentProfile?: StudentProfile;
  driverProfile?: DriverProfile;
}

export interface StudentProfile {
  studentId: string;
  registrationNumber: string;
  department: string;
  year: number;
  section?: string;
  areaId: string;
  preferredStopId: string;
  exactDestination?: string;
  isHosteller: boolean;
  hostelName?: string;
  busPassNumber: string;
}

export interface DriverProfile {
  driverId: string;
  employeeId: string;
  licenseNumber: string;
  licenseExpiry: string; // YYYY-MM-DD
  phone: string;
  isAvailable: boolean;
  assignedBusId?: string;
  experienceYears: number;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  primaryCorridors: string[];
}

export interface BusStop {
  id: string;
  name: string;
  areaId: string;
  corridor: string;
  latitude: number;
  longitude: number;
  estimatedDistFromCollegeKm: number;
  estimatedTimeFromCollegeMin: number;
  isMajorJunction: boolean;
}

export interface RoadEdge {
  id: string;
  fromStopId: string;
  toStopId: string;
  distanceKm: number;
  travelTimeMin: number;
  trafficMultiplier: number;
  corridorName: string;
  isOneWay?: boolean;
}

export interface DepartureSlot {
  id: string;
  name: string;
  departureTime: string; // e.g. "15:00" or "17:00"
  displayTime: string; // e.g. "3:00 PM" or "5:00 PM"
  active: boolean;
  bookingOpenTime: string; // "06:00"
  bookingCloseTime: string; // "14:00"
  minDemandThreshold: number;
  description: string;
}

export interface DailySlotDecision {
  date: string;
  slotId: string;
  totalBookings: number;
  status: SlotDemandStatus;
  adminOverride: AdminSlotOverride;
  requiredBuses: number;
  availableBuses: number;
  shortageCount: number;
  reason: string;
  lastCalculatedAt: string;
}

export interface Bus {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  type: BusType;
  status: BusStatus;
  assignedRouteId?: string;
  assignedDriverId?: string;
  fuelLevelPct: number;
  lastMaintenanceDate: string;
  fitnessCertificateValidUntil: string;
  currentLat?: number;
  currentLng?: number;
}

export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  isAvailable: boolean;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
  assignedBusId?: string;
  rating: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  studentDepartment: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  areaId: string;
  stopId: string;
  stopName: string;
  routeId?: string;
  tripId?: string;
  busId?: string;
  busNumber?: string;
  seatNumber?: number;
  status: BookingStatus;
  bookedAt: string;
  boardingPassCode: string;
  checkedInAt?: string;
}

export interface RouteStopDetail {
  stopId: string;
  stopName: string;
  areaName: string;
  sequenceOrder: number;
  studentCount: number;
  estimatedArrivalMin: number;
  latitude: number;
  longitude: number;
}

export interface CandidateRoute {
  id: string;
  routeCode: string;
  routeName: string;
  corridor: string;
  slotId: string;
  stops: RouteStopDetail[];
  totalStudents: number;
  busCapacity: number;
  occupancyPercentage: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  assignedBusId?: string;
  assignedBusNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  studentIds: string[];
  isFeasible: boolean;
  violations: string[];
}

export interface OptimizationWeights {
  busMinimization: number; // e.g. 40
  travelTime: number; // e.g. 25
  distance: number; // e.g. 15
  studentDetour: number; // e.g. 15
  unusedCapacity: number; // e.g. 5
}

export interface CandidateSolution {
  id: string;
  name: string;
  type: 'MIN_BUSES' | 'MIN_TRAVEL_TIME' | 'BALANCED' | 'CUSTOM';
  description: string;
  score: number; // 0 to 100
  totalBuses: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  averageOccupancyPct: number;
  routes: CandidateRoute[];
  violations: string[];
}

export interface OptimizationRun {
  id: string;
  runNumber: number;
  date: string;
  slotId: string;
  slotName: string;
  totalDemand: number;
  totalStops: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  candidateSolutions: CandidateSolution[];
  selectedSolutionId: string;
  weights: OptimizationWeights;
  runAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  date: string;
  slotId: string;
  slotName: string;
  departureTime: string;
  routeId: string;
  routeName: string;
  corridor: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  status: TripStatus;
  stops: RouteStopDetail[];
  currentStopIndex: number;
  passengers: {
    studentId: string;
    studentRegNo: string;
    studentName: string;
    stopId: string;
    stopName: string;
    seatNumber: number;
    isCheckedIn: boolean;
    checkedInAt?: string;
  }[];
  startedAt?: string;
  completedAt?: string;
  delayMinutes?: number;
  delayReason?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  role?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details: string;
}

export interface CollegeRoute {
  id: string;
  routeCode: string;
  name: string;
  direction: 'OUTBOUND' | 'INBOUND';
  corridor: string;
  stopIds: string[];
  stops?: RouteStopDetail[];
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  maxAllowedDurationMin: number;
  active: boolean;
  assignedBusId?: string;
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalPlanVersion {
  version: number;
  planId: string;
  date: string;
  slotId: string;
  createdBy: string;
  createdAt: string;
  reason: string;
  status: 'OPTIMIZED' | 'MANUALLY_MODIFIED' | 'APPROVED' | 'LOCKED';
  routes: CandidateRoute[];
  changes?: string[];
}

export interface OperationalPlan {
  id: string;
  date: string;
  slotId: string;
  currentVersion: number;
  status: 'OPTIMIZED' | 'MANUALLY_MODIFIED' | 'APPROVED' | 'LOCKED';
  versions: OperationalPlanVersion[];
  activeRoutes: CandidateRoute[];
  lockedBy?: string;
  lockedAt?: string;
}

export interface FullOptimizationSettings extends OptimizationWeights {
  maxRouteDurationMin: number;
  maxStopsPerRoute: number;
  maxStudentCapacityPerBus: number;
}

