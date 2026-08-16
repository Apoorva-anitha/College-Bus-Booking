package com.collegebus.repository;

import com.collegebus.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusStopRepository extends JpaRepository<BusStop, String> {
    List<BusStop> findByAreaIdOrderByDisplayOrderAsc(String areaId);
    List<BusStop> findByCorridorOrderByDisplayOrderAsc(String corridor);
}
