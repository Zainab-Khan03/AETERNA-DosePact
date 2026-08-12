// server/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// IMPORTANT: Import instrument.js FIRST
import './instrument.js';

// All other imports come after
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { sessionMiddleware } from './middleware/session.js';
import { setupSwagger } from './swagger.js';
import * as Sentry from '@sentry/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp() {
  const app = express();

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Session middleware
  app.use(sessionMiddleware);

  // JSON Body Parser
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Setup Swagger
  setupSwagger(app);

  // Serve static files
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const uploadsAudioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
  if (!fs.existsSync(uploadsAudioDir)) {
    fs.mkdirSync(uploadsAudioDir, { recursive: true });
  }

  app.use(express.static(publicDir));
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Mount API routes
  app.use('/api', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Sentry error handler - MUST be after all controllers and before any other error middleware
  // The error handler must be registered before any other error middleware and after all controllers
  Sentry.setupExpressErrorHandler(app);

  // Optional fallthrough error handler
  app.use(function onError(err: any, req: any, res: any, next: any) {
    // The error id is attached to `res.sentry` to be returned
    res.statusCode = 500;
    res.json({
      error: 'Internal Server Error',
      message: err.message,
      sentryId: res.sentry || 'No ID available',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}