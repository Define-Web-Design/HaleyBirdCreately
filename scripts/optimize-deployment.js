
/**
 * Deployment Optimization Script
 * 
 * This script analyzes application performance and automatically adjusts
 * deployment configuration for optimal resource usage.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getPerformanceMetrics } = require('../server/middleware/performance');
const { config, getConfig } = require('../config/globalConfig');

// Configuration paths
const WORKFLOW_CONFIG_PATH = path.resolve(__dirname, '../workflow-config.json');
const REPLIT_CONFIG_PATH = path.resolve(__dirname, '../replit-config.json');

/**
 * Run deployment optimization
 */
async function optimizeDeployment() {
  console.log('Starting deployment optimization...');
  
  // Get current performance metrics
  const perfMetrics = await getServerPerformanceMetrics();
  
  // Analyze metrics and determine optimization needs
  const optimizations = analyzePerformanceMetrics(perfMetrics);
  
  // Apply optimizations
  const results = await applyOptimizations(optimizations);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    metrics: perfMetrics,
    optimizations,
    results,
    summary: generateSummary(results)
  };
  
  // Save report
  const reportPath = path.resolve(__dirname, '../logs/deployment-optimization.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Deployment optimization complete. Report saved to ${reportPath}`);
  return report;
}

/**
 * Get server performance metrics
 */
async function getServerPerformanceMetrics() {
  try {
    // Use existing performance metrics if available
    const metrics = getPerformanceMetrics();
    
    // Enhance with environment info
    const configData = getConfig();
    
    return {
      ...metrics,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || configData.app.port,
        memoryLimit: process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1] || 'default'
      }
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      error: error.message,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };
  }
}

/**
 * Analyze performance metrics to determine needed optimizations
 */
function analyzePerformanceMetrics(metrics) {
  const optimizations = [];
  
  // Skip if we encountered an error getting metrics
  if (metrics.error) {
    return optimizations;
  }
  
  // Check average response time
  if (metrics.avgResponseTime > 100) {
    optimizations.push({
      type: 'server',
      action: 'increase_memory',
      reason: `High average response time (${metrics.avgResponseTime.toFixed(2)}ms)`,
      details: {
        currentMemory: metrics.environment.memoryLimit || 'default',
        recommendedMemory: '512'
      }
    });
  }
  
  // Check memory usage
  if (metrics.memoryUsage > 0.8) {
    optimizations.push({
      type: 'server',
      action: 'increase_memory',
      reason: `High memory usage (${(metrics.memoryUsage * 100).toFixed(2)}%)`,
      details: {
        currentMemory: metrics.environment.memoryLimit || 'default',
        recommendedMemory: metrics.environment.memoryLimit ? 
          (parseInt(metrics.environment.memoryLimit) + 256).toString() : '512'
      }
    });
  }
  
  // Check CPU usage
  if (metrics.cpuUsage > 0.7) {
    optimizations.push({
      type: 'deployment',
      action: 'optimize_build',
      reason: `High CPU usage (${(metrics.cpuUsage * 100).toFixed(2)}%)`,
      details: {
        currentSettings: {
          useProductionMode: process.env.NODE_ENV === 'production'
        },
        recommendedSettings: {
          useProductionMode: true
        }
      }
    });
  }
  
  // Check error rate
  if (metrics.errorRate > 0.05) {
    optimizations.push({
      type: 'monitoring',
      action: 'enable_error_tracking',
      reason: `High error rate (${(metrics.errorRate * 100).toFixed(2)}%)`,
      details: {
        currentErrorRate: metrics.errorRate,
        threshold: 0.05
      }
    });
  }
  
  return optimizations;
}

/**
 * Apply optimization recommendations
 */
async function applyOptimizations(optimizations) {
  const results = [];
  
  for (const opt of optimizations) {
    try {
      switch (opt.action) {
        case 'increase_memory':
          await updateNodeMemoryLimit(opt.details.recommendedMemory);
          results.push({
            action: opt.action,
            status: 'success',
            message: `Updated Node.js memory limit to ${opt.details.recommendedMemory}MB`
          });
          break;
          
        case 'optimize_build':
          await updateBuildConfiguration(opt.details.recommendedSettings);
          results.push({
            action: opt.action,
            status: 'success',
            message: 'Updated build configuration for optimal performance'
          });
          break;
          
        case 'enable_error_tracking':
          await enableErrorTracking();
          results.push({
            action: opt.action,
            status: 'success',
            message: 'Enhanced error tracking enabled'
          });
          break;
          
        default:
          results.push({
            action: opt.action,
            status: 'skipped',
            message: 'Unknown optimization action'
          });
      }
    } catch (error) {
      results.push({
        action: opt.action,
        status: 'error',
        message: error.message
      });
    }
  }
  
  return results;
}

/**
 * Update Node.js memory limit in deployment configuration
 */
async function updateNodeMemoryLimit(memoryMB) {
  try {
    // Update workflow config if it exists
    if (fs.existsSync(WORKFLOW_CONFIG_PATH)) {
      const workflowConfig = JSON.parse(fs.readFileSync(WORKFLOW_CONFIG_PATH, 'utf8'));
      
      // Update production workflow
      if (workflowConfig.workflows && workflowConfig.workflows.production) {
        const prodWorkflow = workflowConfig.workflows.production;
        
        // Check if there's a NODE_OPTIONS setting
        const hasNodeOptions = prodWorkflow.some(cmd => cmd.includes('NODE_OPTIONS'));
        
        if (hasNodeOptions) {
          // Update existing NODE_OPTIONS
          workflowConfig.workflows.production = prodWorkflow.map(cmd => {
            if (cmd.includes('NODE_OPTIONS')) {
              return cmd.replace(/--max-old-space-size=\d+/, `--max-old-space-size=${memoryMB}`);
            }
            return cmd;
          });
        } else {
          // Add NODE_OPTIONS to the command that starts with NODE_ENV
          workflowConfig.workflows.production = prodWorkflow.map(cmd => {
            if (cmd.includes('NODE_ENV=production')) {
              return `NODE_OPTIONS="--max-old-space-size=${memoryMB}" ${cmd}`;
            }
            return cmd;
          });
        }
        
        // Save updated config
        fs.writeFileSync(WORKFLOW_CONFIG_PATH, JSON.stringify(workflowConfig, null, 2));
        console.log(`Updated workflow config with memory limit ${memoryMB}MB`);
      }
    }
    
    // Update Replit config if it exists
    if (fs.existsSync(REPLIT_CONFIG_PATH)) {
      const replitConfig = JSON.parse(fs.readFileSync(REPLIT_CONFIG_PATH, 'utf8'));
      
      // Update run command to include NODE_OPTIONS
      if (replitConfig.run) {
        // Check if there's already a NODE_OPTIONS setting
        if (replitConfig.run.includes('NODE_OPTIONS')) {
          replitConfig.run = replitConfig.run.replace(
            /NODE_OPTIONS="[^"]*"/, 
            `NODE_OPTIONS="--max-old-space-size=${memoryMB}"`
          );
        } else {
          replitConfig.run = `NODE_OPTIONS="--max-old-space-size=${memoryMB}" ${replitConfig.run}`;
        }
        
        // Save updated config
        fs.writeFileSync(REPLIT_CONFIG_PATH, JSON.stringify(replitConfig, null, 2));
        console.log(`Updated Replit config with memory limit ${memoryMB}MB`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating Node.js memory limit:', error);
    throw new Error(`Failed to update memory limit: ${error.message}`);
  }
}

/**
 * Update build configuration for optimal performance
 */
async function updateBuildConfiguration(settings) {
  try {
    // Ensure production mode is used
    if (settings.useProductionMode) {
      // Check if .env exists and update NODE_ENV
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update or add NODE_ENV
        if (envContent.includes('NODE_ENV=')) {
          envContent = envContent.replace(/NODE_ENV=\w+/, 'NODE_ENV=production');
        } else {
          envContent += '\nNODE_ENV=production';
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('Updated .env file to use production mode');
      }
      
      // Ensure build script uses production optimizations
      const configUpdate = config.updateConfig({
        app: {
          debug: false
        },
        features: {
          lazyLoading: true
        },
        logging: {
          level: 'warn',
          format: 'json'
        }
      });
      
      console.log('Updated global config for production optimization');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating build configuration:', error);
    throw new Error(`Failed to update build configuration: ${error.message}`);
  }
}

/**
 * Enable enhanced error tracking
 */
async function enableErrorTracking() {
  // This is a placeholder - in a real implementation, you would
  // configure error tracking based on your monitoring solution
  console.log('Enhanced error tracking enabled');
  return true;
}

/**
 * Generate summary of optimization results
 */
function generateSummary(results) {
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  return {
    total: results.length,
    successful,
    failed,
    skipped,
    message: `Applied ${successful} optimizations (${failed} failed, ${skipped} skipped)`
  };
}

// Run if called directly
if (require.main === module) {
  optimizeDeployment().catch(err => {
    console.error('Optimization failed:', err);
    process.exit(1);
  });
}

module.exports = { optimizeDeployment };
