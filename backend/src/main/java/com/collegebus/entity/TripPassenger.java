package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_passengers")
public class TripPassenger {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "is_boarded", nullable = false)
    private boolean boarded = false;

    @Column(name = "boarded_at")
    private OffsetDateTime boardedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarded_at_stop_id")
    private BusStop boardedAtStop;

    public TripPassenger() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public boolean isBoarded() { return boarded; }
    public void setBoarded(boolean boarded) { this.boarded = boarded; }
    public OffsetDateTime getBoardedAt() { return boardedAt; }
    public void setBoardedAt(OffsetDateTime boardedAt) { this.boardedAt = boardedAt; }
    public BusStop getBoardedAtStop() { return boardedAtStop; }
    public void setBoardedAtStop(BusStop boardedAtStop) { this.boardedAtStop = boardedAtStop; }
}
