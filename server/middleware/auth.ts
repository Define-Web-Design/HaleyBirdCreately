import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import storage from '../storage';
import { AuthService } from '../services/auth';
import { config } from '../config';

// Define types for the JWT payload and augment Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        displayName?: string;
        role: string;
      };
    }
  }
}

// Create auth service for token management
const authService = new AuthService(storage);

// Extract token from request
export function extractToken(req: Request): string | undefined {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  let token: string | undefined = undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } 
  // Check for token in session
  else if (req.session && req.session.token) {
    token = req.session.token;
  }
  
  return token;
}

// Validate JWT token
export function validateToken(token: string): any {
  try {
    // Verify the token using the JWT_SECRET from environment variables
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    // Log the error but don't expose details to response
    console.error('Token validation error:', error);
    return null;
  }
}

// Populate user data from session or token
export function populateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from request
    const token = extractToken(req);
    
    // If token exists, validate it and set user data on request
    if (token) {
      const payload = validateToken(token);
      
      if (payload) {
        // Set user data on the request object
        req.user = {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          displayName: payload.displayName,
          role: payload.role || 'user'
        };
      }
    } 
    // No token, check session
    else if (req.session && req.session.userId) {
      req.user = {
        id: req.session.userId,
        username: req.session.username,
        email: req.session.email || '',
        displayName: req.session.displayName,
        role: req.session.role || 'user'
      };
    }

    next();
  } catch (error) {
    console.error('Error populating user data:', error);
    next();
  }
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  next();
}

// Middleware to require specific roles
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Then check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: insufficient privileges' 
      });
    }
    
    next();
  };
}

// Middleware to require admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}