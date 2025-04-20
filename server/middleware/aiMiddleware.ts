
import { Request, Response, NextFunction } from 'express';
import { getAIService } from '../ai/aiService';

/**
 * Middleware to check AI service health
 */
export function checkAIHealth(req: Request, res: Response, next: NextFunction) {
  const aiService = getAIService();
  const health = aiService.getServiceHealth();
  
  if (!health.healthy) {
    return res.status(503).json({
      error: 'AI services unavailable',
      message: health.message || 'No AI providers are available',
      lastCheck: health.lastCheck
    });
  }
  
  next();
}

/**
 * Middleware to add AI provider information to the response
 */
export function addAIProviderInfo(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(body) {
    const aiService = getAIService();
    const providers = aiService.getProviderStatus();
    
    // Only modify AI responses
    if (body && (body.content !== undefined || body.result !== undefined)) {
      body.providers = providers;
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}

/**
 * Middleware for rate limiting AI requests
 */
export function aiRateLimiter(req: Request, res: Response, next: NextFunction) {
  // Implement rate limiting logic here
  // This is a placeholder for future implementation
  next();
}

export default {
  checkAIHealth,
  addAIProviderInfo,
  aiRateLimiter
};
