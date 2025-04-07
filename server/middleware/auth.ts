import { Request, Response, NextFunction } from 'express';
import { ServiceRegistry } from '../services/registry';
import { AuthService } from '../services/auth';

// Extend Express Request type to include user information 
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
      token?: string;
    }
    // We don't need to extend session here as it's already defined by express-session
  }
}

/**
 * Authentication middleware to verify JWT tokens and session-based authentication
 */
export const authenticate = (required: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Development mode bypass - allows authentication in development
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        // Create a development user if in development mode
        req.user = {
          userId: 1,
          username: 'dev_user',
          role: 'admin'
        };
        req.token = 'dev-token';
        return next();
      }
      
      // Get the AuthService from the ServiceRegistry
      const authService = ServiceRegistry.getInstance().getService<AuthService>('auth');
      
      // Check Authorization header for JWT token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;
      
      // If token exists, verify it
      if (token) {
        const payload = authService.verifyToken(token);
        if (payload) {
          req.user = {
            userId: payload.userId,
            username: payload.username,
            role: payload.role
          };
          req.token = token;
          return next();
        }
      }
      
      // If no token or invalid token, check for session-based authentication
      if (req.session && req.session.userId) {
        req.user = {
          userId: req.session.userId,
          username: req.session.username || 'user',
          role: req.session.role || 'user'
        };
        return next();
      }
      
      // If authentication is required and no valid auth method was found
      if (required) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // If authentication is optional, continue
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      if (required) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed' 
        });
      }
      next();
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists and has a role
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized: User role not found' 
        });
      }
      
      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized: Insufficient permissions' 
        });
      }
      
      // Role check passed, continue
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(403).json({ 
        success: false, 
        message: 'Authorization failed' 
      });
    }
  };
};