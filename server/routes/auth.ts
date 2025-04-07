import { Router, Request, Response } from 'express';
import { ServiceRegistry } from '../services/registry';
import { AuthService } from '../services/auth';
import { z } from 'zod';
import { insertUserSchema } from '../../shared/schema';
import { authenticate } from '../middleware/auth';

// Create a new router for auth-related routes
const router = Router();

// Helper to get auth service when needed
const getAuthService = () => {
  return ServiceRegistry.getInstance().getService<AuthService>('auth');
};

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// Register route
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    // Register the user using auth service
    const user = validationResult.data;
    const result = await getAuthService().register(user);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Store user info in session if using session-based auth
    if (req.session) {
      req.session.userId = result.user!.id;
      req.session.username = result.user!.username;
      req.session.role = result.user!.role;
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    // Get client info for security logging
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Authenticate the user
    const { username, password } = validationResult.data;
    const result = await getAuthService().login(username, password, ipAddress, userAgent);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Store user info in session if using session-based auth
    if (req.session) {
      req.session.userId = result.user!.id;
      req.session.username = result.user!.username;
      req.session.role = result.user!.role;
    }

    return res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// Logout route
router.post('/logout', authenticate(false), async (req: Request, res: Response) => {
  try {
    // Get refresh token from request
    const refreshToken = req.body.refreshToken;
    
    // Revoke the refresh token if it exists
    if (refreshToken) {
      await getAuthService().logout(refreshToken);
    }
    
    // Clear session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout'
    });
  }
});

// Refresh token route
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    // Check if refresh token exists in the request
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Try to refresh the token
    const result = await getAuthService().refreshToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    // Update session if it exists
    if (req.session && result.user) {
      req.session.userId = result.user.id;
      req.session.username = result.user.username;
      req.session.role = result.user.role;
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during token refresh'
    });
  }
});

// Get current user info route
router.get('/me', authenticate(), async (req: Request, res: Response) => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Development mode - return mock user
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      return res.json({
        success: true,
        user: {
          id: req.user.userId,
          username: req.user.username,
          email: 'dev@example.com',
          displayName: 'Development User',
          avatar: null,
          role: req.user.role,
          lastLogin: new Date().toISOString()
        }
      });
    }
    
    // Production mode - get user from storage
    const getStorage = () => ServiceRegistry.getInstance().getService<any>('storage');
    const user = await getStorage().getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return user data without sensitive fields
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving user info'
    });
  }
});

export default router;