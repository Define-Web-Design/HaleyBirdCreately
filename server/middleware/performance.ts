
import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * Performance monitoring middleware
 * Tracks request timing and logs slow requests
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  // Skip for static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  const start = Date.now();
  
  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log all API requests with timing
    if (req.path.startsWith('/api/')) {
      log.performance(req.path, duration, {
        method: req.method,
        path: req.path
      });
    }
    
    // Warning for slow requests (> 500ms)
    if (duration > 500) {
      log.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`, {
        method: req.method,
        path: req.path,
        duration
      });
    }
  });
  
  next();
}
