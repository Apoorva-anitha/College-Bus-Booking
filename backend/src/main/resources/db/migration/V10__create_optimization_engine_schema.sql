-- V10__create_optimization_engine_schema.sql
CREATE TABLE optimization_runs (
    id VARCHAR(64) PRIMARY KEY,
    daily_slot_id VARCHAR(64) NOT NULL REFERENCES daily_slots(id) ON DELETE CASCADE,
    total_demand_count INTEGER NOT NULL,
    total_buses_assigned INTEGER NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    total_duration_min INTEGER NOT NULL,
    efficiency_score DOUBLE PRECISION NOT NULL,
    algorithm_used VARCHAR(50) NOT NULL DEFAULT 'MULTI_CORRIDOR_GRAPH_CLUSTER_V2',
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    summary_report JSONB,
    executed_by_user_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE optimization_candidates (
    id VARCHAR(64) PRIMARY KEY,
    optimization_run_id VARCHAR(64) NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    ordered_stop_ids JSONB NOT NULL,
    projected_student_count INTEGER NOT NULL,
    projected_duration_min INTEGER NOT NULL,
    projected_distance_km DOUBLE PRECISION NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE optimization_results (
    id VARCHAR(64) PRIMARY KEY,
    optimization_run_id VARCHAR(64) NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id VARCHAR(64) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    driver_id VARCHAR(64) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    student_count INTEGER NOT NULL,
    capacity_utilization_pct DOUBLE PRECISION NOT NULL,
    stops_visited JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opt_runs_slot ON optimization_runs(daily_slot_id);
