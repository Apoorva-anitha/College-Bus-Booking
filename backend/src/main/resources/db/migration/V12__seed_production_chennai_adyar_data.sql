-- V12__seed_production_chennai_adyar_data.sql

-- Insert Default Areas
INSERT INTO areas (id, name, corridor, description) VALUES
('area_adyar', 'Adyar Corridor', 'Adyar-OMR', 'South Chennai Adyar hub with Shastri Nagar, Besant Nagar, Gandhi Nagar'),
('area_tambaram', 'Tambaram Corridor', 'GST-Road', 'South-West Chennai Tambaram, Chromepet, Pallavaram corridor'),
('area_velachery', 'Velachery Corridor', 'Inner-Ring-Road', 'Velachery, Vijayanagar, Taramani junction corridor'),
('area_anna_nagar', 'Anna Nagar Corridor', 'Poonamallee-High', 'North-West Chennai Anna Nagar, Shenoy Nagar, Kilpauk'),
('area_omr_sholinganallur', 'OMR IT Corridor', 'Old-Mahabalipuram-Road', 'Sholinganallur, Thoraipakkam, Karapakkam, Navalur tech zone')
ON CONFLICT (id) DO NOTHING;

-- Insert Chennai & Adyar Bus Stops
INSERT INTO bus_stops (id, name, area_id, latitude, longitude, corridor, estimated_distance_from_college_km, estimated_time_from_college_min, is_major_junction, display_order) VALUES
('stop_adyar_junction', 'Adyar Junction Bus Depot', 'area_adyar', 13.0064, 80.2575, 'Adyar-OMR', 14.5, 35, true, 1),
('stop_shastri_nagar', 'Shastri Nagar 1st Avenue', 'area_adyar', 12.9989, 80.2587, 'Adyar-OMR', 15.2, 38, false, 2),
('stop_besant_nagar', 'Besant Nagar Church / Beach', 'area_adyar', 12.9998, 80.2695, 'Adyar-OMR', 16.8, 42, false, 3),
('stop_gandhi_nagar', 'Gandhi Nagar 2nd Main Rd', 'area_adyar', 13.0089, 80.2512, 'Adyar-OMR', 14.0, 32, false, 4),
('stop_kotturpuram', 'Kotturpuram MRTS Junction', 'area_adyar', 13.0186, 80.2442, 'Adyar-OMR', 12.8, 28, true, 5),
('stop_thiruvanmiyur', 'Thiruvanmiyur Signal / RTO', 'area_adyar', 12.9863, 80.2608, 'Adyar-OMR', 17.5, 45, true, 6),
('stop_tidel_park', 'TIDEL Park / Taramani Station', 'area_velachery', 12.9897, 80.2492, 'Adyar-OMR', 18.0, 48, true, 7),
('stop_velachery_checkpost', 'Velachery Checkpost & MRTS', 'area_velachery', 12.9754, 80.2212, 'Inner-Ring-Road', 19.5, 50, true, 8),
('stop_tambaram_sanatorium', 'Tambaram Sanatorium Bus Stand', 'area_tambaram', 12.9324, 80.1264, 'GST-Road', 24.0, 60, true, 9),
('stop_chromepet_signal', 'Chromepet MIT Flyover', 'area_tambaram', 12.9517, 80.1408, 'GST-Road', 22.0, 55, true, 10),
('stop_anna_nagar_roundtana', 'Anna Nagar Roundtana', 'area_anna_nagar', 13.0850, 80.2101, 'Poonamallee-High', 26.0, 65, true, 11),
('stop_sholinganallur_jn', 'Sholinganallur Junction', 'area_omr_sholinganallur', 12.9010, 80.2279, 'Old-Mahabalipuram-Road', 28.5, 70, true, 12),
('stop_college_main_gate', 'Engineering College Main Campus Hub', 'area_omr_sholinganallur', 12.8710, 80.2190, 'Campus-Arrival', 0.0, 0, true, 99)
ON CONFLICT (id) DO NOTHING;

-- Insert Route Graph Edges for Dynamic Graph Routing
INSERT INTO route_edges (id, from_stop_id, to_stop_id, corridor_name, distance_km, travel_time_min, is_one_way, traffic_weight) VALUES
('edge_1', 'stop_besant_nagar', 'stop_shastri_nagar', 'Adyar-OMR', 1.8, 5, false, 1.0),
('edge_2', 'stop_shastri_nagar', 'stop_adyar_junction', 'Adyar-OMR', 1.4, 4, false, 1.1),
('edge_3', 'stop_gandhi_nagar', 'stop_adyar_junction', 'Adyar-OMR', 1.2, 3, false, 1.0),
('edge_4', 'stop_kotturpuram', 'stop_gandhi_nagar', 'Adyar-OMR', 1.5, 4, false, 1.0),
('edge_5', 'stop_adyar_junction', 'stop_thiruvanmiyur', 'Adyar-OMR', 2.3, 6, false, 1.2),
('edge_6', 'stop_thiruvanmiyur', 'stop_tidel_park', 'Adyar-OMR', 1.9, 5, false, 1.3),
('edge_7', 'stop_tidel_park', 'stop_sholinganallur_jn', 'Adyar-OMR', 9.5, 20, false, 1.2),
('edge_8', 'stop_sholinganallur_jn', 'stop_college_main_gate', 'Campus-Arrival', 3.8, 8, false, 1.0),
('edge_9', 'stop_velachery_checkpost', 'stop_tidel_park', 'Inner-Ring-Road', 3.2, 8, false, 1.1),
('edge_10', 'stop_tambaram_sanatorium', 'stop_chromepet_signal', 'GST-Road', 2.5, 6, false, 1.0),
('edge_11', 'stop_chromepet_signal', 'stop_college_main_gate', 'GST-Road', 18.0, 42, false, 1.1)
ON CONFLICT (id) DO NOTHING;

-- Insert Departure Slots
INSERT INTO departure_slots (id, slot_time, label, slot_type, is_active, booking_cutoff_hours_prior) VALUES
('slot_06_30', '06:30:00', '06:30 AM Early Morning Commute', 'MORNING_PICKUP', true, 12),
('slot_07_30', '07:30:00', '07:30 AM Peak Morning Commute', 'MORNING_PICKUP', true, 12),
('slot_15_30', '15:30:00', '03:30 PM Early Evening Return', 'EVENING_DROP', true, 6),
('slot_17_00', '17:00:00', '05:00 PM Main Evening Return', 'EVENING_DROP', true, 6)
ON CONFLICT (id) DO NOTHING;

-- Insert Fleet Buses
INSERT INTO buses (id, bus_number, registration_plate, capacity, status, is_electric, current_odometer_km) VALUES
('bus_tn09_101', 'BUS-101', 'TN-09-BC-4412', 45, 'AVAILABLE', false, 48200.0),
('bus_tn09_102', 'BUS-102', 'TN-09-BC-4413', 45, 'AVAILABLE', true, 22100.0),
('bus_tn09_103', 'BUS-103', 'TN-09-BD-8891', 32, 'AVAILABLE', false, 61500.0),
('bus_tn09_104', 'BUS-104', 'TN-09-BD-8892', 45, 'AVAILABLE', true, 15300.0),
('bus_tn09_105', 'BUS-105', 'TN-09-BE-1004', 55, 'AVAILABLE', false, 79200.0),
('bus_tn09_106', 'BUS-106', 'TN-09-BE-1005', 45, 'MAINTENANCE', false, 91400.0)
ON CONFLICT (id) DO NOTHING;

-- Insert Base Admin, Driver, and Student Users
-- Passwords hashed with BCrypt ($2a$10$e7...) -> default password for seed users: 'Password@123'
INSERT INTO users (id, username, email, password_hash, full_name, phone, is_active) VALUES
('usr_admin_1', 'admin', 'transport.admin@college.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Prof. R. Narayanan (Transport Officer)', '+91 98401 22334', true),
('usr_driver_1', 'driver.kannan', 'kannan.m@collegebus.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Kannan Muthu', '+91 94441 55667', true),
('usr_driver_2', 'driver.selvam', 'selvam.p@collegebus.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Selvam Pandian', '+91 94442 88990', true),
('usr_student_1', 'std.aarav', 'aarav.sharma@student.college.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Aarav Sharma', '+91 91760 11223', true),
('usr_student_2', 'std.divya', 'divya.ramesh@student.college.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Divya Ramesh', '+91 91760 33445', true)
ON CONFLICT (id) DO NOTHING;

-- Map User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
('usr_admin_1', 3), -- ROLE_ADMIN
('usr_admin_1', 4), -- ROLE_SUPER_ADMIN
('usr_driver_1', 2), -- ROLE_DRIVER
('usr_driver_2', 2), -- ROLE_DRIVER
('usr_student_1', 1), -- ROLE_STUDENT
('usr_student_2', 1)  -- ROLE_STUDENT
ON CONFLICT DO NOTHING;

-- Map Drivers
INSERT INTO drivers (id, user_id, license_number, license_expiry_date, phone, status, preferred_corridor, rating) VALUES
('drv_101', 'usr_driver_1', 'TN-07-2015-883921', '2028-12-31', '+91 94441 55667', 'AVAILABLE', 'Adyar-OMR', 4.9),
('drv_102', 'usr_driver_2', 'TN-09-2017-104958', '2029-06-30', '+91 94442 88990', 'AVAILABLE', 'GST-Road', 4.8)
ON CONFLICT (id) DO NOTHING;

-- Map Students
INSERT INTO students (id, user_id, register_number, department, academic_year, default_area_id) VALUES
('std_21cs101', 'usr_student_1', '311521104001', 'Computer Science & Engineering', 'Final Year (2021-2025)', 'area_adyar'),
('std_22it142', 'usr_student_2', '311522205042', 'Information Technology', 'Third Year (2022-2026)', 'area_adyar')
ON CONFLICT (id) DO NOTHING;
