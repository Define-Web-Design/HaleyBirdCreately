/**
 * Performance Middleware
 * 
 * Middleware for tracking API performance metrics including response times,
 * error rates, and AI-specific metrics.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetricsOptions {
  /** Whether to track detailed metrics (more verbose) */
  detailed?: boolean;
  
  /** Paths to exclude from tracking (e.g. health checks) */
  pathExclusions?: string[];
  
  /** Sampling rate (0-1) to control how many requests are tracked */
  sampleRate?: number;
  
  /** Whether to track AI-specific metrics */
  trackAiCalls?: boolean;
}

/**
 * Map to store ongoing requests for timing purposes
 */
const requestTimings = new Map<string, {
  startTime: number;
  path: string;
  method: string;
}>();

/**
 * In-memory metrics storage
 */
const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  pathMetrics: new Map<string, {
    count: number;
    errors: number;
    totalDuration: number;
    min: number;
    max: number;
  }>(),
  aiMetrics: {
    totalCalls: 0,
    totalErrors: 0,
    providerMetrics: new Map<string, {
      calls: number;
      errors: number;
      totalDuration: number;
    }>()
  }
};

/**
 * Reset all performance metrics
 */
export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.totalErrors = 0;
  metrics.pathMetrics.clear();
  metrics.aiMetrics.totalCalls = 0;
  metrics.aiMetrics.totalErrors = 0;
  metrics.aiMetrics.providerMetrics.clear();
  requestTimings.clear();
}

/**
 * Get current performance metrics
 */
export function getMetrics(): any {
  const pathMetricsObj: Record<string, any> = {};
  metrics.pathMetrics.forEach((value, key) => {
    pathMetricsObj[key] = {
      ...value,
      avgDuration: value.count > 0 ? value.totalDuration / value.count : 0
    };
  });
  
  const providerMetricsObj: Record<string, any> = {};
  metrics.aiMetrics.providerMetrics.forEach((value, key) => {
    providerMetricsObj[key] = {
      ...value,
      avgDuration: value.calls > 0 ? value.totalDuration / value.calls : 0
    };
  });
  
  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRate: metrics.totalRequests > 0 ? metrics.totalErrors / metrics.totalRequests : 0,
    paths: pathMetricsObj,
    ai: {
      totalCalls: metrics.aiMetrics.totalCalls,
      totalErrors: metrics.aiMetrics.totalErrors,
      errorRate: metrics.aiMetrics.totalCalls > 0 
        ? metrics.aiMetrics.totalErrors / metrics.aiMetrics.totalCalls 
        : 0,
      providers: providerMetricsObj
    }
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Update metrics for a completed request
 */
function updateMetrics(
  path: string,
  method: string,
  statusCode: number,
  duration: number,
  isAiRequest: boolean,
  aiProvider?: string
): void {
  // Increment total requests
  metrics.totalRequests++;
  
  // Check if it's an error response
  const isError = statusCode >= 400;
  if (isError) {
    metrics.totalErrors++;
  }
  
  // Update path-specific metrics
  const pathKey = `${method}:${path}`;
  const pathMetric = metrics.pathMetrics.get(pathKey) || {
    count: 0,
    errors: 0,
    totalDuration: 0,
    min: Number.MAX_VALUE,
    max: 0
  };
  
  pathMetric.count++;
  pathMetric.totalDuration += duration;
  if (isError) pathMetric.errors++;
  pathMetric.min = Math.min(pathMetric.min, duration);
  pathMetric.max = Math.max(pathMetric.max, duration);
  
  metrics.pathMetrics.set(pathKey, pathMetric);
  
  // Update AI-specific metrics if applicable
  if (isAiRequest) {
    metrics.aiMetrics.totalCalls++;
    if (isError) metrics.aiMetrics.totalErrors++;
    
    if (aiProvider) {
      const providerMetric = metrics.aiMetrics.providerMetrics.get(aiProvider) || {
        calls: 0,
        errors: 0,
        totalDuration: 0
      };
      
      providerMetric.calls++;
      providerMetric.totalDuration += duration;
      if (isError) providerMetric.errors++;
      
      metrics.aiMetrics.providerMetrics.set(aiProvider, providerMetric);
    }
  }
}

/**
 * Middleware for tracking performance metrics
 */
export function performanceMiddleware(options: PerformanceMetricsOptions = {}) {
  const {
    detailed = false,
    pathExclusions = ['/health', '/metrics'],
    sampleRate = 1.0,
    trackAiCalls = false
  } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (pathExclusions.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Apply sampling
    if (Math.random() > sampleRate) {
      return next();
    }
    
    // Generate request ID and track start time
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    // Store request timing info
    requestTimings.set(requestId, {
      startTime,
      path: req.path,
      method: req.method
    });
    
    // Add request ID to response headers if detailed tracking is enabled
    if (detailed) {
      res.setHeader('X-Request-ID', requestId);
    }
    
    // Detect if this is an AI request
    const isAiRequest = trackAiCalls && req.path.includes('/api/ai/');
    const aiProvider = isAiRequest 
      ? (req.query.provider as string || req.body?.options?.provider || 'unknown')
      : undefined;
    
    // Track response time
    const originalEnd = res.end;
    
    // @ts-ignore - Monkey patch the end method to track when the response completes
    res.end = function(chunk: any, encoding: BufferEncoding) {
      // Get the request timing info
      const timing = requestTimings.get(requestId);
      
      if (timing) {
        const duration = Date.now() - timing.startTime;
        
        // Update metrics
        updateMetrics(timing.path, timing.method, res.statusCode, duration, isAiRequest, aiProvider);
        
        // Add timing header if detailed tracking is enabled
        if (detailed) {
          res.setHeader('X-Response-Time', `${duration}ms`);
        }
        
        // Log the request (only in development or if detailed tracking is enabled)
        if (detailed || process.env.NODE_ENV !== 'production') {
          const logLevel = res.statusCode >= 500 ? 'error' : 
                          res.statusCode >= 400 ? 'warn' : 
                          'info';
          
          logger[logLevel]('API Request', {
            method: timing.method,
            path: timing.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ...(isAiRequest && aiProvider ? { aiProvider } : {})
          });
        }
        
        // Clean up request timing
        requestTimings.delete(requestId);
      }
      
      // Call the original end method
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * Export singleton metrics instance
 */
export default {
  middleware: performanceMiddleware,
  getMetrics,
  resetMetrics
};