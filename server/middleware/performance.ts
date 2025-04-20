/**
 * Performance Middleware
 * 
 * This middleware tracks API performance metrics, including:
 * - Request timing
 * - Response size
 * - Error rates
 * - AI service call metrics
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';

// Interface for performance middleware options
interface PerformanceMiddlewareOptions {
  /** Whether to include detailed breakdowns of timing */
  detailed?: boolean;
  
  /** Percentage of requests to sample (0.0 - 1.0) */
  sampleRate?: number;
  
  /** Paths to exclude from monitoring */
  pathExclusions?: string[];
  
  /** Whether to specifically track AI service calls */
  trackAiCalls?: boolean;
}

// Default options
const DEFAULT_OPTIONS: PerformanceMiddlewareOptions = {
  detailed: false,
  sampleRate: 1.0,
  pathExclusions: ['/api/health', '/health'],
  trackAiCalls: false
};

// Metrics storage
const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  requestsByEndpoint: {} as Record<string, number>,
  errorsByEndpoint: {} as Record<string, number>,
  timingByEndpoint: {} as Record<string, number[]>,
  aiMetrics: {
    totalCalls: 0,
    callsByProvider: {} as Record<string, number>,
    errorsByProvider: {} as Record<string, number>,
    timingByProvider: {} as Record<string, number[]>,
    tokensByProvider: {} as Record<string, number>
  }
};

/**
 * Reset all collected metrics
 */
export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.totalErrors = 0;
  metrics.requestsByEndpoint = {};
  metrics.errorsByEndpoint = {};
  metrics.timingByEndpoint = {};
  metrics.aiMetrics.totalCalls = 0;
  metrics.aiMetrics.callsByProvider = {};
  metrics.aiMetrics.errorsByProvider = {};
  metrics.aiMetrics.timingByProvider = {};
  metrics.aiMetrics.tokensByProvider = {};
}

/**
 * Get the current collected metrics
 */
export function getMetrics() {
  // Calculate averages for endpoint timings
  const averageTimings: Record<string, number> = {};
  for (const [endpoint, timings] of Object.entries(metrics.timingByEndpoint)) {
    if (timings.length > 0) {
      averageTimings[endpoint] = timings.reduce((sum, time) => sum + time, 0) / timings.length;
    }
  }
  
  // Calculate averages for AI provider timings
  const averageAiTimings: Record<string, number> = {};
  for (const [provider, timings] of Object.entries(metrics.aiMetrics.timingByProvider)) {
    if (timings.length > 0) {
      averageAiTimings[provider] = timings.reduce((sum, time) => sum + time, 0) / timings.length;
    }
  }
  
  // Return formatted metrics
  return {
    requests: {
      total: metrics.totalRequests,
      byEndpoint: metrics.requestsByEndpoint
    },
    errors: {
      total: metrics.totalErrors,
      byEndpoint: metrics.errorsByEndpoint,
      rate: metrics.totalRequests > 0 ? metrics.totalErrors / metrics.totalRequests : 0
    },
    timing: {
      averageByEndpoint: averageTimings
    },
    ai: {
      totalCalls: metrics.aiMetrics.totalCalls,
      callsByProvider: metrics.aiMetrics.callsByProvider,
      errorsByProvider: metrics.aiMetrics.errorsByProvider,
      averageTimingByProvider: averageAiTimings,
      tokensByProvider: metrics.aiMetrics.tokensByProvider
    }
  };
}

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware(options: PerformanceMiddlewareOptions = {}) {
  // Merge options with defaults
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (mergedOptions.pathExclusions && 
        mergedOptions.pathExclusions.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Only sample a percentage of requests if configured
    if (mergedOptions.sampleRate && mergedOptions.sampleRate < 1.0 && 
        Math.random() > mergedOptions.sampleRate) {
      return next();
    }
    
    // Mark request start time
    const startTime = performance.now();
    
    // Track endpoint
    const endpoint = req.method + ' ' + req.path;
    metrics.totalRequests++;
    metrics.requestsByEndpoint[endpoint] = (metrics.requestsByEndpoint[endpoint] || 0) + 1;
    
    // Track timing after response
    const originalSend = res.send;
    res.send = function(body: any): Response {
      // Calculate request duration
      const duration = performance.now() - startTime;
      
      // Store timing data
      if (!metrics.timingByEndpoint[endpoint]) {
        metrics.timingByEndpoint[endpoint] = [];
      }
      metrics.timingByEndpoint[endpoint].push(duration);
      
      // Track AI metrics if enabled and it's an AI call
      if (mergedOptions.trackAiCalls && req.path.startsWith('/api/ai/')) {
        try {
          trackAiMetrics(req, body, duration);
        } catch (error) {
          logger.error('Error tracking AI metrics', { error });
        }
      }
      
      // Track errors
      if (res.statusCode >= 400) {
        metrics.totalErrors++;
        metrics.errorsByEndpoint[endpoint] = (metrics.errorsByEndpoint[endpoint] || 0) + 1;
      }
      
      // Add performance tracking header if detailed is enabled
      if (mergedOptions.detailed) {
        res.setHeader('X-Response-Time', duration.toFixed(2) + 'ms');
      }
      
      // Log request performance
      if (duration > 1000) {
        // Log slow requests
        logger.warn('Slow API request', { 
          path: req.path, 
          method: req.method, 
          duration: duration.toFixed(2) + 'ms',
          status: res.statusCode
        });
      } else if (mergedOptions.detailed) {
        // Log all requests in detailed mode
        logger.debug('API request performance', { 
          path: req.path, 
          method: req.method, 
          duration: duration.toFixed(2) + 'ms',
          status: res.statusCode
        });
      }
      
      // Continue with the original send
      return originalSend.call(this, body);
    };
    
    next();
  };
}

/**
 * Track AI-specific metrics from request/response
 */
function trackAiMetrics(req: Request, responseBody: any, duration: number): void {
  // Extract provider from request or response
  let provider: string | undefined;
  
  // Try to get provider from request
  if (req.body && req.body.options && req.body.options.provider) {
    provider = req.body.options.provider;
  } 
  // Try to get from response if available (assume JSON)
  else if (typeof responseBody === 'string' && responseBody.startsWith('{')) {
    try {
      const responseData = JSON.parse(responseBody);
      if (responseData && responseData.provider) {
        provider = responseData.provider;
      } else if (responseData && responseData.model && typeof responseData.model === 'string') {
        // Extract provider from model name (assuming format like 'openai/gpt-4')
        const parts = responseData.model.split('/');
        if (parts.length > 1) {
          provider = parts[0];
        } else if (responseData.model.includes('gpt')) {
          provider = 'openai';
        } else if (responseData.model.includes('claude')) {
          provider = 'anthropic';
        } else if (responseData.model.includes('llama')) {
          provider = 'perplexity';
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Default to 'unknown' if provider couldn't be determined
  provider = provider || 'unknown';
  
  // Increment total calls
  metrics.aiMetrics.totalCalls++;
  
  // Track by provider
  metrics.aiMetrics.callsByProvider[provider] = 
    (metrics.aiMetrics.callsByProvider[provider] || 0) + 1;
  
  // Track timing
  if (!metrics.aiMetrics.timingByProvider[provider]) {
    metrics.aiMetrics.timingByProvider[provider] = [];
  }
  metrics.aiMetrics.timingByProvider[provider].push(duration);
  
  // Track errors
  if (responseBody && typeof responseBody === 'string' && responseBody.includes('error')) {
    try {
      const data = JSON.parse(responseBody);
      if (data.error) {
        metrics.aiMetrics.errorsByProvider[provider] = 
          (metrics.aiMetrics.errorsByProvider[provider] || 0) + 1;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Try to track token usage if available in response
  if (typeof responseBody === 'string') {
    try {
      const data = JSON.parse(responseBody);
      if (data.usage && typeof data.usage.total_tokens === 'number') {
        metrics.aiMetrics.tokensByProvider[provider] = 
          (metrics.aiMetrics.tokensByProvider[provider] || 0) + data.usage.total_tokens;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}