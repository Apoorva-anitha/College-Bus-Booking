package com.collegebus.repository;

import com.collegebus.entity.TripPassenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripPassengerRepository extends JpaRepository<TripPassenger, String> {
    List<TripPassenger> findByTripId(String tripId);
    Optional<TripPassenger> findByBookingId(String bookingId);
}
