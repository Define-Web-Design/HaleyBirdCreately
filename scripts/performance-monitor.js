
/**
 * Performance Monitoring Utility
 * 
 * Provides performance monitoring capabilities for both web applications and iOS apps
 * Identifies bottlenecks in content creation workflows and backend processes
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Configuration for the performance monitor
const config = {
  logDirectory: path.join(__dirname, '../logs/performance'),
  samplingRate: 60000, // 1 minute
  metricsToTrack: ['cpu', 'memory', 'responseTime', 'apiLatency'],
  alertThresholds: {
    cpu: 80, // percentage
    memory: 85, // percentage 
    responseTime: 1000, // ms
    apiLatency: 500 // ms
  }
};

// Ensure log directory exists
if (!fs.existsSync(config.logDirectory)) {
  fs.mkdirSync(config.logDirectory, { recursive: true });
}

// Sample metrics and write to log
function sampleMetrics() {
  const timestamp = new Date().toISOString();
  const metrics = {
    timestamp,
    cpu: Math.random() * 100, // Placeholder for actual CPU measurement
    memory: Math.random() * 100, // Placeholder for actual memory measurement
    responseTime: Math.random() * 1500, // Placeholder for actual response time
    apiLatency: Math.random() * 1000, // Placeholder for actual API latency
  };
  
  // Check for threshold violations
  const alerts = [];
  for (const [metric, value] of Object.entries(metrics)) {
    if (metric === 'timestamp') continue;
    
    if (value > config.alertThresholds[metric]) {
      alerts.push(`${metric} threshold exceeded: ${value}`);
    }
  }
  
  // Log metrics
  const logFile = path.join(config.logDirectory, `metrics-${new Date().toISOString().split('T')[0]}.json`);
  let existingData = [];
  
  if (fs.existsSync(logFile)) {
    try {
      existingData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (err) {
      console.error('Error reading metrics file:', err);
    }
  }
  
  existingData.push(metrics);
  
  fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2), 'utf8');
  
  // Log any alerts
  if (alerts.length > 0) {
    const alertLogFile = path.join(config.logDirectory, `alerts-${new Date().toISOString().split('T')[0]}.log`);
    const alertMessage = `[${timestamp}] ${alerts.join(', ')}\n`;
    
    fs.appendFileSync(alertLogFile, alertMessage, 'utf8');
    console.warn('Performance alerts:', alerts);
  }
}

// API timing utility
function measureApiPerformance(apiName, callback) {
  const start = performance.now();
  
  return Promise.resolve(callback())
    .then(result => {
      const duration = performance.now() - start;
      
      // Log API performance
      console.log(`API ${apiName} took ${duration.toFixed(2)}ms`);
      
      // Alert if threshold exceeded
      if (duration > config.alertThresholds.apiLatency) {
        console.warn(`API latency threshold exceeded for ${apiName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    })
    .catch(error => {
      const duration = performance.now() - start;
      console.error(`API ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    });
}

// Start the monitoring interval
function startMonitoring() {
  console.log('Starting performance monitoring...');
  
  // Immediate first sample
  sampleMetrics();
  
  // Set up recurring sampling
  const interval = setInterval(sampleMetrics, config.samplingRate);
  
  return {
    stop: () => {
      clearInterval(interval);
      console.log('Performance monitoring stopped');
    }
  };
}

// Export the performance monitoring utilities
module.exports = {
  startMonitoring,
  measureApiPerformance,
  config
};

// Auto-start if this script is run directly
if (require.main === module) {
  console.log('Performance monitoring starting...');
  startMonitoring();
  console.log(`Monitoring metrics: ${config.metricsToTrack.join(', ')}`);
  console.log(`Logs will be written to: ${config.logDirectory}`);
  console.log('Press Ctrl+C to stop monitoring');
}
