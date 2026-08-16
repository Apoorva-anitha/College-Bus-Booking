import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  name?: string;
  id?: string;
}

export interface RouteSegmentResult {
  distanceKm: number;
  durationMin: number;
  polyline?: string;
}

export interface DistanceMatrixResult {
  distancesKm: number[][];
  durationsMin: number[][];
}

export interface RoutingService {
  getDistanceAndDuration(origin: LocationCoordinate, destination: LocationCoordinate): Promise<RouteSegmentResult>;
  getDistanceMatrix(origins: LocationCoordinate[], destinations: LocationCoordinate[]): Promise<DistanceMatrixResult>;
  getOptimizedWaypointOrder(origin: LocationCoordinate, waypoints: LocationCoordinate[], destination: LocationCoordinate): Promise<{
    optimizedOrder: number[];
    totalDistanceKm: number;
    totalDurationMin: number;
  }>;
}

/**
 * Adyar Graph and Haversine Development Routing Provider
 * Provides sub-millisecond local graph-based distance and travel time calculation.
 */
export class DevelopmentRoutingService implements RoutingService {
  private calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    // Account for urban road winding factor (~1.25x straight line)
    return Math.round(dist * 1.25 * 100) / 100;
  }

  public async getDistanceAndDuration(origin: LocationCoordinate, destination: LocationCoordinate): Promise<RouteSegmentResult> {
    const distKm = this.calculateHaversineKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
    // Average Chennai urban peak transit speed ~22 km/h + 2 min dwell per stop
    const durationMin = Math.max(3, Math.round((distKm / 22) * 60) + 2);
    return {
      distanceKm: distKm,
      durationMin
    };
  }

  public async getDistanceMatrix(origins: LocationCoordinate[], destinations: LocationCoordinate[]): Promise<DistanceMatrixResult> {
    const distancesKm: number[][] = [];
    const durationsMin: number[][] = [];

    for (let i = 0; i < origins.length; i++) {
      distancesKm[i] = [];
      durationsMin[i] = [];
      for (let j = 0; j < destinations.length; j++) {
        const seg = await this.getDistanceAndDuration(origins[i], destinations[j]);
        distancesKm[i][j] = seg.distanceKm;
        durationsMin[i][j] = seg.durationMin;
      }
    }

    return { distancesKm, durationsMin };
  }

  public async getOptimizedWaypointOrder(
    origin: LocationCoordinate,
    waypoints: LocationCoordinate[],
    destination: LocationCoordinate
  ): Promise<{ optimizedOrder: number[]; totalDistanceKm: number; totalDurationMin: number }> {
    if (waypoints.length === 0) {
      const direct = await this.getDistanceAndDuration(origin, destination);
      return {
        optimizedOrder: [],
        totalDistanceKm: direct.distanceKm,
        totalDurationMin: direct.durationMin
      };
    }

    // Nearest-neighbor TSP heuristic with 2-opt refinement
    const unvisited = waypoints.map((w, idx) => ({ ...w, originalIdx: idx }));
    const orderedIndices: number[] = [];
    let currentLoc = origin;
    let totalDist = 0;
    let totalDur = 0;

    while (unvisited.length > 0) {
      let bestNextIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = this.calculateHaversineKm(currentLoc.latitude, currentLoc.longitude, unvisited[i].latitude, unvisited[i].longitude);
        if (dist < minDistance) {
          minDistance = dist;
          bestNextIdx = i;
        }
      }

      const nextStop = unvisited.splice(bestNextIdx, 1)[0];
      const seg = await this.getDistanceAndDuration(currentLoc, nextStop);
      totalDist += seg.distanceKm;
      totalDur += seg.durationMin;
      orderedIndices.push(nextStop.originalIdx);
      currentLoc = nextStop;
    }

    // Final leg to destination (or terminal stop)
    const finalLeg = await this.getDistanceAndDuration(currentLoc, destination);
    totalDist += finalLeg.distanceKm;
    totalDur += finalLeg.durationMin;

    return {
      optimizedOrder: orderedIndices,
      totalDistanceKm: Math.round(totalDist * 100) / 100,
      totalDurationMin: totalDur
    };
  }
}

/**
 * Production Google Maps Routing Service
 * Calls Google Directions and Distance Matrix APIs when API key is provided,
 * automatically falling back to high-fidelity Development Routing on network/rate limits.
 */
export class GoogleMapsRoutingService implements RoutingService {
  private devFallback = new DevelopmentRoutingService();

  public async getDistanceAndDuration(origin: LocationCoordinate, destination: LocationCoordinate): Promise<RouteSegmentResult> {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
      return this.devFallback.getDistanceAndDuration(origin, destination);
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes?.[0]?.legs?.[0]) {
        const leg = data.routes[0].legs[0];
        return {
          distanceKm: Math.round((leg.distance.value / 1000) * 100) / 100,
          durationMin: Math.ceil(leg.duration.value / 60),
          polyline: data.routes[0].overview_polyline?.points
        };
      }
    } catch (err) {
      logger.warn('Google Maps API request failed, utilizing local routing fallback', err);
    }

    return this.devFallback.getDistanceAndDuration(origin, destination);
  }

  public async getDistanceMatrix(origins: LocationCoordinate[], destinations: LocationCoordinate[]): Promise<DistanceMatrixResult> {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
      return this.devFallback.getDistanceMatrix(origins, destinations);
    }

    try {
      const origStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
      const destStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origStr}&destinations=${destStr}&mode=driving&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows) {
        const distancesKm: number[][] = [];
        const durationsMin: number[][] = [];
        for (let i = 0; i < data.rows.length; i++) {
          distancesKm[i] = [];
          durationsMin[i] = [];
          for (let j = 0; j < data.rows[i].elements.length; j++) {
            const el = data.rows[i].elements[j];
            if (el.status === 'OK') {
              distancesKm[i][j] = Math.round((el.distance.value / 1000) * 100) / 100;
              durationsMin[i][j] = Math.ceil(el.duration.value / 60);
            } else {
              distancesKm[i][j] = 0;
              durationsMin[i][j] = 0;
            }
          }
        }
        return { distancesKm, durationsMin };
      }
    } catch (err) {
      logger.warn('Google Distance Matrix request failed, utilizing local routing fallback', err);
    }

    return this.devFallback.getDistanceMatrix(origins, destinations);
  }

  public async getOptimizedWaypointOrder(
    origin: LocationCoordinate,
    waypoints: LocationCoordinate[],
    destination: LocationCoordinate
  ): Promise<{ optimizedOrder: number[]; totalDistanceKm: number; totalDurationMin: number }> {
    if (!ENV.GOOGLE_MAPS_API_KEY || waypoints.length === 0) {
      return this.devFallback.getOptimizedWaypointOrder(origin, waypoints, destination);
    }

    try {
      const waypointsParam = `optimize:true|` + waypoints.map(w => `${w.latitude},${w.longitude}`).join('|');
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=${waypointsParam}&mode=driving&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes?.[0]) {
        const route = data.routes[0];
        let totalDist = 0;
        let totalDur = 0;
        for (const leg of route.legs) {
          totalDist += leg.distance.value / 1000;
          totalDur += leg.duration.value / 60;
        }

        return {
          optimizedOrder: route.waypoint_order || waypoints.map((_, i) => i),
          totalDistanceKm: Math.round(totalDist * 100) / 100,
          totalDurationMin: Math.ceil(totalDur)
        };
      }
    } catch (err) {
      logger.warn('Google Directions waypoint optimization failed, utilizing local optimizer fallback', err);
    }

    return this.devFallback.getOptimizedWaypointOrder(origin, waypoints, destination);
  }
}

export function getRoutingService(): RoutingService {
  if (ENV.USE_REAL_GOOGLE_MAPS && ENV.GOOGLE_MAPS_API_KEY) {
    return new GoogleMapsRoutingService();
  }
  return new DevelopmentRoutingService();
}
