import { Router } from 'express';
import {
  medicationSchedules,
  medicationLogs,
  MedicationSchedule,
  MedicationLog,
} from '../dbStore.js';

const router = Router();

// POST /api/schedules
router.post('/', (req, res) => {
  const { userId, userMedicationId, times, dosagePerTime, quantityPerTime, withFood, notes } = req.body;

  if (!userMedicationId || !times || !Array.isArray(times)) {
    return res.status(400).json({ error: 'userMedicationId and times array are required' });
  }

  const createdSchedules: MedicationSchedule[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  times.forEach((t: string) => {
    const newSched: MedicationSchedule = {
      _id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'user_1',
      userMedicationId,
      scheduledTime: `${todayStr}T${t}:00.000Z`,
      scheduledTimeString: t,
      dosage: dosagePerTime || '1 tablet',
      quantity: quantityPerTime || 1,
      status: 'pending',
      notes: notes || (withFood ? 'Take with food' : 'Take as directed'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    medicationSchedules.push(newSched);
    createdSchedules.push(newSched);
  });

  res.status(201).json(createdSchedules);
});

// GET /api/schedules/user/:userId
router.get('/user/:userId', (req, res) => {
  const list = medicationSchedules.filter((s) => s.userId === req.params.userId);
  res.json(list);
});

// GET /api/schedules/today/:userId
router.get('/today/:userId', (req, res) => {
  const list = medicationSchedules.filter((s) => s.userId === req.params.userId);
  res.json({
    date: new Date().toISOString().split('T')[0],
    schedules: list,
  });
});

// PUT /api/schedules/:scheduleId
router.put('/:scheduleId', (req, res) => {
  const idx = medicationSchedules.findIndex((s) => s._id === req.params.scheduleId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  medicationSchedules[idx] = {
    ...medicationSchedules[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json(medicationSchedules[idx]);
});

// DELETE /api/schedules/:scheduleId
router.delete('/:scheduleId', (req, res) => {
  const idx = medicationSchedules.findIndex((s) => s._id === req.params.scheduleId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  medicationSchedules.splice(idx, 1);
  res.json({ message: 'Schedule deleted successfully' });
});

// POST /api/schedules/:scheduleId/take
router.post('/:scheduleId/take', (req, res) => {
  const { photoUrl, photoVerified, notes } = req.body;
  const idx = medicationSchedules.findIndex((s) => s._id === req.params.scheduleId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  medicationSchedules[idx].status = 'taken';
  medicationSchedules[idx].actualTakenTime = new Date().toISOString();
  if (photoUrl) {
    medicationSchedules[idx].verificationPhoto = {
      url: photoUrl,
      uploadedAt: new Date().toISOString(),
      verified: Boolean(photoVerified),
    };
  }

  // Record log entry
  const log: MedicationLog = {
    _id: `log_${Date.now()}`,
    userId: medicationSchedules[idx].userId,
    userMedicationId: medicationSchedules[idx].userMedicationId,
    scheduleId: medicationSchedules[idx]._id,
    date: new Date().toISOString().split('T')[0],
    time: medicationSchedules[idx].scheduledTimeString,
    dosageTaken: medicationSchedules[idx].dosage,
    quantityTaken: medicationSchedules[idx].quantity,
    photoUrl,
    photoVerified: Boolean(photoVerified),
    photoVerificationMethod: photoVerified ? 'exif_plus_gemini_vision' : 'manual',
    sideEffectsExperienced: [],
    notes: notes || 'Logged via API',
    adherenceScore: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  medicationLogs.push(log);

  res.json({
    schedule: medicationSchedules[idx],
    log,
  });
});

export default router;
