package com.collegebus.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "route_stops", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"route_id", "sequence_order"})
})
public class RouteStop {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stop_id", nullable = false)
    private BusStop busStop;

    @Column(name = "sequence_order", nullable = false)
    private int sequenceOrder;

    @Column(name = "estimated_arrival_offset_min", nullable = false)
    private int estimatedArrivalOffsetMin;

    public RouteStop() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }
    public BusStop getBusStop() { return busStop; }
    public void setBusStop(BusStop busStop) { this.busStop = busStop; }
    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public int getEstimatedArrivalOffsetMin() { return estimatedArrivalOffsetMin; }
    public void setEstimatedArrivalOffsetMin(int estimatedArrivalOffsetMin) { this.estimatedArrivalOffsetMin = estimatedArrivalOffsetMin; }
}
