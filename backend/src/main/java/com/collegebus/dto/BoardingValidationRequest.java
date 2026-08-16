package com.collegebus.dto;

public record BoardingValidationRequest(
    String tripId,
    String bookingReferenceOrQr,
    String currentStopId
) {}
