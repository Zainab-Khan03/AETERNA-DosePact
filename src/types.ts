export type MedicationCategory = 'prescription' | 'over-the-counter' | 'supplement';

export type GIRiskLevel = 'low' | 'moderate' | 'high';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  category: MedicationCategory;
  instructions: string; // e.g. "Take with full glass of water after food"
  foodRequirement: 'with_food' | 'empty_stomach' | 'no_restriction';
  giRisk: GIRiskLevel;
  color: string; // hex or tailwind class for badge
  shape: 'tablet' | 'capsule' | 'liquid' | 'chewable' | 'drop' | 'softgel';
  sideEffects?: string[];
  stockCount?: number;
}

export interface ScheduleSlot {
  id: string;
  time: string; // "HH:MM" e.g. "08:00"
  label: string; // e.g. "Morning Dose"
  medicationIds: string[];
  recurringDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  isEnabled: boolean;
  notes?: string;
}

export type DoseStatus = 'taken' | 'missed' | 'snoozed' | 'pending';

export interface DoseLog {
  id: string;
  scheduleId: string;
  scheduleLabel: string;
  scheduledTime: string; // ISO date string or HH:MM
  date: string; // YYYY-MM-DD
  medicationsTaken: {
    medicationId: string;
    name: string;
    dosage: string;
  }[];
  takenAt: string; // ISO string timestamp
  status: DoseStatus;
  photoUrl?: string;
  photoVerified: boolean;
  exifTimestamp?: string;
  verificationDetails?: {
    pillsDetected: boolean;
    handDetected: boolean;
    confidence: number;
    notes: string;
  };
}

export interface InteractionWarning {
  id: string;
  medications: string[];
  severity: 'mild' | 'moderate' | 'severe';
  title: string;
  stomachGIImpact: string;
  recommendation: string;
  details: string;
}

export interface AlarmState {
  active: boolean;
  scheduleSlot?: ScheduleSlot;
  medications?: Medication[];
  startedAt?: string;
  escalationLevel: 1 | 2 | 3; // 1 = mild, 2 = urgent, 3 = critical
  snoozeCount: number;
  maxSnoozes: number;
  isRinging: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  phoneNumber?: string;
  age: number;
  stomachConditions: string[]; // e.g. ["Acid Reflux / GERD", "Gastritis", "Sensitive Stomach"]
  physicianName?: string;
  emergencyContact?: string;
  onboardingCompleted: boolean;
}

export interface AdherenceStats {
  totalScheduled: number;
  takenCount: number;
  missedCount: number;
  adherencePercentage: number;
  currentStreak: number;
  bestStreak: number;
  dailyBreakdown: {
    date: string;
    dayName: string;
    taken: number;
    scheduled: number;
    percentage: number;
  }[];
}
