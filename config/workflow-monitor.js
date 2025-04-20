/**
 * Workflow Monitoring System
 * 
 * This module provides monitoring capabilities for workflow execution,
 * tracking performance metrics, resource usage, and errors.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json()
  ),
  defaultMeta: { service: 'workflow-monitor' },
  transports: [
    new winston.transports.File({ filename: 'logs/workflow-monitor.log' })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Performance metrics collector
 */
class PerformanceMetrics {
  constructor() {
    this.startTime = Date.now();
    this.checkpoints = {};
    this.metrics = {
      cpu: [],
      memory: [],
      heapUsed: [],
      eventLoopDelay: [],
      duration: 0
    };
    
    // Track execution time
    this.executionTimer = setInterval(() => {
      this.collectResourceMetrics();
    }, 1000);
  }
  
  /**
   * Record a checkpoint with timing information
   * @param {string} name - Checkpoint name
   */
  checkpoint(name) {
    const timestamp = Date.now();
    const elapsed = timestamp - this.startTime;
    
    this.checkpoints[name] = {
      timestamp,
      elapsed
    };
    
    logger.info(`Checkpoint: ${name}`, { 
      checkpoint: name, 
      elapsed,
      timestamp 
    });
    
    return elapsed;
  }
  
  /**
   * Collect current resource usage metrics
   */
  collectResourceMetrics() {
    // CPU load (average of all cores)
    const cpuLoad = os.loadavg()[0] / os.cpus().length;
    
    // Memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    // Node.js process memory
    const memoryUsage = process.memoryUsage();
    
    this.metrics.cpu.push(cpuLoad);
    this.metrics.memory.push(memoryUsagePercent);
    this.metrics.heapUsed.push(memoryUsage.heapUsed / 1024 / 1024); // Convert to MB
    
    // Approximate event loop delay
    const hrtime = process.hrtime();
    const now = hrtime[0] * 1000000 + hrtime[1] / 1000;
    setTimeout(() => {
      const hrtime2 = process.hrtime();
      const after = hrtime2[0] * 1000000 + hrtime2[1] / 1000;
      const delay = Math.max(0, (after - now) - 1000);
      this.metrics.eventLoopDelay.push(delay);
    }, 1);
  }
  
  /**
   * Calculate average value from array
   * @param {Array<number>} arr - Array of numbers
   * @returns {number} Average value
   */
  calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  /**
   * Complete monitoring and return summary metrics
   * @returns {Object} Summary metrics
   */
  complete() {
    // Stop the metrics collection timer
    clearInterval(this.executionTimer);
    
    // Calculate duration
    this.metrics.duration = Date.now() - this.startTime;
    
    // Calculate averages
    const summary = {
      duration: this.metrics.duration,
      durationSeconds: (this.metrics.duration / 1000).toFixed(2),
      checkpoints: this.checkpoints,
      averages: {
        cpu: this.calculateAverage(this.metrics.cpu).toFixed(2),
        memory: this.calculateAverage(this.metrics.memory).toFixed(2),
        heapUsed: this.calculateAverage(this.metrics.heapUsed).toFixed(2),
        eventLoopDelay: this.calculateAverage(this.metrics.eventLoopDelay).toFixed(2)
      }
    };
    
    // Log completion
    logger.info('Monitoring completed', { summary });
    
    return summary;
  }
}

/**
 * Workflow execution monitor
 */
class WorkflowMonitor {
  /**
   * Create a new workflow monitor
   * @param {string} workflowName - Name of the workflow to monitor
   * @param {Object} options - Monitor options
   */
  constructor(workflowName, options = {}) {
    this.workflowName = workflowName;
    this.options = {
      collectMetrics: true,
      logDetails: true,
      ...options
    };
    
    this.startTime = Date.now();
    this.errors = [];
    
    // Initialize performance metrics
    if (this.options.collectMetrics) {
      this.metrics = new PerformanceMetrics();
    }
    
    // Log start
    logger.info(`Workflow started: ${workflowName}`, {
      workflow: workflowName,
      startTime: new Date(this.startTime).toISOString()
    });
  }
  
  /**
   * Record a checkpoint in the workflow execution
   * @param {string} name - Checkpoint name
   * @returns {number} Elapsed time since start
   */
  checkpoint(name) {
    if (this.options.collectMetrics) {
      return this.metrics.checkpoint(name);
    }
    
    const elapsed = Date.now() - this.startTime;
    
    logger.info(`Checkpoint: ${name}`, { 
      workflow: this.workflowName,
      checkpoint: name, 
      elapsed
    });
    
    return elapsed;
  }
  
  /**
   * Record an error that occurred during workflow execution
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  recordError(error, context = 'unknown') {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(errorDetails);
    
    logger.error(`Workflow error: ${error.message}`, {
      workflow: this.workflowName,
      error: errorDetails
    });
  }
  
  /**
   * Complete workflow monitoring and return summary
   * @param {string} status - Completion status (success, failure, etc)
   * @param {Object} result - Result details
   * @returns {Object} Workflow execution summary
   */
  complete(status = 'success', result = {}) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    // Collect final metrics
    let metricsData = null;
    if (this.options.collectMetrics) {
      metricsData = this.metrics.complete();
    }
    
    // Create summary
    const summary = {
      workflow: this.workflowName,
      status,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      durationFormatted: `${(duration / 1000).toFixed(2)}s`,
      errors: this.errors,
      errorCount: this.errors.length,
      result,
      metrics: metricsData
    };
    
    // Log completion
    logger.info(`Workflow completed: ${this.workflowName} (${status})`, {
      workflow: this.workflowName,
      status,
      duration,
      errorCount: this.errors.length,
      ...(this.options.logDetails ? { summary } : {})
    });
    
    // Save detailed report to file
    this.saveReport(summary);
    
    return summary;
  }
  
  /**
   * Save a detailed workflow execution report to the logs directory
   * @param {Object} summary - Execution summary
   */
  saveReport(summary) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `logs/workflow-${this.workflowName}-${timestamp}.json`;
      
      fs.writeFileSync(
        filename,
        JSON.stringify(summary, null, 2)
      );
      
      logger.info(`Saved workflow report: ${filename}`);
    } catch (error) {
      logger.error(`Failed to save workflow report: ${error.message}`);
    }
  }
}

module.exports = {
  WorkflowMonitor,
  PerformanceMetrics,
  logger
};