
/**
 * Health Check Routes
 * 
 * Simple endpoints for monitoring the application health
 */

import express from 'express';
import { log } from '../utils/logger';

const router = express.Router();

// Basic health check endpoint
router.get('/', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  };
  
  log.info('Health check performed', { 
    requestId: req.requestId,
    ip: req.ip
  });
  
  res.status(200).json(healthData);
});

// Detailed health check with more system information
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cpuUsage: process.cpuUsage()
  };
  
  log.info('Detailed health check performed', { 
    requestId: req.requestId,
    ip: req.ip,
    memoryUsage: healthData.memory
  });
  
  res.status(200).json(healthData);
});

export default router;
