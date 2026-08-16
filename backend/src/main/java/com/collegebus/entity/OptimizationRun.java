package com.collegebus.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "optimization_runs")
public class OptimizationRun {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_slot_id", nullable = false)
    private DailySlot dailySlot;

    @Column(name = "total_demand_count", nullable = false)
    private int totalDemandCount;

    @Column(name = "total_buses_assigned", nullable = false)
    private int totalBusesAssigned;

    @Column(name = "total_distance_km", nullable = false)
    private double totalDistanceKm;

    @Column(name = "total_duration_min", nullable = false)
    private int totalDurationMin;

    @Column(name = "efficiency_score", nullable = false)
    private double efficiencyScore;

    @Column(name = "algorithm_used", nullable = false, length = 50)
    private String algorithmUsed = "MULTI_CORRIDOR_GRAPH_CLUSTER_V2";

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @Column(name = "summary_report", columnDefinition = "TEXT")
    private String summaryReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executed_by_user_id")
    private User executedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public OptimizationRun() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public DailySlot getDailySlot() { return dailySlot; }
    public void setDailySlot(DailySlot dailySlot) { this.dailySlot = dailySlot; }
    public int getTotalDemandCount() { return totalDemandCount; }
    public void setTotalDemandCount(int totalDemandCount) { this.totalDemandCount = totalDemandCount; }
    public int getTotalBusesAssigned() { return totalBusesAssigned; }
    public void setTotalBusesAssigned(int totalBusesAssigned) { this.totalBusesAssigned = totalBusesAssigned; }
    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }
    public int getTotalDurationMin() { return totalDurationMin; }
    public void setTotalDurationMin(int totalDurationMin) { this.totalDurationMin = totalDurationMin; }
    public double getEfficiencyScore() { return efficiencyScore; }
    public void setEfficiencyScore(double efficiencyScore) { this.efficiencyScore = efficiencyScore; }
    public String getAlgorithmUsed() { return algorithmUsed; }
    public void setAlgorithmUsed(String algorithmUsed) { this.algorithmUsed = algorithmUsed; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSummaryReport() { return summaryReport; }
    public void setSummaryReport(String summaryReport) { this.summaryReport = summaryReport; }
    public User getExecutedBy() { return executedBy; }
    public void setExecutedBy(User executedBy) { this.executedBy = executedBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
