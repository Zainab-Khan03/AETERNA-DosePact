// src/dbStore.ts - Remove this file or make it a proper store
// Instead, create a proper database store:

// src/store/dbStore.ts
import { Medication, ScheduleSlot, DoseLog, UserProfile } from './types';
import { INITIAL_MEDICATIONS, INITIAL_SCHEDULES, INITIAL_USER_PROFILE, INITIAL_LOGS } from './data/initialData';

class DatabaseStore {
  private static instance: DatabaseStore;
  
  // Singleton pattern
  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  // Generic CRUD operations
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`dosepact_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`dosepact_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }

  // Specific data accessors
  getMedications(): Medication[] {
    return this.get('meds') || INITIAL_MEDICATIONS;
  }

  setMedications(meds: Medication[]): void {
    this.set('meds', meds);
  }

  getSchedules(): ScheduleSlot[] {
    return this.get('schedules') || INITIAL_SCHEDULES;
  }

  setSchedules(schedules: ScheduleSlot[]): void {
    this.set('schedules', schedules);
  }

  getLogs(): DoseLog[] {
    return this.get('logs') || INITIAL_LOGS;
  }

  setLogs(logs: DoseLog[]): void {
    this.set('logs', logs);
  }

  getProfile(): UserProfile {
    return this.get('profile') || INITIAL_USER_PROFILE;
  }

  setProfile(profile: UserProfile): void {
    this.set('profile', profile);
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem('dosepact_meds');
    localStorage.removeItem('dosepact_schedules');
    localStorage.removeItem('dosepact_logs');
    localStorage.removeItem('dosepact_profile');
    localStorage.removeItem('dosepact_token');
  }
}

export const db = DatabaseStore.getInstance();