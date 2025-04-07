import { Request, Response, NextFunction } from 'express';
import { ServiceRegistry } from '../services/registry';
import { AuthService } from '../services/auth';

// Extend Express Request type to include user information 
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
          id: 1,
          userId: 1, // For backward compatibility
          username: 'dev_user',
          email: 'dev@example.com',
          displayName: 'Development User',
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
          // Map payload to the user object expected by the client
          req.user = {
            id: payload.userId,
            userId: payload.userId, // For backward compatibility
            username: payload.username,
            role: payload.role
          };
          req.token = token;
          return next();
        }
      }

      // If no token or invalid token, check for session-based authentication
      if (req.session && req.session.userId) {
        // Get user from session
        req.user = {
          id: req.session.userId,
          userId: req.session.userId, // For backward compatibility
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