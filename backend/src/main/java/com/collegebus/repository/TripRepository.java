package com.collegebus.repository;

import com.collegebus.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByDriverIdOrderByCreatedAtDesc(String driverId);
    List<Trip> findByDailySlotId(String dailySlotId);
    Optional<Trip> findByDailySlotIdAndRouteId(String dailySlotId, String routeId);
    List<Trip> findByStatus(String status);
}
