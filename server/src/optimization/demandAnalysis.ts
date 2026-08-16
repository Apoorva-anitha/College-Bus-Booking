export interface StopDemandSummary {
  stopId: string;
  stopName: string;
  areaId: string;
  corridor: string;
  latitude: number;
  longitude: number;
  studentCount: number;
  studentIds: string[];
}

export interface CorridorDemandSummary {
  corridor: string;
  totalStudents: number;
  stops: StopDemandSummary[];
  recommendedBuses: number;
}

export interface DemandAnalysisResult {
  date: string;
  slotId: string;
  totalStudents: number;
  corridors: Record<string, CorridorDemandSummary>;
  stopDemandList: StopDemandSummary[];
  minimumBusesRequired: number;
  isDemandSufficient: boolean;
}

export function analyzeDemand(
  date: string,
  slotId: string,
  bookings: Array<{
    id: string;
    studentId: string;
    stopId: string;
    stopName: string;
    areaId: string;
    status: string;
  }>,
  stopsMaster: Array<{
    id: string;
    name: string;
    areaId: string;
    corridor: string;
    latitude: number;
    longitude: number;
  }>,
  minThreshold: number = 15
): DemandAnalysisResult {
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const stopMap = new Map<string, StopDemandSummary>();

  for (const s of stopsMaster) {
    stopMap.set(s.id, {
      stopId: s.id,
      stopName: s.name,
      areaId: s.areaId,
      corridor: s.corridor,
      latitude: s.latitude,
      longitude: s.longitude,
      studentCount: 0,
      studentIds: []
    });
  }

  for (const bk of confirmedBookings) {
    let stopSummary = stopMap.get(bk.stopId);
    if (!stopSummary) {
      // Fallback
      stopSummary = {
        stopId: bk.stopId,
        stopName: bk.stopName || bk.stopId,
        areaId: bk.areaId || 'area-adyar',
        corridor: 'Adyar - Guindy - Saidapet Corridor',
        latitude: 13.0012,
        longitude: 80.2565,
        studentCount: 0,
        studentIds: []
      };
      stopMap.set(bk.stopId, stopSummary);
    }
    stopSummary.studentCount += 1;
    stopSummary.studentIds.push(bk.id);
  }

  const activeStops = Array.from(stopMap.values()).filter(s => s.studentCount > 0);
  const corridors: Record<string, CorridorDemandSummary> = {};

  for (const stop of activeStops) {
    if (!corridors[stop.corridor]) {
      corridors[stop.corridor] = {
        corridor: stop.corridor,
        totalStudents: 0,
        stops: [],
        recommendedBuses: 0
      };
    }
    corridors[stop.corridor].totalStudents += stop.studentCount;
    corridors[stop.corridor].stops.push(stop);
  }

  let totalBuses = 0;
  for (const c of Object.values(corridors)) {
    c.recommendedBuses = Math.ceil(c.totalStudents / 50);
    totalBuses += c.recommendedBuses;
  }

  return {
    date,
    slotId,
    totalStudents: confirmedBookings.length,
    corridors,
    stopDemandList: activeStops,
    minimumBusesRequired: Math.max(1, totalBuses),
    isDemandSufficient: confirmedBookings.length >= minThreshold
  };
}
