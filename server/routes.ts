import express from 'express';
import { ServiceRegistry } from './services/registry';
import storage from './storage';
import snippetRoutes from './routes/snippet-routes';

const router = express.Router();

// Get server status
router.get('/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    const existingUser = await storage.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Get the auth service from registry
    const authService = ServiceRegistry.getInstance().getService('authService');
    if (!authService) {
      return res.status(500).json({ error: 'Auth service not available' });
    }
    
    // Register the user
    const user = await authService.registerUser(username, email, password);
    
    res.status(201).json({ user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get the auth service from registry
    const authService = ServiceRegistry.getInstance().getService('authService');
    if (!authService) {
      return res.status(500).json({ error: 'Auth service not available' });
    }
    
    // Login the user
    const result = await authService.loginUser(email, password);
    
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected route example
router.get('/user/profile', async (req, res) => {
  try {
    // This would normally use middleware to verify the token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get the auth service from registry
    const authService = ServiceRegistry.getInstance().getService('authService');
    if (!authService) {
      return res.status(500).json({ error: 'Auth service not available' });
    }
    
    // Verify the token
    const decoded = authService.verifyToken(token);
    
    // Get the user
    const user = await storage.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
});

// Register code snippet routes
router.use('/snippets', snippetRoutes);

export default router;