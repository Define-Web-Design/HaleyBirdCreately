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
    // Only bypass auth if explicitly configured or development mode is active
    const bypassAuth = options?.bypassAuth || process.env.BYPASS_AUTH === 'true' || process.env.NODE_ENV !== 'production';

    if (bypassAuth) {
      console.log('Authentication bypassed due to explicit configuration');

      // Check if the request has a dev-mock-token in the authorization header
      const authHeader = req.headers.authorization;
      const isDevelopmentToken = authHeader && authHeader.includes('dev-mock-token');

      // Set mock user for testing
      req.user = {
        id: 1,
        email: 'dev@example.com',
        username: 'devuser',
        displayName: 'Development User',
        role: 'admin'
      };

      // For the /api/auth/me endpoint specifically, return more detailed user object
      if (req.path === '/me') {
        res.json({
          success: true,
          user: {
            id: 1,
            email: 'dev@example.com',
            username: 'devuser',
            displayName: 'Development User',
            role: 'admin',
            avatar: null,
            createdAt: new Date().toISOString()
          }
        });
        return; // Stop execution here
      }

      return next();
    }

    // Check for Replit authentication headers
    const replitUserId = req.headers['x-replit-user-id'];
    const replitUserName = req.headers['x-replit-user-name'];
    const replitUserRoles = req.headers['x-replit-user-roles'];

    if (replitUserId) {
      // If Replit authentication headers are present, use them
      // Extract single values from potentially array-typed headers
      const userId = String(Array.isArray(replitUserId) ? replitUserId[0] : replitUserId);
      const userName = String(Array.isArray(replitUserName) ? replitUserName[0] : replitUserName || 'replit-user');
      const userRole = String(Array.isArray(replitUserRoles) ? replitUserRoles[0] : replitUserRoles || 'user');

      req.user = {
        id: userId,
        username: userName,
        role: userRole
      };
      return next();
    }

    // JWT Authentication (replaced with edited code's functionality)
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret) as {
        id: string | number;
        email?: string;
        username?: string;
        role?: string;
      };
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
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
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Added for backward compatibility as per edited code
export const checkRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === role) {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied: insufficient permissions' });
    }
  };
};

export default { authenticate, requireAdmin, checkRole };