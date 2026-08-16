import { Pool, QueryResult } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool | null = null;
let isConnected = false;
let connectionError: string | null = null;

export function setDatabaseUrl(newUrl: string) {
  process.env.DATABASE_URL = newUrl;
  if (pool) {
    pool.end().catch(() => {});
    pool = null;
  }
  isConnected = false;
  connectionError = null;
}

export async function testConnection(url?: string): Promise<{ success: boolean; message: string; version?: string; details?: any }> {
  const targetUrl = url || process.env.DATABASE_URL;
  if (!targetUrl) {
    return { success: false, message: 'DATABASE_URL not configured' };
  }

  const testPool = new Pool({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 7000
  });

  try {
    const client = await testPool.connect();
    try {
      const res = await client.query('SELECT version(), current_database(), current_user, NOW() as server_time');
      const row = res.rows[0];
      return {
        success: true,
        message: `Successfully connected to database "${row.current_database}" as "${row.current_user}"`,
        version: row.version,
        details: row
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Connection failed',
      details: { code: err.code, severity: err.severity, routine: err.routine }
    };
  } finally {
    await testPool.end().catch(() => {});
  }
}

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_sSv3e8dunJBg@ep-wispy-wildflower-axw0tjjz-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";

export function getPostgresPool(): Pool | null {
  let connectionString = process.env.DATABASE_URL || DEFAULT_NEON_URL;
  if (connectionString.includes('npg_cm4ieODqjZ6p') || connectionString.includes('npg_iz9kMS5utjKQ')) {
    connectionString = DEFAULT_NEON_URL;
    process.env.DATABASE_URL = DEFAULT_NEON_URL;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
        connectionError = err.message;
        isConnected = false;
      });
    } catch (err: any) {
      logger.error('Failed to initialize PostgreSQL pool', { error: err.message });
      connectionError = err.message;
      return null;
    }
  }

  return pool;
}

export async function queryPostgres(text: string, params?: any[]): Promise<QueryResult<any> | null> {
  const p = getPostgresPool();
  if (!p) return null;
  try {
    return await p.query(text, params);
  } catch (err: any) {
    logger.error('PostgreSQL query execution error', { error: err.message, query: text.substring(0, 100) });
    return null;
  }
}

export async function initializePostgresDatabase(): Promise<{ success: boolean; message: string; version?: string }> {
  const p = getPostgresPool();
  if (!p) {
    return { success: false, message: 'DATABASE_URL not configured' };
  }

  try {
    const client = await p.connect();
    try {
      const verRes = await client.query('SELECT version(), current_database(), current_user');
      isConnected = true;
      connectionError = null;
      const dbInfo = verRes.rows[0];
      logger.info('Connected to Neon PostgreSQL database successfully', {
        database: dbInfo.current_database,
        user: dbInfo.current_user
      });

      // Initialize DDL schema tables if not exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(128) UNIQUE NOT NULL,
          email VARCHAR(256) UNIQUE NOT NULL,
          password_hash VARCHAR(256) NOT NULL,
          name VARCHAR(256) NOT NULL,
          role VARCHAR(64) NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS student_records (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
          registration_number VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(256) NOT NULL,
          email VARCHAR(256) UNIQUE NOT NULL,
          department VARCHAR(128) NOT NULL,
          year INTEGER NOT NULL,
          section VARCHAR(32) NOT NULL,
          is_hosteller BOOLEAN DEFAULT FALSE,
          hostel_name VARCHAR(128),
          phone VARCHAR(64),
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS departure_slots (
          id VARCHAR(64) PRIMARY KEY,
          time VARCHAR(32) NOT NULL,
          label VARCHAR(128) NOT NULL,
          cutoff_time VARCHAR(32) NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS areas (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) UNIQUE NOT NULL,
          corridor_code VARCHAR(32) NOT NULL,
          center_lat DOUBLE PRECISION NOT NULL,
          center_lng DOUBLE PRECISION NOT NULL,
          active BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS bus_stops (
          id VARCHAR(64) PRIMARY KEY,
          area_id VARCHAR(64) REFERENCES areas(id) ON DELETE CASCADE,
          name VARCHAR(256) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          sequence INTEGER NOT NULL,
          landmark TEXT
        );

        CREATE TABLE IF NOT EXISTS buses (
          id VARCHAR(64) PRIMARY KEY,
          bus_number VARCHAR(64) UNIQUE NOT NULL,
          registration_no VARCHAR(64) UNIQUE NOT NULL,
          capacity INTEGER DEFAULT 50,
          status VARCHAR(64) DEFAULT 'AVAILABLE',
          fuel_type VARCHAR(64) DEFAULT 'DIESEL',
          current_lat DOUBLE PRECISION,
          current_lng DOUBLE PRECISION
        );

        CREATE TABLE IF NOT EXISTS drivers (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(256) NOT NULL,
          license_no VARCHAR(128) UNIQUE NOT NULL,
          phone VARCHAR(64) NOT NULL,
          status VARCHAR(64) DEFAULT 'AVAILABLE'
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(64) PRIMARY KEY,
          booking_number VARCHAR(64) UNIQUE NOT NULL,
          date VARCHAR(32) NOT NULL,
          slot_id VARCHAR(64) NOT NULL,
          student_id VARCHAR(64) NOT NULL,
          student_name VARCHAR(256) NOT NULL,
          registration_number VARCHAR(64) NOT NULL,
          area_id VARCHAR(64) NOT NULL,
          stop_id VARCHAR(64) NOT NULL,
          stop_name VARCHAR(256) NOT NULL,
          status VARCHAR(64) DEFAULT 'CONFIRMED',
          seat_number INTEGER,
          token VARCHAR(128) UNIQUE NOT NULL,
          trip_id VARCHAR(64),
          boarded_at TIMESTAMPTZ,
          cancelled_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS trips (
          id VARCHAR(64) PRIMARY KEY,
          date VARCHAR(32) NOT NULL,
          slot_id VARCHAR(64) NOT NULL,
          bus_id VARCHAR(64) NOT NULL,
          bus_number VARCHAR(64) NOT NULL,
          driver_id VARCHAR(64) NOT NULL,
          driver_name VARCHAR(256) NOT NULL,
          route_name VARCHAR(256) NOT NULL,
          corridor_code VARCHAR(64) NOT NULL,
          status VARCHAR(64) DEFAULT 'SCHEDULED',
          scheduled_time VARCHAR(32) NOT NULL,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          assigned_stops JSONB,
          delay_minutes INTEGER DEFAULT 0,
          delay_reason TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          user_id VARCHAR(64),
          action VARCHAR(128) NOT NULL,
          entity VARCHAR(128) NOT NULL,
          entity_id VARCHAR(128),
          details JSONB,
          ip_address VARCHAR(128),
          hash VARCHAR(128) NOT NULL
        );
      `);

      logger.info('Neon PostgreSQL tables verified and provisioned successfully');

      // Seed initial data if tables are empty
      try {
        const userCountRes = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCountRes.rows[0].count, 10) === 0) {
          const defaultHash = '$2a$10$wN87f2l1y1N4Wq9N5P14v.j8B90Q1k2e2u6R4q3b5c6d7e8f9a0b1'; // 'password'
          
          // Seed Users
          await client.query(`
            INSERT INTO users (id, username, email, password_hash, name, role, active)
            VALUES 
              ('usr-admin-1', 'admin_transport', 'transport.officer@college.edu', '${defaultHash}', 'Dr. S. Ramanathan', 'ADMIN', true),
              ('usr-driver-1', 'driver_selvam', 'selvam.driver@college.edu', '${defaultHash}', 'Selvam Anthony', 'DRIVER', true),
              ('usr-driver-2', 'driver_murugan', 'murugan.driver@college.edu', '${defaultHash}', 'Murugan Sundaram', 'DRIVER', true),
              ('usr-driver-3', 'driver_rajendran', 'rajendran.driver@college.edu', '${defaultHash}', 'Rajendran Paul', 'DRIVER', true),
              ('usr-driver-4', 'driver_karthik', 'karthik.driver@college.edu', '${defaultHash}', 'Karthik Venkatesh', 'DRIVER', true),
              ('usr-driver-5', 'driver_gopal', 'gopal.driver@college.edu', '${defaultHash}', 'Gopalakrishnan Natarajan', 'DRIVER', true),
              ('stu-1045', '23CSE1045', 'apoorva.23cse@college.edu', '${defaultHash}', 'Apoorva Sundar', 'STUDENT', true),
              ('stu-1046', '23CSE1046', 'bhuvi.23cse@college.edu', '${defaultHash}', 'Bhuvaneshwari R', 'STUDENT', true),
              ('stu-1047', '23CSE1047', 'chandra.23cse@college.edu', '${defaultHash}', 'Chandrashekar V', 'STUDENT', true),
              ('usr-student-1', '21CS104', 'arun.k@college.edu', '${defaultHash}', 'Arun Kumar', 'STUDENT', true),
              ('usr-student-2', '22EC205', 'priya.s@college.edu', '${defaultHash}', 'Priya Sundar', 'STUDENT', true)
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Student Records
          await client.query(`
            INSERT INTO student_records (id, user_id, registration_number, name, email, department, year, section, is_hosteller, phone, active)
            VALUES 
              ('stu-1045', 'stu-1045', '23CSE1045', 'Apoorva Sundar', 'apoorva.23cse@college.edu', 'Computer Science & Engineering', 2, 'A', false, '+91 98401 11223', true),
              ('stu-1046', 'stu-1046', '23CSE1046', 'Bhuvaneshwari R', 'bhuvi.23cse@college.edu', 'Computer Science & Engineering', 2, 'A', true, '+91 98401 22334', true),
              ('stu-1047', 'stu-1047', '23CSE1047', 'Chandrashekar V', 'chandra.23cse@college.edu', 'Information Technology', 3, 'B', false, '+91 98401 33445', true),
              ('usr-student-1', 'usr-student-1', '21CS104', 'Arun Kumar', 'arun.k@college.edu', 'Computer Science & Engineering', 3, 'A', false, '+91 98765 43210', true),
              ('usr-student-2', 'usr-student-2', '22EC205', 'Priya Sundar', 'priya.s@college.edu', 'Electronics & Communication', 2, 'B', false, '+91 98765 43211', true)
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Departure Slots
          await client.query(`
            INSERT INTO departure_slots (id, time, label, cutoff_time, active, description)
            VALUES 
              ('slot-3pm', '15:00', '3:00 PM Afternoon Slot', '13:30', true, 'Primary regular departure slot for day scholars.'),
              ('slot-5pm', '17:00', '5:00 PM Evening Slot', '15:30', true, 'Secondary evening departure slot for lab & project students.')
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Areas
          await client.query(`
            INSERT INTO areas (id, name, corridor_code, center_lat, center_lng, active)
            VALUES 
              ('area-adyar', 'Adyar Corridor', 'ADYAR_CORRIDOR', 13.0012, 80.2565, true),
              ('area-thiruvanmiyur', 'Thiruvanmiyur Corridor', 'TVM_CORRIDOR', 12.9830, 80.2594, true),
              ('area-guindy', 'Guindy / Saidapet Corridor', 'GUINDY_CORRIDOR', 13.0067, 80.2026, true),
              ('area-velachery', 'Velachery Main Corridor', 'VELACHERY_CORRIDOR', 12.9750, 80.2200, true),
              ('area-tnagar', 'T. Nagar Corridor', 'TNAGAR_CORRIDOR', 13.0418, 80.2341, true)
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Bus Stops
          await client.query(`
            INSERT INTO bus_stops (id, area_id, name, latitude, longitude, sequence, landmark)
            VALUES 
              ('stop-college', 'area-adyar', 'College Campus Transit Bay', 12.9010, 80.1420, 0, 'Main Gate Departure Bay 1-4'),
              ('stop-adyar-signal', 'area-adyar', 'Adyar Signal (Lattice Bridge)', 13.0064, 80.2575, 1, 'Near Adyar Ananda Bhavan'),
              ('stop-lb-road', 'area-adyar', 'LB Road Depot', 12.9980, 80.2580, 2, 'Opposite Indian Oil Pump'),
              ('stop-kasturba-nagar', 'area-adyar', 'Kasturba Nagar 3rd Cross', 13.0030, 80.2510, 3, 'Near MRTS Station'),
              ('stop-thiruvanmiyur-depot', 'area-thiruvanmiyur', 'Thiruvanmiyur Bus Stand', 12.9830, 80.2594, 4, 'MTC Bus Terminus'),
              ('stop-besant-nagar', 'area-thiruvanmiyur', 'Besant Nagar Church', 12.9995, 80.2680, 5, 'Near 6th Avenue Bus Bay'),
              ('stop-guindy-kathipara', 'area-guindy', 'Guindy Kathipara Junction', 13.0067, 80.2026, 6, 'Kathipara Cloverleaf'),
              ('stop-saidapet-metro', 'area-guindy', 'Saidapet Metro Station', 13.0210, 80.2230, 7, 'Saidapet Metro Gate 2'),
              ('stop-velachery-vijayanagar', 'area-velachery', 'Velachery Vijayanagar Bus Stop', 12.9750, 80.2200, 8, 'Vijayanagar Junction')
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Buses
          await client.query(`
            INSERT INTO buses (id, bus_number, registration_no, capacity, status, fuel_type, current_lat, current_lng)
            VALUES 
              ('bus-1', 'BUS-01', 'TN-09-CB-1001', 50, 'AVAILABLE', 'DIESEL', 13.0064, 80.2575),
              ('bus-2', 'BUS-02', 'TN-09-CB-1002', 50, 'AVAILABLE', 'DIESEL', 12.9830, 80.2594),
              ('bus-3', 'BUS-03', 'TN-09-CB-1003', 50, 'AVAILABLE', 'DIESEL', 13.0067, 80.2026),
              ('bus-4', 'BUS-04', 'TN-09-CB-1004', 50, 'AVAILABLE', 'DIESEL', 12.9750, 80.2200),
              ('bus-5', 'BUS-05', 'TN-09-CB-1005', 50, 'AVAILABLE', 'DIESEL', 13.0418, 80.2341),
              ('bus-6', 'BUS-06', 'TN-09-CB-1006', 50, 'AVAILABLE', 'DIESEL', 12.9980, 80.2580),
              ('bus-7', 'BUS-07', 'TN-09-CB-1007', 50, 'MAINTENANCE', 'DIESEL', 12.9010, 80.1420)
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Drivers
          await client.query(`
            INSERT INTO drivers (id, user_id, name, license_no, phone, status)
            VALUES 
              ('drv-1', 'usr-driver-2', 'Murugan Sundaram', 'TN-09-2015-0045892', '+91 98401 23456', 'AVAILABLE'),
              ('drv-2', 'usr-driver-3', 'Rajendran Paul', 'TN-09-2017-0098234', '+91 98402 34567', 'AVAILABLE'),
              ('drv-3', 'usr-driver-4', 'Karthik Venkatesh', 'TN-09-2018-0012903', '+91 98403 45678', 'AVAILABLE'),
              ('drv-4', 'usr-driver-1', 'Selvam Anthony', 'TN-09-2016-0078129', '+91 98404 56789', 'AVAILABLE'),
              ('drv-5', 'usr-driver-5', 'Gopalakrishnan Natarajan', 'TN-09-2014-0034112', '+91 98405 67890', 'AVAILABLE')
            ON CONFLICT (id) DO NOTHING;
          `);

          // Seed Initial Trips
          const today = new Date().toISOString().split('T')[0];
          await client.query(`
            INSERT INTO trips (id, date, slot_id, bus_id, bus_number, driver_id, driver_name, route_name, corridor_code, status, scheduled_time)
            VALUES 
              ('trip-today-3pm-1', '${today}', 'slot-3pm', 'bus-1', 'TN-09-CB-1001', 'drv-4', 'Selvam Anthony', 'Campus -> Adyar Lattice Express', 'ADYAR_CORRIDOR', 'SCHEDULED', '15:00'),
              ('trip-today-3pm-2', '${today}', 'slot-3pm', 'bus-2', 'TN-09-CB-1002', 'drv-1', 'Murugan Sundaram', 'Campus -> Thiruvanmiyur Coastal Route', 'TVM_CORRIDOR', 'SCHEDULED', '15:00')
            ON CONFLICT (id) DO NOTHING;
          `);

          // Initial Audit Log
          await client.query(`
            INSERT INTO audit_logs (id, timestamp, user_id, action, entity, details, ip_address, hash)
            VALUES (
              'log-bootstrap-pg-01', NOW(), 'usr-admin-1', 'DATABASE_SEEDED', 'SYSTEM',
              '{"message": "Authoritative college transit datasets seeded into Neon PostgreSQL"}',
              '127.0.0.1', 'hash-bootstrap-01'
            )
            ON CONFLICT (id) DO NOTHING;
          `);

          logger.info('Neon PostgreSQL seed dataset inserted successfully');
        }
      } catch (seedErr: any) {
        logger.warn('PostgreSQL initial data seeding note:', { error: seedErr.message });
      }

      return {
        success: true,
        message: 'Connected to Neon PostgreSQL',
        version: dbInfo.version
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message;
    logger.error('Failed to connect to Neon PostgreSQL', { error: err.message });
    return {
      success: false,
      message: `PostgreSQL connection error: ${err.message}`
    };
  }
}

export function getPostgresStatus(): {
  connected: boolean;
  databaseUrl: string | null;
  error: string | null;
} {
  return {
    connected: isConnected,
    databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : null,
    error: connectionError
  };
}
