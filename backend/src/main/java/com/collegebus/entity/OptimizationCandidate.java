package com.collegebus.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "optimization_candidates")
public class OptimizationCandidate {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optimization_run_id", nullable = false)
    private OptimizationRun optimizationRun;

    @Column(name = "candidate_name", nullable = false, length = 150)
    private String candidateName;

    @Column(nullable = false, length = 100)
    private String corridor;

    @Column(name = "ordered_stop_ids", columnDefinition = "TEXT", nullable = false)
    private String orderedStopIdsJson;

    @Column(name = "projected_student_count", nullable = false)
    private int projectedStudentCount;

    @Column(name = "projected_duration_min", nullable = false)
    private int projectedDurationMin;

    @Column(name = "projected_distance_km", nullable = false)
    private double projectedDistanceKm;

    @Column(nullable = false)
    private double score;

    @Column(name = "is_selected", nullable = false)
    private boolean selected = false;

    public OptimizationCandidate() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public OptimizationRun getOptimizationRun() { return optimizationRun; }
    public void setOptimizationRun(OptimizationRun optimizationRun) { this.optimizationRun = optimizationRun; }
    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
    public String getCorridor() { return corridor; }
    public void setCorridor(String corridor) { this.corridor = corridor; }
    public String getOrderedStopIdsJson() { return orderedStopIdsJson; }
    public void setOrderedStopIdsJson(String orderedStopIdsJson) { this.orderedStopIdsJson = orderedStopIdsJson; }
    public int getProjectedStudentCount() { return projectedStudentCount; }
    public void setProjectedStudentCount(int projectedStudentCount) { this.projectedStudentCount = projectedStudentCount; }
    public int getProjectedDurationMin() { return projectedDurationMin; }
    public void setProjectedDurationMin(int projectedDurationMin) { this.projectedDurationMin = projectedDurationMin; }
    public double getProjectedDistanceKm() { return projectedDistanceKm; }
    public void setProjectedDistanceKm(double projectedDistanceKm) { this.projectedDistanceKm = projectedDistanceKm; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public boolean isSelected() { return selected; }
    public void setSelected(boolean selected) { this.selected = selected; }
}
