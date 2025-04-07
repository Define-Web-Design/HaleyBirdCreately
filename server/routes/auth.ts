import { Router } from 'express';
import { ServiceRegistry } from '../services/registry';
import { AuthService } from '../services/auth';

const router = Router();
const services = ServiceRegistry.getInstance();
const authService = services.getService<AuthService>('auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const result = await authService.login(username, password, req.ip, req.headers['user-agent']);
    
    if (result.success) {
      // Set authentication in session
      if (req.session) {
        req.session.userId = result.user!.id;
        req.session.username = result.user!.username;
        req.session.role = result.user!.role;
      }
      
      res.json({
        success: true,
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message || 'Invalid credentials'
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
    }
    
    const result = await authService.register({
      username,
      email,
      password,
      displayName,
      role: 'user'
    });
    
    if (result.success) {
      // Set authentication in session
      if (req.session) {
        req.session.userId = result.user!.id;
        req.session.username = result.user!.username;
        req.session.role = result.user!.role;
      }
      
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Registration failed'
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration error'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    if (result.success) {
      res.json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message || 'Invalid refresh token'
      });
    }
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh error'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    const refreshToken = req.body.refreshToken;
    
    // Clear session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    // Invalidate tokens
    if (token) {
      await authService.logout(token, refreshToken);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout error'
    });
  }
});

// Get current authenticated user
router.get('/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    res.json({
      success: true,
      user: req.user
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve user data'
    });
  }
});

export default router;
