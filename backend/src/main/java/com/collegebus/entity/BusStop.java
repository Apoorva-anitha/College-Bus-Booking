package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bus_stops")
public class BusStop {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false, length = 100)
    private String corridor;

    @Column(name = "estimated_distance_from_college_km", nullable = false)
    private double estimatedDistanceFromCollegeKm;

    @Column(name = "estimated_time_from_college_min", nullable = false)
    private int estimatedTimeFromCollegeMin;

    @Column(name = "is_major_junction", nullable = false)
    private boolean majorJunction;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public BusStop() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public String getCorridor() { return corridor; }
    public void setCorridor(String corridor) { this.corridor = corridor; }
    public double getEstimatedDistanceFromCollegeKm() { return estimatedDistanceFromCollegeKm; }
    public void setEstimatedDistanceFromCollegeKm(double km) { this.estimatedDistanceFromCollegeKm = km; }
    public int getEstimatedTimeFromCollegeMin() { return estimatedTimeFromCollegeMin; }
    public void setEstimatedTimeFromCollegeMin(int min) { this.estimatedTimeFromCollegeMin = min; }
    public boolean isMajorJunction() { return majorJunction; }
    public void setMajorJunction(boolean majorJunction) { this.majorJunction = majorJunction; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
