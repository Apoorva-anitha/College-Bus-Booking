import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { dbStore } from '../db';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import driverRoutes from './routes/driver.routes';
import simulationRoutes from './routes/simulation.routes';
import { errorHandler } from './middleware/errorHandler';
import { eventBus } from './services/eventBus';
import { initializePostgresDatabase, getPostgresStatus } from './config/postgres';

export function createApp() {
  const app = express();

  // Initialize PostgreSQL database tables in background
  initializePostgresDatabase().catch(err => {
    console.error('PostgreSQL background init error:', err);
  });

  // Core Middlewares
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // System Health Endpoint
  app.get('/api/health', (_req, res) => {
    const pgStatus = getPostgresStatus();
    res.json({
      status: 'UP',
      architecture: 'Node.js Express + Neon PostgreSQL',
      database: {
        engine: 'Neon PostgreSQL (aws-us-east-2)',
        connected: pgStatus.connected,
        error: pgStatus.error
      },
      activeSlots: dbStore.slots.filter(s => s.active).length,
      fleetCount: dbStore.buses.length,
      driverCount: dbStore.drivers.length,
      totalBookings: dbStore.bookings.filter(b => b.status === 'CONFIRMED').length,
      routingEngine: 'Multi-Corridor Adyar Graph & Google Maps Provider',
      sseClients: eventBus.getClientCount(),
      timestamp: new Date().toISOString()
    });
  });

  // Database Connection Health Check
  app.get('/api/admin/db-health', (_req, res) => {
    res.json(getPostgresStatus());
  });

  // Real-Time Server-Sent Events (SSE) Stream
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    eventBus.registerClient(res);
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/driver', driverRoutes);
  app.use('/api/simulation', simulationRoutes);

  // Catch-all for undefined /api/* endpoints - ALWAYS return JSON, never HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

// Background GPS simulation ticker for live active buses (runs every 5 seconds)
setInterval(() => {
  const activeTrips = dbStore.trips.filter(t => t.status === 'IN_TRANSIT' || t.status === 'BOARDING');
  if (activeTrips.length > 0) {
    const updates = activeTrips.map(trip => {
      const bus = dbStore.buses.find(b => b.id === trip.busId);
      if (!bus) return null;

      // Slight step towards next stop
      const currentStop = trip.stops[trip.currentStopIndex || 0];
      if (currentStop) {
        bus.currentLat = currentStop.latitude + (Math.random() - 0.5) * 0.001;
        bus.currentLng = currentStop.longitude + (Math.random() - 0.5) * 0.001;
      }

      return {
        tripId: trip.id,
        busId: bus.id,
        busNumber: bus.registrationNumber || bus.busNumber,
        lat: bus.currentLat,
        lng: bus.currentLng,
        status: trip.status,
        currentStop: currentStop?.stopName
      };
    }).filter(Boolean);

    if (updates.length > 0) {
      eventBus.broadcast('BUS_TELEMETRY', updates);
    }
  }
}, 5000);

