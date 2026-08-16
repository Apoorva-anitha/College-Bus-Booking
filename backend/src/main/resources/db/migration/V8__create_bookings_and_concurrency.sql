-- V8__create_bookings_and_concurrency.sql
CREATE TABLE bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    daily_slot_id VARCHAR(64) NOT NULL REFERENCES daily_slots(id) ON DELETE CASCADE,
    bus_stop_id VARCHAR(64) NOT NULL REFERENCES bus_stops(id) ON DELETE RESTRICT,
    assigned_route_id VARCHAR(64) REFERENCES routes(id) ON DELETE SET NULL,
    assigned_bus_id VARCHAR(64) REFERENCES buses(id) ON DELETE SET NULL,
    seat_number INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, BOARDED, CANCELLED, NO_SHOW, WAITLISTED
    booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    boarding_pass_qr VARCHAR(255) NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_student_slot_active UNIQUE (student_id, daily_slot_id)
);

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_daily_slot ON bookings(daily_slot_id);
CREATE INDEX idx_bookings_bus_stop ON bookings(bus_stop_id);
CREATE INDEX idx_bookings_status ON bookings(status);
