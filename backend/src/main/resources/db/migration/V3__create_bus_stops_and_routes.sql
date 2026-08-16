-- V3__create_bus_stops_and_routes.sql
CREATE TABLE bus_stops (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    area_id VARCHAR(64) NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    estimated_distance_from_college_km DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    estimated_time_from_college_min INTEGER NOT NULL DEFAULT 0,
    is_major_junction BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
    id VARCHAR(64) PRIMARY KEY,
    route_code VARCHAR(30) NOT NULL UNIQUE,
    route_name VARCHAR(150) NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    estimated_duration_min INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bus_stops_area ON bus_stops(area_id);
CREATE INDEX idx_bus_stops_corridor ON bus_stops(corridor);
