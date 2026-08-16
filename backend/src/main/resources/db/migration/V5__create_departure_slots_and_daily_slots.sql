-- V5__create_departure_slots_and_daily_slots.sql
CREATE TABLE departure_slots (
    id VARCHAR(64) PRIMARY KEY,
    slot_time TIME NOT NULL UNIQUE,
    label VARCHAR(50) NOT NULL,
    slot_type VARCHAR(30) NOT NULL, -- MORNING_PICKUP, EVENING_DROP, SPECIAL
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    booking_cutoff_hours_prior INTEGER NOT NULL DEFAULT 12
);

CREATE TABLE daily_slots (
    id VARCHAR(64) PRIMARY KEY,
    operation_date DATE NOT NULL,
    departure_slot_id VARCHAR(64) NOT NULL REFERENCES departure_slots(id) ON DELETE CASCADE,
    is_booking_open BOOLEAN NOT NULL DEFAULT TRUE,
    cutoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_bookings INTEGER NOT NULL DEFAULT 0,
    is_optimized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_slot UNIQUE (operation_date, departure_slot_id)
);

CREATE INDEX idx_daily_slots_date_slot ON daily_slots(operation_date, departure_slot_id);
