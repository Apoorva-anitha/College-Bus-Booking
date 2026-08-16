package com.collegebus.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

public record BookingResponseDto(
    String id,
    String bookingReference,
    String studentId,
    String studentName,
    String studentRegNo,
    String dailySlotId,
    LocalDate operationDate,
    LocalTime slotTime,
    String slotLabel,
    String busStopId,
    String busStopName,
    String corridor,
    String assignedRouteId,
    String assignedRouteName,
    String assignedBusNumber,
    Integer seatNumber,
    String status,
    String boardingPassQr,
    OffsetDateTime bookedAt
) {}
