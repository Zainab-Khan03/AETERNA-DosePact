import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { alarmSoundsList, alarmSettings, AlarmSettings } from '../dbStore.js';

const router = Router();

// Set up directory for custom uploaded audio files
const uploadsAudioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
if (!fs.existsSync(uploadsAudioDir)) {
  fs.mkdirSync(uploadsAudioDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsAudioDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `custom-alarm-${uniqueSuffix}${ext}`);
  },
});

const uploadAudio = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files (MP3, WAV, OGG, M4A) are allowed.'));
    }
  },
});

// GET /api/alarm/sounds or /api/alarms/sounds
router.get(['/sounds', '/sounds'], (_req, res) => {
  res.json(alarmSoundsList);
});

// POST /api/alarm/upload-sound or /api/alarms/upload-sound - Upload custom alarm sound
router.post('/upload-sound', (req, res) => {
  uploadAudio.single('audio')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error uploading custom alarm audio file' });
    }

    let fileUrl = '';
    let name = req.body?.name || 'Custom Alarm Sound';

    if (req.file) {
      fileUrl = `/uploads/audio/${req.file.filename}`;
      if (!req.body?.name && req.file.originalname) {
        name = req.file.originalname.replace(/\.[^/.]+$/, '');
      }
    } else if (req.body?.audioBase64) {
      // Fallback base64 upload
      const cleanBase64 = req.body.audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      const filename = `custom-alarm-${Date.now()}.mp3`;
      const filePath = path.join(uploadsAudioDir, filename);
      fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));
      fileUrl = `/uploads/audio/${filename}`;
    } else {
      return res.status(400).json({ error: 'Please select an audio file (MP3, WAV, OGG, M4A) to upload.' });
    }

    const newSound = {
      id: `sound-${Date.now()}`,
      name,
      fileUrl,
      duration: 30,
      isCustom: true,
      uploadedAt: new Date().toISOString(),
    };

    alarmSoundsList.push(newSound);

    res.status(201).json({
      message: 'Custom alarm music uploaded successfully!',
      sound: newSound,
      sounds: alarmSoundsList,
    });
  });
});

// PUT /api/alarm/sound/:soundId/rename
router.put('/sound/:soundId/rename', (req, res) => {
  const { soundId } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Sound name is required' });
  }

  const sound = alarmSoundsList.find((s) => s.id === soundId);
  if (!sound) {
    return res.status(404).json({ error: 'Alarm sound track not found' });
  }

  sound.name = name.trim();
  res.json({
    message: `Alarm sound renamed to "${sound.name}"`,
    updatedSound: sound,
    sounds: alarmSoundsList,
  });
});

// PUT /api/alarm/set-default/:soundId
router.put('/set-default/:soundId', (req, res) => {
  const { soundId } = req.params;
  const sound = alarmSoundsList.find((s) => s.id === soundId);
  if (!sound) {
    return res.status(404).json({ error: 'Alarm sound not found' });
  }

  if (alarmSettings.length > 0) {
    alarmSettings[0].alarmSound = {
      name: sound.name,
      fileUrl: sound.fileUrl,
      duration: sound.duration || 30,
    };
  }

  res.json({
    message: `Default alarm sound updated to "${sound.name}"`,
    selectedSound: sound,
    alarmSettings: alarmSettings[0] || null,
  });
});

// DELETE /api/alarm/sound/:soundId
router.delete('/sound/:soundId', (req, res) => {
  const { soundId } = req.params;
  const idx = alarmSoundsList.findIndex((s) => s.id === soundId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Custom alarm sound not found' });
  }

  const removed = alarmSoundsList.splice(idx, 1)[0];
  res.json({
    message: `Custom alarm sound "${removed.name}" deleted.`,
    removedSound: removed,
    sounds: alarmSoundsList,
  });
});

// POST /api/alarms/settings
router.post('/settings', (req, res) => {
  const { userMedicationId, alarmSound, snoozeEnabled, snoozeDuration, notificationMethod, advanceReminder, persistentAlarm } = req.body;

  const newAlarm: AlarmSettings = {
    _id: `alarm_${Date.now()}`,
    userId: 'user_1',
    userMedicationId: userMedicationId || 'umed_1',
    alarmSound: alarmSound || { name: 'Gentle Wake Bell', fileUrl: '/sounds/gentle-wake.mp3', duration: 15 },
    snoozeEnabled: snoozeEnabled !== false,
    snoozeDuration: snoozeDuration || 5,
    notificationMethod: notificationMethod || ['push', 'audio', 'email'],
    advanceReminder: advanceReminder || { enabled: true, minutesBefore: 15 },
    persistentAlarm: persistentAlarm || { enabled: true, escalationInterval: 5, maxEscalations: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  alarmSettings.push(newAlarm);
  res.status(201).json(newAlarm);
});

// PUT /api/alarms/settings/:alarmId
router.put('/settings/:alarmId', (req, res) => {
  const idx = alarmSettings.findIndex((a) => a._id === req.params.alarmId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Alarm settings not found' });
  }

  alarmSettings[idx] = {
    ...alarmSettings[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json(alarmSettings[idx]);
});

// POST /api/alarms/media/upload
router.post('/media/upload', (req, res) => {
  res.json({
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    type: 'image',
    uploadedAt: new Date().toISOString(),
  });
});

// POST /api/alarms/test/:userId
router.post('/test/:userId', (req, res) => {
  res.json({
    message: `Test alarm notification triggered for user ${req.params.userId}`,
    audioPreviewUrl: '/sounds/gentle-wake.mp3',
    timestamp: new Date().toISOString(),
  });
});

// PUT /api/alarms/:alarmId/silence
router.put('/:alarmId/silence', (req, res) => {
  const { silenceDuration } = req.body;
  res.json({
    message: `Alarm ${req.params.alarmId} silenced for ${silenceDuration || 10} minutes`,
    silencedUntil: new Date(Date.now() + (silenceDuration || 10) * 60000).toISOString(),
  });
});

export default router;
