export interface SpringBootFile {
  path: string;
  category: 'Flyway SQL' | 'Entity' | 'Service' | 'Controller' | 'Security' | 'Test' | 'Config' | 'Docker';
  description: string;
  content: string;
}

export const SPRING_BOOT_ARTIFACTS: SpringBootFile[] = [
  {
    path: 'pom.xml',
    category: 'Config',
    description: 'Maven Project configuration with Java 21, Spring Boot 3.3.x, Spring Data JPA, Security, Flyway, PostgreSQL, Lombok & Testcontainers',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.2</version>
        <relativePath/>
    </parent>
    <groupId>edu.college.transport</groupId>
    <artifactId>college-bus-optimizer</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>college-bus-optimizer</name>
    <description>Production College Bus Management and Route Optimization System</description>
    <properties>
        <java.version>21</java.version>
        <jjwt.version>0.12.6</jjwt.version>
    </properties>
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Database & Flyway -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- JWT Security -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- OpenAPI 3.0 Documentation -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.6.0</version>
        </dependency>

        <!-- Testing & Testcontainers -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`
  },
  {
    path: 'src/main/resources/db/migration/V1__create_users.sql',
    category: 'Flyway SQL',
    description: 'Flyway Migration V1: Roles, permissions, users and user_roles tables with audit columns',
    content: `-- V1__create_users.sql: PostgreSQL schema for User Management and RBAC

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);`
  },
  {
    path: 'src/main/resources/db/migration/V2__create_students.sql',
    category: 'Flyway SQL',
    description: 'Flyway Migration V2: Students and student_profiles with unique registration numbers',
    content: `-- V2__create_students.sql: Student Domain Model

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 5),
    is_hosteller BOOLEAN DEFAULT FALSE NOT NULL,
    bus_pass_number VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_students_reg_no ON students(registration_number);`
  },
  {
    path: 'src/main/resources/db/migration/V3__create_areas_and_stops.sql',
    category: 'Flyway SQL',
    description: 'Flyway Migration V3: Areas, bus_stops, and geographic graph nodes',
    content: `-- V3__create_areas_and_stops.sql: Areas, Stops, Corridors and Road Edges

CREATE TABLE areas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE bus_stops (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    area_id VARCHAR(50) NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    corridor VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    estimated_distance_km NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    estimated_time_min INTEGER NOT NULL DEFAULT 0,
    is_major_junction BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE road_edges (
    id VARCHAR(50) PRIMARY KEY,
    from_stop_id VARCHAR(50) NOT NULL REFERENCES bus_stops(id) ON DELETE RESTRICT,
    to_stop_id VARCHAR(50) NOT NULL REFERENCES bus_stops(id) ON DELETE RESTRICT,
    distance_km NUMERIC(6, 2) NOT NULL,
    travel_time_min INTEGER NOT NULL,
    traffic_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    corridor_name VARCHAR(100) NOT NULL,
    is_one_way BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_bus_stops_area ON bus_stops(area_id);
CREATE INDEX idx_bus_stops_corridor ON bus_stops(corridor);`
  },
  {
    path: 'src/main/resources/db/migration/V7__create_bookings.sql',
    category: 'Flyway SQL',
    description: 'Flyway Migration V7: Bookings table with PostgreSQL transactional concurrency protection, cutoff times, and state transitions',
    content: `-- V7__create_bookings.sql: ACID-Compliant Booking Storage with Race-Condition Protection

CREATE TYPE booking_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'NO_SHOW');

CREATE TABLE departure_slots (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    booking_open_time TIME NOT NULL,
    booking_close_time TIME NOT NULL,
    min_demand_threshold INTEGER DEFAULT 15 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(40) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    slot_id VARCHAR(50) NOT NULL REFERENCES departure_slots(id),
    area_id VARCHAR(50) NOT NULL REFERENCES areas(id),
    stop_id VARCHAR(50) NOT NULL REFERENCES bus_stops(id),
    route_id VARCHAR(50),
    trip_id UUID,
    seat_number INTEGER,
    status VARCHAR(20) DEFAULT 'CONFIRMED' NOT NULL,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    boarding_pass_code VARCHAR(50) NOT NULL UNIQUE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Prevent duplicate active bookings for the same student on the same date and slot
    CONSTRAINT uq_student_date_slot UNIQUE (student_id, booking_date, slot_id)
);

CREATE INDEX idx_bookings_date_slot ON bookings(booking_date, slot_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_stop ON bookings(stop_id);
CREATE INDEX idx_bookings_status ON bookings(status);`
  },
  {
    path: 'src/main/resources/db/migration/V8__create_optimization.sql',
    category: 'Flyway SQL',
    description: 'Flyway Migration V8: Optimization runs, candidate solutions, and audit trail',
    content: `-- V8__create_optimization.sql: Optimization Runs & Candidate Storage

CREATE TABLE optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_number BIGSERIAL,
    schedule_date DATE NOT NULL,
    slot_id VARCHAR(50) NOT NULL REFERENCES departure_slots(id),
    total_demand INTEGER NOT NULL,
    total_stops INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' NOT NULL,
    weights_json JSONB NOT NULL,
    selected_solution_id VARCHAR(100),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE TABLE optimization_candidates (
    id VARCHAR(100) PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
    strategy_name VARCHAR(100) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    total_buses INTEGER NOT NULL,
    total_distance_km NUMERIC(8, 2) NOT NULL,
    total_duration_min INTEGER NOT NULL,
    average_occupancy_pct INTEGER NOT NULL,
    routes_json JSONB NOT NULL,
    violations_json JSONB
);

CREATE INDEX idx_opt_runs_date_slot ON optimization_runs(schedule_date, slot_id);`
  },
  {
    path: 'src/main/java/edu/college/transport/service/BookingService.java',
    category: 'Service',
    description: 'Transactional Booking Engine with Pessimistic Locking to eliminate race conditions (Section 9 & 47 requirement)',
    content: `package edu.college.transport.service;

import edu.college.transport.dto.BookingRequest;
import edu.college.transport.dto.BookingResponse;
import edu.college.transport.entity.*;
import edu.college.transport.exception.*;
import edu.college.transport.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StudentRepository studentRepository;
    private final DepartureSlotRepository slotRepository;
    private final BusStopRepository stopRepository;
    private final DailySlotCapacityRepository capacityRepository;
    private final AuditLogService auditLogService;

    /**
     * Concurrency-safe atomic booking with REPEATABLE_READ isolation
     * and pessimistic write lock on the slot capacity counter.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse createBooking(UUID authenticatedUserId, BookingRequest request) {
        log.info("Processing booking request for user: {}, date: {}, slot: {}", authenticatedUserId, request.getDate(), request.getSlotId());

        // 1. Verify Student Profile & Ownership (Prevents IDOR)
        Student student = studentRepository.findByUserId(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for authenticated user"));

        // 2. Validate Departure Slot & Cutoff Time
        DepartureSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid departure slot: " + request.getSlotId()));

        if (!slot.isActive()) {
            throw new BusinessValidationException("Departure slot is currently inactive");
        }

        LocalTime now = LocalTime.now();
        if (request.getDate().equals(LocalDate.now()) && now.isAfter(slot.getBookingCloseTime())) {
            throw new BookingCutoffException("Booking is closed for slot: " + slot.getName() + ". Cutoff was " + slot.getBookingCloseTime());
        }

        // 3. Prevent duplicate active booking
        boolean alreadyBooked = bookingRepository.existsByStudentIdAndBookingDateAndSlotIdAndStatus(
                student.getId(), request.getDate(), slot.getId(), BookingStatus.CONFIRMED);
        if (alreadyBooked) {
            throw new DuplicateBookingException("Student already has an active booking for this date and departure slot");
        }

        // 4. ATOMIC CAPACITY CHECK WITH PESSIMISTIC LOCK
        DailySlotCapacity capacity = capacityRepository.findWithPessimisticWriteLock(request.getDate(), slot.getId())
                .orElseGet(() -> {
                    DailySlotCapacity newCap = new DailySlotCapacity();
                    newCap.setScheduleDate(request.getDate());
                    newCap.setSlotId(slot.getId());
                    newCap.setTotalCapacity(150); // Pool capacity
                    newCap.setBookedCount(0);
                    return capacityRepository.save(newCap);
                });

        if (capacity.getBookedCount() >= capacity.getTotalCapacity()) {
            auditLogService.logAction(authenticatedUserId.toString(), "BOOKING_REJECTED_NO_CAPACITY", "BOOKINGS", "Capacity full for slot");
            throw new CapacityExceededException("No capacity available for " + slot.getName() + " on " + request.getDate());
        }

        // Increment capacity atomically
        capacity.setBookedCount(capacity.getBookedCount() + 1);
        capacityRepository.save(capacity);

        // 5. Create Confirmed Booking Record
        BusStop stop = stopRepository.findById(request.getStopId())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid stop ID: " + request.getStopId()));

        Booking booking = new Booking();
        booking.setBookingNumber("BKG-" + System.currentTimeMillis());
        booking.setStudent(student);
        booking.setBookingDate(request.getDate());
        booking.setSlot(slot);
        booking.setArea(stop.getArea());
        booking.setStop(stop);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBoardingPassCode("PASS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setSeatNumber(capacity.getBookedCount());

        Booking saved = bookingRepository.save(booking);

        auditLogService.logAction(authenticatedUserId.toString(), "BOOKING_CONFIRMED", "BOOKINGS", saved.getBookingNumber());
        log.info("Booking confirmed successfully: ID {}", saved.getId());

        return mapToDto(saved);
    }

    /**
     * IDOR-protected cancellation: verifies resource ownership against SecurityContext
     */
    @Transactional
    public void cancelBooking(UUID authenticatedUserId, UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getStudent().getUser().getId().equals(authenticatedUserId)) {
            auditLogService.logSecurityEvent(authenticatedUserId.toString(), "IDOR_ATTEMPT_BLOCKED", "BOOKINGS", bookingId.toString());
            throw new AccessDeniedException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidStateTransitionException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Release slot capacity atomically
        capacityRepository.decrementBookedCount(booking.getBookingDate(), booking.getSlot().getId());
        auditLogService.logAction(authenticatedUserId.toString(), "BOOKING_CANCELLED", "BOOKINGS", booking.getBookingNumber());
    }

    private BookingResponse mapToDto(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingNumber(b.getBookingNumber())
                .studentRegNo(b.getStudent().getRegistrationNumber())
                .date(b.getBookingDate())
                .slotId(b.getSlot().getId())
                .slotName(b.getSlot().getName())
                .stopId(b.getStop().getId())
                .stopName(b.getStop().getName())
                .status(b.getStatus().name())
                .boardingPassCode(b.getBoardingPassCode())
                .seatNumber(b.getSeatNumber())
                .build();
    }
}`
  },
  {
    path: 'src/main/java/edu/college/transport/security/SecurityConfig.java',
    category: 'Security',
    description: 'Spring Security 6 with stateless JWT authentication filter, RBAC and secure headers',
    content: `package edu.college.transport.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint authEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/health").permitAll()
                .requestMatchers("/api/student/**").hasAnyRole("STUDENT", "ADMIN")
                .requestMatchers("/api/driver/**").hasAnyRole("DRIVER", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`
  },
  {
    path: 'src/test/java/edu/college/transport/BookingConcurrencyTest.java',
    category: 'Test',
    description: 'Section 47 Concurrency Test: Verifies that when capacity=1, only 1 of multiple concurrent threads gets a confirmed seat',
    content: `package edu.college.transport;

import edu.college.transport.dto.BookingRequest;
import edu.college.transport.dto.BookingResponse;
import edu.college.transport.entity.DailySlotCapacity;
import edu.college.transport.exception.CapacityExceededException;
import edu.college.transport.repository.DailySlotCapacityRepository;
import edu.college.transport.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
public class BookingConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private DailySlotCapacityRepository capacityRepository;

    @Test
    @DisplayName("Mandatory Concurrency Test: Capacity=1, 2 Simultaneous Student Bookings -> Exactly 1 Success, 1 Failure")
    void testConcurrentBookingForLastSeat() throws InterruptedException {
        LocalDate testDate = LocalDate.now().plusDays(1);
        String slotId = "slot-3pm";

        // Setup test capacity = 1
        DailySlotCapacity capacity = new DailySlotCapacity();
        capacity.setScheduleDate(testDate);
        capacity.setSlotId(slotId);
        capacity.setTotalCapacity(1);
        capacity.setBookedCount(0);
        capacityRepository.save(capacity);

        UUID studentAId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID studentBId = UUID.fromString("00000000-0000-0000-0000-000000000002");

        BookingRequest requestA = new BookingRequest(testDate, slotId, "stop-adyar-signal");
        BookingRequest requestB = new BookingRequest(testDate, slotId, "stop-lb-road");

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        Callable<Void> taskA = () -> {
            latch.await();
            try {
                bookingService.createBooking(studentAId, requestA);
                successCount.incrementAndGet();
            } catch (CapacityExceededException e) {
                failureCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> taskB = () -> {
            latch.await();
            try {
                bookingService.createBooking(studentBId, requestB);
                successCount.incrementAndGet();
            } catch (CapacityExceededException e) {
                failureCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(taskA);
        Future<Void> f2 = executor.submit(taskB);

        // Trigger both threads simultaneously
        latch.countDown();

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        // Strict assertion: exactly 1 succeeded, 1 failed
        assertEquals(1, successCount.get(), "Exactly one student should receive the confirmed seat");
        assertEquals(1, failureCount.get(), "Exactly one student should receive CapacityExceededException");
    }
}`
  },
  {
    path: 'docker-compose.yml',
    category: 'Docker',
    description: 'Production Multi-Container Compose with PostgreSQL 16, Spring Boot 3 Backend, and React Frontend',
    content: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: college_bus_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: college_bus_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: change_me_secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d college_bus_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: college_bus_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/college_bus_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: change_me_secure_password
      JWT_SECRET: college_bus_jwt_super_secret_key_minimum_256_bits_for_production_security
    ports:
      - "8080:8080"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: college_bus_frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:3000"

volumes:
  pgdata:`
  }
];
