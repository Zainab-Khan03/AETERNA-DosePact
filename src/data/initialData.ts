import { Medication, ScheduleSlot, UserProfile, DoseLog } from '../types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Omeprazole',
    dosage: '20 mg',
    category: 'prescription',
    instructions: 'Take 30 minutes before first meal of the day with water.',
    foodRequirement: 'empty_stomach',
    giRisk: 'low',
    color: '#00CED1', // Aqua
    shape: 'capsule',
    sideEffects: ['Headache', 'Mild stomach cramps'],
    stockCount: 28,
  },
  {
    id: 'med-2',
    name: 'Ibuprofen',
    dosage: '400 mg',
    category: 'over-the-counter',
    instructions: 'MUST be taken with food or milk to protect stomach lining.',
    foodRequirement: 'with_food',
    giRisk: 'high',
    color: '#E0A96D', // Warm amber
    shape: 'tablet',
    sideEffects: ['Stomach irritation', 'Heartburn', 'Acid reflux'],
    stockCount: 15,
  },
  {
    id: 'med-3',
    name: 'Metformin HCl',
    dosage: '500 mg',
    category: 'prescription',
    instructions: 'Take with evening meal to minimize stomach upset.',
    foodRequirement: 'with_food',
    giRisk: 'moderate',
    color: '#40E0D0', // Bright aqua
    shape: 'tablet',
    sideEffects: ['Nausea', 'Abdominal bloating'],
    stockCount: 60,
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 + K2',
    dosage: '2000 IU',
    category: 'supplement',
    instructions: 'Take with fat-containing meal for optimal absorption.',
    foodRequirement: 'with_food',
    giRisk: 'low',
    color: '#7FFFD4', // Light aquamarine
    shape: 'softgel',
    sideEffects: ['None reported'],
    stockCount: 90,
  },
  {
    id: 'med-5',
    name: 'Aspirin (Buffered)',
    dosage: '81 mg',
    category: 'over-the-counter',
    instructions: 'Take with food or a full glass of water. Avoid taking on empty stomach.',
    foodRequirement: 'with_food',
    giRisk: 'high',
    color: '#D27D2D', // Cinnamon brown
    shape: 'tablet',
    sideEffects: ['Gastric mucosal erosion', 'Stomach discomfort'],
    stockCount: 45,
  }
];

export const INITIAL_SCHEDULES: ScheduleSlot[] = [
  {
    id: 'sched-1',
    time: '08:00',
    label: 'Morning Dose',
    medicationIds: ['med-1', 'med-4'],
    recurringDays: [0, 1, 2, 3, 4, 5, 6],
    isEnabled: true,
    notes: 'Take Omeprazole 30 mins before breakfast, Vitamin D3 with breakfast.',
  },
  {
    id: 'sched-2',
    time: '13:00',
    label: 'Midday Dose',
    medicationIds: ['med-2'],
    recurringDays: [1, 2, 3, 4, 5],
    isEnabled: true,
    notes: 'Take Ibuprofen after lunch only if experiencing joint pain.',
  },
  {
    id: 'sched-3',
    time: '20:00',
    label: 'Evening Dose',
    medicationIds: ['med-3', 'med-5'],
    recurringDays: [0, 1, 2, 3, 4, 5, 6],
    isEnabled: true,
    notes: 'Take Metformin & Aspirin after dinner with ample liquid.',
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Eleanor Vance',
  age: 48,
  stomachConditions: ['Acid Reflux / GERD', 'Sensitive Gastric Mucosa'],
  physicianName: 'Dr. Marcus Vance, M.D.',
  emergencyContact: '+1 (555) 392-8811',
  onboardingCompleted: true,
};

export const INITIAL_LOGS: DoseLog[] = [
  {
    id: 'log-101',
    scheduleId: 'sched-1',
    scheduleLabel: 'Morning Dose',
    scheduledTime: '08:00',
    date: '2026-07-26',
    medicationsTaken: [
      { medicationId: 'med-1', name: 'Omeprazole', dosage: '20 mg' },
      { medicationId: 'med-4', name: 'Vitamin D3 + K2', dosage: '2000 IU' }
    ],
    takenAt: '2026-07-26T08:04:12.000Z',
    status: 'taken',
    photoVerified: true,
    exifTimestamp: '2026-07-26T08:04:10.000Z',
    verificationDetails: {
      pillsDetected: true,
      handDetected: true,
      confidence: 0.98,
      notes: 'Verified 2 capsules in palm with matching timestamp.'
    }
  },
  {
    id: 'log-102',
    scheduleId: 'sched-2',
    scheduleLabel: 'Midday Dose',
    scheduledTime: '13:00',
    date: '2026-07-26',
    medicationsTaken: [
      { medicationId: 'med-2', name: 'Ibuprofen', dosage: '400 mg' }
    ],
    takenAt: '2026-07-26T13:12:00.000Z',
    status: 'taken',
    photoVerified: true,
    exifTimestamp: '2026-07-26T13:11:45.000Z',
    verificationDetails: {
      pillsDetected: true,
      handDetected: true,
      confidence: 0.95,
      notes: 'Tablet confirmed in hand with food requirement note.'
    }
  },
  {
    id: 'log-103',
    scheduleId: 'sched-3',
    scheduleLabel: 'Evening Dose',
    scheduledTime: '20:00',
    date: '2026-07-26',
    medicationsTaken: [
      { medicationId: 'med-3', name: 'Metformin HCl', dosage: '500 mg' },
      { medicationId: 'med-5', name: 'Aspirin (Buffered)', dosage: '81 mg' }
    ],
    takenAt: '2026-07-26T20:02:10.000Z',
    status: 'taken',
    photoVerified: true,
    exifTimestamp: '2026-07-26T20:02:00.000Z',
    verificationDetails: {
      pillsDetected: true,
      handDetected: true,
      confidence: 0.97,
      notes: 'Photo verified.'
    }
  }
];
