package com.collegebus.dto;

import java.util.List;

public record OptimizationRequest(
    String dailySlotId,
    int maxBusCapacity,
    int maxRouteDurationMinutes,
    int maxStopsPerRoute,
    double detourToleranceRatio, // e.g. 1.35
    boolean allowDynamicExpressRoutes,
    boolean prioritizeElectricBuses
) {}
