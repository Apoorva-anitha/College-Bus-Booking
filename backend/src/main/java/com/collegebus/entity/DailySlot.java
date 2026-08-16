package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "daily_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"operation_date", "departure_slot_id"})
})
public class DailySlot {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "operation_date", nullable = false)
    private LocalDate operationDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "departure_slot_id", nullable = false)
    private DepartureSlot departureSlot;

    @Column(name = "is_booking_open", nullable = false)
    private boolean bookingOpen = true;

    @Column(name = "cutoff_time", nullable = false)
    private OffsetDateTime cutoffTime;

    @Column(name = "total_bookings", nullable = false)
    private int totalBookings = 0;

    @Column(name = "is_optimized", nullable = false)
    private boolean optimized = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public DailySlot() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalDate getOperationDate() { return operationDate; }
    public void setOperationDate(LocalDate operationDate) { this.operationDate = operationDate; }
    public DepartureSlot getDepartureSlot() { return departureSlot; }
    public void setDepartureSlot(DepartureSlot departureSlot) { this.departureSlot = departureSlot; }
    public boolean isBookingOpen() { return bookingOpen; }
    public void setBookingOpen(boolean bookingOpen) { this.bookingOpen = bookingOpen; }
    public OffsetDateTime getCutoffTime() { return cutoffTime; }
    public void setCutoffTime(OffsetDateTime cutoffTime) { this.cutoffTime = cutoffTime; }
    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }
    public boolean isOptimized() { return optimized; }
    public void setOptimized(boolean optimized) { this.optimized = optimized; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
