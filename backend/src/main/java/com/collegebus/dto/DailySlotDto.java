package com.collegebus.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

public record DailySlotDto(
    String id,
    LocalDate operationDate,
    String departureSlotId,
    LocalTime slotTime,
    String label,
    String slotType,
    boolean isBookingOpen,
    OffsetDateTime cutoffTime,
    int totalBookings,
    boolean isOptimized
) {}
