
/**
 * Debug Application Utility
 * 
 * This script helps diagnose issues across your application stack.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n====== APPLICATION DEBUGGING TOOL ======\n');

// Check environment
try {
  const nodeVersion = execSync('node -v').toString().trim();
  const npmVersion = execSync('npm -v').toString().trim();
  console.log(`✅ Node.js: ${nodeVersion}, npm: ${npmVersion}`);
} catch (error) {
  console.error('❌ Failed to detect Node/npm version:', error.message);
}

// Check for required files
const criticalFiles = [
  'server/index.ts',
  'client/src/App.tsx',
  'package.json'
];

console.log('\n--- Critical Files Check ---');
criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} exists`);
  } else {
    console.log(`❌ ${filePath} is missing`);
  }
});

// Check environment variables
console.log('\n--- Environment Variables ---');
const envFiles = ['.env', '.env.local', '.env.example'];
const foundEnvFiles = envFiles.filter(file => fs.existsSync(file));

if (foundEnvFiles.length > 0) {
  console.log(`✅ Environment files found: ${foundEnvFiles.join(', ')}`);
  
  try {
    const envContent = fs.readFileSync(foundEnvFiles[0], 'utf8');
    const criticalVars = ['PORT', 'NODE_ENV'];
    const missingVars = criticalVars.filter(v => !envContent.includes(v));
    
    if (missingVars.length > 0) {
      console.log(`⚠️ Missing critical environment variables: ${missingVars.join(', ')}`);
    } else {
      console.log('✅ Critical environment variables defined');
    }
  } catch (error) {
    console.log('❌ Failed to check environment variables');
  }
} else {
  console.log('⚠️ No environment files found');
}

// Analyze logging configuration
console.log('\n--- Logging Configuration ---');
try {
  const configPath = 'config/globalConfig.ts';
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract logging level
    const logLevelMatch = configContent.match(/level:.*?default\(['"](.+?)['"]\)/);
    if (logLevelMatch) {
      console.log(`Current log level: ${logLevelMatch[1]}`);
      if (logLevelMatch[1] !== 'debug' && logLevelMatch[1] !== 'verbose' && logLevelMatch[1] !== 'silly') {
        console.log('ℹ️ For more detailed logs, set level to "debug", "verbose", or "silly"');
      }
    }
    
    // Extract log format
    const logFormatMatch = configContent.match(/format:.*?default\(['"](.+?)['"]\)/);
    if (logFormatMatch) {
      console.log(`Current log format: ${logFormatMatch[1]}`);
    }
  } else {
    console.log('❌ Config file not found');
  }
} catch (error) {
  console.log('❌ Error analyzing logging configuration:', error.message);
}

// Check server status
console.log('\n--- Server Status ---');
try {
  const lsofOutput = execSync('lsof -i TCP:3000').toString();
  console.log('✅ Server is running on port 3000');
} catch (error) {
  console.log('❌ No server detected on port 3000');
}

// Check package dependencies
console.log('\n--- Dependencies Check ---');
try {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for outdated packages
    try {
      console.log('Checking for outdated packages...');
      const outdatedOutput = execSync('npm outdated --depth=0').toString();
      if (outdatedOutput.trim()) {
        console.log('⚠️ Some packages are outdated');
      } else {
        console.log('✅ All packages are up-to-date');
      }
    } catch (error) {
      // npm outdated returns non-zero exit code when outdated packages are found
      console.log('⚠️ Some packages are outdated');
    }
    
    // Check for known vulnerabilities
    try {
      console.log('Checking for vulnerabilities...');
      execSync('npm audit --production');
      console.log('✅ No vulnerabilities found');
    } catch (error) {
      console.log('⚠️ Some vulnerabilities found. Run "npm audit" for details');
    }
  }
} catch (error) {
  console.log('❌ Failed to check dependencies:', error.message);
}

// Enable verbose logging
console.log('\n--- Enabling Verbose Logging ---');
console.log('To enable detailed logging in the application, you can:');
console.log('1. Temporarily modify config/globalConfig.ts to set logging.level to "debug"');
console.log('2. Use the logger in your code: import { log } from "./server/utils/logger"');
console.log('3. Add debug statements: log.debug("Debugging info", { data: value })');

// Inspect the performance monitoring
console.log('\n--- Performance Monitoring ---');
console.log('The application has built-in performance monitoring in server/middleware/performance.ts');
console.log('To analyze performance issues:');
console.log('1. Check logs/performance.log for timing information');
console.log('2. Look for slow requests (> 1000ms response time)');
console.log('3. Monitor memory usage and CPU utilization');

// Client-side debugging tools
console.log('\n--- Client-Side Debugging ---');
console.log('For React application debugging:');
console.log('1. Error boundaries are configured in client/src/components/ui/error-boundary.tsx');
console.log('2. Client errors are reported to /api/logs/client-error endpoint');
console.log('3. Use React DevTools browser extension for component inspection');

// Debugging API requests
console.log('\n--- API Request Debugging ---');
console.log('To debug API requests:');
console.log('1. Check client/src/lib/apiInterceptor.ts for request/response handling');
console.log('2. Inspect browser Network tab for API calls');
console.log('3. Server logs will show detailed API request/response information');

console.log('\n====== END OF DEBUGGING REPORT ======\n');

console.log('For more detailed system diagnosis, run:');
console.log('node scripts/diagnose-environment.js');
