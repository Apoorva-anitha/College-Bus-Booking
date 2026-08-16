-- V2__create_students_and_areas.sql
CREATE TABLE areas (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    corridor VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    default_area_id VARCHAR(64) REFERENCES areas(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_reg_no ON students(register_number);
CREATE INDEX idx_students_area ON students(default_area_id);
