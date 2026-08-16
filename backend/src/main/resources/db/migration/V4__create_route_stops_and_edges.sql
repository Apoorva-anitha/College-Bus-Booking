-- V4__create_route_stops_and_edges.sql
CREATE TABLE route_stops (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_id VARCHAR(64) NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    estimated_arrival_offset_min INTEGER NOT NULL,
    CONSTRAINT uq_route_stop_sequence UNIQUE (route_id, sequence_order)
);

CREATE TABLE route_edges (
    id VARCHAR(64) PRIMARY KEY,
    from_stop_id VARCHAR(64) NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    to_stop_id VARCHAR(64) NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    corridor_name VARCHAR(100) NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    travel_time_min INTEGER NOT NULL,
    is_one_way BOOLEAN NOT NULL DEFAULT FALSE,
    traffic_weight DOUBLE PRECISION NOT NULL DEFAULT 1.0
);

CREATE INDEX idx_route_stops_route ON route_stops(route_id);
CREATE INDEX idx_route_edges_from_to ON route_edges(from_stop_id, to_stop_id);
