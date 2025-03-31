
import type { Request, Response, NextFunction } from "express";
import path from "path";
import { securityMonitor } from "../services/securityMonitor";

// File extensions that should receive watermarking
const WATERMARKABLE_EXTENSIONS = [
  '.js', '.css', '.html', '.htm', '.svg', 
  '.json', '.txt', '.md', '.ts', '.tsx'
];

// Options for watermarking based on file type
const getWatermarkOptions = (req: Request, filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  const assetId = path.basename(filePath);
  const timestamp = Date.now();
  
  // Determine asset type based on file extension
  let assetType: 'image' | 'text' | 'code' = 'text';
  if (['.js', '.ts', '.tsx', '.jsx', '.css'].includes(ext)) {
    assetType = 'code';
  } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
    assetType = 'image';
  }
  
  return {
    assetId,
    assetType,
    ownerInfo: '© 2023 All Rights Reserved',
    timestamp
  };
};

// Middleware to watermark static files
export const watermarkStaticFiles = (req: Request, res: Response, next: NextFunction) => {
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function
  res.send = function(body?: any): Response {
    // Only watermark text-based content
    if (typeof body === 'string' && res.getHeader('content-type')?.toString().includes('text')) {
      const filePath = req.path;
      const ext = path.extname(filePath).toLowerCase();
      
      // Check if this file should be watermarked
      if (WATERMARKABLE_EXTENSIONS.includes(ext)) {
        const options = getWatermarkOptions(req, filePath);
        body = securityMonitor.embedOwnershipMetadata(body, options);
      }
    }
    
    // Call the original send with potentially modified body
    return originalSend.call(this, body);
  };
  
  next();
};

// Add ownership verification to static files
export const verifyStaticFileOwnership = (req: Request, res: Response, next: NextFunction) => {
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function
  res.send = function(body?: any): Response {
    // For text-based content, verify ownership before sending
    if (typeof body === 'string' && res.getHeader('content-type')?.toString().includes('text')) {
      const filePath = req.path;
      const ext = path.extname(filePath).toLowerCase();
      
      // Only verify certain file types
      if (WATERMARKABLE_EXTENSIONS.includes(ext)) {
        const options = getWatermarkOptions(req, filePath);
        const { assetId, assetType, ownerInfo } = options;
        
        // Log verification attempt (in a real implementation, this would be more sophisticated)
        console.log(`Verifying ownership: ${filePath}`);
        
        // Verify if needed - this is mostly for demonstration
        // In a real implementation, we'd do more thorough verification
        if (body.length > 1000) { // Only check larger files
          const isVerified = securityMonitor.verifyOwnership(body, { assetId, assetType, ownerInfo });
          
          if (!isVerified) {
            console.warn(`Ownership verification failed for: ${filePath}`);
            // In a real implementation, we might take action here
          }
        }
      }
    }
    
    // Call the original send
    return originalSend.call(this, body);
  };
  
  next();
};
