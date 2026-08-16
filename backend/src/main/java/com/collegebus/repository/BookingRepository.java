package com.collegebus.repository;

import com.collegebus.entity.Booking;
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
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByStudentIdOrderByDailySlotOperationDateDesc(String studentId);

    Optional<Booking> findByStudentIdAndDailySlotIdAndStatusNot(String studentId, String dailySlotId, String status);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByDailySlotIdAndStatus(String dailySlotId, String status);

    @Query("SELECT b FROM Booking b WHERE b.dailySlot.operationDate = :date AND b.status = 'CONFIRMED'")
    List<Booking> findConfirmedBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.dailySlot.id = :dailySlotId AND b.status = 'CONFIRMED'")
    List<Booking> findConfirmedBookingsByDailySlotId(@Param("dailySlotId") String dailySlotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.dailySlot.id = :dailySlotId AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsForUpdate(@Param("dailySlotId") String dailySlotId);

    long countByDailySlotIdAndStatus(String dailySlotId, String status);
}
