-- V9__create_trips_and_passengers.sql
CREATE TABLE trips (
    id VARCHAR(64) PRIMARY KEY,
    daily_slot_id VARCHAR(64) NOT NULL REFERENCES daily_slots(id) ON DELETE CASCADE,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    driver_id VARCHAR(64) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    current_stop_id VARCHAR(64) REFERENCES bus_stops(id),
    total_boarded_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_passengers (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    booking_id VARCHAR(64) NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    is_boarded BOOLEAN NOT NULL DEFAULT FALSE,
    boarded_at TIMESTAMP WITH TIME ZONE,
    boarded_at_stop_id VARCHAR(64) REFERENCES bus_stops(id)
);

CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_daily_slot ON trips(daily_slot_id);
