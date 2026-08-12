// server/sentry.ts - Simplified version
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Request, Response, NextFunction, Express } from 'express';

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] SENTRY_DSN not configured. Sentry integration disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    debug: ENVIRONMENT === 'development',
  });

  console.log('[Sentry] Sentry initialized successfully');
};

// Simple middleware setup without Handlers
export const setupSentryExpress = (app: Express) => {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] Cannot setup Sentry Express middleware: SENTRY_DSN not configured');
    return;
  }

  // Add a simple middleware to capture request info
  app.use((req, res, next) => {
    Sentry.setContext('request', {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: req.headers,
    });
    next();
  });

  console.log('[Sentry] Express middleware setup complete');
};

// Custom error class for business logic errors
export class BusinessError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// Helper to capture errors with context
export const captureError = (
  error: Error,
  context?: Record<string, any>,
  severity: 'fatal' | 'error' | 'warning' | 'info' = 'error'
) => {
  if (!SENTRY_DSN) {
    console.error('[Sentry] Error captured (Sentry disabled):', error.message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    scope.setLevel(severity);
    Sentry.captureException(error);
  });
};

// Express error handling middleware with Sentry
export const sentryErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (SENTRY_DSN) {
    captureError(err, {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      userId: (req as any).userId,
      ip: req.ip,
    });
  }
  next(err);
};

// Express error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle BusinessError
  if (err instanceof BusinessError) {
    return res.status(err.statusCode).json({
      error: err.code || 'Business Error',
      message: err.message,
      context: err.context,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export { Sentry };