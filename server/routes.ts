import express from 'express';
import authRoutes from './routes/auth';
import snippetRoutes from './routes/snippet-routes';
import healthRoutes from './routes/health';
import googleDocsRoutes from './routes/google-docs';
import serviceHealthRoutes from './routes/service-health';
import aiRoutes from './routes/aiRoutes';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { storage } from './storage';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Middleware to verify JWT tokens
const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // Continue without user info
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    // Continue without user info instead of returning 401
    next();
  }
};

// Apply token verification middleware to all routes
router.use(verifyToken);

// Register a new user
router.post('/auth/register', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(30),
      email: z.string().email(),
      password: z.string().min(6)
    });

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: validationResult.error.format()
      });
    }

    const { username, email, password } = validationResult.data;

    const user = await storage.registerUser(username, email, password);

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);

    if ((error as any).code === '23505') { // PostgreSQL unique constraint violation
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string()
    });

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid credentials',
        details: validationResult.error.format()
      });
    }

    const { email, password } = validationResult.data;

    const user = await storage.loginUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Get current user
router.get('/auth/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await storage.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

// Use snippet routes
router.use('/api/snippets', snippetRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/google-docs', googleDocsRoutes);
router.use('/api/service-health', serviceHealthRoutes);
router.use('/api/ai', aiRoutes);

export default router;