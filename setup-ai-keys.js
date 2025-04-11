/**
 * Creately AI Keys Setup Utility
 * 
 * This script helps users set up their Mistral and Codestral API keys
 * for use with the Creately application.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Log a formatted message to the console
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Display a header in the console
 */
function printHeader(title) {
  const line = '='.repeat(title.length + 8);
  console.log('');
  log(line, 'blue');
  log(`    ${title}    `, 'blue');
  log(line, 'blue');
  console.log('');
}

/**
 * Load existing environment variables from .env file
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) continue;
      
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
    
    log('Loaded existing environment variables from .env file', 'green');
  } else {
    log('No .env file found. Creating a new one.', 'yellow');
  }
  
  return envVars;
}

/**
 * Save environment variables to .env file
 */
function saveEnvFile(envVars) {
  const envPath = path.join(__dirname, '.env');
  let content = '';
  
  for (const [key, value] of Object.entries(envVars)) {
    content += `${key}=${value}\n`;
  }
  
  fs.writeFileSync(envPath, content);
  log('Updated .env file with new API keys', 'green');
}

/**
 * Main function to set up API keys
 */
async function setupApiKeys() {
  printHeader('Creately AI Keys Setup');
  
  log('This utility will help you set up your Mistral and Codestral API keys', 'cyan');
  log('for use with the Creately application.', 'cyan');
  
  console.log('');
  log('API keys are required to use AI features like:', 'yellow');
  log('- Code generation with Codestral', 'yellow');
  log('- Smart chat with Mistral AI', 'yellow');
  log('- Code completion and refactoring', 'yellow');
  
  console.log('');
  
  // Load existing environment variables
  const envVars = loadEnvFile();
  
  // Check for existing API keys
  const hasMistralKey = envVars.MISTRAL_API_KEY && envVars.MISTRAL_API_KEY !== 'MISTRAL_API_KEY_NOT_SET';
  const hasCodestralKey = envVars.CODESTRAL_API_KEY && envVars.CODESTRAL_API_KEY !== 'CODESTRAL_API_KEY_NOT_SET';
  
  if (hasMistralKey) {
    log('✅ Mistral API Key is already configured', 'green');
  }
  
  if (hasCodestralKey) {
    log('✅ Codestral API Key is already configured', 'green');
  }
  
  // Ask for missing keys
  if (!hasMistralKey || !hasCodestralKey) {
    console.log('');
    log('You need to set up the following API keys:', 'cyan');
    
    if (!hasMistralKey) {
      log('- Mistral API Key (for chat features)', 'cyan');
    }
    
    if (!hasCodestralKey) {
      log('- Codestral API Key (for code generation features)', 'cyan');
    }
    
    console.log('');
    log('You can obtain these keys from:', 'yellow');
    log('https://console.mistral.ai/', 'yellow');
    
    // Get missing keys
    if (!hasMistralKey) {
      await new Promise(resolve => {
        rl.question('Enter your Mistral API Key: ', (answer) => {
          if (answer.trim()) {
            envVars.MISTRAL_API_KEY = answer.trim();
            log('✅ Mistral API Key added', 'green');
          } else {
            log('⚠️ No key provided. AI chat features will be disabled.', 'yellow');
            envVars.MISTRAL_API_KEY = 'MISTRAL_API_KEY_NOT_SET';
          }
          resolve();
        });
      });
    }
    
    if (!hasCodestralKey) {
      await new Promise(resolve => {
        rl.question('Enter your Codestral API Key: ', (answer) => {
          if (answer.trim()) {
            envVars.CODESTRAL_API_KEY = answer.trim();
            log('✅ Codestral API Key added', 'green');
          } else {
            log('⚠️ No key provided. Code generation features will be disabled.', 'yellow');
            envVars.CODESTRAL_API_KEY = 'CODESTRAL_API_KEY_NOT_SET';
          }
          resolve();
        });
      });
    }
    
    // Save updated environment variables
    saveEnvFile(envVars);
  } else {
    log('All API keys are already configured!', 'green');
  }
  
  console.log('');
  log('Would you like to test your AI API keys?', 'cyan');
  await new Promise(resolve => {
    rl.question('Run API tests? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        log('Running tests...', 'cyan');
        console.log('');
        
        // Run the test script
        const { spawn } = require('child_process');
        const testProcess = spawn('node', ['test-mistral.js'], { stdio: 'inherit' });
        
        testProcess.on('close', (code) => {
          if (code !== 0) {
            log(`Test process exited with code ${code}`, 'red');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
  
  console.log('');
  log('Setup complete! Your AI keys are now configured.', 'green');
  log('You can now use AI features in Creately.', 'green');
  
  rl.close();
}

// Start the setup process
setupApiKeys().catch(error => {
  log(`Error during setup: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});