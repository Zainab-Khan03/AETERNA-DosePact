import { Router } from 'express';
import {
  medicationSchedules,
  medicationLogs,
  userMedications,
} from '../dbStore.js';

const router = Router();

// GET /api/tracking/adherence/:userId
router.get('/adherence/:userId', (req, res) => {
  const total = medicationSchedules.length || 1;
  const taken = medicationSchedules.filter((s) => s.status === 'taken').length;
  const missed = medicationSchedules.filter((s) => s.status === 'missed').length;
  const rate = Math.round((taken / total) * 100);

  res.json({
    adherenceRate: rate,
    totalDoses: total,
    takenDoses: taken,
    missedDoses: missed,
    dailyBreakdown: [
      { day: 'Mon', adherence: 100 },
      { day: 'Tue', adherence: 85 },
      { day: 'Wed', adherence: 92 },
      { day: 'Thu', adherence: 100 },
      { day: 'Fri', adherence: 88 },
      { day: 'Sat', adherence: 95 },
      { day: 'Sun', adherence: rate },
    ],
    weeklyTrend: [
      { week: 'Week 1', rate: 90 },
      { week: 'Week 2', rate: 94 },
      { week: 'Week 3', rate: 92 },
    ],
    medicationSpecific: userMedications.map((m) => ({
      medicationId: m._id,
      name: m.customMedicationName || 'Medication',
      adherenceRate: 95,
    })),
  });
});

// GET /api/tracking/medication-history/:userId
router.get('/medication-history/:userId', (req, res) => {
  const logs = medicationLogs.filter((l) => l.userId === req.params.userId);
  res.json(logs);
});

// GET /api/tracking/missed-doses/:userId
router.get('/missed-doses/:userId', (req, res) => {
  const missed = medicationSchedules.filter((s) => s.userId === req.params.userId && s.status === 'missed');
  res.json(missed);
});

// POST /api/tracking/export/:userId
router.post('/export/:userId', (req, res) => {
  const { format } = req.body;
  res.json({
    downloadUrl: `/exports/provider_adherence_report_${req.params.userId}.${format || 'pdf'}`,
    generatedAt: new Date().toISOString(),
    format: format || 'pdf',
  });
});

export default router;
