import { OptimizationRun, OptimizationWeights, Bus, Driver } from '../../../src/types';
import { analyzeDemand } from './demandAnalysis';
import { generateCandidateSolutions } from './candidateRoutes';
import { getRoutingService } from '../integrations/maps/routingService';
import { logger } from '../utils/logger';

export class OptimizationEngine {
  private routingService = getRoutingService();

  public async runOptimization(
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
    availableBuses: Bus[],
    availableDrivers: Driver[],
    weights: OptimizationWeights = {
      busMinimization: 40,
      travelTime: 25,
      distance: 15,
      studentDetour: 15,
      unusedCapacity: 5
    },
    adminUserId: string = 'usr-admin-1'
  ): Promise<OptimizationRun> {
    logger.info(`Starting dynamic route optimization for date=${date}, slot=${slotId}, total bookings=${bookings.length}`);

    // Step 1: Demand Analysis & Corridor aggregation
    const demand = analyzeDemand(date, slotId, bookings, stopsMaster);

    // Step 2: Multi-Strategy Candidate Generation (Min fleet, min time, balanced)
    const candidateSolutions = await generateCandidateSolutions(
      demand,
      slotId,
      availableBuses,
      availableDrivers,
      weights,
      this.routingService
    );

    const slotName = slotId === 'slot-3pm' ? '3:00 PM Afternoon Slot' : slotId === 'slot-5pm' ? '5:00 PM Evening Slot' : 'Special Departure Slot';
    const runId = `opt-run-${Date.now()}`;
    const runNumber = Math.floor(Math.random() * 900) + 100;

    const run: OptimizationRun = {
      id: runId,
      runNumber,
      date,
      slotId,
      slotName,
      totalDemand: demand.totalStudents,
      totalStops: demand.stopDemandList.length,
      status: 'PENDING_APPROVAL',
      candidateSolutions,
      selectedSolutionId: candidateSolutions[0]?.id || '',
      weights,
      runAt: new Date().toISOString(),
      notes: `Evaluated ${demand.totalStudents} confirmed students across ${demand.stopDemandList.length} transit stops in Chennai Adyar network.`
    };

    logger.info(`Optimization completed. Generated ${candidateSolutions.length} candidates with top score=${candidateSolutions[0]?.score || 0}`);
    return run;
  }
}

export const optimizationEngineInstance = new OptimizationEngine();
