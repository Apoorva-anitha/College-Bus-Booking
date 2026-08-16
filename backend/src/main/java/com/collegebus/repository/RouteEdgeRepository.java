package com.collegebus.repository;

import com.collegebus.entity.RouteEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteEdgeRepository extends JpaRepository<RouteEdge, String> {
    List<RouteEdge> findByCorridorName(String corridorName);
    List<RouteEdge> findByFromStopId(String fromStopId);
}
