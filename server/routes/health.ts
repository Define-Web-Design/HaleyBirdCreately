import { Router } from 'express';
import storage from '../storage';

const router = Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint for deployment verification
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    // Check database connection
    let dbStatus = 'unknown';
    try {
      const dbCheck = storage.testConnection?.();
      dbStatus = dbCheck ? 'connected' : 'disconnected';
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Health check - DB error:', dbError);
    }

    // Return system status
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

export default router;