package com.collegebus.dto;

public record BusStopDto(
    String id,
    String name,
    String areaId,
    String areaName,
    double latitude,
    double longitude,
    String corridor,
    double estimatedDistanceFromCollegeKm,
    int estimatedTimeFromCollegeMin,
    boolean isMajorJunction,
    int displayOrder
) {}
