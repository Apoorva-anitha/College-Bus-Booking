package com.collegebus.repository;

import com.collegebus.entity.DriverAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverAvailabilityRepository extends JpaRepository<DriverAvailability, String> {
    List<DriverAvailability> findByOperationDateAndDepartureSlotIdAndAvailableTrue(LocalDate date, String slotId);
    Optional<DriverAvailability> findByDriverIdAndOperationDateAndDepartureSlotId(String driverId, LocalDate date, String slotId);
}
