package com.collegebus.dto;

import java.time.OffsetDateTime;

public record BoardingValidationResponse(
    boolean success,
    String message,
    String bookingReference,
    String studentName,
    String studentRegNo,
    String stopName,
    Integer seatNumber,
    OffsetDateTime boardedAt
) {}
