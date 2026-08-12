// server/routes/debugRoutes.ts
import { Router } from 'express';

const router = Router();

// Debug Sentry route - intentionally throws an error
router.get('/debug-sentry', function mainHandler(req, res, next) {
  try {
    // Send a log before throwing the error
    console.log('[Sentry Debug] User triggered test error');
    
    // Throw an error to test Sentry
    throw new Error("My first Sentry error!");
  } catch (error) {
    // Pass error to Sentry error handler
    next(error);
  }
});

// Test route that sends structured logs
router.get('/test-log', function logHandler(req, res) {
  console.log('[Sentry Debug] Test log endpoint called');
  
  res.json({
    message: 'Test log sent to console',
    timestamp: new Date().toISOString(),
  });
});

export default router;