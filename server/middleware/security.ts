
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { storage } from "../storage";

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
    ownershipNotice: "All content and functionality protected by intellectual property law."
  }
});

// Ownership verification in headers
export const addOwnershipHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Ownership", "© 2023 All Rights Reserved");
  res.setHeader("X-Protected-Content", "Unauthorized reproduction prohibited");
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
    authorized: !!isAuthenticated
  });
  
  if (!isAuthenticated && !isPublicRoute) {
    return res.status(401).json({
      message: "Unauthorized access. All content and functionality are protected by intellectual property law.",
      ownershipNotice: "© 2023 All Rights Reserved. Unauthorized reproduction prohibited."
    });
  }
  
  next();
};

// Track and detect potential scraping or unauthorized access
export const scrapeDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousHeaders = [
    'HTTrack',
    'WebCopier',
    'Download Ninja',
    'Offline Explorer',
    'Website Extractor'
  ];
  
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  
  // Check for known scraper user agents
  const isSuspiciousAgent = suspiciousHeaders.some(header => 
    userAgent.toLowerCase().includes(header.toLowerCase())
  );
  
  // Check for high request frequency (would be more sophisticated in production)
  const requestTimestamp = Date.now();
  
  if (isSuspiciousAgent) {
    console.warn(`Suspicious access detected: ${userAgent}, IP: ${req.ip}, Path: ${req.path}`);
    // In production, you might want to block or add additional verification
    // For now, we'll just log and continue
  }
  
  next();
};
