/**
 * AI Middleware
 * 
 * This middleware integrates the AI service with Express routes,
 * providing request validation, error handling, and performance monitoring.
 */

import { Request, Response, NextFunction } from 'express';
import { aiService } from '../ai/aiService';
import { AIRequestOptions } from '../ai/adapters/baseAdapter';
import { performance } from 'perf_hooks';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-middleware' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/ai-middleware.log',
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

// Custom error class for AI request errors
export class AIRequestError extends Error {
  status: number;
  code: string;
  
  constructor(message: string, status = 500, code = 'AI_SERVICE_ERROR') {
    super(message);
    this.name = 'AIRequestError';
    this.status = status;
    this.code = code;
  }
}

// Interface for request validation rules
interface ValidationRules {
  required?: string[];
  maxLength?: Record<string, number>;
  minLength?: Record<string, number>;
}

// Performance tracking middleware
export const trackAIPerformance = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if not an AI API route
    if (!req.path.startsWith('/api/ai')) {
      return next();
    }
    
    const startTime = performance.now();
    
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to capture timing
    res.end = function(this: Response, ...args: any[]) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Add performance header
      res.setHeader('X-AI-Response-Time', `${duration.toFixed(2)}ms`);
      
      // Log performance data
      logger.debug('AI request completed', {
        path: req.path,
        method: req.method,
        duration,
        statusCode: res.statusCode
      });
      
      // Call original end method
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

// Request validation middleware factory
export const validateAIRequest = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      
      // Check required fields
      if (rules.required) {
        for (const field of rules.required) {
          if (body[field] === undefined || body[field] === null || body[field] === '') {
            throw new AIRequestError(`Missing required field: ${field}`, 400, 'VALIDATION_ERROR');
          }
        }
      }
      
      // Check max length constraints
      if (rules.maxLength) {
        for (const [field, maxLen] of Object.entries(rules.maxLength)) {
          if (body[field] && typeof body[field] === 'string' && body[field].length > maxLen) {
            throw new AIRequestError(
              `Field ${field} exceeds maximum length of ${maxLen} characters`,
              400,
              'VALIDATION_ERROR'
            );
          }
        }
      }
      
      // Check min length constraints
      if (rules.minLength) {
        for (const [field, minLen] of Object.entries(rules.minLength)) {
          if (body[field] && typeof body[field] === 'string' && body[field].length < minLen) {
            throw new AIRequestError(
              `Field ${field} below minimum length of ${minLen} characters`,
              400,
              'VALIDATION_ERROR'
            );
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// AI service availability check middleware
export const checkAIAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get available providers
    const providers = aiService.getProviders();
    
    if (providers.length === 0) {
      throw new AIRequestError(
        'No AI providers are configured. Please check your API keys.',
        503,
        'AI_SERVICE_UNAVAILABLE'
      );
    }
    
    // Get provider status
    const status = await aiService.getStatus();
    const availableProviders = Object.entries(status)
      .filter(([_, providerStatus]) => providerStatus.available)
      .map(([name]) => name);
    
    if (availableProviders.length === 0) {
      throw new AIRequestError(
        'All AI providers are currently unavailable. Please try again later.',
        503,
        'AI_SERVICE_UNAVAILABLE'
      );
    }
    
    // If a specific provider is requested, check if it's available
    const requestedProvider = req.body.provider || req.query.provider;
    if (requestedProvider && !availableProviders.includes(requestedProvider.toString().toLowerCase())) {
      throw new AIRequestError(
        `Requested AI provider '${requestedProvider}' is not available. Available providers: ${availableProviders.join(', ')}`,
        400,
        'PROVIDER_UNAVAILABLE'
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Request timeout middleware
export const aiRequestTimeout = (timeoutMs = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if not an AI API route
    if (!req.path.startsWith('/api/ai')) {
      return next();
    }
    
    // Set timeout
    req.setTimeout(timeoutMs, () => {
      const error = new AIRequestError(
        `Request timeout after ${timeoutMs}ms`,
        408,
        'REQUEST_TIMEOUT'
      );
      
      logger.warn('AI request timeout', {
        path: req.path,
        timeout: timeoutMs
      });
      
      next(error);
    });
    
    next();
  };
};

// Error handling middleware for AI requests
export const handleAIErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Only handle AI-related errors
  if (!(err instanceof AIRequestError) && !req.path.startsWith('/api/ai')) {
    return next(err);
  }
  
  // Convert generic errors to AIRequestError
  if (!(err instanceof AIRequestError)) {
    err = new AIRequestError(
      err.message || 'An unexpected error occurred while processing your AI request',
      500,
      'AI_SERVICE_ERROR'
    );
  }
  
  // Log the error
  logger.error('AI request error', {
    code: err.code,
    message: err.message,
    status: err.status,
    path: req.path,
    method: req.method
  });
  
  // Send error response
  res.status(err.status).json({
    error: {
      code: err.code,
      message: err.message
    }
  });
};

// Helper function to normalize request options
export const normalizeRequestOptions = (options: any): AIRequestOptions => {
  return {
    model: options.model,
    temperature: parseFloat(options.temperature) || 0.7,
    maxTokens: parseInt(options.maxTokens) || undefined,
    topP: parseFloat(options.topP) || undefined,
    frequencyPenalty: parseFloat(options.frequencyPenalty) || undefined,
    presencePenalty: parseFloat(options.presencePenalty) || undefined,
    systemPrompt: options.systemPrompt || undefined,
    responseFormat: options.responseFormat || 'text',
    stream: options.stream === true || options.stream === 'true',
    user: options.user || undefined,
    timeout: parseInt(options.timeout) || undefined,
    retries: parseInt(options.retries) || undefined,
    trackMetrics: options.trackMetrics !== false
  };
};

// Export core AI service functions as middleware handlers
export const aiHandlers = {
  // Text generation handler
  generateText: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body;
      const options = normalizeRequestOptions({
        ...req.body,
        provider: req.body.provider
      });
      
      // Handle streaming response
      if (options.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const stream = await aiService.streamText(prompt, options);
        
        stream.on('data', (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        });
        
        stream.on('metadata', (metadata) => {
          res.write(`data: ${JSON.stringify({ metadata })}\n\n`);
        });
        
        stream.on('error', (error) => {
          logger.error('Stream error', { error });
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        });
        
        stream.on('end', () => {
          res.write('data: [DONE]\n\n');
          res.end();
        });
        
        // Handle client disconnect
        req.on('close', () => {
          logger.debug('Client disconnected from stream');
        });
      } else {
        // Non-streaming response
        const response = await aiService.generateText(prompt, options);
        res.json(response);
      }
    } catch (error) {
      next(error);
    }
  },
  
  // JSON generation handler
  generateJson: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt } = req.body;
      const options = normalizeRequestOptions({
        ...req.body,
        responseFormat: 'json',
        provider: req.body.provider
      });
      
      const response = await aiService.generateJson(prompt, options);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  
  // Image generation handler
  generateImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options = {
        prompt: req.body.prompt,
        n: parseInt(req.body.n) || 1,
        size: req.body.size || '1024x1024',
        quality: req.body.quality || 'standard',
        format: req.body.format || 'url',
        provider: req.body.provider
      };
      
      const response = await aiService.generateImage(options);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
  
  // Service status handler
  getStatus: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await aiService.getStatus();
      res.json({
        status: 'ok',
        providers: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Metrics handler
  getMetrics: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = aiService.getMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  },
  
  // Cache clear handler
  clearCache: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      aiService.clearCache();
      res.json({
        status: 'ok',
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Metrics reset handler
  resetMetrics: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      aiService.resetMetrics();
      res.json({
        status: 'ok',
        message: 'Metrics reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};