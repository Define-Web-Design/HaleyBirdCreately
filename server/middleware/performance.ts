/**
 * Performance Monitoring Middleware
 * 
 * This middleware tracks request performance metrics and system resource usage,
 * providing detailed insights into application performance.
 */

import { Request, Response, NextFunction } from 'express';
import os from 'os';
import winston from 'winston';
import { config } from '../../config/globalConfig';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'performance-middleware' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/performance.log',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
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

// Performance metrics type
export interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  query: Record<string, any>;
  statusCode: number;
  startTime: number;
  endTime: number;
  duration: number;
  timestamp: string;
  userAgent?: string;
  referrer?: string;
  contentLength?: number;
  bytesSent?: number;
  contentType?: string;
  cpu?: {
    system: number;
    user: number;
    percentage: number;
  };
  memory?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers?: number;
    usage: number;
  };
  system?: {
    freemem: number;
    totalmem: number;
    loadavg: number[];
    uptime: number;
  };
  databaseQueries?: {
    count: number;
    duration: number;
  };
  aiCalls?: {
    count: number;
    duration: number;
    tokens: number;
  };
}

// Performance metrics storage
const metricsCache: PerformanceMetrics[] = [];
const maxMetricsCache = 1000; // Maximum number of metrics to keep in memory

// Request ID counter
let requestIdCounter = 1;

// Generate unique request ID
function generateRequestId(): string {
  const timestamp = Date.now();
  const counter = requestIdCounter++;
  return `req-${timestamp}-${counter}`;
}

// Get CPU usage for the current process
function getCpuUsage(): { system: number; user: number; percentage: number } {
  const cpuUsage = process.cpuUsage();
  
  // Convert from microseconds to seconds
  const system = cpuUsage.system / 1000000;
  const user = cpuUsage.user / 1000000;
  
  // Calculate total CPU time across all cores
  const totalCpuTime = os.cpus().reduce((total, cpu) => {
    return total + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
  }, 0);
  
  // Calculate percentage (this is approximate)
  const totalProcessTime = system + user;
  const percentage = (totalProcessTime / totalCpuTime) * 100 * os.cpus().length;
  
  return { system, user, percentage };
}

// Get memory usage for the current process
function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers?: number;
  usage: number;
} {
  const memoryUsage = process.memoryUsage();
  
  return {
    rss: memoryUsage.rss, // Resident Set Size - total memory allocated
    heapTotal: memoryUsage.heapTotal, // V8 heap memory allocated
    heapUsed: memoryUsage.heapUsed, // V8 heap memory used
    external: memoryUsage.external, // Memory used by C++ objects bound to JS
    arrayBuffers: memoryUsage.arrayBuffers, // Memory used by ArrayBuffers and SharedArrayBuffers
    usage: memoryUsage.heapUsed / os.totalmem() * 100, // Percentage of total system memory used
  };
}

// Get system metrics
function getSystemMetrics(): {
  freemem: number;
  totalmem: number;
  loadavg: number[];
  uptime: number;
} {
  return {
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    loadavg: os.loadavg(),
    uptime: os.uptime(),
  };
}

/**
 * Store performance metrics
 * @param metrics Performance metrics
 */
function storeMetrics(metrics: PerformanceMetrics): void {
  // Add to cache
  metricsCache.push(metrics);
  
  // Trim cache if necessary
  if (metricsCache.length > maxMetricsCache) {
    metricsCache.shift(); // Remove oldest entry
  }
  
  // Log metrics
  logger.debug('Performance metrics', { metrics });
  
  // Check for slow requests
  if (metrics.duration > 500) {
    logger.warn('Slow request detected', {
      requestId: metrics.requestId,
      method: metrics.method,
      path: metrics.path,
      duration: metrics.duration,
    });
  }
}

/**
 * Performance monitoring middleware
 * @param options Options for performance monitoring
 * @returns Express middleware
 */
export function performanceMiddleware(options: {
  detailed?: boolean;
  sampleRate?: number;
  pathExclusions?: string[];
} = {}) {
  // Default options
  const mergedOptions = {
    detailed: process.env.NODE_ENV !== 'production', // Detailed metrics in non-production environments
    sampleRate: 1.0, // Sample 100% of requests by default
    pathExclusions: ['/health', '/metrics', '/favicon.ico'],
    ...options,
  };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip based on path exclusions
    if (mergedOptions.pathExclusions.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Sample based on rate
    if (Math.random() > mergedOptions.sampleRate) {
      return next();
    }
    
    // Generate request ID
    const requestId = generateRequestId();
    req.headers['x-request-id'] = requestId;
    
    // Set start time
    const startTime = performance.now();
    
    // Attach metrics to the request for other middleware to use
    const reqWithMetrics = req as Request & {
      metrics?: {
        databaseQueries: { count: number; duration: number };
        aiCalls: { count: number; duration: number; tokens: number };
      };
    };
    
    reqWithMetrics.metrics = {
      databaseQueries: { count: 0, duration: 0 },
      aiCalls: { count: 0, duration: 0, tokens: 0 },
    };
    
    // Track response
    res.on('finish', () => {
      // Calculate duration
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Collect metrics
      const metrics: PerformanceMetrics = {
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        statusCode: res.statusCode,
        startTime,
        endTime,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer,
        contentLength: parseInt(req.headers['content-length'] || '0', 10) || undefined,
        bytesSent: parseInt(res.getHeader('content-length') as string || '0', 10) || undefined,
        contentType: res.getHeader('content-type') as string,
      };
      
      // Add detailed metrics if enabled
      if (mergedOptions.detailed) {
        metrics.cpu = getCpuUsage();
        metrics.memory = getMemoryUsage();
        metrics.system = getSystemMetrics();
        
        // Add database and AI metrics if available
        if (reqWithMetrics.metrics) {
          metrics.databaseQueries = reqWithMetrics.metrics.databaseQueries;
          metrics.aiCalls = reqWithMetrics.metrics.aiCalls;
        }
      }
      
      // Store metrics
      storeMetrics(metrics);
    });
    
    next();
  };
}

/**
 * Get recent performance metrics
 * @param limit Maximum number of metrics to return
 * @returns Array of performance metrics
 */
export function getRecentMetrics(limit: number = 100): PerformanceMetrics[] {
  return metricsCache.slice(-limit);
}

/**
 * Get performance statistics
 * @param timeframe Timeframe in milliseconds (default: last hour)
 * @returns Performance statistics
 */
export function getPerformanceStats(timeframe: number = 60 * 60 * 1000): {
  requestCount: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  tps: number;
  cpuUsage?: number;
  memoryUsage?: number;
} {
  // Calculate cutoff time
  const cutoffTime = Date.now() - timeframe;
  
  // Filter metrics by timeframe
  const recentMetrics = metricsCache.filter(
    metric => new Date(metric.timestamp).getTime() > cutoffTime
  );
  
  if (recentMetrics.length === 0) {
    return {
      requestCount: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      tps: 0,
    };
  }
  
  // Calculate statistics
  const durations = recentMetrics.map(metric => metric.duration);
  durations.sort((a, b) => a - b);
  
  const requestCount = recentMetrics.length;
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  const averageResponseTime = totalDuration / requestCount;
  const maxResponseTime = durations[durations.length - 1];
  const minResponseTime = durations[0];
  
  // Calculate 95th percentile
  const p95Index = Math.ceil(durations.length * 0.95) - 1;
  const p95ResponseTime = durations[p95Index];
  
  // Calculate error rate (responses with status code >= 400)
  const errorCount = recentMetrics.filter(metric => metric.statusCode >= 400).length;
  const errorRate = (errorCount / requestCount) * 100;
  
  // Calculate transactions per second
  const tps = requestCount / (timeframe / 1000);
  
  // Calculate CPU and memory usage if available
  let cpuUsage: number | undefined;
  let memoryUsage: number | undefined;
  
  const metricsWithCpu = recentMetrics.filter(metric => metric.cpu);
  if (metricsWithCpu.length > 0) {
    cpuUsage = metricsWithCpu.reduce((sum, metric) => sum + (metric.cpu?.percentage || 0), 0) / metricsWithCpu.length;
  }
  
  const metricsWithMemory = recentMetrics.filter(metric => metric.memory);
  if (metricsWithMemory.length > 0) {
    memoryUsage = metricsWithMemory.reduce((sum, metric) => sum + (metric.memory?.usage || 0), 0) / metricsWithMemory.length;
  }
  
  return {
    requestCount,
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    p95ResponseTime,
    errorRate,
    tps,
    cpuUsage,
    memoryUsage,
  };
}

/**
 * Performance metrics route handler
 * @param req Express request
 * @param res Express response
 */
export function performanceMetricsHandler(req: Request, res: Response): void {
  // Get query parameters
  const limit = parseInt(req.query.limit as string || '100', 10);
  const timeframe = parseInt(req.query.timeframe as string || '3600000', 10); // Default: 1 hour
  
  // Check if detailed metrics are requested
  const detailed = req.query.detailed === 'true';
  
  if (detailed) {
    // Return recent metrics if detailed view requested
    res.json({
      metrics: getRecentMetrics(limit),
      stats: getPerformanceStats(timeframe),
    });
  } else {
    // Return only stats
    res.json(getPerformanceStats(timeframe));
  }
}

/**
 * Track database query performance
 * @param req Express request
 * @param duration Query duration in milliseconds
 */
export function trackDatabaseQuery(req: Request, duration: number): void {
  const reqWithMetrics = req as Request & {
    metrics?: {
      databaseQueries: { count: number; duration: number };
    };
  };
  
  if (reqWithMetrics.metrics?.databaseQueries) {
    reqWithMetrics.metrics.databaseQueries.count++;
    reqWithMetrics.metrics.databaseQueries.duration += duration;
  }
}

/**
 * Track AI API call performance
 * @param req Express request
 * @param duration Call duration in milliseconds
 * @param tokens Number of tokens used
 */
export function trackAiApiCall(req: Request, duration: number, tokens: number = 0): void {
  const reqWithMetrics = req as Request & {
    metrics?: {
      aiCalls: { count: number; duration: number; tokens: number };
    };
  };
  
  if (reqWithMetrics.metrics?.aiCalls) {
    reqWithMetrics.metrics.aiCalls.count++;
    reqWithMetrics.metrics.aiCalls.duration += duration;
    reqWithMetrics.metrics.aiCalls.tokens += tokens;
  }
}

// Register metrics endpoint if enabled
if (config.getConfig().monitoring.enabled) {
  logger.info('Performance monitoring initialized with metrics endpoint /api/performance/metrics');
}