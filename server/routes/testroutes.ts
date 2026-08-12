// server/routes/testRoutes.ts
import { Router } from 'express';
import { captureError, BusinessError } from '../sentry.js';

const router = Router();

// Test route to verify Sentry is working
router.get('/test-sentry', (req, res) => {
  try {
    throw new Error('Test error for Sentry integration - This is intentional');
  } catch (error: any) {
    captureError(error, {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Sentry integration test error',
      path: req.path,
      method: req.method,
    });
    
    res.json({
      message: 'Test error captured in Sentry. Check your Sentry dashboard.',
      timestamp: new Date().toISOString(),
    });
  }
});

// Test route for BusinessError
router.get('/test-business-error', (req, res, next) => {
  next(new BusinessError('This is a test business error', 400, 'TEST_ERROR', {
    testData: 'Some context data',
  }));
});

// Check Sentry status
router.get('/sentry-status', (req, res) => {
  res.json({
    sentryEnabled: !!process.env.SENTRY_DSN,
    dsnConfigured: !!process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

export default router;