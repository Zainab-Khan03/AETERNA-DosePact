// server/middleware/session.ts
import session from 'express-session';
import MongoStore from 'connect-mongo';

const SESSION_SECRET = process.env.SESSION_SECRET || 'aeterna-dosepact-session-secret-change-me';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax' as const,
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/dosepact',
    collectionName: 'sessions',
    ttl: SESSION_MAX_AGE / 1000, // Convert to seconds
    autoRemove: 'native',
  }),
};

export const sessionMiddleware = session(sessionConfig);

// Extended session data types
declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    isAuthenticated: boolean;
    lastActivity: string;
    deviceInfo?: string;
    preferences?: {
      theme?: string;
      language?: string;
    };
  }
}