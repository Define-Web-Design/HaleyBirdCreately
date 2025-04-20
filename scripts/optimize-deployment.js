
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
const { environmentController } = require('../server/scaling/environmentController');
const { config, getConfig } = require('../config/globalConfig');

// Configuration paths
const WORKFLOW_CONFIG_PATH = path.resolve(__dirname, '../workflow-config.json');
const REPLIT_CONFIG_PATH = path.resolve(__dirname, '../replit-config.json');

// Performance thresholds
const THRESHOLDS = {
  RESPONSE_TIME: {
    GOOD: 100, // ms
    WARNING: 200, // ms
    CRITICAL: 300 // ms
  },
  MEMORY_USAGE: {
    GOOD: 0.6, // 60%
    WARNING: 0.7, // 70%
    CRITICAL: 0.8 // 80%
  },
  CPU_USAGE: {
    GOOD: 0.5, // 50%
    WARNING: 0.7, // 70%
    CRITICAL: 0.85 // 85%
  },
  ERROR_RATE: {
    GOOD: 0.01, // 1%
    WARNING: 0.03, // 3%
    CRITICAL: 0.05 // 5%
  }
};

/**
 * Run deployment optimization
 */
async function optimizeDeployment() {
  console.log('🚀 Starting deployment optimization...');
  
  // Get current performance metrics
  const perfMetrics = await getServerPerformanceMetrics();
  
  // Analyze metrics and determine optimization needs
  const optimizations = analyzePerformanceMetrics(perfMetrics);
  
  // Apply optimizations
  const results = await applyOptimizations(optimizations);
  
  // Configure automatic scaling based on optimization results
  const scalingResult = await configureAutomaticScaling(perfMetrics, optimizations);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    metrics: perfMetrics,
    optimizations,
    results,
    scaling: scalingResult,
    summary: generateSummary(results, scalingResult)
  };
  
  // Save report
  const reportPath = path.resolve(__dirname, '../logs/deployment-optimization.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`🏁 Deployment optimization complete. Report saved to ${reportPath}`);
  
  // Print summary
  console.log('\n📊 Optimization Summary:');
  console.log(`- Applied optimizations: ${results.filter(r => r.status === 'success').length}/${results.length}`);
  
  if (scalingResult.configured) {
    console.log(`- Auto-scaling: Configured (${scalingResult.mode} mode)`);
    console.log(`- Scaling thresholds: CPU ${scalingResult.thresholds.cpu * 100}%, Memory ${scalingResult.thresholds.memory * 100}%, Response time ${scalingResult.thresholds.responseTime}ms`);
  } else {
    console.log(`- Auto-scaling: Not configured (${scalingResult.reason})`);
  }
  
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
    
    // Get current memory usage from process
    const memInfo = process.memoryUsage();
    
    // Get current deployment mode
    let deploymentMode = 'development';
    if (fs.existsSync(REPLIT_CONFIG_PATH)) {
      try {
        const replitConfig = JSON.parse(fs.readFileSync(REPLIT_CONFIG_PATH, 'utf8'));
        if (replitConfig.run && replitConfig.run.includes('NODE_ENV=production')) {
          deploymentMode = 'production';
        }
      } catch (e) {
        // Ignore errors reading config
      }
    }
    
    return {
      ...metrics,
      environment: {
        nodeEnv: process.env.NODE_ENV || deploymentMode,
        port: process.env.PORT || configData.app.port,
        memoryLimit: getMemoryLimit(),
        processMemory: {
          rss: Math.round(memInfo.rss / (1024 * 1024)),
          heapTotal: Math.round(memInfo.heapTotal / (1024 * 1024)),
          heapUsed: Math.round(memInfo.heapUsed / (1024 * 1024)),
          external: Math.round(memInfo.external / (1024 * 1024))
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    return {
      error: error.message,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };
  }
}

/**
 * Get current memory limit from NODE_OPTIONS or default
 */
function getMemoryLimit() {
  // Check NODE_OPTIONS environment variable
  const nodeOptions = process.env.NODE_OPTIONS || '';
  const memoryMatch = nodeOptions.match(/--max-old-space-size=(\d+)/);
  
  if (memoryMatch && memoryMatch[1]) {
    return parseInt(memoryMatch[1], 10);
  }
  
  // Check .env file
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envMemoryMatch = envContent.match(/NODE_OPTIONS=.*--max-old-space-size=(\d+)/);
      
      if (envMemoryMatch && envMemoryMatch[1]) {
        return parseInt(envMemoryMatch[1], 10);
      }
    }
  } catch (error) {
    // Ignore error reading .env file
  }
  
  // Default value
  return 512;
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
  
  // Check environment mode
  if (metrics.environment.nodeEnv !== 'production') {
    optimizations.push({
      type: 'deployment',
      action: 'set_production_mode',
      priority: 'high',
      reason: `Application is running in ${metrics.environment.nodeEnv} mode`,
      details: {
        currentSettings: {
          nodeEnv: metrics.environment.nodeEnv
        },
        recommendedSettings: {
          nodeEnv: 'production'
        }
      }
    });
  }
  
  // Check average response time
  if (metrics.avgResponseTime > THRESHOLDS.RESPONSE_TIME.CRITICAL) {
    optimizations.push({
      type: 'server',
      action: 'increase_memory',
      priority: 'high',
      reason: `High average response time (${metrics.avgResponseTime.toFixed(2)}ms)`,
      details: {
        currentMemory: metrics.environment.memoryLimit || 'default',
        recommendedMemory: calculateRecommendedMemory(metrics)
      }
    });
  } else if (metrics.avgResponseTime > THRESHOLDS.RESPONSE_TIME.WARNING) {
    optimizations.push({
      type: 'server',
      action: 'increase_memory',
      priority: 'medium',
      reason: `Elevated response time (${metrics.avgResponseTime.toFixed(2)}ms)`,
      details: {
        currentMemory: metrics.environment.memoryLimit || 'default',
        recommendedMemory: calculateRecommendedMemory(metrics)
      }
    });
  }
  
  // Check memory usage
  if (metrics.memoryUsage > THRESHOLDS.MEMORY_USAGE.CRITICAL) {
    optimizations.push({
      type: 'server',
      action: 'increase_memory',
      priority: 'high',
      reason: `High memory usage (${(metrics.memoryUsage * 100).toFixed(2)}%)`,
      details: {
        currentMemory: metrics.environment.memoryLimit || 'default',
        recommendedMemory: calculateRecommendedMemory(metrics)
      }
    });
  } else if (metrics.memoryUsage > THRESHOLDS.MEMORY_USAGE.WARNING) {
    optimizations.push({
      type: 'server',
      action: 'optimize_memory_usage',
      priority: 'medium',
      reason: `Elevated memory usage (${(metrics.memoryUsage * 100).toFixed(2)}%)`,
      details: {
        suggestions: [
          'Implement memory leak detection',
          'Review large object allocations',
          'Consider implementing garbage collection hints'
        ]
      }
    });
  }
  
  // Check CPU usage
  if (metrics.cpuUsage > THRESHOLDS.CPU_USAGE.CRITICAL) {
    optimizations.push({
      type: 'deployment',
      action: 'optimize_cpu_usage',
      priority: 'high',
      reason: `High CPU usage (${(metrics.cpuUsage * 100).toFixed(2)}%)`,
      details: {
        currentSettings: {
          useProductionMode: metrics.environment.nodeEnv === 'production'
        },
        recommendedSettings: {
          useProductionMode: true,
          cacheEnabled: true,
          workerProcesses: 'auto'
        }
      }
    });
  } else if (metrics.cpuUsage > THRESHOLDS.CPU_USAGE.WARNING) {
    optimizations.push({
      type: 'deployment',
      action: 'optimize_cpu_usage',
      priority: 'medium',
      reason: `Elevated CPU usage (${(metrics.cpuUsage * 100).toFixed(2)}%)`,
      details: {
        suggestions: [
          'Review computation-heavy endpoints',
          'Implement request throttling/caching',
          'Consider worker threads for CPU-bound tasks'
        ]
      }
    });
  }
  
  // Check error rate
  if (metrics.errorRate > THRESHOLDS.ERROR_RATE.CRITICAL) {
    optimizations.push({
      type: 'monitoring',
      action: 'enhance_error_handling',
      priority: 'high',
      reason: `High error rate (${(metrics.errorRate * 100).toFixed(2)}%)`,
      details: {
        currentErrorRate: metrics.errorRate,
        threshold: THRESHOLDS.ERROR_RATE.CRITICAL,
        recommendations: [
          'Implement detailed error logging',
          'Add circuit breakers for failing systems',
          'Review error patterns for top issues'
        ]
      }
    });
  }
  
  // Check request rate vs concurrency
  if (metrics.requestRate && metrics.concurrentRequests) {
    const requestRatioPerConcurrent = metrics.requestRate / Math.max(1, metrics.concurrentRequests);
    
    if (requestRatioPerConcurrent > 20) {
      // High request turnover suggests short-lived requests - optimize for throughput
      optimizations.push({
        type: 'deployment',
        action: 'optimize_for_throughput',
        priority: 'medium',
        reason: `High throughput pattern detected (${requestRatioPerConcurrent.toFixed(1)} req/concurrent)`,
        details: {
          recommendations: [
            'Increase connection pooling',
            'Optimize routing layer',
            'Consider HTTP keep-alive configuration'
          ]
        }
      });
    } else if (requestRatioPerConcurrent < 2) {
      // Low request turnover suggests long-lived requests - optimize for concurrency
      optimizations.push({
        type: 'deployment',
        action: 'optimize_for_concurrency',
        priority: 'medium',
        reason: `High concurrency pattern detected (${requestRatioPerConcurrent.toFixed(1)} req/concurrent)`,
        details: {
          recommendations: [
            'Implement request timeouts',
            'Review long-running operations',
            'Consider streaming responses for large payloads'
          ]
        }
      });
    }
  }
  
  return optimizations;
}

/**
 * Calculate recommended memory based on current usage patterns
 */
function calculateRecommendedMemory(metrics) {
  // Base memory is current memory limit (or default of 512 if undefined)
  const currentMemory = metrics.environment.memoryLimit || 512;
  
  // Get process memory usage
  const heapUsed = metrics.environment.processMemory?.heapUsed || 0;
  const rss = metrics.environment.processMemory?.rss || 0;
  
  // Calculate target based on current usage plus buffer
  const processTarget = Math.max(heapUsed * 2, rss * 1.5);
  
  // Calculate target based on performance metrics
  let performanceTarget = currentMemory;
  
  // If response time is high, increase target
  if (metrics.avgResponseTime > THRESHOLDS.RESPONSE_TIME.CRITICAL) {
    performanceTarget = currentMemory * 1.5;
  } else if (metrics.avgResponseTime > THRESHOLDS.RESPONSE_TIME.WARNING) {
    performanceTarget = currentMemory * 1.25;
  }
  
  // If memory usage is high, increase target
  if (metrics.memoryUsage > THRESHOLDS.MEMORY_USAGE.CRITICAL) {
    performanceTarget = Math.max(performanceTarget, currentMemory * 2);
  } else if (metrics.memoryUsage > THRESHOLDS.MEMORY_USAGE.WARNING) {
    performanceTarget = Math.max(performanceTarget, currentMemory * 1.5);
  }
  
  // Take the max of all calculated targets
  const rawTarget = Math.max(processTarget, performanceTarget);
  
  // Round to nearest 128MB
  const recommendedMemory = Math.ceil(rawTarget / 128) * 128;
  
  // Cap at a reasonable maximum (8GB)
  return Math.min(recommendedMemory, 8192);
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
          
        case 'set_production_mode':
          await updateProductionMode();
          results.push({
            action: opt.action,
            status: 'success',
            message: 'Updated environment to production mode'
          });
          break;
          
        case 'optimize_cpu_usage':
          await optimizeCpuUsage(opt.details);
          results.push({
            action: opt.action,
            status: 'success',
            message: 'Applied CPU optimization settings'
          });
          break;
          
        case 'enhance_error_handling':
          await enhanceErrorHandling();
          results.push({
            action: opt.action,
            status: 'success',
            message: 'Enhanced error tracking enabled'
          });
          break;
          
        case 'optimize_for_throughput':
        case 'optimize_for_concurrency':
          // These are recommendations only, not automated actions
          results.push({
            action: opt.action,
            status: 'recommendation',
            message: `Recommendation provided: ${opt.details.recommendations.join(', ')}`
          });
          break;
          
        case 'optimize_memory_usage':
          // These are recommendations only, not automated actions
          results.push({
            action: opt.action,
            status: 'recommendation',
            message: `Recommendation provided: ${opt.details.suggestions.join(', ')}`
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
      console.error(`❌ Error performing ${opt.action}:`, error);
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
        console.log(`📝 Updated workflow config with memory limit ${memoryMB}MB`);
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
        console.log(`📝 Updated Replit config with memory limit ${memoryMB}MB`);
      }
    }
    
    // Update environment controller config
    if (environmentController) {
      // Update memory settings in the controller
      environmentController.updateScalingConfig({
        actions: {
          memory: {
            initialMB: memoryMB,
            incrementMB: Math.floor(memoryMB * 0.25), // 25% of base memory
            maxMB: memoryMB * 2 // Double the base memory
          }
        }
      });
      
      console.log(`📝 Updated environment controller with memory settings`);
    }
    
    // Update .env file
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add NODE_OPTIONS
    if (envContent.includes('NODE_OPTIONS=')) {
      envContent = envContent.replace(
        /NODE_OPTIONS=["']?([^"'\n]*)["']?/,
        (match, contents) => {
          if (contents.includes('--max-old-space-size=')) {
            return match.replace(/--max-old-space-size=\d+/, `--max-old-space-size=${memoryMB}`);
          } else {
            return match.replace(contents, `${contents} --max-old-space-size=${memoryMB}`);
          }
        }
      );
    } else {
      envContent += `\nNODE_OPTIONS="--max-old-space-size=${memoryMB}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env file with memory limit ${memoryMB}MB`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating Node.js memory limit:', error);
    throw new Error(`Failed to update memory limit: ${error.message}`);
  }
}

/**
 * Update environment to production mode
 */
async function updateProductionMode() {
  try {
    // Update .env file
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add NODE_ENV
    if (envContent.includes('NODE_ENV=')) {
      envContent = envContent.replace(/NODE_ENV=\w+/, 'NODE_ENV=production');
    } else {
      envContent += '\nNODE_ENV=production\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Updated .env file to use production mode');
    
    // Update Replit config if it exists
    if (fs.existsSync(REPLIT_CONFIG_PATH)) {
      const replitConfig = JSON.parse(fs.readFileSync(REPLIT_CONFIG_PATH, 'utf8'));
      
      // Update run command to include NODE_ENV=production
      if (replitConfig.run) {
        if (replitConfig.run.includes('NODE_ENV=')) {
          replitConfig.run = replitConfig.run.replace(/NODE_ENV=\w+/, 'NODE_ENV=production');
        } else {
          replitConfig.run = `NODE_ENV=production ${replitConfig.run}`;
        }
        
        // Save updated config
        fs.writeFileSync(REPLIT_CONFIG_PATH, JSON.stringify(replitConfig, null, 2));
        console.log('📝 Updated Replit config to use production mode');
      }
    }
    
    // Update global config
    config.updateConfig({
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
    
    console.log('📝 Updated global config for production optimization');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating production mode:', error);
    throw new Error(`Failed to update to production mode: ${error.message}`);
  }
}

/**
 * Optimize CPU usage
 */
async function optimizeCpuUsage(details) {
  try {
    // Enable production mode
    await updateProductionMode();
    
    // Update global config with CPU-friendly settings
    config.updateConfig({
      app: {
        debug: false
      },
      performance: {
        caching: true,
        compressionLevel: 1, // Lower compression level is less CPU-intensive
        etags: true,
        minify: true
      },
      features: {
        lazyLoading: true
      },
      logging: {
        level: 'warn',
        format: 'json',
        console: false,
        file: true
      }
    });
    
    console.log('📝 Applied CPU optimization settings');
    
    return true;
  } catch (error) {
    console.error('❌ Error optimizing CPU usage:', error);
    throw new Error(`Failed to optimize CPU usage: ${error.message}`);
  }
}

/**
 * Enable enhanced error tracking
 */
async function enhanceErrorHandling() {
  try {
    // Update global config with enhanced error tracking
    config.updateConfig({
      logging: {
        level: 'verbose',
        format: 'json',
        console: false,
        file: true,
        maxFiles: 10,
        maxSize: '20m'
      },
      monitoring: {
        errorTracking: true,
        detailedErrors: true,
        healthChecks: true,
        errorNotifications: true
      }
    });
    
    console.log('📝 Enhanced error tracking enabled');
    
    return true;
  } catch (error) {
    console.error('❌ Error enabling error tracking:', error);
    throw new Error(`Failed to enable error tracking: ${error.message}`);
  }
}

/**
 * Configure automatic scaling based on metrics and optimizations
 */
async function configureAutomaticScaling(metrics, optimizations) {
  try {
    // Skip if no environment controller
    if (!environmentController) {
      return {
        configured: false,
        reason: 'Environment controller not available'
      };
    }
    
    // Determine scaling mode based on optimizations
    const needsAggressive = optimizations.some(opt => 
      opt.priority === 'high' && 
      (opt.action === 'increase_memory' || opt.action === 'optimize_cpu_usage')
    );
    
    // Calculate appropriate thresholds based on current metrics
    const cpuThreshold = needsAggressive ? 0.7 : Math.max(0.75, metrics.cpuUsage * 1.2);
    const memoryThreshold = needsAggressive ? 0.7 : Math.max(0.75, metrics.memoryUsage * 1.2);
    const responseTimeThreshold = needsAggressive 
      ? Math.min(THRESHOLDS.RESPONSE_TIME.WARNING, metrics.avgResponseTime * 0.8)
      : Math.min(THRESHOLDS.RESPONSE_TIME.CRITICAL, metrics.avgResponseTime * 1.2);
    
    // Configure environment controller
    const scalingConfig = environmentController.updateScalingConfig({
      enabled: true,
      autoScale: true,
      checkIntervalMs: needsAggressive ? 30000 : 60000, // 30s or 60s
      metrics: {
        cpu: {
          threshold: cpuThreshold,
          cooldownMinutes: needsAggressive ? 5 : 10
        },
        memory: {
          threshold: memoryThreshold,
          cooldownMinutes: needsAggressive ? 8 : 15
        },
        responseTime: {
          threshold: responseTimeThreshold,
          cooldownMinutes: needsAggressive ? 3 : 5
        }
      }
    });
    
    // Start monitoring if not already started
    environmentController.startMonitoring();
    
    console.log(`📈 Configured automatic scaling (${needsAggressive ? 'aggressive' : 'standard'} mode)`);
    console.log(`   - CPU threshold: ${(cpuThreshold * 100).toFixed(0)}%`);
    console.log(`   - Memory threshold: ${(memoryThreshold * 100).toFixed(0)}%`);
    console.log(`   - Response time threshold: ${responseTimeThreshold.toFixed(0)}ms`);
    
    return {
      configured: true,
      mode: needsAggressive ? 'aggressive' : 'standard',
      thresholds: {
        cpu: cpuThreshold,
        memory: memoryThreshold,
        responseTime: responseTimeThreshold
      }
    };
  } catch (error) {
    console.error('❌ Error configuring automatic scaling:', error);
    return {
      configured: false,
      reason: `Error: ${error.message}`
    };
  }
}

/**
 * Generate summary of optimization results
 */
function generateSummary(results, scalingResult) {
  const successful = results.filter(r => r.status === 'success').length;
  const recommendations = results.filter(r => r.status === 'recommendation').length;
  const failed = results.filter(r => r.status === 'error').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  let scalingSummary = '';
  if (scalingResult.configured) {
    scalingSummary = ` Automatic scaling enabled in ${scalingResult.mode} mode.`;
  }
  
  return {
    total: results.length,
    successful,
    recommendations,
    failed,
    skipped,
    message: `Applied ${successful} optimizations, provided ${recommendations} recommendations.${scalingSummary}`
  };
}

// Run if called directly
if (require.main === module) {
  optimizeDeployment().catch(err => {
    console.error('❌ Optimization failed:', err);
    process.exit(1);
  });
}

module.exports = { optimizeDeployment };
