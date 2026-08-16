package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bookings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "daily_slot_id"})
})
public class Booking {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 50)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "daily_slot_id", nullable = false)
    private DailySlot dailySlot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bus_stop_id", nullable = false)
    private BusStop busStop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_route_id")
    private Route assignedRoute;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_bus_id")
    private Bus assignedBus;

    @Column(name = "seat_number")
    private Integer seatNumber;

    @Column(nullable = false, length = 30)
    private String status = "CONFIRMED"; // CONFIRMED, BOARDED, CANCELLED, NO_SHOW, WAITLISTED

    @Column(name = "booked_at", nullable = false, updatable = false)
    private OffsetDateTime bookedAt = OffsetDateTime.now();

    @Column(name = "boarding_pass_qr", nullable = false)
    private String boardingPassQr;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    public Booking() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public DailySlot getDailySlot() { return dailySlot; }
    public void setDailySlot(DailySlot dailySlot) { this.dailySlot = dailySlot; }
    public BusStop getBusStop() { return busStop; }
    public void setBusStop(BusStop busStop) { this.busStop = busStop; }
    public Route getAssignedRoute() { return assignedRoute; }
    public void setAssignedRoute(Route assignedRoute) { this.assignedRoute = assignedRoute; }
    public Bus getAssignedBus() { return assignedBus; }
    public void setAssignedBus(Bus assignedBus) { this.assignedBus = assignedBus; }
    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(OffsetDateTime bookedAt) { this.bookedAt = bookedAt; }
    public String getBoardingPassQr() { return boardingPassQr; }
    public void setBoardingPassQr(String boardingPassQr) { this.boardingPassQr = boardingPassQr; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
