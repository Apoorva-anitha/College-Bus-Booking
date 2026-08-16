package com.collegebus.dto;

public record FleetStatusDto(
    String id,
    String busNumber,
    String registrationPlate,
    int capacity,
    String status,
    boolean isElectric,
    double currentOdometerKm,
    String assignedDriverName,
    String currentRouteName
) {}
