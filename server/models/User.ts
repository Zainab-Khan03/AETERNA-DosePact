// server/models/User.ts
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  profileImage?: string;
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
  stomachConditions: string[];
  physicianName?: string;
  physicianPhone?: string;
  onboardingCompleted: boolean;
}

// In-memory user store (replace with database in production)
export class UserStore {
  private static instance: UserStore;
  private users: Map<string, IUser> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  private constructor() {
    // Seed with initial demo user
    const demoUser: IUser = {
      id: 'user_demo_001',
      email: 'zainabkhan21033@gmail.com',
      passwordHash: bcrypt.hashSync('Demo@123', 10),
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
      stomachConditions: ['Acid Reflux / GERD', 'Sensitive Gastric Mucosa'],
      physicianName: 'Dr. Marcus Vance, M.D.',
      physicianPhone: '+15559981244',
      onboardingCompleted: true,
    };

    this.users.set(demoUser.id, demoUser);
    this.emailIndex.set(demoUser.email, demoUser.id);
  }

  public static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Check if email already exists
    if (this.emailIndex.has(userData.email)) {
      throw new Error('Email already registered');
    }

    const user: IUser = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, user);
    this.emailIndex.set(userData.email, id);

    return user;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findUserById(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.emailIndex.delete(user.email);
    return true;
  }

  async getUserData(id: string): Promise<any> {
    const user = this.users.get(id);
    if (!user) return null;

    // Return user data without sensitive fields
    const { passwordHash, emailVerificationToken, resetPasswordToken, resetPasswordExpiry, ...safeData } = user;
    return safeData;
  }

  async verifyPassword(email: string, password: string): Promise<IUser | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const userStore = UserStore.getInstance();