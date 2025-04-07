import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { StorageInterface } from '../storage';
import { ServiceRegistry } from '../services/registry';

// Define AuthenticatedRequest interface for type safety
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// Extend Express Request type to include user information (Keeping this from original)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userId?: number; // For backward compatibility
        username: string;
        email?: string;
        displayName?: string;
        role: string;
      };
      token?: string;
    }
    // We don't need to extend session here as it's already defined by express-session
  }
}


/**
 * Middleware to verify JWT authentication token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role?: string;
    };

    // Add the user info to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // If we need to validate the user exists in storage
    const storage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    if (storage) {
      const user = await storage.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};