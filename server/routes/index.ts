// server/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import medicationRoutes from './medicationRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';
import alarmRoutes from './alarmRoutes.js';
import trackingRoutes from './trackingRoutes.js';
import interactionRoutes from './interactionRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import debugRoutes from './debugRoutes.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    service: 'AETERNA DosePact API Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/account', authRoutes);
router.use('/medications', medicationRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/alarm', alarmRoutes);
router.use('/alarms', alarmRoutes);
router.use('/tracking', trackingRoutes);
router.use('/interactions', interactionRoutes);
router.use('/analyze-interactions', interactionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', aiRoutes);
router.use('/debug', debugRoutes); // Debug routes for Sentry testing

export default router;