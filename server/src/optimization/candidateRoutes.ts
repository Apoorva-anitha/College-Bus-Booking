import { CandidateRoute, CandidateSolution, OptimizationWeights, Bus, Driver, RouteStopDetail } from '../../../src/types';
import { DemandAnalysisResult, StopDemandSummary } from './demandAnalysis';
import { scoreCandidateSolution } from './routeScoring';
import { RoutingService, LocationCoordinate } from '../integrations/maps/routingService';

const COLLEGE_LOCATION: LocationCoordinate = {
  id: 'stop-college',
  name: 'College Campus Main Departure Bay',
  latitude: 12.8715,
  longitude: 80.2185
};

export async function generateCandidateSolutions(
  demand: DemandAnalysisResult,
  slotId: string,
  availableBuses: Bus[],
  availableDrivers: Driver[],
  weights: OptimizationWeights,
  routingService: RoutingService
): Promise<CandidateSolution[]> {
  const activeStops = demand.stopDemandList.filter(s => s.studentCount > 0);

  if (activeStops.length === 0) {
    return [];
  }

  // --- STRATEGY 1: MINIMUM FLEET / MAX CONSOLIDATION ---
  const solutionMinFleet = await buildClusterSolution({
    strategyType: 'MIN_BUSES',
    name: 'Strategy A: Fleet Maximization (Minimal Buses)',
    description: 'High-density clustering packing up to 50 students per bus to minimize operating fleet and fuel overhead.',
    maxCapacityPerBus: 50,
    maxStopsPerRoute: 7,
    demand,
    activeStops,
    slotId,
    availableBuses,
    availableDrivers,
    weights: { ...weights, busMinimization: 50, travelTime: 20 },
    routingService
  });

  // --- STRATEGY 2: MINIMUM STUDENT TRAVEL TIME / EXPRESS ---
  const solutionMinTime = await buildClusterSolution({
    strategyType: 'MIN_TRAVEL_TIME',
    name: 'Strategy B: Direct Express (Minimum Commute Time)',
    description: 'Direct point-to-point corridor routing with fewer stops per bus, reducing passenger in-vehicle travel time.',
    maxCapacityPerBus: 40,
    maxStopsPerRoute: 4,
    demand,
    activeStops,
    slotId,
    availableBuses,
    availableDrivers,
    weights: { ...weights, travelTime: 50, busMinimization: 20 },
    routingService
  });

  // --- STRATEGY 3: BALANCED MULTI-CORRIDOR OPTIMAL ---
  const solutionBalanced = await buildClusterSolution({
    strategyType: 'BALANCED',
    name: 'Strategy C: Balanced Multi-Corridor Optimal (Recommended)',
    description: 'Mathematically weighted equilibrium balancing passenger detour penalty, transit time, and bus utilization.',
    maxCapacityPerBus: 48,
    maxStopsPerRoute: 5,
    demand,
    activeStops,
    slotId,
    availableBuses,
    availableDrivers,
    weights,
    routingService
  });

  return [solutionBalanced, solutionMinFleet, solutionMinTime];
}

interface BuildClusterOptions {
  strategyType: 'MIN_BUSES' | 'MIN_TRAVEL_TIME' | 'BALANCED';
  name: string;
  description: string;
  maxCapacityPerBus: number;
  maxStopsPerRoute: number;
  demand: DemandAnalysisResult;
  activeStops: StopDemandSummary[];
  slotId: string;
  availableBuses: Bus[];
  availableDrivers: Driver[];
  weights: OptimizationWeights;
  routingService: RoutingService;
}

async function buildClusterSolution(opts: BuildClusterOptions): Promise<CandidateSolution> {
  const routes: CandidateRoute[] = [];
  const corridorGroups = opts.demand.corridors;

  let busIdx = 0;
  let routeCount = 0;

  for (const [corridorName, corridor] of Object.entries(corridorGroups)) {
    if (corridor.totalStudents === 0) continue;

    // Split stops within this corridor into capacity chunks
    const stopsQueue = [...corridor.stops].sort((a, b) => b.studentCount - a.studentCount);
    let currentRouteStops: StopDemandSummary[] = [];
    let currentRouteStudents = 0;
    let currentStudentIds: string[] = [];

    const flushRoute = async () => {
      if (currentRouteStops.length === 0) return;
      routeCount++;
      const assignedBus = opts.availableBuses[busIdx % Math.max(1, opts.availableBuses.length)];
      const assignedDriver = opts.availableDrivers[busIdx % Math.max(1, opts.availableDrivers.length)];
      busIdx++;

      const busCap = assignedBus ? assignedBus.capacity : 50;

      // Order waypoints from college
      const waypoints: LocationCoordinate[] = currentRouteStops.map(s => ({
        id: s.stopId,
        name: s.stopName,
        latitude: s.latitude,
        longitude: s.longitude
      }));

      const destination = waypoints[waypoints.length - 1] || COLLEGE_LOCATION;
      const orderRes = await opts.routingService.getOptimizedWaypointOrder(COLLEGE_LOCATION, waypoints, destination);

      let cumulativeOffset = 0;
      const orderedStopDetails: RouteStopDetail[] = orderRes.optimizedOrder.map((origIdx, seq) => {
        const stop = currentRouteStops[origIdx];
        cumulativeOffset += 6; // ~6 min average leg
        return {
          stopId: stop.stopId,
          stopName: stop.stopName,
          areaName: corridorName,
          sequenceOrder: seq + 1,
          studentCount: stop.studentCount,
          estimatedArrivalMin: cumulativeOffset,
          latitude: stop.latitude,
          longitude: stop.longitude
        };
      });

      const routeCode = `R-${opts.slotId === 'slot-3pm' ? '3PM' : '5PM'}-${routeCount.toString().padStart(2, '0')}`;
      const occupancy = Math.min(100, Math.round((currentRouteStudents / busCap) * 100));

      const violations: string[] = [];
      if (currentRouteStudents > busCap) {
        violations.push(`Capacity exceeded (${currentRouteStudents}/${busCap})`);
      }

      routes.push({
        id: `c-route-${opts.strategyType}-${routeCount}`,
        routeCode,
        routeName: `${corridorName.split(' - ')[0]} Shuttle ${routeCount}`,
        corridor: corridorName,
        slotId: opts.slotId,
        stops: orderedStopDetails,
        totalStudents: currentRouteStudents,
        busCapacity: busCap,
        occupancyPercentage: occupancy,
        totalDistanceKm: orderRes.totalDistanceKm || Math.round(orderedStopDetails.length * 4.2 * 10) / 10,
        totalDurationMin: orderRes.totalDurationMin || Math.round(orderedStopDetails.length * 7 + 10),
        assignedBusId: assignedBus?.id,
        assignedBusNumber: assignedBus?.registrationNumber || `TN-09-CB-${1000 + routeCount}`,
        assignedDriverId: assignedDriver?.id,
        assignedDriverName: assignedDriver?.name || 'Assigned Certified Driver',
        studentIds: currentStudentIds,
        isFeasible: violations.length === 0,
        violations
      });

      currentRouteStops = [];
      currentRouteStudents = 0;
      currentStudentIds = [];
    };

    for (const stop of stopsQueue) {
      if (
        currentRouteStudents + stop.studentCount > opts.maxCapacityPerBus ||
        currentRouteStops.length >= opts.maxStopsPerRoute
      ) {
        await flushRoute();
      }
      currentRouteStops.push(stop);
      currentRouteStudents += stop.studentCount;
      currentStudentIds.push(...stop.studentIds);
    }

    await flushRoute();
  }

  const scoring = scoreCandidateSolution(
    routes.map(r => ({
      totalStudents: r.totalStudents,
      busCapacity: r.busCapacity,
      totalDistanceKm: r.totalDistanceKm,
      totalDurationMin: r.totalDurationMin,
      stopCount: r.stops.length,
      occupancyPercentage: r.occupancyPercentage,
      isFeasible: r.isFeasible,
      violations: r.violations
    })),
    opts.weights,
    opts.demand.totalStudents,
    opts.availableBuses.length
  );

  return {
    id: `sol-${opts.strategyType.toLowerCase()}-${Date.now()}`,
    name: opts.name,
    type: opts.strategyType,
    description: opts.description,
    score: scoring.score,
    totalBuses: routes.length,
    totalDistanceKm: scoring.totalDistanceKm,
    totalDurationMin: scoring.totalDurationMin,
    averageOccupancyPct: scoring.averageOccupancy,
    routes,
    violations: scoring.violations
  };
}
