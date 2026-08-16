package com.collegebus.repository;

import com.collegebus.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, String> {
    List<MaintenanceRecord> findByBusIdOrderByStartDateDesc(String busId);
    List<MaintenanceRecord> findByStatus(String status);
}
