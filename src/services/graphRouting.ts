import { BusStop, RoadEdge, Booking, CandidateRoute, CandidateSolution, OptimizationWeights, Bus, Driver, RouteStopDetail } from '../types';
import { INITIAL_STOPS, INITIAL_ROAD_EDGES } from '../data/initialData';

export interface RouteCandidateDraft {
  corridorName: string;
  stopSequence: string[]; // stopIds in order
  description: string;
}

// Canonical Chennai Transportation Corridors for Adyar and South Zones
export const CANDIDATE_CORRIDORS: RouteCandidateDraft[] = [
  {
    corridorName: 'Guindy-Saidapet-Adyar Expressway',
    stopSequence: ['stop-college', 'stop-guindy-kathipara', 'stop-saidapet-metro', 'stop-adyar-signal', 'stop-lb-road'],
    description: 'Direct GST to Anna Salai into Central Adyar and LB Road'
  },
  {
    corridorName: 'Velachery-Kasturba-Adyar Corridor',
    stopSequence: ['stop-college', 'stop-velachery-bypass', 'stop-velachery-mrts', 'stop-kasturba-nagar', 'stop-indira-nagar', 'stop-adyar-signal'],
    description: 'Medavakkam Bypass connecting Velachery, Kasturba Nagar and Indira Nagar'
  },
  {
    corridorName: 'OMR-Thiruvanmiyur Coastal Corridor',
    stopSequence: ['stop-college', 'stop-perungudi', 'stop-srp-tools', 'stop-tidel-park', 'stop-thiruvanmiyur-depot', 'stop-besant-nagar'],
    description: 'Radial Road into OMR IT Corridor, Thiruvanmiyur Beach & Besant Nagar Terminus'
  },
  {
    corridorName: 'Adyar-Thiruvanmiyur Extended Loop',
    stopSequence: ['stop-college', 'stop-guindy-kathipara', 'stop-saidapet-metro', 'stop-adyar-signal', 'stop-thiruvanmiyur-depot', 'stop-besant-nagar'],
    description: 'Combined Central Adyar and Coastal Thiruvanmiyur route'
  },
  {
    corridorName: 'Velachery-Adyar-LB Combined Express',
    stopSequence: ['stop-college', 'stop-velachery-bypass', 'stop-kasturba-nagar', 'stop-adyar-signal', 'stop-lb-road', 'stop-besant-nagar'],
    description: 'Southwest cross-connector covering Velachery, Kasturba and LB Road'
  }
];

export class GraphRoutingEngine {
  private stopsMap: Map<string, BusStop>;
  private edges: RoadEdge[];

  constructor(stops: BusStop[] = INITIAL_STOPS, edges: RoadEdge[] = INITIAL_ROAD_EDGES) {
    this.stopsMap = new Map(stops.map(s => [s.id, s]));
    this.edges = edges;
  }

  public getStop(stopId: string): BusStop | undefined {
    return this.stopsMap.get(stopId);
  }

  /**
   * Calculate exact distance and travel time along a sequence of stops using road edges and topology
   */
  public calculatePathMetrics(stopIds: string[]): { distanceKm: number; durationMin: number } {
    let totalDist = 0;
    let totalTime = 0;

    for (let i = 0; i < stopIds.length - 1; i++) {
      const fromId = stopIds[i];
      const toId = stopIds[i + 1];

      // Find direct edge or fallback to geographic coordinate distance
      const directEdge = this.edges.find(e => (e.fromStopId === fromId && e.toStopId === toId) || (e.fromStopId === toId && e.toStopId === fromId));
      if (directEdge) {
        totalDist += directEdge.distanceKm;
        totalTime += Math.round(directEdge.travelTimeMin * directEdge.trafficMultiplier);
      } else {
        const fromStop = this.stopsMap.get(fromId);
        const toStop = this.stopsMap.get(toId);
        if (fromStop && toStop) {
          const deltaDist = Math.abs(toStop.estimatedDistFromCollegeKm - fromStop.estimatedDistFromCollegeKm);
          const deltaTime = Math.abs(toStop.estimatedTimeFromCollegeMin - fromStop.estimatedTimeFromCollegeMin);
          totalDist += Math.max(deltaDist, 1.5);
          totalTime += Math.max(deltaTime, 4);
        }
      }
    }

    return {
      distanceKm: Math.round(totalDist * 10) / 10,
      durationMin: Math.max(totalTime, 20)
    };
  }

  /**
   * Main Route Optimization Engine
   * Takes bookings, available fleet, drivers, and weights to generate Candidate Solutions
   */
  public optimizeRoutes(
    bookings: Booking[],
    slotId: string,
    availableBuses: Bus[],
    availableDrivers: Driver[],
    weights: OptimizationWeights = { busMinimization: 40, travelTime: 25, distance: 15, studentDetour: 15, unusedCapacity: 5 }
  ): CandidateSolution[] {
    const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' && b.slotId === slotId);

    // 1. Group bookings by stop
    const stopDemandMap = new Map<string, Booking[]>();
    for (const b of activeBookings) {
      const list = stopDemandMap.get(b.stopId) || [];
      list.push(b);
      stopDemandMap.set(b.stopId, list);
    }

    const availableStandardBuses = availableBuses.filter(b => b.status === 'AVAILABLE');
    const availableActiveDrivers = availableDrivers.filter(d => d.isAvailable && d.status === 'ACTIVE');

    // Generate Solution A: MIN_BUSES (Packs demand into fewer high-occupancy buses)
    const solutionA = this.generateClusteredSolution(
      'MIN_BUSES',
      'Solution A: Minimum Buses Strategy',
      'Maximizes bus occupancy by clustering compatible corridors into fewer high-capacity 50/60-seater buses, reducing fuel and driver overhead.',
      stopDemandMap,
      slotId,
      availableStandardBuses,
      availableActiveDrivers,
      50,
      true,
      weights
    );

    // Generate Solution B: MIN_TRAVEL_TIME (Splits into faster express routes)
    const solutionB = this.generateClusteredSolution(
      'MIN_TRAVEL_TIME',
      'Solution B: Minimum Travel Time Strategy',
      'Splits demand into shorter, dedicated express corridor routes with minimal stops, ensuring students reach home in shortest possible duration.',
      stopDemandMap,
      slotId,
      availableStandardBuses,
      availableActiveDrivers,
      40, // Target lower cap for express speed
      false,
      weights
    );

    // Generate Solution C: BALANCED (Optimal trade-off according to admin weights)
    const solutionC = this.generateClusteredSolution(
      'BALANCED',
      'Solution C: Weighted Balanced Strategy',
      `Optimized trade-off balancing bus utilization (${weights.busMinimization}%), travel time (${weights.travelTime}%), and detour limit (${weights.studentDetour}%).`,
      stopDemandMap,
      slotId,
      availableStandardBuses,
      availableActiveDrivers,
      50,
      false,
      weights
    );

    return [solutionC, solutionA, solutionB];
  }

  private generateClusteredSolution(
    type: 'MIN_BUSES' | 'MIN_TRAVEL_TIME' | 'BALANCED',
    name: string,
    description: string,
    stopDemandMap: Map<string, Booking[]>,
    slotId: string,
    buses: Bus[],
    drivers: Driver[],
    targetCapacity: number,
    aggressivePacking: boolean,
    weights: OptimizationWeights
  ): CandidateSolution {
    const routes: CandidateRoute[] = [];
    const unassignedStops = new Set(stopDemandMap.keys());
    let busIndex = 0;
    let driverIndex = 0;
    let routeCounter = 101;

    // Corridor clusters to test against demand
    const corridorTemplates = [...CANDIDATE_CORRIDORS];

    for (const corridor of corridorTemplates) {
      // Find which unassigned stops belong to this corridor
      const matchingStops = corridor.stopSequence.filter(sid => unassignedStops.has(sid) && sid !== 'stop-college');
      if (matchingStops.length === 0) continue;

      let currentRouteStops: string[] = ['stop-college'];
      let currentStudentIds: string[] = [];
      let currentStopDetails: RouteStopDetail[] = [];
      let accumulatedDemand = 0;

      for (const stopId of matchingStops) {
        const stopBookings = stopDemandMap.get(stopId) || [];
        const stopInfo = this.stopsMap.get(stopId);
        if (!stopInfo) continue;

        // Check if adding this stop exceeds bus capacity
        if (accumulatedDemand + stopBookings.length > targetCapacity && currentStudentIds.length > 0) {
          // If we exceed capacity, finalize the current route and start a new split route!
          const bus = buses[busIndex % buses.length];
          const driver = drivers[driverIndex % drivers.length];
          const metrics = this.calculatePathMetrics(currentRouteStops);
          
          routes.push(this.buildCandidateRoute(
            `R-${routeCounter++}`,
            `${corridor.corridorName} (Split A)`,
            corridor.corridorName,
            slotId,
            currentStopDetails,
            currentStudentIds,
            bus?.capacity || 50,
            bus,
            driver,
            metrics.distanceKm,
            metrics.durationMin
          ));

          busIndex++;
          driverIndex++;

          // Reset for next split
          currentRouteStops = ['stop-college'];
          currentStudentIds = [];
          currentStopDetails = [];
          accumulatedDemand = 0;
        }

        // Add stop to active route
        currentRouteStops.push(stopId);
        accumulatedDemand += stopBookings.length;
        currentStudentIds.push(...stopBookings.map(b => b.id));
        unassignedStops.delete(stopId);

        currentStopDetails.push({
          stopId: stopInfo.id,
          stopName: stopInfo.name,
          areaName: stopInfo.corridor,
          sequenceOrder: currentRouteStops.length - 1,
          studentCount: stopBookings.length,
          estimatedArrivalMin: stopInfo.estimatedTimeFromCollegeMin,
          latitude: stopInfo.latitude,
          longitude: stopInfo.longitude
        });
      }

      // If we have remaining stops in this corridor
      if (currentStudentIds.length > 0) {
        const bus = buses[busIndex % (buses.length || 1)];
        const driver = drivers[driverIndex % (drivers.length || 1)];
        const metrics = this.calculatePathMetrics(currentRouteStops);

        routes.push(this.buildCandidateRoute(
          `R-${routeCounter++}`,
          corridor.corridorName,
          corridor.corridorName,
          slotId,
          currentStopDetails,
          currentStudentIds,
          bus?.capacity || 50,
          bus,
          driver,
          metrics.distanceKm,
          metrics.durationMin
        ));

        busIndex++;
        driverIndex++;
      }
    }

    // Handle any orphan stops not covered by predefined templates
    if (unassignedStops.size > 0) {
      const orphanStops = Array.from(unassignedStops);
      const orphanBookings: string[] = [];
      const orphanDetails: RouteStopDetail[] = [];
      let seq = 1;

      for (const sid of orphanStops) {
        const stopBookings = stopDemandMap.get(sid) || [];
        const stopInfo = this.stopsMap.get(sid);
        if (stopInfo) {
          orphanBookings.push(...stopBookings.map(b => b.id));
          orphanDetails.push({
            stopId: sid,
            stopName: stopInfo.name,
            areaName: stopInfo.corridor,
            sequenceOrder: seq++,
            studentCount: stopBookings.length,
            estimatedArrivalMin: stopInfo.estimatedTimeFromCollegeMin,
            latitude: stopInfo.latitude,
            longitude: stopInfo.longitude
          });
        }
      }

      if (orphanBookings.length > 0) {
        const bus = buses[busIndex % (buses.length || 1)];
        const driver = drivers[driverIndex % (drivers.length || 1)];
        const metrics = this.calculatePathMetrics(['stop-college', ...orphanStops]);

        routes.push(this.buildCandidateRoute(
          `R-${routeCounter++}`,
          'South Suburban Connector Route',
          'Cross-City Feeder',
          slotId,
          orphanDetails,
          orphanBookings,
          bus?.capacity || 50,
          bus,
          driver,
          metrics.distanceKm,
          metrics.durationMin
        ));
      }
    }

    // Calculate aggregate solution metrics
    const totalBuses = routes.length;
    const totalDist = routes.reduce((acc, r) => acc + r.totalDistanceKm, 0);
    const totalDuration = routes.reduce((acc, r) => acc + r.totalDurationMin, 0);
    const avgOccupancy = routes.length > 0
      ? Math.round(routes.reduce((acc, r) => acc + r.occupancyPercentage, 0) / routes.length)
      : 0;

    // Check violations
    const violations: string[] = [];
    if (totalBuses > buses.length) {
      violations.push(`Bus shortage: requires ${totalBuses} buses but only ${buses.length} are available`);
    }
    if (totalBuses > drivers.length) {
      violations.push(`Driver shortage: requires ${totalBuses} drivers but only ${drivers.length} are active`);
    }
    for (const r of routes) {
      if (r.totalStudents > r.busCapacity) {
        violations.push(`Route ${r.routeCode} exceeds capacity: ${r.totalStudents}/${r.busCapacity}`);
      }
    }

    // Score calculation using weighted objective function
    const busPenalty = (totalBuses / (buses.length || 1)) * (weights.busMinimization);
    const durationPenalty = (totalDuration / (routes.length * 60 || 1)) * (weights.travelTime);
    const occupancyBonus = (avgOccupancy / 100) * 30;
    const violationPenalty = violations.length * 25;

    const rawScore = Math.round(100 - busPenalty - durationPenalty + occupancyBonus - violationPenalty);
    const normalizedScore = Math.max(10, Math.min(99, rawScore));

    return {
      id: `sol-${type.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name,
      type,
      description,
      score: normalizedScore,
      totalBuses,
      totalDistanceKm: Math.round(totalDist * 10) / 10,
      totalDurationMin: totalDuration,
      averageOccupancyPct: avgOccupancy,
      routes,
      violations
    };
  }

  private buildCandidateRoute(
    routeCode: string,
    routeName: string,
    corridor: string,
    slotId: string,
    stops: RouteStopDetail[],
    studentIds: string[],
    busCapacity: number,
    bus?: Bus,
    driver?: Driver,
    distanceKm: number = 25,
    durationMin: number = 45
  ): CandidateRoute {
    const totalStudents = studentIds.length;
    const occupancyPercentage = Math.min(100, Math.round((totalStudents / busCapacity) * 100));
    const isOverCapacity = totalStudents > busCapacity;
    const violations: string[] = [];

    if (isOverCapacity) {
      violations.push(`Demand of ${totalStudents} exceeds bus capacity of ${busCapacity}`);
    }
    if (durationMin > 80) {
      violations.push(`Route duration (${durationMin} min) exceeds 80 min threshold`);
    }

    return {
      id: `route-${routeCode.toLowerCase()}`,
      routeCode,
      routeName,
      corridor,
      slotId,
      stops,
      totalStudents,
      busCapacity,
      occupancyPercentage,
      totalDistanceKm: distanceKm,
      totalDurationMin: durationMin,
      assignedBusId: bus?.id,
      assignedBusNumber: bus?.registrationNumber,
      assignedDriverId: driver?.id,
      assignedDriverName: driver?.name,
      studentIds,
      isFeasible: violations.length === 0,
      violations
    };
  }
}

export const routingEngine = new GraphRoutingEngine();
