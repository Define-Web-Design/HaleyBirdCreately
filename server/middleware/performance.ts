/**
 * Performance Monitoring Middleware
 * 
 * This middleware adds performance monitoring capabilities to the application,
 * including request timing, response size tracking, and resource usage metrics.
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import os from 'os';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'performance-monitor' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/performance.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Performance metrics
interface PerformanceMetrics {
  requestsTotal: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  responseTimes: number[];
  cpuUsage: number;
  memoryUsage: number;
  startTime: number;
}

// Initialize metrics
const metrics: PerformanceMetrics = {
  requestsTotal: 0,
  requestsPerMinute: 0,
  avgResponseTime: 0,
  maxResponseTime: 0,
  p95ResponseTime: 0,
  errorRate: 0,
  responseTimes: [],
  cpuUsage: 0,
  memoryUsage: 0,
  startTime: Date.now()
};

// Request counter for calculating requests per minute
let requestCounter = 0;
let lastMinuteTimestamp = Date.now();

// Update requests per minute every 10 seconds
setInterval(() => {
  const now = Date.now();
  const elapsedMinutes = (now - lastMinuteTimestamp) / 60000;
  
  if (elapsedMinutes > 0) {
    metrics.requestsPerMinute = Math.round(requestCounter / elapsedMinutes);
    requestCounter = 0;
    lastMinuteTimestamp = now;
  }
  
  // Update system resource usage
  updateResourceUsage();
  
  // Log metrics to console in development
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Performance metrics update', {
      requestsPerMinute: metrics.requestsPerMinute,
      avgResponseTime: metrics.avgResponseTime.toFixed(2),
      errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
      cpuUsage: `${(metrics.cpuUsage * 100).toFixed(2)}%`,
      memoryUsage: `${(metrics.memoryUsage * 100).toFixed(2)}%`
    });
  }
}, 10000);

/**
 * Update system resource usage metrics
 */
function updateResourceUsage() {
  // CPU usage (average load over number of cores)
  const cpuLoad = os.loadavg()[0] / os.cpus().length;
  metrics.cpuUsage = cpuLoad;
  
  // Memory usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  metrics.memoryUsage = usedMemory / totalMemory;
}

/**
 * Calculate percentile value from an array
 * @param arr Array of numbers
 * @param percentile Percentile to calculate (0-100)
 * @returns Percentile value
 */
function calculatePercentile(arr: number[], percentile: number): number {
  if (arr.length === 0) return 0;
  
  // Sort array
  const sorted = [...arr].sort((a, b) => a - b);
  
  // Calculate index
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[index];
}

/**
 * Update response time metrics
 * @param time Response time in milliseconds
 */
function updateResponseTimeMetrics(time: number) {
  // Add to response times array (limit to last 1000 requests)
  metrics.responseTimes.push(time);
  if (metrics.responseTimes.length > 1000) {
    metrics.responseTimes.shift();
  }
  
  // Update average
  const sum = metrics.responseTimes.reduce((a, b) => a + b, 0);
  metrics.avgResponseTime = sum / metrics.responseTimes.length;
  
  // Update max
  metrics.maxResponseTime = Math.max(metrics.maxResponseTime, time);
  
  // Update p95
  metrics.p95ResponseTime = calculatePercentile(metrics.responseTimes, 95);
}

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record start time
    const startTime = performance.now();
    
    // Increment request counters
    metrics.requestsTotal++;
    requestCounter++;
    
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to capture timing
    res.end = function(this: Response, ...args: any[]) {
      // Calculate response time
      const responseTime = performance.now() - startTime;
      
      // Update metrics
      updateResponseTimeMetrics(responseTime);
      
      // Update error rate
      const isError = res.statusCode >= 400;
      const errorWeight = isError ? 1 : 0;
      const totalRequests = metrics.requestsTotal;
      metrics.errorRate = ((metrics.errorRate * (totalRequests - 1)) + errorWeight) / totalRequests;
      
      // Add response time header
      res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
      
      // Log request details
      if (isError) {
        logger.warn('Request completed with error', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime,
          userAgent: req.headers['user-agent']
        });
      } else if (responseTime > 1000) {
        // Log slow requests
        logger.info('Slow request detected', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          responseTime,
          threshold: 1000
        });
      }
      
      // Call original end method
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

/**
 * Get current performance metrics
 * @returns Performance metrics
 */
export function getPerformanceMetrics() {
  // Calculate uptime
  const uptime = Date.now() - metrics.startTime;
  
  return {
    ...metrics,
    uptime,
    uptimeFormatted: formatUptime(uptime),
    timestamp: new Date().toISOString()
  };
}

/**
 * Format uptime in a human-readable format
 * @param ms Uptime in milliseconds
 * @returns Formatted uptime string
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Web Vitals middleware for tracking frontend performance metrics
 */
export const webVitalsCollector = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip non-web-vitals endpoints
    if (req.path !== '/api/web-vitals') {
      return next();
    }
    
    try {
      const { name, value, id, page } = req.body;
      
      if (!name || value === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Log web vitals metric
      logger.info('Web Vitals metric received', {
        metric: name,
        value,
        id,
        page: page || req.headers.referer,
        userAgent: req.headers['user-agent']
      });
      
      // Send success response
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error processing Web Vitals metric', { error });
      next(error);
    }
  };
};

// Export web-vitals router handler
export const webVitalsRouter = (req: Request, res: Response) => {
  try {
    if (req.method === 'GET') {
      // Return metrics reporting script
      res.setHeader('Content-Type', 'application/javascript');
      res.send(`
        // Web Vitals Reporter
        import {getLCP, getFID, getCLS, getTTFB, getFCP} from 'https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.js';
        
        function sendToAnalytics(metric) {
          // Create beacon data
          const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            page: window.location.pathname,
            ...metric.attribution
          });
          
          // Use navigator.sendBeacon if available
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/web-vitals', body);
          } else {
            // Fallback to fetch
            fetch('/api/web-vitals', {
              method: 'POST',
              body,
              headers: { 'Content-Type': 'application/json' },
              keepalive: true
            });
          }
          
          // Log to console in development
          if (process.env.NODE_ENV !== 'production') {
            console.log('Web Vitals', metric);
          }
        }
        
        // Report all web vitals
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getLCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
        getFCP(sendToAnalytics);
      `);
    } else {
      // POST method - collect metrics
      const { name, value, id, page } = req.body;
      
      if (!name || value === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Log web vitals metric
      logger.info('Web Vitals metric received', {
        metric: name,
        value,
        id,
        page: page || req.headers.referer,
        userAgent: req.headers['user-agent']
      });
      
      // Send success response
      res.status(200).json({ success: true });
    }
  } catch (error) {
    logger.error('Error processing Web Vitals request', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
};