import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/college_bus_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'transoptima-super-secret-jwt-key-chennai-transit-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  USE_REAL_GOOGLE_MAPS: process.env.USE_REAL_GOOGLE_MAPS === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
