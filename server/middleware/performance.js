/**
 * Performance Monitoring Middleware
 * 
 * This middleware tracks request performance and logs information about
 * slow requests to help identify bottlenecks in the application.
 */

// Threshold in milliseconds after which a request is considered "slow"
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second

/**
 * Middleware that monitors request performance
 */
export function performanceMonitor(req, res, next) {
  // Skip performance monitoring for static assets
  if (req.url.startsWith('/assets/')) {
    return next();
  }

  // Record start time
  const start = process.hrtime();
  
  // Function to log performance after response is sent
  function logPerformance() {
    // Calculate elapsed time
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds
    
    // Format for logging
    const route = `${req.method} ${req.originalUrl || req.url}`;
    
    // Log information about slow requests
    if (time > SLOW_REQUEST_THRESHOLD) {
      console.warn(`🐢 Slow request: ${route} (${time.toFixed(2)}ms)`);
    } else {
      // For debugging, optionally log all requests in development
      if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_PERFORMANCE === 'true') {
        console.log(`⚡ Request: ${route} (${time.toFixed(2)}ms)`);
      }
    }
    
    // Remove listeners to prevent memory leaks
    res.removeListener('finish', logPerformance);
    res.removeListener('close', logPerformance);
  }
  
  // Listen for response finish or close
  res.on('finish', logPerformance);
  res.on('close', logPerformance);
  
  next();
}