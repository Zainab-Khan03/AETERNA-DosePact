// server/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.isAuthenticated) {
    // Update last activity
    req.session.lastActivity = new Date().toISOString();
    return next();
  }

  // Check for token in Authorization header (for API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Validate token here (JWT verification)
    // For now, we'll check if it exists in session
    if (req.session?.userId) {
      return next();
    }
  }

  res.status(401).json({
    error: 'Unauthorized',
    message: 'Please log in to access this resource',
    status: 401,
  });
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Allow access but check auth status
  next();
};

// Session cleanup middleware
export const sessionCleanup = (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    // Clean expired sessions (optional - MongoStore handles this)
    next();
  } else {
    next();
  }
};