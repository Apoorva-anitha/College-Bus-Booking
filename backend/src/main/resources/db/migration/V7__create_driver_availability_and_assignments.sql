-- V7__create_driver_availability_and_assignments.sql
CREATE TABLE driver_availability (
    id VARCHAR(64) PRIMARY KEY,
    driver_id VARCHAR(64) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    operation_date DATE NOT NULL,
    departure_slot_id VARCHAR(64) NOT NULL REFERENCES departure_slots(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_driver_date_slot UNIQUE (driver_id, operation_date, departure_slot_id)
);

CREATE TABLE bus_assignments (
    id VARCHAR(64) PRIMARY KEY,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    daily_slot_id VARCHAR(64) NOT NULL REFERENCES daily_slots(id) ON DELETE CASCADE,
    assigned_capacity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE driver_assignments (
    id VARCHAR(64) PRIMARY KEY,
    driver_id VARCHAR(64) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    daily_slot_id VARCHAR(64) NOT NULL REFERENCES daily_slots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
