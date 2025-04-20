/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for tracking and reporting frontend performance metrics
 * using the Web Vitals API and custom performance markers.
 */

// Import Web Vitals
import type { Metric as WebVitalsMetric } from 'web-vitals';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

// Use the imported Metric type
type Metric = WebVitalsMetric;

// Types for performance metrics
export interface PerformanceMetrics {
  // Core Web Vitals
  CLS?: number;  // Cumulative Layout Shift
  FID?: number;  // First Input Delay
  LCP?: number;  // Largest Contentful Paint
  
  // Other Web Vitals
  FCP?: number;  // First Contentful Paint
  TTFB?: number; // Time to First Byte
  
  // Custom metrics
  TTI?: number;  // Time to Interactive
  TBT?: number;  // Total Blocking Time
  
  // Component-specific metrics
  componentLoadTimes?: Record<string, number>;
  apiCallTimes?: Record<string, number>;
  renderTimes?: Record<string, number>;
}

// Metric reporting options
export interface MetricReportOptions {
  path?: string;
  analyticsId?: string;
  debug?: boolean;
  reportUri?: string;
  onReport?: (metrics: PerformanceMetrics) => void;
}

// Performance marker interface
export interface PerformanceMarker {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Store for performance markers
const performanceMarkers: Map<string, PerformanceMarker> = new Map();

// Current metrics collection
let currentMetrics: PerformanceMetrics = {};

// Default report options
const defaultReportOptions: MetricReportOptions = {
  debug: process.env.NODE_ENV !== 'production',
  reportUri: '/api/performance/report'
};

/**
 * Initialize performance monitoring
 * @param options Metric reporting options
 */
export function initPerformanceMonitoring(options: MetricReportOptions = {}) {
  const mergedOptions = { ...defaultReportOptions, ...options };
  
  // Get current path
  const path = options.path || window.location.pathname;
  
  // Reset current metrics
  currentMetrics = {};
  
  // Capture Web Vitals using the updated web-vitals API
  onCLS(metric => reportWebVital('CLS', metric, mergedOptions));
  onFID(metric => reportWebVital('FID', metric, mergedOptions));
  onLCP(metric => reportWebVital('LCP', metric, mergedOptions));
  onFCP(metric => reportWebVital('FCP', metric, mergedOptions));
  onTTFB(metric => reportWebVital('TTFB', metric, mergedOptions));
  
  // Log initialization if in debug mode
  if (mergedOptions.debug) {
    console.info('Performance monitoring initialized', { path });
  }
  
  // Return function to manually report metrics
  return {
    reportMetrics: () => reportAllMetrics(mergedOptions)
  };
}

/**
 * Report a Web Vital metric
 * @param name Metric name
 * @param metric Web Vitals metric
 * @param options Report options
 */
function reportWebVital(
  name: keyof PerformanceMetrics, 
  metric: Metric, 
  options: MetricReportOptions
) {
  // Store metric value safely with proper typing
  if (name === 'componentLoadTimes' || name === 'apiCallTimes' || name === 'renderTimes') {
    // These are record types, initialize if needed
    if (!currentMetrics[name]) {
      currentMetrics[name] = {};
    }
    // In this case, we'd add to the record, but we'd need a key
  } else {
    // For simple numeric metrics
    (currentMetrics as any)[name] = metric.value;
  }
  
  // Debug log
  if (options.debug) {
    console.info(`Web Vital: ${name}`, metric);
  }
  
  // Call user callback if provided
  if (options.onReport) {
    options.onReport(currentMetrics);
  }
}

/**
 * Start a performance marker for custom timing
 * @param name Marker name
 * @param metadata Optional metadata
 * @returns Marker object
 */
export function startPerformanceMarker(
  name: string, 
  metadata?: Record<string, any>
): PerformanceMarker {
  // Create marker
  const marker: PerformanceMarker = {
    name,
    startTime: performance.now(),
    metadata
  };
  
  // Store marker
  performanceMarkers.set(name, marker);
  
  // Add performance entry if browser API available
  if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
    window.performance.mark(`${name}:start`);
  }
  
  return marker;
}

/**
 * End a performance marker and calculate duration
 * @param name Marker name
 * @param additionalMetadata Additional metadata to add
 * @returns Duration in milliseconds or -1 if marker not found
 */
export function endPerformanceMarker(
  name: string,
  additionalMetadata?: Record<string, any>
): number {
  // Get marker
  const marker = performanceMarkers.get(name);
  
  if (!marker) {
    console.warn(`Performance marker '${name}' not found`);
    return -1;
  }
  
  // Calculate duration
  const endTime = performance.now();
  const duration = endTime - marker.startTime;
  
  // Update marker
  marker.duration = duration;
  
  if (additionalMetadata) {
    marker.metadata = { ...marker.metadata, ...additionalMetadata };
  }
  
  // Add performance entry if browser API available
  if (typeof window !== 'undefined' && window.performance) {
    if (window.performance.mark) {
      window.performance.mark(`${name}:end`);
    }
    
    if (window.performance.measure) {
      try {
        window.performance.measure(name, `${name}:start`, `${name}:end`);
      } catch (e) {
        // Some browsers might throw if marks don't exist
      }
    }
  }
  
  return duration;
}

/**
 * Track component render time using React's useEffect hook
 * @param componentName Component name
 * @returns Object with start and end functions
 */
export function useComponentPerformanceTracking(componentName: string) {
  return {
    startRender: () => startPerformanceMarker(`render:${componentName}`),
    endRender: () => {
      const duration = endPerformanceMarker(`render:${componentName}`);
      
      // Store in metrics
      if (!currentMetrics.renderTimes) {
        currentMetrics.renderTimes = {};
      }
      
      currentMetrics.renderTimes[componentName] = duration;
      
      return duration;
    }
  };
}

/**
 * Track API call performance
 * @param endpoint API endpoint name
 * @returns Object with start and end functions
 */
export function trackApiCall(endpoint: string) {
  return {
    startCall: () => startPerformanceMarker(`api:${endpoint}`),
    endCall: (success: boolean, additionalInfo?: Record<string, any>) => {
      const duration = endPerformanceMarker(`api:${endpoint}`, { 
        success, 
        ...additionalInfo 
      });
      
      // Store in metrics
      if (!currentMetrics.apiCallTimes) {
        currentMetrics.apiCallTimes = {};
      }
      
      currentMetrics.apiCallTimes[endpoint] = duration;
      
      return duration;
    }
  };
}

/**
 * Report all collected metrics
 * @param options Report options
 */
export async function reportAllMetrics(options: MetricReportOptions = defaultReportOptions) {
  // Merge options
  const mergedOptions = { ...defaultReportOptions, ...options };
  
  // Prepare report data
  const reportData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    path: window.location.pathname,
    metrics: { ...currentMetrics },
    userAgent: navigator.userAgent,
    markers: Array.from(performanceMarkers.entries()).map(([name, marker]) => ({
      name,
      duration: marker.duration || 0,
      metadata: marker.metadata
    }))
  };
  
  // Debug log
  if (mergedOptions.debug) {
    console.info('Performance metrics report', reportData);
  }
  
  // Call user callback if provided
  if (mergedOptions.onReport) {
    mergedOptions.onReport(currentMetrics);
  }
  
  // Send to server if reporting URI provided
  if (mergedOptions.reportUri) {
    try {
      const response = await fetch(mergedOptions.reportUri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      
      if (!response.ok) {
        console.error('Failed to report performance metrics', {
          status: response.status,
          statusText: response.statusText
        });
      }
      
      return response.ok;
    } catch (error) {
      console.error('Error reporting performance metrics', error);
      return false;
    }
  }
  
  return true;
}

/**
 * Get all current performance metrics
 * @returns Current performance metrics
 */
export function getCurrentMetrics(): PerformanceMetrics {
  return { ...currentMetrics };
}

/**
 * Get all performance markers
 * @returns Array of performance markers
 */
export function getAllPerformanceMarkers(): PerformanceMarker[] {
  return Array.from(performanceMarkers.values());
}

/**
 * Clear all performance markers
 */
export function clearPerformanceMarkers(): void {
  performanceMarkers.clear();
}

// Initialize on load if in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Initialize on page load with a small delay to allow the page to settle
    setTimeout(() => initPerformanceMonitoring(), 100);
  });
}