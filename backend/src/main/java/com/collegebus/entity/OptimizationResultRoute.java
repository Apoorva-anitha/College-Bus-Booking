package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "optimization_results")
public class OptimizationResultRoute {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optimization_run_id", nullable = false)
    private OptimizationRun optimizationRun;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "student_count", nullable = false)
    private int studentCount;

    @Column(name = "capacity_utilization_pct", nullable = false)
    private double capacityUtilizationPct;

    @Column(name = "stops_visited", columnDefinition = "TEXT")
    private String stopsVisitedJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public OptimizationResultRoute() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public OptimizationRun getOptimizationRun() { return optimizationRun; }
    public void setOptimizationRun(OptimizationRun optimizationRun) { this.optimizationRun = optimizationRun; }
    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }
    public double getCapacityUtilizationPct() { return capacityUtilizationPct; }
    public void setCapacityUtilizationPct(double pct) { this.capacityUtilizationPct = pct; }
    public String getStopsVisitedJson() { return stopsVisitedJson; }
    public void setStopsVisitedJson(String json) { this.stopsVisitedJson = json; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
