package com.collegebus.dto;

public record TripStatusUpdateRequest(
    String status, // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    Double currentLatitude,
    Double currentLongitude,
    String currentStopId
) {}
