/**
 * Performance Monitoring Module
 * 
 * This module provides frontend performance tracking using Web Vitals
 * and reports metrics back to the backend for unified performance analysis.
 */

import { getCLS, getFID, getLCP, getFCP, getTTFB, Metric } from 'web-vitals';
import { logger } from './logger';

// Configuration for performance tracking
interface PerformanceTrackingConfig {
  /** Whether performance tracking is enabled */
  enabled: boolean;
  
  /** Endpoint to send performance metrics to */
  reportingEndpoint: string;
  
  /** How often to report (percentage of sessions, 0-1) */
  samplingRate: number;
  
  /** Whether to log metrics to console */
  logToConsole: boolean;
  
  /** Additional context data to include with reports */
  contextData?: Record<string, any>;
}

// Default configuration
const defaultConfig: PerformanceTrackingConfig = {
  enabled: true,
  reportingEndpoint: '/api/performance/metrics',
  samplingRate: 0.1, // Track 10% of sessions by default
  logToConsole: process.env.NODE_ENV !== 'production'
};

// Current configuration
let config: PerformanceTrackingConfig = { ...defaultConfig };

/**
 * Report a metric to the backend
 */
function reportMetric(metric: Metric): void {
  // Check if metric should be reported based on sampling rate
  if (!config.enabled || Math.random() > config.samplingRate) {
    return;
  }
  
  // Log to console if enabled
  if (config.logToConsole) {
    logger.debug(`Web Vital: ${metric.name}`, { 
      value: metric.value,
      rating: metric.rating
    });
  }
  
  // Prepare the data to send
  const data = {
    ...metric,
    timestamp: Date.now(),
    page: window.location.pathname,
    context: config.contextData || {}
  };
  
  // Send to the backend
  try {
    navigator.sendBeacon(config.reportingEndpoint, JSON.stringify(data));
  } catch (error) {
    // Fall back to fetch if sendBeacon fails
    try {
      fetch(config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {
        // Ignore fetch errors - this is just telemetry
      });
    } catch (fetchError) {
      // Completely ignore errors - this is non-critical telemetry
    }
  }
}

/**
 * Initialize performance tracking
 */
export function initPerformanceTracking(customConfig: Partial<PerformanceTrackingConfig> = {}): void {
  // Update configuration
  config = { ...defaultConfig, ...customConfig };
  
  // Don't initialize if disabled
  if (!config.enabled) {
    return;
  }
  
  // Only track performance in browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Initialize Core Web Vitals tracking
  getCLS(reportMetric);
  getFID(reportMetric);
  getLCP(reportMetric);
  getFCP(reportMetric);
  getTTFB(reportMetric);
  
  // Track additional metrics
  trackNavigationTiming();
  trackResourceTiming();
  
  // Set up error tracking
  setupErrorTracking();
  
  // Log initialization
  if (config.logToConsole) {
    logger.info('Performance tracking initialized', { 
      samplingRate: config.samplingRate
    });
  }
}

/**
 * Track Navigation Timing API metrics
 */
function trackNavigationTiming(): void {
  if (window.performance && window.performance.timing) {
    // Wait for the page to fully load
    window.addEventListener('load', () => {
      // Wait a bit more to ensure all timing data is available
      setTimeout(() => {
        const timing = window.performance.timing;
        
        // Calculate key metrics
        const navigationStart = timing.navigationStart;
        const metrics = {
          name: 'navigation-timing',
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnection: timing.connectEnd - timing.connectStart,
          serverResponse: timing.responseStart - timing.requestStart,
          domLoading: timing.domLoading - navigationStart,
          domInteractive: timing.domInteractive - navigationStart,
          domComplete: timing.domComplete - navigationStart,
          loadEvent: timing.loadEventEnd - timing.loadEventStart,
          fullPageLoad: timing.loadEventEnd - navigationStart
        };
        
        // Report combined navigation timing metrics
        reportMetric({
          name: 'TTFR', // Time to First Response
          value: timing.responseStart - navigationStart,
          delta: 0,
          id: 'nav-ttfr',
          entries: []
        });
        
        reportMetric({
          name: 'DOMReady',
          value: timing.domContentLoadedEventEnd - navigationStart,
          delta: 0,
          id: 'nav-domready',
          entries: []
        });
        
        reportMetric({
          name: 'FullLoad',
          value: timing.loadEventEnd - navigationStart,
          delta: 0,
          id: 'nav-fullload',
          entries: []
        });
        
        // Log all metrics if enabled
        if (config.logToConsole) {
          logger.debug('Navigation Timing', metrics);
        }
      }, 0);
    });
  }
}

/**
 * Track Resource Timing API metrics for key resources
 */
function trackResourceTiming(): void {
  if (window.performance && window.performance.getEntriesByType) {
    // Track resource timing after load
    window.addEventListener('load', () => {
      setTimeout(() => {
        // Get all resource entries
        const resourceEntries = window.performance.getEntriesByType('resource');
        
        // Track JS and CSS files specifically
        const jsFiles = resourceEntries.filter(entry => entry.name.endsWith('.js'));
        const cssFiles = resourceEntries.filter(entry => entry.name.endsWith('.css'));
        const imageFiles = resourceEntries.filter(entry => 
          entry.name.endsWith('.png') || entry.name.endsWith('.jpg') || 
          entry.name.endsWith('.jpeg') || entry.name.endsWith('.gif') ||
          entry.name.endsWith('.svg')
        );
        
        // Report aggregated metrics
        if (jsFiles.length) {
          const avgDuration = jsFiles.reduce((sum, entry) => sum + entry.duration, 0) / jsFiles.length;
          reportMetric({
            name: 'JS-Load',
            value: avgDuration,
            delta: 0,
            id: 'res-js-load',
            entries: []
          });
        }
        
        if (cssFiles.length) {
          const avgDuration = cssFiles.reduce((sum, entry) => sum + entry.duration, 0) / cssFiles.length;
          reportMetric({
            name: 'CSS-Load',
            value: avgDuration,
            delta: 0,
            id: 'res-css-load',
            entries: []
          });
        }
        
        if (imageFiles.length) {
          const avgDuration = imageFiles.reduce((sum, entry) => sum + entry.duration, 0) / imageFiles.length;
          reportMetric({
            name: 'IMG-Load',
            value: avgDuration,
            delta: 0,
            id: 'res-img-load',
            entries: []
          });
        }
        
        // Track critical resources (API calls)
        const apiCalls = resourceEntries.filter(entry => entry.name.includes('/api/'));
        if (apiCalls.length) {
          const avgDuration = apiCalls.reduce((sum, entry) => sum + entry.duration, 0) / apiCalls.length;
          reportMetric({
            name: 'API-Load',
            value: avgDuration,
            delta: 0,
            id: 'res-api-load',
            entries: []
          });
        }
        
        // Log detailed info if enabled
        if (config.logToConsole) {
          logger.debug('Resource Timing Summary', {
            totalResources: resourceEntries.length,
            jsFiles: jsFiles.length,
            cssFiles: cssFiles.length,
            imageFiles: imageFiles.length,
            apiCalls: apiCalls.length
          });
        }
      }, 0);
    });
  }
}

/**
 * Set up error tracking for JS errors and API errors
 */
function setupErrorTracking(): void {
  // Track JS errors
  window.addEventListener('error', (event) => {
    reportMetric({
      name: 'JS-Error',
      value: 1,
      delta: 0,
      id: `error-${Date.now()}`,
      entries: []
    });
    
    if (config.logToConsole) {
      logger.error('JavaScript Error', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno
      });
    }
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportMetric({
      name: 'Promise-Rejection',
      value: 1,
      delta: 0,
      id: `promise-error-${Date.now()}`,
      entries: []
    });
    
    if (config.logToConsole) {
      logger.error('Unhandled Promise Rejection', {
        reason: event.reason ? (event.reason.message || event.reason) : 'Unknown'
      });
    }
  });
  
  // Track fetch errors by monkey-patching the fetch API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = performance.now();
    const url = args[0] instanceof Request ? args[0].url : String(args[0]);
    
    return originalFetch.apply(this, args)
      .then(response => {
        const duration = performance.now() - startTime;
        
        // Track API errors
        if (!response.ok) {
          reportMetric({
            name: 'API-Error',
            value: response.status,
            delta: 0,
            id: `api-error-${Date.now()}`,
            entries: []
          });
          
          if (config.logToConsole) {
            logger.warn('API Error', {
              url,
              status: response.status,
              statusText: response.statusText,
              duration
            });
          }
        } 
        // Track slow API responses
        else if (duration > 1000) {
          reportMetric({
            name: 'API-Slow',
            value: duration,
            delta: 0,
            id: `api-slow-${Date.now()}`,
            entries: []
          });
          
          if (config.logToConsole) {
            logger.warn('Slow API Response', {
              url,
              duration
            });
          }
        }
        
        return response;
      })
      .catch(error => {
        // Track network errors
        reportMetric({
          name: 'API-Network-Error',
          value: 0,
          delta: 0,
          id: `api-network-error-${Date.now()}`,
          entries: []
        });
        
        if (config.logToConsole) {
          logger.error('API Network Error', {
            url,
            error: error.message || 'Network Error'
          });
        }
        
        throw error; // Re-throw to not break the Promise chain
      });
  };
}

/**
 * Mark a user interaction for tracking
 */
export function markInteraction(name: string, data: any = {}): void {
  if (!config.enabled) {
    return;
  }
  
  const mark = `interaction-${name}-start`;
  
  // Create performance mark
  if (window.performance && window.performance.mark) {
    window.performance.mark(mark);
  }
  
  // Store interaction data
  const interaction = {
    name,
    startTime: performance.now(),
    data
  };
  
  // Store on window for access in endInteraction
  (window as any).__performanceInteractions = (window as any).__performanceInteractions || {};
  (window as any).__performanceInteractions[name] = interaction;
}

/**
 * End and measure a previously marked user interaction
 */
export function endInteraction(name: string, additionalData: any = {}): void {
  if (!config.enabled) {
    return;
  }
  
  const interactions = (window as any).__performanceInteractions || {};
  const interaction = interactions[name];
  
  if (!interaction) {
    if (config.logToConsole) {
      logger.warn(`Tried to end non-existent interaction: ${name}`);
    }
    return;
  }
  
  const startTime = interaction.startTime;
  const duration = performance.now() - startTime;
  
  // Create performance measure if supported
  const markStart = `interaction-${name}-start`;
  const markEnd = `interaction-${name}-end`;
  
  if (window.performance && window.performance.mark && window.performance.measure) {
    try {
      window.performance.mark(markEnd);
      window.performance.measure(`interaction-${name}`, markStart, markEnd);
    } catch (e) {
      // Ignore errors with performance API
    }
  }
  
  // Report the interaction
  reportMetric({
    name: `Interaction-${name}`,
    value: duration,
    delta: 0,
    id: `interaction-${name}-${Date.now()}`,
    entries: []
  });
  
  // Log if enabled
  if (config.logToConsole) {
    logger.debug(`Interaction: ${name}`, {
      duration,
      ...interaction.data,
      ...additionalData
    });
  }
  
  // Clean up
  delete interactions[name];
}

/**
 * Track component render times
 */
export function trackComponentRender(componentName: string, renderTime: number): void {
  if (!config.enabled || Math.random() > config.samplingRate) {
    return;
  }
  
  reportMetric({
    name: `Component-${componentName}`,
    value: renderTime,
    delta: 0,
    id: `component-${componentName}-${Date.now()}`,
    entries: []
  });
  
  // Log slow renders
  if (config.logToConsole && renderTime > 50) {
    logger.warn(`Slow component render: ${componentName}`, {
      renderTime
    });
  }
}

// Export the client-side logger for convenience
export { logger };