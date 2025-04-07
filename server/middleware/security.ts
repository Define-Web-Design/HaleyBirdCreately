import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';

// CORS configuration middleware
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}

// Security headers middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Helps prevent XSS attacks
  res.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://*;");
  
  // Prevents clickjacking
  res.header('X-Frame-Options', 'DENY');
  
  // Prevents MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Enables browser XSS protections
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Controls referrer information
  res.header('Referrer-Policy', 'same-origin');
  
  next();
}

// Rate limiting for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register attempts per hour
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to prevent common security issues
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Apply all security middlewares
  corsMiddleware(req, res, () => {
    securityHeadersMiddleware(req, res, next);
  });
}