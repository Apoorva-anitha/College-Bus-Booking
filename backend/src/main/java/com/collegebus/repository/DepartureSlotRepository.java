package com.collegebus.repository;

import com.collegebus.entity.DepartureSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartureSlotRepository extends JpaRepository<DepartureSlot, String> {
    List<DepartureSlot> findByActiveTrueOrderBySlotTimeAsc();
    Optional<DepartureSlot> findBySlotType(String slotType);
}
