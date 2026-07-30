// In-memory data store providing full MongoDB schema structures for Medication Adherence Hub

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  profileImage: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    language: string;
    timezone: string;
    notificationEnabled: boolean;
  };
  emergencyContact: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
}

export interface MedicationGlobal {
  _id: string;
  genericName: string;
  brandNames: string[];
  manufacturer: string;
  drugClass: string;
  description: string;
  dosageForms: Array<{
    type: string;
    strengths: string[];
  }>;
  interactions: Array<{
    medicationId: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  sideEffects: Array<{
    effect: string;
    frequency: string;
    severity: string;
  }>;
  stomachEffects: {
    risk: string;
    description: string;
    recommendations: string;
  };
  foodInteractions: Array<{
    foodType: string;
    description: string;
    recommendation: string;
  }>;
  precautions: string[];
  pregnancyCategory: string;
  lactationCategory: string;
  storageInstructions: string;
  countrySpecificInfo: Array<{
    country: string;
    brandName: string;
    manufacturer: string;
    availability: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserMedication {
  _id: string;
  userId: string;
  medicationId?: string;
  customMedicationName?: string;
  customDosage?: string;
  frequency: {
    type: string; // daily, weekly, monthly, as_needed
    interval: number;
    daysOfWeek: number[]; // 0-6
    specificDates?: string[];
    startDate: string;
    endDate?: string;
    times: Array<{
      time: string; // HH:mm
      dosage: string;
      quantity: number;
      withFood: boolean;
      notes?: string;
    }>;
  };
  prescribedBy?: string;
  prescribedDate?: string;
  refillReminder?: {
    enabled: boolean;
    daysBefore: number;
  };
  currentStock?: {
    quantity: number;
    unit: string;
    lastUpdated: string;
  };
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  _id: string;
  userId: string;
  userMedicationId: string;
  scheduledTime: string;
  scheduledTimeString: string;
  dosage: string;
  quantity: number;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  verificationPhoto?: {
    url: string;
    uploadedAt: string;
    verified: boolean;
  };
  actualTakenTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlarmSettings {
  _id: string;
  userId: string;
  userMedicationId: string;
  alarmSound: {
    name: string;
    fileUrl: string;
    duration: number;
  };
  snoozeEnabled: boolean;
  snoozeDuration: number;
  notificationMethod: string[];
  advanceReminder: {
    enabled: boolean;
    minutesBefore: number;
  };
  persistentAlarm: {
    enabled: boolean;
    escalationInterval: number;
    maxEscalations: number;
  };
  customMedia?: {
    url: string;
    type: string;
    uploadedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLog {
  _id: string;
  userId: string;
  userMedicationId: string;
  scheduleId: string;
  date: string;
  time: string;
  dosageTaken: string;
  quantityTaken: number;
  photoUrl?: string;
  photoVerified: boolean;
  photoVerificationMethod: string;
  sideEffectsExperienced: string[];
  notes?: string;
  adherenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  _id: string;
  userId: string;
  scheduleId: string;
  notificationType: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'read';
  createdAt: string;
}

// Initial Mock Seed Data
export const users: User[] = [
  {
    _id: 'user_1',
    email: 'patient@example.com',
    passwordHash: '$2b$10$e7B...hash', // mock bcrypt
    firstName: 'Eleanor',
    lastName: 'Vance',
    dateOfBirth: '1985-04-12',
    phoneNumber: '+15553928811',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      notificationEnabled: true
    },
    emergencyContact: {
      name: 'Dr. Marcus Vance',
      phoneNumber: '+15553928811',
      relationship: 'Primary Physician & Caregiver'
    }
  }
];

export const globalMedications: MedicationGlobal[] = [
  {
    _id: 'med_101',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nurofen', 'Brufen'],
    manufacturer: 'Pfizer / Generic',
    drugClass: 'NSAID (Nonsteroidal Anti-inflammatory Drug)',
    description: 'Relieves pain, reduces fever, and decreases inflammation.',
    dosageForms: [{ type: 'tablet', strengths: ['200mg', '400mg', '600mg', '800mg'] }],
    interactions: [
      {
        medicationId: 'med_102',
        severity: 'severe',
        description: 'Increased risk of severe gastrointestinal ulceration and renal toxicity when combined with Aspirin.',
        recommendation: 'Separate dosing by 8 hours or consult doctor for gastroprotection.'
      }
    ],
    sideEffects: [
      { effect: 'Dyspepsia / Stomach Upset', frequency: 'common', severity: 'moderate' },
      { effect: 'Gastric Ulceration', frequency: 'uncommon', severity: 'severe' }
    ],
    stomachEffects: {
      risk: 'high',
      description: 'Inhibits protective prostaglandin synthesis in gastric mucosa.',
      recommendations: 'Always take with a meal or full glass of milk.'
    },
    foodInteractions: [
      { foodType: 'Alcohol', description: 'Increases risk of stomach bleeding', recommendation: 'Avoid heavy alcohol use' }
    ],
    precautions: ['History of GI ulcers', 'Renal impairment', 'Asthma'],
    pregnancyCategory: 'C (D in 3rd trimester)',
    lactationCategory: 'Compatible',
    storageInstructions: 'Store at room temperature away from direct moisture.',
    countrySpecificInfo: [
      { country: 'US', brandName: 'Advil', manufacturer: 'Haleon', availability: 'OTC' },
      { country: 'UK', brandName: 'Nurofen', manufacturer: 'Reckitt', availability: 'OTC' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'med_102',
    genericName: 'Aspirin',
    brandNames: ['Bayer', 'Ecotrin', 'Anacin'],
    manufacturer: 'Bayer AG',
    drugClass: 'Antiplatelet / Salicylate NSAID',
    description: 'Inhibits platelet aggregation and reduces risk of cardiac events.',
    dosageForms: [{ type: 'tablet', strengths: ['81mg', '325mg', '500mg'] }],
    interactions: [
      {
        medicationId: 'med_101',
        severity: 'severe',
        description: 'Ibuprofen interferes with irreversible platelet inhibition of low-dose aspirin.',
        recommendation: 'Take aspirin 30 minutes before or 8 hours after ibuprofen.'
      }
    ],
    sideEffects: [
      { effect: 'Gastric Bleeding', frequency: 'common', severity: 'severe' }
    ],
    stomachEffects: {
      risk: 'high',
      description: 'Direct mucosal irritant and anti-prostaglandin agent.',
      recommendations: 'Use enteric-coated tablets and take with food.'
    },
    foodInteractions: [
      { foodType: 'Alcohol', description: 'Heightens mucosal damage', recommendation: 'Limit alcohol intake' }
    ],
    precautions: ['Bleeding disorders', 'Ulcers'],
    pregnancyCategory: 'D',
    lactationCategory: 'Caution',
    storageInstructions: 'Keep dry and tightly sealed.',
    countrySpecificInfo: [
      { country: 'US', brandName: 'Bayer Aspirin', manufacturer: 'Bayer', availability: 'OTC' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'med_103',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Losec', 'Zegerid'],
    manufacturer: 'AstraZeneca / Generic',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    description: 'Decreases the amount of acid produced in the stomach.',
    dosageForms: [{ type: 'capsule', strengths: ['10mg', '20mg', '40mg'] }],
    interactions: [],
    sideEffects: [
      { effect: 'Headache', frequency: 'common', severity: 'mild' },
      { effect: 'Nausea', frequency: 'uncommon', severity: 'mild' }
    ],
    stomachEffects: {
      risk: 'low',
      description: 'Protects stomach lining by suppressing gastric hydrogen-potassium ATPase.',
      recommendations: 'Take 30-60 minutes BEFORE breakfast on an empty stomach.'
    },
    foodInteractions: [],
    precautions: ['Long-term bone density reduction'],
    pregnancyCategory: 'C',
    lactationCategory: 'Compatible',
    storageInstructions: 'Protect from light and moisture.',
    countrySpecificInfo: [
      { country: 'US', brandName: 'Prilosec OTC', manufacturer: 'Procter & Gamble', availability: 'OTC/Rx' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const userMedications: UserMedication[] = [
  {
    _id: 'umed_1',
    userId: 'user_1',
    medicationId: 'med_101',
    customMedicationName: 'Ibuprofen',
    customDosage: '400mg',
    frequency: {
      type: 'daily',
      interval: 1,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-01-01',
      times: [
        { time: '08:00', dosage: '400mg', quantity: 1, withFood: true, notes: 'Take after breakfast' },
        { time: '20:00', dosage: '400mg', quantity: 1, withFood: true, notes: 'Take with dinner' }
      ]
    },
    prescribedBy: 'Dr. Marcus Vance',
    prescribedDate: '2026-01-01',
    refillReminder: { enabled: true, daysBefore: 5 },
    currentStock: { quantity: 45, unit: 'tablets', lastUpdated: new Date().toISOString() },
    notes: 'For severe joint inflammation',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'umed_2',
    userId: 'user_1',
    medicationId: 'med_103',
    customMedicationName: 'Omeprazole',
    customDosage: '20mg',
    frequency: {
      type: 'daily',
      interval: 1,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-01-01',
      times: [
        { time: '07:30', dosage: '20mg', quantity: 1, withFood: false, notes: 'Take on empty stomach before breakfast' }
      ]
    },
    prescribedBy: 'Dr. Marcus Vance',
    prescribedDate: '2026-01-01',
    refillReminder: { enabled: true, daysBefore: 7 },
    currentStock: { quantity: 30, unit: 'capsules', lastUpdated: new Date().toISOString() },
    notes: 'Gastric acid protection',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const medicationSchedules: MedicationSchedule[] = [
  {
    _id: 'sched_1',
    userId: 'user_1',
    userMedicationId: 'umed_2',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T07:30:00.000Z',
    scheduledTimeString: '07:30',
    dosage: '20mg',
    quantity: 1,
    status: 'taken',
    verificationPhoto: {
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      uploadedAt: new Date().toISOString(),
      verified: true
    },
    actualTakenTime: new Date().toISOString(),
    notes: 'Taken on time before breakfast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'sched_2',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T08:00:00.000Z',
    scheduledTimeString: '08:00',
    dosage: '400mg',
    quantity: 1,
    status: 'pending',
    notes: 'Take post-meal with full glass of water',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'sched_3',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T20:00:00.000Z',
    scheduledTimeString: '20:00',
    dosage: '400mg',
    quantity: 1,
    status: 'pending',
    notes: 'Evening dose with dinner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const alarmSettings: AlarmSettings[] = [
  {
    _id: 'alarm_1',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    alarmSound: {
      name: 'Medical Pulse Harmonic',
      fileUrl: '/sounds/medical-pulse.mp3',
      duration: 30
    },
    snoozeEnabled: true,
    snoozeDuration: 5,
    notificationMethod: ['push', 'audio', 'email'],
    advanceReminder: { enabled: true, minutesBefore: 10 },
    persistentAlarm: { enabled: true, escalationInterval: 5, maxEscalations: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const medicationLogs: MedicationLog[] = [
  {
    _id: 'log_1',
    userId: 'user_1',
    userMedicationId: 'umed_2',
    scheduleId: 'sched_1',
    date: new Date().toISOString().split('T')[0],
    time: '07:30',
    dosageTaken: '20mg',
    quantityTaken: 1,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    photoVerified: true,
    photoVerificationMethod: 'exif_plus_gemini_vision',
    sideEffectsExperienced: [],
    notes: 'Verified photo capture',
    adherenceScore: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const alarmSoundsList = [
  { id: 'sound-1', name: 'Gentle Wake Bell', fileUrl: '/sounds/gentle-wake.mp3', duration: 15 },
  { id: 'sound-2', name: 'Medical Chime High Intensity', fileUrl: '/sounds/medical-chime.mp3', duration: 30 },
  { id: 'sound-3', name: 'Urgent Alarm Pulse', fileUrl: '/sounds/urgent-pulse.mp3', duration: 45 },
  { id: 'sound-4', name: 'Soft Harmonic Tone', fileUrl: '/sounds/soft-tone.mp3', duration: 20 }
];

export const notificationsList: NotificationRecord[] = [
  {
    _id: 'notif_1',
    userId: 'user_1',
    scheduleId: 'sched_2',
    notificationType: 'push',
    scheduledTime: new Date().toISOString().split('T')[0] + 'T08:00:00.000Z',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];
