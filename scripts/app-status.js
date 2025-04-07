/**
 * App Status Monitor
 * 
 * Provides comprehensive application status checks and monitoring
 * to ensure system health and performance.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';

const execPromise = util.promisify(exec);
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '..', 'logs', 'app-status');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// App Status Service (from edited code)
// This utility checks the status of various application components


// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs', 'app-status');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Runs a comprehensive check of the application status
 * @returns {Promise<Object>} Status report
 */
async function runAppStatusCheck() {
  console.log('Running app status check...');

  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    status: 'healthy', // Default to healthy, will change if issues found
    checkedServices: 0,
    onlineServices: 0,
    offlineServices: 0,
    issues: [],
    details: {},
    executionTimeMs: 0
  };

  try {
    // Check file system health
    const fsStatus = await checkFileSystemHealth();
    results.details.fileSystem = fsStatus;
    results.checkedServices++;

    if (fsStatus.status === 'healthy') {
      results.onlineServices++;
    } else {
      results.offlineServices++;
      results.status = 'degraded';
      results.issues.push({
        service: 'File System',
        message: fsStatus.message || 'File system issues detected'
      });
    }

    // Check node modules
    const nodeModulesStatus = await checkNodeModules();
    results.details.nodeModules = nodeModulesStatus;
    results.checkedServices++;

    if (nodeModulesStatus.status === 'healthy') {
      results.onlineServices++;
    } else {
      results.offlineServices++;
      results.status = 'degraded';
      results.issues.push({
        service: 'Node Modules',
        message: nodeModulesStatus.message || 'Node modules issues detected'
      });
    }

    // Check configuration files
    const configStatus = await checkConfigFiles();
    results.details.configFiles = configStatus;
    results.checkedServices++;

    if (configStatus.status === 'healthy') {
      results.onlineServices++;
    } else {
      results.offlineServices++;
      results.status = 'degraded';
      results.issues.push({
        service: 'Configuration',
        message: configStatus.message || 'Configuration issues detected'
      });
    }

    // Log results
    logStatusCheck(results);

    // Calculate execution time
    results.executionTimeMs = Date.now() - startTime;

    return results;
  } catch (error) {
    console.error('Error in app status check:', error);
    results.status = 'error';
    results.issues.push({
      service: 'Status Check',
      message: `Internal error: ${error.message}`
    });
    results.executionTimeMs = Date.now() - startTime;

    // Log error results
    logStatusCheck(results);

    return results;
  }
}

/**
 * Checks the file system health
 * @returns {Promise<Object>} Status report
 */
async function checkFileSystemHealth() {
  try {
    // Check critical directories
    const criticalDirs = [
      path.join(__dirname, '..', 'client', 'src'),
      path.join(__dirname, '..', 'server'),
      path.join(__dirname, '..', 'scripts'),
      path.join(__dirname, '..', 'public')
    ];

    for (const dir of criticalDirs) {
      if (!fs.existsSync(dir)) {
        return {
          status: 'error',
          message: `Critical directory missing: ${dir}`
        };
      }
    }

    // Check writable logs directory
    const testFile = path.join(logsDir, 'test-write.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);

    return {
      status: 'healthy',
      message: 'File system is healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: `File system error: ${error.message}`
    };
  }
}

/**
 * Checks node modules health
 * @returns {Promise<Object>} Status report
 */
async function checkNodeModules() {
  try {
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
      return {
        status: 'warning',
        message: 'Node modules directory not found. Dependencies may need installation.'
      };
    }

    // Check for critical packages
    const criticalPackages = ['react', 'express', 'vite'];
    const missingPackages = [];

    for (const pkg of criticalPackages) {
      const pkgPath = path.join(nodeModulesPath, pkg);
      if (!fs.existsSync(pkgPath)) {
        missingPackages.push(pkg);
      }
    }

    if (missingPackages.length > 0) {
      return {
        status: 'warning',
        message: `Missing critical packages: ${missingPackages.join(', ')}`
      };
    }

    return {
      status: 'healthy',
      message: 'Node modules are properly installed'
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Node modules check error: ${error.message}`
    };
  }
}

/**
 * Checks configuration files health
 * @returns {Promise<Object>} Status report
 */
async function checkConfigFiles() {
  try {
    // Check critical configuration files
    const criticalFiles = [
      path.join(__dirname, '..', 'package.json'),
      path.join(__dirname, '..', '.replit'),
      path.join(__dirname, '..', 'vite.config.ts')
    ];

    const missingFiles = [];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      return {
        status: 'error',
        message: `Missing critical configuration files: ${missingFiles.join(', ')}`
      };
    }

    // Check package.json format
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!packageJson.name || !packageJson.version || !packageJson.scripts) {
      return {
        status: 'warning',
        message: 'package.json is missing essential fields'
      };
    }

    return {
      status: 'healthy',
      message: 'Configuration files are present and valid'
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Configuration check error: ${error.message}`
    };
  }
}

/**
 * Logs the status check results to a file
 * @param {Object} results - The results to log
 */
function logStatusCheck(results) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFile = path.join(logsDir, `status-check-${timestamp}.json`);
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
    console.log(`Status check logged to ${logFile}`);

    // Maintain a latest.json file for quick access
    const latestFile = path.join(logsDir, 'latest.json');
    fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error logging status check:', error);
  }
}

// Add a monitor function for continuous monitoring
async function monitorAppStatus(intervalMinutes = 60) {
  console.log(`Starting app status monitor with ${intervalMinutes} minute intervals...`);

  // Run initial check
  await runAppStatusCheck();

  // Set up recurring checks
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(async () => {
    console.log('Running scheduled app status check...');
    await runAppStatusCheck();
  }, intervalMs);

  console.log(`App status monitor running, checking every ${intervalMinutes} minutes`);
}


/**
 * Check system resources
 */
async function checkSystemResources() {
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 100);

    // CPU load
    const cpus = os.cpus();
    const cpuCount = cpus.length;

    try {
      // Get CPU load from top command
      const { stdout } = await execPromise("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");
      const cpuUsage = parseFloat(stdout.trim());

      this.status.system.cpu = {
        usage: cpuUsage,
        cores: cpuCount
      };
    } catch (error) {
      console.error('Error getting CPU usage:', error);
      this.status.system.cpu = {
        usage: 'Unknown',
        cores: cpuCount
      };
    }

    this.status.system.memory = {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(usedMem),
      usagePercent: memoryUsagePercent
    };

    this.status.system.uptime = formatUptime(os.uptime());

    // Process memory usage (Node.js specific)
    const nodeMemoryUsage = process.memoryUsage();
    this.status.performance.memoryUsage = {
      rss: formatBytes(nodeMemoryUsage.rss),
      heapTotal: formatBytes(nodeMemoryUsage.heapTotal),
      heapUsed: formatBytes(nodeMemoryUsage.heapUsed),
      external: formatBytes(nodeMemoryUsage.external),
    };
  }


/**
 * Check if the server is running
 */
async function checkServerStatus() {
  try {
    const { stdout, stderr } = await execPromise('ps aux | grep "node.*server" | grep -v grep');
    this.status.application.serverRunning = stdout.trim().length > 0;
  } catch (error) {
    this.status.application.serverRunning = false;
  }
}

/**
 * Check client build status
 */
async function checkClientBuildStatus() {
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

  if (fs.existsSync(clientDistPath)) {
    try {
      const stats = fs.statSync(clientDistPath);
      const lastModified = stats.mtime;
      const now = new Date();
      const ageInDays = (now - lastModified) / (1000 * 60 * 60 * 24);

      this.status.application.clientBuildStatus = {
        exists: true,
        lastBuilt: lastModified.toISOString(),
        ageInDays: Math.round(ageInDays * 10) / 10,
        needsRebuild: ageInDays > 7
      };
    } catch (error) {
      this.status.application.clientBuildStatus = {
        exists: true,
        error: error.message
      };
    }
  } else {
    this.status.application.clientBuildStatus = {
      exists: false,
      needsRebuild: true
    };
  }
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  try {
    const { stdout, stderr } = await execPromise('node -e "require(\'./server/db.ts\').checkConnection().then(status => console.log(\'DB:\', status))"');
    this.status.application.databaseConnection = {
      success: stdout.includes('DB: connected'),
      message: stdout.trim()
    };
  } catch (error) {
    this.status.application.databaseConnection = {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check security status
 */
async function checkSecurityStatus() {
  try {
    const { stdout } = await execPromise('node -e "const { securityMonitor } = require(\'./server/services/securityMonitor.js\'); securityMonitor.validateAssetIntegrity().then(results => console.log(JSON.stringify(results)))"');
    const securityResults = JSON.parse(stdout);

    this.status.security = {
      issuesDetected: securityResults.valid ? [] : securityResults.issues || ['Unknown security issues'],
      lastSecurityCheck: new Date().toISOString(),
      valid: securityResults.valid
    };
  } catch (error) {
    this.status.security = {
      issuesDetected: ['Error running security check: ' + error.message],
      lastSecurityCheck: new Date().toISOString(),
      valid: false
    };
  }
}

/**
 * Generate a human-readable summary
 */
function generateSummary() {
  const status = this.status;
  const criticalIssues = [];
  const warnings = [];
  const healthyComponents = [];

  // Check server
  if (status.application.serverRunning) {
    healthyComponents.push('Server is running');
  } else {
    criticalIssues.push('Server is not running');
  }

  // Check client build
  if (status.application.clientBuildStatus) {
    if (!status.application.clientBuildStatus.exists) {
      criticalIssues.push('Client build not found');
    } else if (status.application.clientBuildStatus.needsRebuild) {
      warnings.push(`Client build is ${status.application.clientBuildStatus.ageInDays} days old`);
    } else {
      healthyComponents.push('Client build is up to date');
    }
  }

  // Check database
  if (status.application.databaseConnection) {
    if (status.application.databaseConnection.success) {
      healthyComponents.push('Database connection successful');
    } else {
      criticalIssues.push('Database connection failed');
    }
  }

  // Check memory usage
  if (status.system.memory && status.system.memory.usagePercent > 90) {
    criticalIssues.push(`High memory usage: ${status.system.memory.usagePercent}%`);
  } else if (status.system.memory && status.system.memory.usagePercent > 80) {
    warnings.push(`Elevated memory usage: ${status.system.memory.usagePercent}%`);
  } else if (status.system.memory) {
    healthyComponents.push(`Memory usage normal: ${status.system.memory.usagePercent}%`);
  }

  // Check security
  if (status.security) {
    if (!status.security.valid) {
      criticalIssues.push(`Security issues detected: ${status.security.issuesDetected.length}`);
    } else {
      healthyComponents.push('Security validation passed');
    }
  }

  // Build summary
  let summary = `\n=== APP STATUS SUMMARY (${new Date().toLocaleString()}) ===\n\n`;

  if (criticalIssues.length > 0) {
    summary += '🔴 CRITICAL ISSUES:\n';
    criticalIssues.forEach(issue => {
      summary += `  - ${issue}\n`;
    });
    summary += '\n';
  }

  if (warnings.length > 0) {
    summary += '🟠 WARNINGS:\n';
    warnings.forEach(warning => {
      summary += `  - ${warning}\n`;
    });
    summary += '\n';
  }

  if (healthyComponents.length > 0) {
    summary += '🟢 HEALTHY COMPONENTS:\n';
    healthyComponents.forEach(component => {
      summary += `  - ${component}\n`;
    });
    summary += '\n';
  }

  // Add system info
  summary += '📊 SYSTEM INFO:\n';
  summary += `  - Memory: ${status.system.memory.used} used of ${status.system.memory.total} (${status.system.memory.usagePercent}%)\n`;
  summary += `  - CPU: ${typeof status.system.cpu.usage === 'number' ? status.system.cpu.usage.toFixed(1) + '%' : status.system.cpu.usage} across ${status.system.cpu.cores} cores\n`;
  summary += `  - Uptime: ${status.system.uptime}\n`;
  summary += `  - Node Version: ${status.system.nodeVersion}\n\n`;

  // Overall status
  const healthStatus = criticalIssues.length === 0
    ? '✅ HEALTHY'
    : criticalIssues.length <= 2 && warnings.length <= 3
      ? '⚠️ NEEDS ATTENTION'
      : '❌ UNHEALTHY';

  summary += `OVERALL STATUS: ${healthStatus}\n`;
  summary += '=================================================\n';

  return summary;
}

/**
 * Log the status check to a file
 */
function logStatusCheck() {
  const logFile = path.join(LOG_DIR, `status-${new Date().toISOString().slice(0, 10)}.json`);
  const summary = this.generateSummary();

  try {
    // Write JSON status to file
    fs.writeFileSync(
      logFile,
      JSON.stringify(this.status, null, 2)
    );

    // Write summary to console
    console.log(summary);

    // Write summary to a readable log file
    fs.writeFileSync(
      path.join(LOG_DIR, `summary-${new Date().toISOString().slice(0, 10)}.txt`),
      summary,
      { flag: 'a' } // Append mode
    );

    return true;
  } catch (error) {
    console.error('Error saving status log:', error);
    return false;
  }
}

/**
 * Monitor the application status at regular intervals
 */
async function monitorAppStatus(intervalMinutes = 60) {
  const monitor = new AppStatusMonitor();
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`Starting app status monitoring (interval: ${intervalMinutes} minutes)`);

  // Run initial check
  await monitor.runFullStatusCheck();

  // Set up interval for continuous monitoring
  setInterval(async () => {
    console.log(`\nRunning scheduled app status check (${new Date().toLocaleString()})`);
    await monitor.runFullStatusCheck();
  }, intervalMs);

  return monitor;
}

/**
 * Run a one-time status check
 */
async function runAppStatusCheckOneTime() {
  const monitor = new AppStatusMonitor();
  const result = await monitor.runFullStatusCheck();
  return result;
}


/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format uptime to human-readable format
 */
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

class AppStatusMonitor {
  constructor() {
    this.lastCheck = null;
    this.status = {
      timestamp: null,
      system: {
        memory: null,
        cpu: null,
        uptime: null,
        nodeVersion: process.version
      },
      application: {
        serverRunning: false,
        clientBuildStatus: null,
        apiEndpoints: [],
        databaseConnection: null
      },
      performance: {
        memoryUsage: null,
        responseTime: {},
        errorRate: null
      },
      security: {
        issuesDetected: [],
        lastSecurityCheck: null
      }
    };
  }

  async runFullStatusCheck() {
    console.log('Starting comprehensive app status check...');
    this.status.timestamp = new Date().toISOString();
    this.lastCheck = Date.now();

    try {
      // Check system resources
      await checkSystemResources.call(this);

      // Check if server is running
      await checkServerStatus.call(this);

      // Check client build status
      await checkClientBuildStatus.call(this);

      // Check database connectivity
      await checkDatabaseConnection.call(this);

      // Check security status
      await checkSecurityStatus.call(this);

      // Log the results
      logStatusCheck.call(this);

      return {
        success: true,
        status: this.status,
        summary: generateSummary.call(this)
      };
    } catch (error) {
      console.error('Error during app status check:', error);
      return {
        success: false,
        error: error.message,
        status: this.status
      };
    }
  }
}

// If this script is run directly
if (require.main === module) {
  // Check if monitoring mode is enabled
  const args = process.argv.slice(2);
  const intervalArg = args[0];

  if (intervalArg && !isNaN(intervalArg)) {
    // Run in monitoring mode
    monitorAppStatus(parseInt(intervalArg, 10));
  } else {
    // Run single check
    runAppStatusCheckOneTime().then(result => {
      if (!result.success) {
        process.exit(1);
      }
    }).catch(err => {
      console.error('Error running app status check:', err);
      process.exit(1);
    });
  }
}

export {
  AppStatusMonitor,
  monitorAppStatus,
  runAppStatusCheck
};