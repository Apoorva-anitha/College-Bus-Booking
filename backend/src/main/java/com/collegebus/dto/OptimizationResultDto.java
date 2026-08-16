package com.collegebus.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record OptimizationResultDto(
    String optimizationRunId,
    String dailySlotId,
    int totalDemandCount,
    int totalBusesAssigned,
    double totalDistanceKm,
    int totalDurationMin,
    double efficiencyScore,
    String algorithmUsed,
    OffsetDateTime timestamp,
    List<OptimizedRoutePlanDto> routes,
    List<CandidateSummaryDto> candidateRoutes
) {
    public record OptimizedRoutePlanDto(
        String routeId,
        String routeName,
        String corridor,
        String busId,
        String busNumber,
        int busCapacity,
        String driverId,
        String driverName,
        int studentCount,
        double capacityUtilizationPct,
        double distanceKm,
        int durationMin,
        List<StopSequenceDto> stops
    ) {}

    public record StopSequenceDto(
        int sequence,
        String stopId,
        String stopName,
        int pickupCount,
        int cumulativeStudents,
        int etaOffsetMin
    ) {}

    public record CandidateSummaryDto(
        String candidateId,
        String name,
        String corridor,
        int projectedStudents,
        int durationMin,
        double distanceKm,
        double score,
        boolean selected
    ) {}
}
