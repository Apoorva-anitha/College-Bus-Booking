package com.collegebus.repository;

import com.collegebus.entity.OptimizationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptimizationRunRepository extends JpaRepository<OptimizationRun, String> {
    List<OptimizationRun> findByDailySlotIdOrderByCreatedAtDesc(String dailySlotId);
    Optional<OptimizationRun> findTopByDailySlotIdOrderByCreatedAtDesc(String dailySlotId);
}
