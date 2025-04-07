
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
