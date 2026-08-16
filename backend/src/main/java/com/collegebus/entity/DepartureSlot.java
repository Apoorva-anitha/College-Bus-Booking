package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "departure_slots")
public class DepartureSlot {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "slot_time", nullable = false, unique = true)
    private LocalTime slotTime;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "slot_type", nullable = false, length = 30)
    private String slotType; // MORNING_PICKUP, EVENING_DROP, SPECIAL

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "booking_cutoff_hours_prior", nullable = false)
    private int bookingCutoffHoursPrior = 12;

    public DepartureSlot() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LocalTime getSlotTime() { return slotTime; }
    public void setSlotTime(LocalTime slotTime) { this.slotTime = slotTime; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getSlotType() { return slotType; }
    public void setSlotType(String slotType) { this.slotType = slotType; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getBookingCutoffHoursPrior() { return bookingCutoffHoursPrior; }
    public void setBookingCutoffHoursPrior(int bookingCutoffHoursPrior) { this.bookingCutoffHoursPrior = bookingCutoffHoursPrior; }
}
