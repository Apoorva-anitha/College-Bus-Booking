package com.collegebus.repository;

import com.collegebus.entity.DailySlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySlotRepository extends JpaRepository<DailySlot, String> {

    List<DailySlot> findByOperationDateOrderByDepartureSlotSlotTimeAsc(LocalDate operationDate);

    Optional<DailySlot> findByOperationDateAndDepartureSlotId(LocalDate operationDate, String departureSlotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ds FROM DailySlot ds WHERE ds.id = :id")
    Optional<DailySlot> findByIdForUpdate(@Param("id") String id);
}
