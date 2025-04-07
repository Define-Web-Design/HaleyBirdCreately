
/**
 * Performance profiling utility for identifying bottlenecks
 */

// Store performance measurements
const measurements: Record<string, {
  start: number;
  end?: number;
  duration?: number;
}> = {};

// Measure start time for an operation
export function startMeasure(name: string): void {
  measurements[name] = {
    start: performance.now()
  };
  console.log(`[Performance] Started measuring: ${name}`);
}

// End measurement and calculate duration
export function endMeasure(name: string): number | undefined {
  const measurement = measurements[name];
  if (!measurement) {
    console.warn(`[Performance] No measurement found for: ${name}`);
    return undefined;
  }
  
  measurement.end = performance.now();
  measurement.duration = measurement.end - measurement.start;
  
  console.log(`[Performance] ${name}: ${measurement.duration.toFixed(2)}ms`);
  return measurement.duration;
}

// Get all performance measurements
export function getAllMeasurements(): Record<string, number | undefined> {
  const result: Record<string, number | undefined> = {};
  
  for (const [name, measurement] of Object.entries(measurements)) {
    result[name] = measurement.duration;
  }
  
  return result;
}

// Generate a performance report
export function generatePerformanceReport(): string {
  let report = '# Performance Report\n\n';
  
  // Sort measurements by duration (descending)
  const sortedMeasurements = Object.entries(measurements)
    .filter(([_, data]) => data.duration !== undefined)
    .sort(([_, dataA], [__, dataB]) => (dataB.duration || 0) - (dataA.duration || 0));
  
  if (sortedMeasurements.length === 0) {
    report += 'No performance measurements recorded.\n';
    return report;
  }
  
  // Add table header
  report += '| Operation | Duration (ms) |\n';
  report += '|-----------|---------------|\n';
  
  // Add rows
  for (const [name, data] of sortedMeasurements) {
    report += `| ${name} | ${data.duration?.toFixed(2) || 'N/A'} |\n`;
  }
  
  // Add potential bottlenecks section
  const potentialBottlenecks = sortedMeasurements
    .filter(([_, data]) => (data.duration || 0) > 100) // Operations taking more than 100ms
    .map(([name]) => name);
  
  if (potentialBottlenecks.length > 0) {
    report += '\n## Potential Bottlenecks\n\n';
    potentialBottlenecks.forEach((name, index) => {
      report += `${index + 1}. **${name}** - Consider optimization\n`;
    });
  }
  
  return report;
}

// Create a decorator for measuring function performance
export function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const methodName = `${target.constructor.name}.${propertyKey}`;
    startMeasure(methodName);
    
    try {
      const result = originalMethod.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          endMeasure(methodName);
        });
      }
      
      endMeasure(methodName);
      return result;
    } catch (error) {
      endMeasure(methodName);
      throw error;
    }
  };
  
  return descriptor;
}

// Function to test API endpoints performance
export async function testApiEndpointPerformance(endpoint: string, method: string = 'GET', body?: any): Promise<number> {
  const measureName = `API ${method} ${endpoint}`;
  startMeasure(measureName);
  
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    await response.json(); // Make sure we wait for the full response
    return endMeasure(measureName) || 0;
  } catch (error) {
    endMeasure(measureName);
    console.error(`Error testing API endpoint ${endpoint}:`, error);
    throw error;
  }
}

// Export performance utilities
export const PerformanceProfiler = {
  startMeasure,
  endMeasure,
  getAllMeasurements,
  generatePerformanceReport,
  testApiEndpointPerformance,
};
/**
 * Performance Profiler Utility
 * 
 * A utility for measuring and tracking performance metrics throughout the application.
 * Helps identify bottlenecks and performance issues.
 */

interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface PerformanceReport {
  measurements: PerformanceMeasurement[];
  slowestOperations: PerformanceMeasurement[];
  totalMeasurements: number;
  averageDuration: number;
}

export class PerformanceProfiler {
  private static measurements: PerformanceMeasurement[] = [];
  private static thresholds = {
    slow: 300, // ms
    critical: 1000 // ms
  };

  /**
   * Start measuring performance for a named operation
   */
  public static startMeasure(name: string): void {
    PerformanceProfiler.measurements.push({
      name,
      startTime: performance.now()
    });
    
    console.log(`🕒 Starting performance measurement: ${name}`);
  }

  /**
   * End measuring performance for a named operation
   * @returns The duration of the operation in milliseconds
   */
  public static endMeasure(name: string): number | undefined {
    const measurementIndex = PerformanceProfiler.measurements.findIndex(
      m => m.name === name && m.endTime === undefined
    );
    
    if (measurementIndex === -1) {
      console.warn(`⚠️ No active measurement found for: ${name}`);
      return undefined;
    }
    
    const endTime = performance.now();
    const measurement = PerformanceProfiler.measurements[measurementIndex];
    const duration = endTime - measurement.startTime;
    
    PerformanceProfiler.measurements[measurementIndex] = {
      ...measurement,
      endTime,
      duration
    };
    
    // Log with different indicators based on performance
    if (duration > PerformanceProfiler.thresholds.critical) {
      console.error(`⛔ CRITICAL PERFORMANCE ISSUE: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > PerformanceProfiler.thresholds.slow) {
      console.warn(`⚠️ SLOW OPERATION: ${name} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ Completed ${name} in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  /**
   * Measure the performance of a function
   */
  public static async measure<T>(
    name: string, 
    fn: () => Promise<T> | T
  ): Promise<T> {
    PerformanceProfiler.startMeasure(name);
    try {
      const result = await fn();
      PerformanceProfiler.endMeasure(name);
      return result;
    } catch (error) {
      PerformanceProfiler.endMeasure(name);
      throw error;
    }
  }

  /**
   * Generate a performance report
   */
  public static generatePerformanceReport(): PerformanceReport {
    const completedMeasurements = PerformanceProfiler.measurements.filter(
      m => m.duration !== undefined
    );
    
    const totalDuration = completedMeasurements.reduce(
      (sum, m) => sum + (m.duration || 0), 
      0
    );
    
    const averageDuration = completedMeasurements.length > 0 
      ? totalDuration / completedMeasurements.length 
      : 0;
    
    // Find slowest operations
    const sortedMeasurements = [...completedMeasurements]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    const slowestOperations = sortedMeasurements.slice(0, 5);
    
    return {
      measurements: completedMeasurements,
      slowestOperations,
      totalMeasurements: completedMeasurements.length,
      averageDuration
    };
  }

  /**
   * Clear all measurements
   */
  public static clearMeasurements(): void {
    PerformanceProfiler.measurements = [];
    console.log('Performance measurements cleared');
  }

  /**
   * Set custom thresholds for slow and critical operations
   */
  public static setThresholds(slow: number, critical: number): void {
    PerformanceProfiler.thresholds = { slow, critical };
  }

  /**
   * Get performance insights for the application
   */
  public static getPerformanceInsights(): string {
    const report = PerformanceProfiler.generatePerformanceReport();
    
    let insights = `# Performance Insights\n\n`;
    insights += `## Summary\n`;
    insights += `- Total operations measured: ${report.totalMeasurements}\n`;
    insights += `- Average operation duration: ${report.averageDuration.toFixed(2)}ms\n\n`;
    
    insights += `## Slowest Operations\n`;
    report.slowestOperations.forEach((op, index) => {
      insights += `${index + 1}. ${op.name}: ${op.duration?.toFixed(2)}ms\n`;
    });
    
    insights += `\n## Recommendations\n`;
    
    // Add recommendations based on slow operations
    const criticalOps = report.measurements.filter(
      m => (m.duration || 0) > PerformanceProfiler.thresholds.critical
    );
    
    if (criticalOps.length > 0) {
      insights += `- Critical performance issues detected in ${criticalOps.length} operations\n`;
      criticalOps.forEach(op => {
        insights += `  - Optimize ${op.name} (${op.duration?.toFixed(2)}ms)\n`;
      });
    }
    
    // General recommendations
    if (report.averageDuration > PerformanceProfiler.thresholds.slow) {
      insights += `- Overall performance is below target, consider reviewing resource usage\n`;
    }
    
    return insights;
  }

  /**
   * Get all measurements for a specific operation
   */
  public static getMeasurementsForOperation(name: string): PerformanceMeasurement[] {
    return PerformanceProfiler.measurements.filter(m => m.name === name);
  }
}

/**
 * Create a higher-order component to measure render performance
 */
export function withPerformanceTracking<P>(
  Component: React.ComponentType<P>,
  operationName: string
): React.FC<P> {
  return (props: P) => {
    React.useEffect(() => {
      const name = `Render_${operationName}`;
      PerformanceProfiler.startMeasure(name);
      
      return () => {
        PerformanceProfiler.endMeasure(name);
      };
    }, []);
    
    return <Component {...props} />;
  };
}
