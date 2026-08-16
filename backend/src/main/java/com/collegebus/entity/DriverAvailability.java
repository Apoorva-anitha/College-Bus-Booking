package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "driver_availability", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"driver_id", "operation_date", "departure_slot_id"})
})
public class DriverAvailability {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "operation_date", nullable = false)
    private LocalDate operationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_slot_id", nullable = false)
    private DepartureSlot departureSlot;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public DriverAvailability() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public LocalDate getOperationDate() { return operationDate; }
    public void setOperationDate(LocalDate operationDate) { this.operationDate = operationDate; }
    public DepartureSlot getDepartureSlot() { return departureSlot; }
    public void setDepartureSlot(DepartureSlot departureSlot) { this.departureSlot = departureSlot; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
