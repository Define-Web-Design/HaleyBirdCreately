import express, { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import storage from '../storage';
import { authRateLimiter } from '../middleware/security';
import { requireAuth } from '../middleware/auth';
import { insertUserSchema } from '../../shared/schema';
import { z } from 'zod';

const router = express.Router();

// Create auth service
const authService = new AuthService(storage);

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// ===== Authentication Routes =====

// Route to register a new user
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid registration data', 
        errors: validation.error.format() 
      });
    }

    // Get client info
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // Register the user
    const result = await authService.register(validation.data);
    
    // If registration was successful and we have a session object
    if (result.success && result.user && result.token && req.session) {
      // Store user info in session
      req.session.userId = result.user.id;
      req.session.username = result.user.username;
      req.session.role = result.user.role;
    }

    // Return response (success or error message)
    return res.status(result.success ? 201 : 400).json({
      success: result.success,
      message: result.message || (result.success ? 'Registration successful' : 'Registration failed'),
      user: result.user ? {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role
      } : undefined,
      token: result.token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during registration' });
  }
});

// Route to login user
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid login data', 
        errors: validation.error.format() 
      });
    }

    // Get client info
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // Log the user in
    const result = await authService.login(
      validation.data.username, 
      validation.data.password,
      ipAddress,
      userAgent
    );

    // If login was successful and we have a session object
    if (result.success && result.user && result.token && req.session) {
      // Store user info in session
      req.session.userId = result.user.id;
      req.session.username = result.user.username;
      req.session.role = result.user.role;
    }

    // Return response (success or error message)
    return res.status(result.success ? 200 : 401).json({
      success: result.success,
      message: result.message || (result.success ? 'Login successful' : 'Login failed'),
      user: result.user ? {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role
      } : undefined,
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during login' });
  }
});

// Route to logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header or session
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.session && req.session.token) {
      token = req.session.token;
    }

    // If we have a token, invalidate it
    let logoutSuccess = false;
    if (token) {
      logoutSuccess = await authService.logout(token);
    }

    // If we have a session, destroy it
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'An unexpected error occurred during logout' });
  }
});

// Route to check user authentication status
router.get('/me', requireAuth, (req: Request, res: Response) => {
  // If we got past requireAuth, user is authenticated
  return res.status(200).json({
    success: true,
    user: req.user ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      role: req.user.role
    } : null
  });
});

export default router;