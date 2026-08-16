package com.collegebus.dto;

import java.util.List;

public record AreaDemandDto(
    String areaId,
    String areaName,
    String corridor,
    int totalDemandCount,
    List<StopDemandDto> stopDemands
) {
    public record StopDemandDto(
        String stopId,
        String stopName,
        int count,
        double latitude,
        double longitude
    ) {}
}
