package com.collegebus.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "route_edges")
public class RouteEdge {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_stop_id", nullable = false)
    private BusStop fromStop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_stop_id", nullable = false)
    private BusStop toStop;

    @Column(name = "corridor_name", nullable = false, length = 100)
    private String corridorName;

    @Column(name = "distance_km", nullable = false)
    private double distanceKm;

    @Column(name = "travel_time_min", nullable = false)
    private int travelTimeMin;

    @Column(name = "is_one_way", nullable = false)
    private boolean oneWay = false;

    @Column(name = "traffic_weight", nullable = false)
    private double trafficWeight = 1.0;

    public RouteEdge() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public BusStop getFromStop() { return fromStop; }
    public void setFromStop(BusStop fromStop) { this.fromStop = fromStop; }
    public BusStop getToStop() { return toStop; }
    public void setToStop(BusStop toStop) { this.toStop = toStop; }
    public String getCorridorName() { return corridorName; }
    public void setCorridorName(String corridorName) { this.corridorName = corridorName; }
    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }
    public int getTravelTimeMin() { return travelTimeMin; }
    public void setTravelTimeMin(int travelTimeMin) { this.travelTimeMin = travelTimeMin; }
    public boolean isOneWay() { return oneWay; }
    public void setOneWay(boolean oneWay) { this.oneWay = oneWay; }
    public double getTrafficWeight() { return trafficWeight; }
    public void setTrafficWeight(double trafficWeight) { this.trafficWeight = trafficWeight; }
}
