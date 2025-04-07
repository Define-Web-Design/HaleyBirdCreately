import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import storage from '../storage';

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for public routes
  if (req.path.startsWith('/api/public/') || 
      req.path === '/api/theme' || 
      req.path === '/api/auth/login' || 
      req.path === '/api/auth/register' ||
      req.path === '/api/auth/refresh') {
    return next();
  }

  try {
    // Check for JWT in Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'default-jwt-secret';
      
      try {
        const decoded = jwt.verify(token, secret) as any;
        
        // Get the user from the database
        const user = await storage.getUserById(decoded.id);
        
        if (user) {
          // Attach user to the request
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role || 'user'
          };
          return next();
        }
      } catch (tokenError) {
        // Token verification failed, fall back to session check
        console.error('Token verification failed:', tokenError);
      }
    }
    
    // Fall back to session-based authentication
    if (req.session && req.session.userId) {
      const userId = req.session.userId;
      const user = await storage.getUserById(userId);
      
      if (user) {
        // Attach user to the request
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role || 'user'
        };
        return next();
      }
    }
    
    // If no authentication was successful and route requires auth
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error'
    });
  }
};
