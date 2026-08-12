import { Router } from 'express';
import { globalMedications, userMedications, UserMedication } from '../dbStore.js';

const router = Router();

// GET /api/medications (Global database search & filtering)
router.get('/', (req, res) => {
  const { search, drugClass, country, condition } = req.query;
  let results = [...globalMedications];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.genericName.toLowerCase().includes(q) ||
        m.brandNames.some((b) => b.toLowerCase().includes(q))
    );
  }

  if (drugClass && typeof drugClass === 'string') {
    results = results.filter((m) => m.drugClass.toLowerCase().includes(drugClass.toLowerCase()));
  }

  res.json({
    total: results.length,
    page: 1,
    limit: 10,
    medications: results,
  });
});

// GET /api/medications/:id
router.get('/:id', (req, res) => {
  const med = globalMedications.find((m) => m._id === req.params.id);
  if (!med) {
    return res.status(404).json({ error: 'Medication not found' });
  }
  res.json(med);
});

// POST /api/medications/custom
router.post('/custom', (req, res) => {
  const { userId, name, dosage, form, purpose, notes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Medication name is required' });
  }

  const newMed: UserMedication = {
    _id: `umed_${Date.now()}`,
    userId: userId || 'user_1',
    customMedicationName: name,
    customDosage: dosage || '1 tablet',
    frequency: {
      type: 'daily',
      interval: 1,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: new Date().toISOString().split('T')[0],
      times: [{ time: '08:00', dosage: dosage || '1 tablet', quantity: 1, withFood: true }],
    },
    notes: notes || purpose || '',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  userMedications.push(newMed);
  res.status(201).json(newMed);
});

// GET /api/medications/user/:userId
router.get('/user/:userId', (req, res) => {
  const list = userMedications.filter((m) => m.userId === req.params.userId);
  res.json(list);
});

// PUT /api/medications/user/:userMedicationId
router.put('/user/:userMedicationId', (req, res) => {
  const idx = userMedications.findIndex((m) => m._id === req.params.userMedicationId);
  if (idx === -1) {
    return res.status(404).json({ error: 'User medication not found' });
  }

  userMedications[idx] = {
    ...userMedications[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json(userMedications[idx]);
});

// DELETE /api/medications/user/:userMedicationId
router.delete('/user/:userMedicationId', (req, res) => {
  const idx = userMedications.findIndex((m) => m._id === req.params.userMedicationId);
  if (idx === -1) {
    return res.status(404).json({ error: 'User medication not found' });
  }
  userMedications.splice(idx, 1);
  res.json({ message: 'User medication deleted successfully' });
});

export default router;
