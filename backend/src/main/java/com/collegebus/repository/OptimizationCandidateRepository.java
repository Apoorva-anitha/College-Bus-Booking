package com.collegebus.repository;

import com.collegebus.entity.OptimizationCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptimizationCandidateRepository extends JpaRepository<OptimizationCandidate, String> {
    List<OptimizationCandidate> findByOptimizationRunId(String optimizationRunId);
}
