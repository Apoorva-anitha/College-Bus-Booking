package com.collegebus.repository;

import com.collegebus.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, String> {
    Optional<Route> findByRouteCode(String routeCode);
    List<Route> findByActiveTrue();
    List<Route> findByCorridorAndActiveTrue(String corridor);
}
