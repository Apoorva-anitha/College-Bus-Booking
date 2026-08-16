package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "bus_number", nullable = false, unique = true, length = 50)
    private String busNumber;

    @Column(name = "registration_plate", nullable = false, unique = true, length = 50)
    private String registrationPlate;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, ASSIGNED, IN_TRANSIT, MAINTENANCE, OUT_OF_SERVICE

    @Column(name = "is_electric", nullable = false)
    private boolean electric = false;

    @Column(name = "current_odometer_km", nullable = false)
    private double currentOdometerKm = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Bus() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }
    public String getRegistrationPlate() { return registrationPlate; }
    public void setRegistrationPlate(String registrationPlate) { this.registrationPlate = registrationPlate; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isElectric() { return electric; }
    public void setElectric(boolean electric) { this.electric = electric; }
    public double getCurrentOdometerKm() { return currentOdometerKm; }
    public void setCurrentOdometerKm(double km) { this.currentOdometerKm = km; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
