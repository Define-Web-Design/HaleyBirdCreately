/**
 * Creately Application Starter
 * 
 * This script provides an intelligent startup system for the Creately application
 * with advanced error handling, dependency checking, and fallback mechanisms.
 */
const { execSync, spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');
const os = require('os');

// Prettier logging with timestamps and colors
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m', // Reset
  };
  
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  
  console.log(`${colors[type]}[${timestamp}] ${prefix[type]} ${message}${colors.reset}`);
}

// Banner for startup
function printBanner() {
  console.log(`
\x1b[34m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                           ┃
┃   \x1b[36mCreately Application Starter v1.0.0\x1b[34m      ┃
┃   \x1b[33mIntelligent startup with fallback systems\x1b[34m ┃
┃                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m
  `);
}

// Check for required dependencies
function checkDependencies() {
  log('Checking dependencies...', 'info');
  
  // Required Node.js version
  const requiredNodeVersion = '14.0.0';
  const currentNodeVersion = process.version.slice(1); // Remove 'v' prefix
  
  if (compareVersions(currentNodeVersion, requiredNodeVersion) < 0) {
    log(`Node.js version ${requiredNodeVersion} or higher is required. Current version: ${currentNodeVersion}`, 'error');
    return false;
  }
  
  // Check if package.json exists and is valid
  try {
    let packageJson;
    if (existsSync(path.join(__dirname, 'package.json'))) {
      packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
      log(`Detected package.json: ${packageJson.name} v${packageJson.version}`, 'info');
    } else {
      log('No package.json found. Using minimal dependency checks.', 'warning');
    }
    
    // Check for TypeScript if we have .ts files
    if (existsSync(path.join(__dirname, 'server', 'index.ts'))) {
      try {
        execSync('npx tsc --version', { stdio: 'pipe' });
        log('TypeScript is available', 'success');
      } catch (e) {
        log('TypeScript is required but not available. Fallback server may be used.', 'warning');
      }
    }
    
    return true;
  } catch (error) {
    log(`Error checking dependencies: ${error.message}`, 'error');
    return false;
  }
}

// Compare semver versions
function compareVersions(v1, v2) {
  const v1parts = v1.split('.').map(Number);
  const v2parts = v2.split('.').map(Number);
  
  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }
    
    if (v1parts[i] === v2parts[i]) {
      continue;
    }
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    return -1;
  }
  
  if (v1parts.length !== v2parts.length) {
    return -1;
  }
  
  return 0;
}

// Load environment configuration
function loadEnvironment() {
  log('Loading environment configuration...', 'info');
  
  // Load from config/environment.js if available
  if (existsSync(path.join(__dirname, 'config', 'environment.js'))) {
    try {
      const config = require('./config/environment.js');
      log('Loaded configuration from config/environment.js', 'success');
      
      // Apply config to environment if not already set
      process.env.PORT = process.env.PORT || config.server.port.toString();
      process.env.NODE_ENV = process.env.NODE_ENV || config.server.env;
      
      if (config.database.useInMemory) {
        process.env.USE_IN_MEMORY_DB = 'true';
      }
      
      // Check API keys for AI features
      log('Checking Mistral AI integration...', 'info');
      if (config.apiKeys.mistral === 'MISTRAL_API_KEY_NOT_SET') {
        log('Mistral AI API Key is missing or not set', 'warning');
        log('AI chat features will be disabled', 'warning');
      } else {
        log('Mistral AI API Key is configured', 'success');
      }
      
      log('Checking Codestral integration...', 'info');
      if (config.apiKeys.codestral === 'CODESTRAL_API_KEY_NOT_SET') {
        log('Codestral API Key is missing or not set', 'warning');
        log('Code assistance features will be disabled', 'warning');
      } else {
        log('Codestral API Key is configured', 'success');
      }
      
      log('Checking OpenAI integration...', 'info');
      if (config.apiKeys.openai === 'OPENAI_API_KEY_NOT_SET') {
        log('OpenAI API Key is missing or not set', 'warning');
        log('AI-powered palette generation will be disabled', 'warning');
      } else {
        log('OpenAI API Key is configured', 'success');
      }
      
      // Log enabled features
      log('AI Features Status:', 'info');
      log(`- AI Palette Generation: ${config.features.aiPalette ? 'Enabled' : 'Disabled'}`, config.features.aiPalette ? 'success' : 'warning');
      log(`- AI Chat Assistant: ${config.features.aiChat ? 'Enabled' : 'Disabled'}`, config.features.aiChat ? 'success' : 'warning');
      log(`- Code Assistance: ${config.features.codeAssistance ? 'Enabled' : 'Disabled'}`, config.features.codeAssistance ? 'success' : 'warning');
      
      return true;
    } catch (error) {
      log(`Error loading environment configuration: ${error.message}`, 'error');
    }
  }
  
  // Fallback to basic environment setup
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '3000';
  
  // Use in-memory DB if no database URL is provided
  if (!process.env.DATABASE_URL) {
    log('No DATABASE_URL found, using in-memory storage', 'warning');
    process.env.USE_IN_MEMORY_DB = 'true';
  } else {
    log('Database URL found in environment', 'success');
  }
  
  // Basic API key checks in fallback mode
  if (!process.env.MISTRAL_API_KEY) {
    log('Mistral API Key is missing. AI chat features will be disabled.', 'warning');
  }
  
  if (!process.env.CODESTRAL_API_KEY) {
    log('Codestral API Key is missing. Code assistance features will be disabled.', 'warning');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    log('OpenAI API Key is missing. AI-powered palette generation will be disabled.', 'warning');
  }
  
  return true;
}

// Get system information for diagnostics
function getSystemInfo() {
  return {
    platform: process.platform,
    nodeVersion: process.version,
    memory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
    cpus: os.cpus().length,
  };
}

// Log system information
function printSystemInfo() {
  const sysInfo = getSystemInfo();
  log('System Information:', 'info');
  log(`Platform: ${sysInfo.platform}`, 'info');
  log(`Node.js Version: ${sysInfo.nodeVersion}`, 'info');
  log(`Memory: ${sysInfo.memory}`, 'info');
  log(`CPUs: ${sysInfo.cpus}`, 'info');
}

// Determine which server file to use (main or fallback)
function determineServerFile() {
  log('Determining server file to use...', 'info');
  
  // Check for main server files
  if (existsSync(path.join(__dirname, 'server', 'index.ts'))) {
    const serverFile = path.join(__dirname, 'server', 'index.ts');
    log(`Found main server file: ${serverFile}`, 'success');
    return { path: serverFile, type: 'main' };
  } 
  
  if (existsSync(path.join(__dirname, 'server', 'index.js'))) {
    const serverFile = path.join(__dirname, 'server', 'index.js');
    log(`Found main server file: ${serverFile}`, 'success');
    return { path: serverFile, type: 'main' };
  }
  
  // Check for fallback server files
  if (existsSync(path.join(__dirname, 'server', 'simple-server.ts'))) {
    const serverFile = path.join(__dirname, 'server', 'simple-server.ts');
    log(`Main server not found. Using fallback: ${serverFile}`, 'warning');
    return { path: serverFile, type: 'fallback' };
  }
  
  if (existsSync(path.join(__dirname, 'server.js'))) {
    const serverFile = path.join(__dirname, 'server.js');
    log(`Main server not found. Using fallback: ${serverFile}`, 'warning');
    return { path: serverFile, type: 'fallback' };
  }
  
  // No server file found
  log('No server file found. Cannot start application.', 'error');
  return { path: '', type: 'none' };
}

// Start the server with the given file
function startServer(serverInfo) {
  if (serverInfo.type === 'none') {
    log('Cannot start server: No server file found', 'error');
    return false;
  }
  
  log(`Starting ${serverInfo.type} server: ${serverInfo.path}`, 'info');
  
  let command = '';
  let args = [];
  
  // Determine command based on file extension
  if (serverInfo.path.endsWith('.ts')) {
    command = 'npx';
    args = ['ts-node', '--esm', serverInfo.path];
    log('Using ts-node to run TypeScript server', 'info');
  } else {
    command = 'node';
    args = [serverInfo.path];
    log('Using node to run JavaScript server', 'info');
  }
  
  try {
    // Start server process
    const server = spawn(command, args, {
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle server process events
    server.on('error', (err) => {
      log(`Failed to start server: ${err.message}`, 'error');
      
      // Try fallback if main server fails
      if (serverInfo.type === 'main') {
        log('Attempting to start fallback server...', 'warning');
        const fallbackInfo = determineFallbackServer();
        if (fallbackInfo.type !== 'none') {
          startServer(fallbackInfo);
        }
      } else {
        process.exit(1);
      }
    });
    
    server.on('close', (code) => {
      if (code !== 0) {
        log(`Server process exited with code ${code}`, 'error');
        
        // Try fallback if main server fails
        if (serverInfo.type === 'main') {
          log('Attempting to start fallback server...', 'warning');
          const fallbackInfo = determineFallbackServer();
          if (fallbackInfo.type !== 'none') {
            startServer(fallbackInfo);
          }
        } else {
          process.exit(code);
        }
      }
    });
    
    // Handle termination signals
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        log(`Received ${signal}, shutting down gracefully`, 'warning');
        server.kill(signal);
        process.exit(0);
      });
    });
    
    return true;
  } catch (error) {
    log(`Error starting server: ${error.message}`, 'error');
    
    // Try fallback if main server fails
    if (serverInfo.type === 'main') {
      log('Attempting to start fallback server...', 'warning');
      const fallbackInfo = determineFallbackServer();
      if (fallbackInfo.type !== 'none') {
        startServer(fallbackInfo);
      }
    }
    
    return false;
  }
}

// Determine fallback server file
function determineFallbackServer() {
  log('Searching for fallback server...', 'info');
  
  // Check for fallback server files in order of preference
  const fallbackPaths = [
    { path: path.join(__dirname, 'server', 'simple-server.ts'), type: 'fallback' },
    { path: path.join(__dirname, 'server', 'simple-server.js'), type: 'fallback' },
    { path: path.join(__dirname, 'server.js'), type: 'fallback' },
    { path: path.join(__dirname, 'simple_server.py'), type: 'fallback' },
  ];
  
  for (const pathInfo of fallbackPaths) {
    if (existsSync(pathInfo.path)) {
      log(`Found fallback server: ${pathInfo.path}`, 'success');
      return pathInfo;
    }
  }
  
  log('No fallback server found', 'error');
  return { path: '', type: 'none' };
}

// Main function
async function main() {
  printBanner();
  printSystemInfo();
  
  // Check dependencies and load environment
  const dependenciesOk = checkDependencies();
  const environmentOk = loadEnvironment();
  
  if (!dependenciesOk || !environmentOk) {
    log('Startup prerequisites not met. Attempting to continue with limited functionality.', 'warning');
  }
  
  // Determine server file and start server
  const serverInfo = determineServerFile();
  const serverStarted = startServer(serverInfo);
  
  if (!serverStarted) {
    log('Failed to start any server. Please check the application setup.', 'error');
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  log(`Unexpected error during startup: ${error.message}`, 'error');
  process.exit(1);
});