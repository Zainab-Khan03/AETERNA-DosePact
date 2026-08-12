// Backend Data Store & Schemas for AETERNA DosePact Medication Adherence Hub

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
}

export interface UserMedication {
  _id: string;
  userId: string;
  globalMedicationId?: string;
  customMedicationName?: string;
  customDosage?: string;
  prescribingDoctor?: {
    name: string;
    phoneNumber: string;
  };
  pharmacyInfo?: {
    name: string;
    rxNumber: string;
    phoneNumber: string;
  };
  frequency: {
    type: string;
    interval: number;
    daysOfWeek: number[];
    startDate: string;
    endDate?: string;
    times: Array<{
      time: string;
      dosage: string;
      quantity: number;
      withFood: boolean;
    }>;
  };
  instructions?: string;
  refillInfo?: {
    totalRefills: number;
    remainingRefills: number;
    lastRefillDate: string;
    pillsRemaining: number;
    lowPillsThreshold: number;
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
  status: 'pending' | 'taken' | 'missed' | 'skipped' | 'snoozed';
  actualTakenTime?: string;
  verificationPhoto?: {
    url: string;
    uploadedAt: string;
    verified: boolean;
  };
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
  photoVerificationMethod?: string;
  sideEffectsExperienced?: string[];
  notes?: string;
  adherenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomAlarmSound {
  id: string;
  name: string;
  fileUrl: string;
  duration: number;
  isCustom: boolean;
  uploadedAt: string;
}

// In-Memory Database Collections
export const users: User[] = [
  {
    _id: 'user_1',
    email: 'zainabkhan21033@gmail.com',
    passwordHash: '$2b$10$abcdef1234567890demo',
    firstName: 'Eleanor',
    lastName: 'Vance',
    dateOfBirth: '1988-04-12',
    phoneNumber: '+15553928811',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      notificationEnabled: true,
    },
    emergencyContact: {
      name: 'Dr. Arthur Vance',
      phoneNumber: '+15559981244',
      relationship: 'Primary Care Physician',
    },
  },
];

export const globalMedications: MedicationGlobal[] = [
  {
    _id: 'med_101',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nurofen'],
    manufacturer: 'Pfizer Consumer Healthcare',
    drugClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    description: 'Relieves pain, fever, and inflammation by blocking COX enzymes.',
    dosageForms: [
      { type: 'Tablet', strengths: ['200mg', '400mg', '600mg', '800mg'] },
      { type: 'Caplet', strengths: ['200mg', '500mg'] },
    ],
    interactions: [
      {
        medicationId: 'med_102',
        severity: 'severe',
        description: 'Increased risk of gastrointestinal ulceration and severe mucosal bleeding.',
        recommendation: 'Avoid concurrent long-term use. Take with misoprostol or PPI if necessary.',
      },
    ],
    sideEffects: [
      { effect: 'Gastric Ulceration', frequency: 'common', severity: 'high' },
      { effect: 'Dyspepsia / Heartburn', frequency: 'very common', severity: 'medium' },
      { effect: 'Nausea', frequency: 'common', severity: 'low' },
    ],
    stomachEffects: {
      risk: 'high',
      description: 'Inhibits protective gastric mucosal prostaglandin synthesis.',
      recommendations: 'MUST be taken with a full meal or milk. Never take on an empty stomach.',
    },
    foodInteractions: [
      {
        foodType: 'Alcohol',
        description: 'Compounds gastric mucosal irritation and stomach bleeding risks.',
        recommendation: 'Strictly avoid ethanol while taking regular NSAIDs.',
      },
    ],
  },
  {
    _id: 'med_102',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    brandNames: ['Bayer', 'Bufferin', 'Ecotrin'],
    manufacturer: 'Bayer AG',
    drugClass: 'Antiplatelet / NSAID',
    description: 'Blood thinner and pain reliever commonly used for cardiovascular protection.',
    dosageForms: [
      { type: 'Enteric Coated Tablet', strengths: ['81mg', '325mg'] },
    ],
    interactions: [
      {
        medicationId: 'med_101',
        severity: 'severe',
        description: 'Compounded risk of stomach erosion.',
        recommendation: 'Separate doses by at least 8 hours.',
      },
    ],
    sideEffects: [
      { effect: 'Gastric Bleeding', frequency: 'common', severity: 'high' },
    ],
    stomachEffects: {
      risk: 'high',
      description: 'Direct mucosal contact irritation and system-wide prostaglandin suppression.',
      recommendations: 'Take enteric-coated formulations after food with a large glass of water.',
    },
    foodInteractions: [],
  },
  {
    _id: 'med_103',
    genericName: 'Omeprazole',
    brandNames: ['Prilosec', 'Losec'],
    manufacturer: 'AstraZeneca',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    description: 'Decreases the amount of acid produced in the stomach.',
    dosageForms: [
      { type: 'Delayed-Release Capsule', strengths: ['10mg', '20mg', '40mg'] },
    ],
    interactions: [],
    sideEffects: [
      { effect: 'Headache', frequency: 'common', severity: 'low' },
      { effect: 'Abdominal Pain', frequency: 'uncommon', severity: 'low' },
    ],
    stomachEffects: {
      risk: 'low',
      description: 'Protects stomach lining by suppressing H+/K+ ATPase pump.',
      recommendations: 'Take 30-60 minutes before breakfast on an empty stomach.',
    },
    foodInteractions: [
      {
        foodType: 'High Fat Meals',
        description: 'May slightly delay peak absorption speed.',
        recommendation: 'Take prior to meal time.',
      },
    ],
  },
  {
    _id: 'med_104',
    genericName: 'Metformin',
    brandNames: ['Glucophage', 'Fortamet'],
    manufacturer: 'Merck Healthcare',
    drugClass: 'Biguanide Antidiabetic Agent',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    dosageForms: [
      { type: 'Extended-Release Tablet', strengths: ['500mg', '850mg', '1000mg'] },
    ],
    interactions: [],
    sideEffects: [
      { effect: 'Diarrhea / GI Upset', frequency: 'very common', severity: 'medium' },
      { effect: 'Nausea', frequency: 'common', severity: 'low' },
    ],
    stomachEffects: {
      risk: 'moderate',
      description: 'Frequently causes transient nausea, cramping, and loose stools.',
      recommendations: 'Take with evening meal to mitigate gastrointestinal side effects.',
    },
    foodInteractions: [],
  },
];

export const userMedications: UserMedication[] = [
  {
    _id: 'umed_1',
    userId: 'user_1',
    globalMedicationId: 'med_101',
    customMedicationName: 'Ibuprofen',
    customDosage: '400mg',
    prescribingDoctor: {
      name: 'Dr. Arthur Vance',
      phoneNumber: '+15559981244',
    },
    pharmacyInfo: {
      name: 'CVS Pharmacy #4821',
      rxNumber: 'RX-992014',
      phoneNumber: '+15552003000',
    },
    frequency: {
      type: 'daily',
      interval: 1,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-07-01',
      times: [
        { time: '08:00', dosage: '400mg', quantity: 1, withFood: true },
        { time: '20:00', dosage: '400mg', quantity: 1, withFood: true },
      ],
    },
    instructions: 'Take 1 tablet with breakfast and dinner. Do not take on empty stomach.',
    refillInfo: {
      totalRefills: 3,
      remainingRefills: 2,
      lastRefillDate: '2026-07-15',
      pillsRemaining: 24,
      lowPillsThreshold: 10,
    },
    notes: 'Prescribed for post-surgical joint discomfort.',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'umed_2',
    userId: 'user_1',
    globalMedicationId: 'med_103',
    customMedicationName: 'Omeprazole',
    customDosage: '20mg',
    prescribingDoctor: {
      name: 'Dr. Arthur Vance',
      phoneNumber: '+15559981244',
    },
    pharmacyInfo: {
      name: 'CVS Pharmacy #4821',
      rxNumber: 'RX-881204',
      phoneNumber: '+15552003000',
    },
    frequency: {
      type: 'daily',
      interval: 1,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-07-01',
      times: [
        { time: '07:30', dosage: '20mg', quantity: 1, withFood: false },
      ],
    },
    instructions: 'Take 1 capsule 30 minutes before breakfast with full glass of water.',
    refillInfo: {
      totalRefills: 5,
      remainingRefills: 4,
      lastRefillDate: '2026-07-10',
      pillsRemaining: 28,
      lowPillsThreshold: 7,
    },
    notes: 'Stomach protection against NSAID mucosal irritation.',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const medicationSchedules: MedicationSchedule[] = [
  {
    _id: 'sched_1',
    userId: 'user_1',
    userMedicationId: 'umed_2',
    scheduledTime: `${new Date().toISOString().split('T')[0]}T07:30:00.000Z`,
    scheduledTimeString: '07:30',
    dosage: '20mg',
    quantity: 1,
    status: 'taken',
    actualTakenTime: `${new Date().toISOString().split('T')[0]}T07:32:15.000Z`,
    verificationPhoto: {
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      uploadedAt: `${new Date().toISOString().split('T')[0]}T07:32:15.000Z`,
      verified: true,
    },
    notes: 'Taken before meal with water',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'sched_2',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    scheduledTime: `${new Date().toISOString().split('T')[0]}T08:00:00.000Z`,
    scheduledTimeString: '08:00',
    dosage: '400mg',
    quantity: 1,
    status: 'taken',
    actualTakenTime: `${new Date().toISOString().split('T')[0]}T08:14:02.000Z`,
    verificationPhoto: {
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      uploadedAt: `${new Date().toISOString().split('T')[0]}T08:14:02.000Z`,
      verified: true,
    },
    notes: 'Taken after breakfast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'sched_3',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    scheduledTime: `${new Date().toISOString().split('T')[0]}T20:00:00.000Z`,
    scheduledTimeString: '20:00',
    dosage: '400mg',
    quantity: 1,
    status: 'pending',
    notes: 'Requires post-dinner meal verification photo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const alarmSettings: AlarmSettings[] = [
  {
    _id: 'alarm_1',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    alarmSound: {
      name: 'Gentle Chime & Water Waves',
      fileUrl: '/sounds/gentle-wake.mp3',
      duration: 30,
    },
    snoozeEnabled: true,
    snoozeDuration: 5,
    notificationMethod: ['push', 'audio', 'email'],
    advanceReminder: {
      enabled: true,
      minutesBefore: 15,
    },
    persistentAlarm: {
      enabled: true,
      escalationInterval: 5,
      maxEscalations: 3,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const alarmSoundsList: CustomAlarmSound[] = [
  { id: 'sound-1', name: 'Gentle Chime & Water Waves', fileUrl: '/sounds/gentle-wake.mp3', duration: 30, isCustom: false, uploadedAt: new Date().toISOString() },
  { id: 'sound-2', name: 'Classic Alarm Bell', fileUrl: '/sounds/classic-bell.mp3', duration: 25, isCustom: false, uploadedAt: new Date().toISOString() },
  { id: 'sound-3', name: 'Soft Zenith Tone', fileUrl: '/sounds/zenith.mp3', duration: 20, isCustom: false, uploadedAt: new Date().toISOString() },
];

export const medicationLogs: MedicationLog[] = [
  {
    _id: 'log_1',
    userId: 'user_1',
    userMedicationId: 'umed_2',
    scheduleId: 'sched_1',
    date: new Date().toISOString().split('T')[0],
    time: '07:32',
    dosageTaken: '20mg',
    quantityTaken: 1,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    photoVerified: true,
    photoVerificationMethod: 'exif_plus_gemini_vision',
    sideEffectsExperienced: [],
    notes: 'Took Omeprazole on empty stomach.',
    adherenceScore: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'log_2',
    userId: 'user_1',
    userMedicationId: 'umed_1',
    scheduleId: 'sched_2',
    date: new Date().toISOString().split('T')[0],
    time: '08:14',
    dosageTaken: '400mg',
    quantityTaken: 1,
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    photoVerified: true,
    photoVerificationMethod: 'exif_plus_gemini_vision',
    sideEffectsExperienced: [],
    notes: 'Took Ibuprofen post-breakfast.',
    adherenceScore: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const notificationsList: any[] = [];
