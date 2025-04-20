
/**
 * Performance monitoring utilities
 */

// Map to store performance metrics
const metrics = new Map<string, {
  start?: number;
  end?: number;
  duration?: number;
  count: number;
  total: number;
  min: number;
  max: number;
}>();

/**
 * Start timing a specific operation
 */
export function startTiming(metricName: string): void {
  const start = performance.now();
  
  if (!metrics.has(metricName)) {
    metrics.set(metricName, {
      count: 0,
      total: 0,
      min: Infinity,
      max: 0
    });
  }
  
  const metric = metrics.get(metricName)!;
  metric.start = start;
}

/**
 * End timing for an operation and record metrics
 */
export function endTiming(metricName: string): number | undefined {
  const end = performance.now();
  const metric = metrics.get(metricName);
  
  if (!metric || metric.start === undefined) {
    console.warn(`No timing started for metric: ${metricName}`);
    return undefined;
  }
  
  const duration = end - metric.start;
  metric.end = end;
  metric.duration = duration;
  metric.count++;
  metric.total += duration;
  metric.min = Math.min(metric.min, duration);
  metric.max = Math.max(metric.max, duration);
  
  return duration;
}

/**
 * Measure the performance of a function
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T, 
  metricName: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    startTiming(metricName);
    const result = fn(...args);
    
    // Handle both synchronous and Promise-returning functions
    if (result instanceof Promise) {
      return result
        .then(value => {
          endTiming(metricName);
          return value;
        })
        .catch(error => {
          endTiming(metricName);
          throw error;
        }) as ReturnType<T>;
    } else {
      endTiming(metricName);
      return result;
    }
  };
}

/**
 * Get all recorded performance metrics
 */
export function getPerformanceMetrics() {
  const result: Record<string, { 
    count: number; 
    avgDuration: number; 
    min: number; 
    max: number; 
    total: number;
  }> = {};
  
  metrics.forEach((metric, name) => {
    result[name] = {
      count: metric.count,
      avgDuration: metric.count > 0 ? metric.total / metric.count : 0,
      min: metric.min === Infinity ? 0 : metric.min,
      max: metric.max,
      total: metric.total
    };
  });
  
  return result;
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics() {
  metrics.clear();
}

/**
 * Report all metrics to console
 */
export function reportPerformanceMetrics() {
  console.group('Performance Metrics');
  
  const allMetrics = getPerformanceMetrics();
  Object.entries(allMetrics).forEach(([name, data]) => {
    console.log(
      `${name}: ${data.count} calls, avg: ${data.avgDuration.toFixed(2)}ms, ` +
      `min: ${data.min.toFixed(2)}ms, max: ${data.max.toFixed(2)}ms, total: ${data.total.toFixed(2)}ms`
    );
  });
  
  console.groupEnd();
}

// Add component rendering performance monitoring
if (typeof window !== 'undefined') {
  // Set up PerformanceObserver to monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 50ms is considered a long task
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.error('PerformanceObserver for longtask not supported', e);
    }
  }
}

// Export React-specific performance utilities
export const componentPerformance = {
  startRender: (componentName: string) => startTiming(`render_${componentName}`),
  endRender: (componentName: string) => endTiming(`render_${componentName}`),
  startEffect: (componentName: string, effectName: string) => 
    startTiming(`effect_${componentName}_${effectName}`),
  endEffect: (componentName: string, effectName: string) => 
    endTiming(`effect_${componentName}_${effectName}`)
};
