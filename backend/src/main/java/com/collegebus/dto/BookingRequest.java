package com.collegebus.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingRequest(
    @NotBlank(message = "Daily slot ID is required")
    String dailySlotId,

    @NotBlank(message = "Bus stop ID is required")
    String busStopId
) {}
