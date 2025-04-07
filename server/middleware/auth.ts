import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { StorageInterface } from '../storage';
import { ServiceRegistry } from '../services/registry';

// Define AuthenticatedRequest interface for type safety that's compatible with Express namespace
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number;
    email?: string;
    username?: string;
    displayName?: string;
    role?: string;
    userId?: number; // For backward compatibility
  };
  token?: string;
}

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        userId?: number; // For backward compatibility
        username?: string;
        email?: string;
        displayName?: string;
        role?: string;
      };
      token?: string;
    }
    // We don't need to extend session here as it's already defined by express-session
  }
}


/**
 * Factory function to create middleware for authenticating users
 * This approach allows the middleware to be more flexible with parameter handling
 */
export const authenticate = (options?: { bypassAuth?: boolean }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Development bypass for easier testing (only if explicitly requested or configured via environment)
    const bypassAuth = options?.bypassAuth || process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';
    
    if (bypassAuth) {
      console.log('Authentication bypassed in development mode');
      // Set mock user for development
      req.user = {
        id: 1,
        email: 'dev@example.com',
        username: 'devuser',
        role: 'admin'
      };
      return next();
    }
    
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string | number;
        email?: string;
        username?: string;
        role?: string;
      };

      // Add the user info to the request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role
      };

      // If we need to validate the user exists in storage
      try {
        const storage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
        if (storage) {
          const user = await storage.getUserById(String(decoded.id)); // Convert to string for compatibility
          if (!user) {
            return res.status(401).json({ error: 'User not found' });
          }
        }
      } catch (error) {
        console.error('User validation error:', error);
        // Continue anyway for development purposes
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};