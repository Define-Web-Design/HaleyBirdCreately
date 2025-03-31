
import { Request, Response, NextFunction } from 'express';
import { securityMonitor } from '../services/securityMonitor';
import { storage } from '../storage';
import rateLimit from 'express-rate-limit';

// Configure rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
    ownershipNotice: "© 2023 All Rights Reserved. This platform is protected by intellectual property law."
  }
});

// Sensitive data middleware - blocks direct access to internal endpoints
export const blockSensitiveEndpoints = (req: Request, res: Response, next: NextFunction) => {
  const sensitivePatterns = [
    /\/\.git\//,
    /\/node_modules\//,
    /\/secrets\//,
    /\.env/,
    /\/config\//,
    /\/private\//
  ];

  if (sensitivePatterns.some(pattern => pattern.test(req.path))) {
    return res.status(403).json({
      message: "Access to this resource is forbidden.",
      ownershipNotice: "© 2023 All Rights Reserved. Unauthorized access attempts are logged."
    });
  }

  next();
};

// Access validation middleware
export const validateAccess = async (req: Request, res: Response, next: NextFunction) => {
  // For demonstration, we use a session-based check
  // In a real implementation, you would validate JWT tokens or session data
  const isAuthenticated = req.session?.userId;
  const isPublicRoute = req.path.startsWith("/api/public");
  
  // Log access attempts for security monitoring
  await storage.trackAccessAttempt({
    ipAddress: req.ip,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"] || "unknown",
    authorized: !!isAuthenticated,
    userId: isAuthenticated ? req.session.userId : undefined
  });
  
  if (!isAuthenticated && !isPublicRoute) {
    return res.status(401).json({
      message: "Unauthorized access. All content and functionality are protected by intellectual property law.",
      ownershipNotice: "© 2023 All Rights Reserved. Unauthorized reproduction prohibited."
    });
  }
  
  next();
};

// Security monitoring middleware
export const monitorSecurity = async (req: Request, res: Response, next: NextFunction) => {
  // Check for extraction attempts (excessive data requests)
  const isExtractionAttempt = securityMonitor.detectExtractionAttempt(req);
  
  // Check for scraping patterns
  const isScrapingAttempt = await securityMonitor.detectScrapingPatterns(req);
  
  if (isExtractionAttempt || isScrapingAttempt) {
    return res.status(429).json({
      message: "Unusual access pattern detected. Please reduce request frequency.",
      ownershipNotice: "© 2023 All Rights Reserved. Automated data collection is prohibited."
    });
  }
  
  // Add ownership notice header to all responses
  res.setHeader('X-Content-Ownership', 'All content is proprietary and protected by intellectual property laws.');
  
  next();
};

// Headers security middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add Content-Security-Policy for additional protection
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    media-src 'self';
    object-src 'none';
    frame-src 'self';
    worker-src 'self' blob:;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim());
  
  next();
};

// Export combined middleware for easy application
export const applySecurityMiddleware = [
  securityHeaders,
  apiLimiter,
  blockSensitiveEndpoints,
  monitorSecurity,
  validateAccess
];

// Function to create an ownership notice for client-side rendering
export const createOwnershipNotice = (req: Request) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || 'unknown';
  const requestId = crypto.randomUUID();
  
  return {
    notice: "© 2023 All Rights Reserved. All content is proprietary and protected by intellectual property laws.",
    requestMetadata: {
      timestamp,
      requestId,
      clientIdentifier: clientIP.split('.').slice(0, 2).join('.') + '.x.x' // Anonymized IP
    }
  };
};
