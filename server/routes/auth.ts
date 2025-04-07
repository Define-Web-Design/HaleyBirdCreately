import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ServiceRegistry } from '../services/registry';
import { StorageInterface } from '../storage';
import { AuthService } from '../services/auth';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Don't initialize services at the module level
// We'll get them when needed in each route handler

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < config.password.minLength) {
      return res.status(400).json({ 
        error: `Password must be at least ${config.password.minLength} characters long` 
      });
    }

    // Get fresh reference to storage service
    let currentStorage;
    try {
      currentStorage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    } catch (error) {
      console.error('Error getting storage service:', error);
      return res.status(500).json({ error: 'Service unavailable, please try again later' });
    }

    if (!currentStorage) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    // Check if user already exists
    const existingUser = await currentStorage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, config.password.saltRounds);
    const userId = await currentStorage.createUser({
      email,
      passwordHash: hashedPassword, // Use the correct property name based on your schema
      username: name || email.split('@')[0], // Fallback to email username part
      displayName: name || null,
      role: 'user'
    });

    if (!userId) {
      throw new Error('Failed to create user');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      { expiresIn: `${config.jwt.accessExpiryMinutes}m` }
    );

    const refreshToken = jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      { expiresIn: `${config.jwt.refreshExpiryDays}d` }
    );

    // Store refresh token in database
    await currentStorage.storeRefreshToken(String(userId), refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email, name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT tokens
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get fresh reference to storage service
    let currentStorage;
    try {
      currentStorage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    } catch (error) {
      console.error('Error getting storage service:', error);
      return res.status(500).json({ error: 'Service unavailable, please try again later' });
    }

    if (!currentStorage) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    // Check if user exists
    const user = await currentStorage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: `${config.jwt.accessExpiryMinutes}m` }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: `${config.jwt.refreshExpiryDays}d` }
    );

    // Store refresh token in database
    await currentStorage.storeRefreshToken(String(user.id), refreshToken);

    res.status(200).json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.displayName || user.username, 
        role: user.role 
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Get fresh reference to storage service
    let currentStorage;
    try {
      currentStorage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    } catch (error) {
      console.error('Error getting storage service:', error);
      return res.status(500).json({ error: 'Service unavailable, please try again later' });
    }

    if (!currentStorage) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as { id: string; email: string };

    // Check if refresh token exists in the database
    const storedToken = await currentStorage.getRefreshToken(decoded.id, refreshToken);
    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get user data to include in the new token
    const user = await currentStorage.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: `${config.jwt.accessExpiryMinutes}m` }
    );

    res.json({
      accessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate refresh token
 * @access Protected
 */
router.post('/logout', authenticate(), async (req: AuthenticatedRequest, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (!userId || !refreshToken) {
      return res.status(400).json({ error: 'User ID and refresh token are required' });
    }

    // Get fresh reference to storage service
    let currentStorage;
    try {
      currentStorage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    } catch (error) {
      console.error('Error getting storage service:', error);
      return res.status(500).json({ error: 'Service unavailable, please try again later' });
    }

    if (!currentStorage) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    // Remove refresh token from database
    await currentStorage.removeRefreshToken(String(userId), refreshToken);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Protected
 */
router.get('/me', authenticate(), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if request has a development token (this is already handled in the auth middleware)
    const authHeader = req.headers.authorization;
    const isDevelopmentToken = authHeader && authHeader.includes('dev-mock-token');
    
    // For development tokens, we've already responded in the middleware
    if (isDevelopmentToken) {
      // The response was already sent in the middleware
      return;
    }

    // Get fresh reference to storage service
    let currentStorage;
    try {
      currentStorage = ServiceRegistry.getInstance().getService<StorageInterface>('storage');
    } catch (error) {
      console.error('Error getting storage service:', error);
      return res.status(500).json({ error: 'Service unavailable, please try again later' });
    }

    if (!currentStorage) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    const user = await currentStorage.getUserById(String(userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send the password hash
    const { passwordHash, ...userInfo } = user;

    res.json(userInfo);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

export default router;