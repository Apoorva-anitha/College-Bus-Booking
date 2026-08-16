import { OptimizationWeights } from '../../../src/types';

export interface RouteMetric {
  totalStudents: number;
  busCapacity: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  stopCount: number;
  occupancyPercentage: number;
  isFeasible: boolean;
  violations: string[];
}

export interface CandidateSolutionScored {
  id: string;
  name: string;
  type: 'MIN_BUSES' | 'MIN_TRAVEL_TIME' | 'BALANCED' | 'CUSTOM';
  description: string;
  score: number; // 0 to 100
  totalBuses: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  averageOccupancyPct: number;
  routes: any[];
  violations: string[];
}

export function scoreCandidateSolution(
  routes: RouteMetric[],
  weights: OptimizationWeights,
  totalDemand: number,
  availableBusesCount: number
): { score: number; averageOccupancy: number; totalDistanceKm: number; totalDurationMin: number; violations: string[] } {
  if (routes.length === 0) {
    return { score: 0, averageOccupancy: 0, totalDistanceKm: 0, totalDurationMin: 0, violations: ['No routes generated'] };
  }

  const totalBuses = routes.length;
  const totalDistanceKm = Math.round(routes.reduce((sum, r) => sum + r.totalDistanceKm, 0) * 10) / 10;
  const totalDurationMin = routes.reduce((sum, r) => sum + r.totalDurationMin, 0);
  const totalOccupancy = routes.reduce((sum, r) => sum + r.occupancyPercentage, 0);
  const averageOccupancy = Math.round(totalOccupancy / routes.length);

  const violations: string[] = [];
  if (totalBuses > availableBusesCount) {
    violations.push(`Requires ${totalBuses} buses, exceeding available fleet (${availableBusesCount})`);
  }

  for (let i = 0; i < routes.length; i++) {
    if (routes[i].totalStudents > routes[i].busCapacity) {
      violations.push(`Route ${i + 1} exceeds bus capacity (${routes[i].totalStudents}/${routes[i].busCapacity})`);
    }
  }

  // Scoring normalization components (0 to 100 each)
  // 1. Bus Minimization: Fewer buses = higher score
  const idealBuses = Math.ceil(totalDemand / 50);
  const busRatio = idealBuses / Math.max(1, totalBuses);
  const busScore = Math.min(100, busRatio * 100);

  // 2. Travel Time Efficiency: average minutes per passenger leg (<40 min is great)
  const avgTimePerRoute = totalDurationMin / routes.length;
  const timeScore = Math.max(10, Math.min(100, 100 - (avgTimePerRoute - 20) * 1.8));

  // 3. Distance Efficiency: (<25 km average is great)
  const avgDistPerRoute = totalDistanceKm / routes.length;
  const distScore = Math.max(10, Math.min(100, 100 - (avgDistPerRoute - 12) * 2.5));

  // 4. Detour & Student wait penalty
  const detourScore = Math.max(20, Math.min(100, 100 - (routes.reduce((acc, r) => acc + r.stopCount, 0) / routes.length) * 4));

  // 5. Capacity Fit (80-95% is optimal)
  const capacityScore = averageOccupancy >= 75 && averageOccupancy <= 98 ? 95 : Math.max(30, averageOccupancy);

  const wTotal = (weights.busMinimization || 40) + (weights.travelTime || 25) + (weights.distance || 15) + (weights.studentDetour || 15) + (weights.unusedCapacity || 5);
  const weightedScore = (
    (weights.busMinimization * busScore) +
    (weights.travelTime * timeScore) +
    (weights.distance * distScore) +
    (weights.studentDetour * detourScore) +
    (weights.unusedCapacity * capacityScore)
  ) / (wTotal || 100);

  const penalty = violations.length * 15;
  const finalScore = Math.max(5, Math.min(99, Math.round(weightedScore - penalty)));

  return {
    score: finalScore,
    averageOccupancy,
    totalDistanceKm,
    totalDurationMin,
    violations
  };
}
