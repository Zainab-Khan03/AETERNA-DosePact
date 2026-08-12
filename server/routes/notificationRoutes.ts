import { Router } from 'express';
import { notificationsList } from '../dbStore.js';

const router = Router();

// POST /api/notifications/schedule
router.post('/schedule', (req, res) => {
  const { userId, scheduleId, notificationType, scheduledTime } = req.body;
  const newNotif = {
    _id: `notif_${Date.now()}`,
    userId: userId || 'user_1',
    scheduleId: scheduleId || 'sched_2',
    notificationType: notificationType || 'push',
    scheduledTime: scheduledTime || new Date().toISOString(),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  notificationsList.push(newNotif);
  res.status(201).json(newNotif);
});

// GET /api/notifications/history/:userId
router.get('/history/:userId', (req, res) => {
  const userNotifs = notificationsList.filter((n) => n.userId === req.params.userId);
  res.json(userNotifs);
});

// PUT /api/notifications/:notificationId/status
router.put('/:notificationId/status', (req, res) => {
  const idx = notificationsList.findIndex((n) => n._id === req.params.notificationId);
  if (idx !== -1) {
    notificationsList[idx].status = req.body.status || 'read';
  }
  res.json({ message: 'Notification status updated' });
});

export default router;
