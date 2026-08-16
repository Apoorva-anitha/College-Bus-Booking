package com.collegebus.repository;

import com.collegebus.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByUserId(String userId);
    List<Driver> findByStatus(String status);
    List<Driver> findByPreferredCorridor(String preferredCorridor);
}
