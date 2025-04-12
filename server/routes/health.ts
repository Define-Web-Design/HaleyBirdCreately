
import express from 'express';
import storage from '../storage';

const router = express.Router();

// Basic health check endpoint
router.get('/', async (_req, res) => {
  try {
    // Check database connection
    let dbStatus = 'unknown';
    try {
      const dbCheck = await (storage as any).testConnection();
      dbStatus = dbCheck ? 'connected' : 'disconnected';
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Health check - DB error:', dbError);
    }

    // Return system status
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      version: process.env.npm_package_version || 'unknown'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

export default router;
