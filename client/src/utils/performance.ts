
/**
 * Performance Monitoring Utilities
 * 
 * Provides comprehensive tools for measuring and tracking client-side
 * performance metrics including component rendering, lazy loading,
 * and interaction responsiveness.
 */

// Performance mark categories
export enum PerformanceCategory {
  NAVIGATION = 'navigation',
  COMPONENT = 'component',
  LAZY_LOAD = 'lazy-load',
  INTERACTION = 'interaction',
  API = 'api',
  RESOURCE = 'resource'
}

// Performance measurement interface
interface PerformanceMeasurement {
  name: string;
  duration: number;
  category: PerformanceCategory;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Component render timings cache
const componentRenderTimings: Map<string, number[]> = new Map();
const lazyLoadTimings: Map<string, number[]> = new Map();
const interactionTimings: Map<string, number[]> = new Map();
const apiCallTimings: Map<string, number[]> = new Map();

// Enhanced measurements log with categorization
const measurements: PerformanceMeasurement[] = [];

/**
 * Start timing a performance measurement
 */
export function startMeasure(name: string, category: PerformanceCategory): void {
  const markName = `${category}:${name}:start`;
  performance.mark(markName);
}

/**
 * End timing a performance measurement and record it
 */
export function endMeasure(name: string, category: PerformanceCategory, metadata?: Record<string, any>): number {
  const startMark = `${category}:${name}:start`;
  const endMark = `${category}:${name}:end`;
  
  performance.mark(endMark);
  
  try {
    const measureName = `${category}:${name}`;
    performance.measure(measureName, startMark, endMark);
    
    const entries = performance.getEntriesByName(measureName, 'measure');
    if (entries.length > 0) {
      const duration = entries[0].duration;
      
      // Record the measurement
      measurements.push({
        name,
        duration,
        category,
        timestamp: Date.now(),
        metadata
      });
      
      // Update specific timing maps based on category
      switch (category) {
        case PerformanceCategory.COMPONENT:
          updateTimingMap(componentRenderTimings, name, duration);
          break;
        case PerformanceCategory.LAZY_LOAD:
          updateTimingMap(lazyLoadTimings, name, duration);
          break;
        case PerformanceCategory.INTERACTION:
          updateTimingMap(interactionTimings, name, duration);
          break;
        case PerformanceCategory.API:
          updateTimingMap(apiCallTimings, name, duration);
          break;
      }
      
      // Clean up
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
      
      return duration;
    }
  } catch (error) {
    console.error(`Error measuring performance for ${name}:`, error);
  }
  
  return 0;
}

/**
 * Measure component render time with React hooks integration
 */
export function measureComponentRender(componentName: string, callback?: (duration: number) => void): [() => void, () => void] {
  let startTime = 0;
  
  const start = () => {
    startTime = performance.now();
    startMeasure(componentName, PerformanceCategory.COMPONENT);
  };
  
  const end = () => {
    if (startTime > 0) {
      const duration = endMeasure(componentName, PerformanceCategory.COMPONENT);
      if (callback) callback(duration);
    }
  };
  
  return [start, end];
}

/**
 * Measure lazy loading performance
 */
export function measureLazyLoad(componentName: string): Promise<number> {
  const startTime = performance.now();
  startMeasure(componentName, PerformanceCategory.LAZY_LOAD);
  
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const duration = endMeasure(componentName, PerformanceCategory.LAZY_LOAD, {
          timestamp: startTime
        });
        resolve(duration);
      });
    });
  });
}

/**
 * Measure user interaction response time
 */
export function measureInteraction(interactionName: string, callback: () => Promise<any> | any): Promise<any> {
  startMeasure(interactionName, PerformanceCategory.INTERACTION);
  
  const result = callback();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      endMeasure(interactionName, PerformanceCategory.INTERACTION);
    });
  } else {
    endMeasure(interactionName, PerformanceCategory.INTERACTION);
    return Promise.resolve(result);
  }
}

/**
 * Measure API call performance
 */
export function measureApiCall<T>(
  apiName: string, 
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  startMeasure(apiName, PerformanceCategory.API);
  
  return apiCall()
    .then(result => {
      endMeasure(apiName, PerformanceCategory.API, metadata);
      return result;
    })
    .catch(error => {
      endMeasure(apiName, PerformanceCategory.API, {
        ...metadata,
        error: error.message
      });
      throw error;
    });
}

/**
 * Record FPS measurements for animations and scrolling
 */
export function measureFPS(durationMs = 1000): Promise<number> {
  return new Promise(resolve => {
    let frameCount = 0;
    let startTime = performance.now();
    
    function countFrame() {
      frameCount++;
      const elapsed = performance.now() - startTime;
      
      if (elapsed < durationMs) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsed) * 1000;
        resolve(fps);
      }
    }
    
    requestAnimationFrame(countFrame);
  });
}

/**
 * Get performance statistics for a specific category
 */
export function getPerformanceStats(category: PerformanceCategory): {
  average: number;
  median: number;
  p95: number;
  min: number;
  max: number;
  count: number;
} {
  let timingsMap: Map<string, number[]>;
  
  switch (category) {
    case PerformanceCategory.COMPONENT:
      timingsMap = componentRenderTimings;
      break;
    case PerformanceCategory.LAZY_LOAD:
      timingsMap = lazyLoadTimings;
      break;
    case PerformanceCategory.INTERACTION:
      timingsMap = interactionTimings;
      break;
    case PerformanceCategory.API:
      timingsMap = apiCallTimings;
      break;
    default:
      timingsMap = new Map();
  }
  
  // Flatten all timings
  const allTimings = Array.from(timingsMap.values()).flat();
  
  if (allTimings.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }
  
  // Sort for percentile calculations
  allTimings.sort((a, b) => a - b);
  
  return {
    average: allTimings.reduce((sum, val) => sum + val, 0) / allTimings.length,
    median: allTimings[Math.floor(allTimings.length / 2)],
    p95: allTimings[Math.floor(allTimings.length * 0.95)],
    min: allTimings[0],
    max: allTimings[allTimings.length - 1],
    count: allTimings.length
  };
}

/**
 * Get detailed performance metrics for components
 */
export function getComponentMetrics(): Record<string, {
  average: number;
  median: number;
  count: number;
  recent: number;
}> {
  const metrics: Record<string, any> = {};
  
  componentRenderTimings.forEach((timings, componentName) => {
    if (timings.length === 0) return;
    
    // Sort timings
    const sortedTimings = [...timings].sort((a, b) => a - b);
    
    metrics[componentName] = {
      average: timings.reduce((sum, val) => sum + val, 0) / timings.length,
      median: sortedTimings[Math.floor(sortedTimings.length / 2)],
      count: timings.length,
      recent: timings[timings.length - 1]
    };
  });
  
  return metrics;
}

/**
 * Get lazy loading performance metrics
 */
export function getLazyLoadingMetrics(): Record<string, {
  average: number;
  median: number;
  count: number;
  recent: number;
}> {
  const metrics: Record<string, any> = {};
  
  lazyLoadTimings.forEach((timings, componentName) => {
    if (timings.length === 0) return;
    
    // Sort timings
    const sortedTimings = [...timings].sort((a, b) => a - b);
    
    metrics[componentName] = {
      average: timings.reduce((sum, val) => sum + val, 0) / timings.length,
      median: sortedTimings[Math.floor(sortedTimings.length / 2)],
      count: timings.length,
      recent: timings[timings.length - 1]
    };
  });
  
  return metrics;
}

/**
 * Export performance data for analysis
 */
export function exportPerformanceData(): {
  measurements: PerformanceMeasurement[];
  componentMetrics: Record<string, any>;
  lazyLoadMetrics: Record<string, any>;
  interactionMetrics: Record<string, any>;
  apiMetrics: Record<string, any>;
  timestamp: number;
} {
  return {
    measurements,
    componentMetrics: getComponentMetrics(),
    lazyLoadMetrics: getLazyLoadingMetrics(),
    interactionMetrics: calculateMetricsFromMap(interactionTimings),
    apiMetrics: calculateMetricsFromMap(apiCallTimings),
    timestamp: Date.now()
  };
}

/**
 * Helper function to update timing maps
 */
function updateTimingMap(map: Map<string, number[]>, key: string, value: number): void {
  const existing = map.get(key) || [];
  existing.push(value);
  
  // Keep only the last 100 measurements to avoid memory issues
  if (existing.length > 100) {
    existing.shift();
  }
  
  map.set(key, existing);
}

/**
 * Calculate metrics from a timing map
 */
function calculateMetricsFromMap(map: Map<string, number[]>): Record<string, any> {
  const metrics: Record<string, any> = {};
  
  map.forEach((timings, name) => {
    if (timings.length === 0) return;
    
    // Sort timings
    const sortedTimings = [...timings].sort((a, b) => a - b);
    
    metrics[name] = {
      average: timings.reduce((sum, val) => sum + val, 0) / timings.length,
      median: sortedTimings[Math.floor(sortedTimings.length / 2)],
      p95: sortedTimings[Math.floor(sortedTimings.length * 0.95)],
      min: sortedTimings[0],
      max: sortedTimings[sortedTimings.length - 1],
      count: timings.length,
      recent: timings[timings.length - 1]
    };
  });
  
  return metrics;
}
