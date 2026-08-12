// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userStore } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aeterna-dosepact-jwt-secret-change-me';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check session first
    if (req.session?.userId) {
      const user = await userStore.findUserById(req.session.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
        // Update session last activity
        req.session.lastActivity = new Date().toISOString();
        return next();
      }
    }

    // Check JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in to access this resource',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    const user = await userStore.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    req.user = user;
    req.userId = user.id;
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
    req.session.email = user.email;
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Try to authenticate but don't fail if not authenticated
    if (req.session?.userId) {
      const user = await userStore.findUserById(req.session.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    // Check JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await userStore.findUserById(decoded.userId);
        if (user) {
          req.user = user;
          req.userId = user.id;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Helper to get user-specific data
export const getUserScopedData = async (userId: string, dataType: 'medications' | 'schedules' | 'logs') => {
  // This function ensures users only access their own data
  // Implement with your data store
  return { userId, dataType };
};