
const http = require('http');
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== Creately Basic System Tests ===\n');

// 1. Check if server is running
function checkServerHealth() {
  return new Promise((resolve) => {
    console.log('Testing server health...');
    
    const options = {
      hostname: '0.0.0.0',
      port: process.env.PORT || 3000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is healthy');
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);
            console.log(`   Environment: ${healthData.environment}`);
            console.log(`   Version: ${healthData.version}`);
            resolve(true);
          } catch (e) {
            console.log('⚠️ Could not parse health response');
            resolve(false);
          }
        });
      } else {
        console.log(`❌ Server responded with status code ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Server health check failed: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// 2. Verify build output
function checkBuildOutput() {
  console.log('\nChecking build artifacts...');
  
  if (!fs.existsSync('dist')) {
    console.log('❌ Build directory not found');
    return false;
  }
  
  if (!fs.existsSync('dist/index.js')) {
    console.log('❌ Main server file not found in build');
    return false;
  }
  
  if (!fs.existsSync('dist/client')) {
    console.log('❌ Client build not found');
    return false;
  }
  
  console.log('✅ Build artifacts verified');
  return true;
}

// 3. Check for common runtime errors in logs
function checkErrorLogs() {
  console.log('\nScanning logs for errors...');
  
  const logDir = 'logs';
  if (!fs.existsSync(logDir)) {
    console.log('⚠️ Logs directory not found');
    return false;
  }
  
  let hasErrors = false;
  const logFiles = fs.readdirSync(logDir)
    .filter(file => file.endsWith('.log'))
    .slice(0, 5); // Check most recent 5 log files
  
  if (logFiles.length === 0) {
    console.log('⚠️ No log files found');
    return false;
  }
  
  const errorPatterns = [
    'Error:', 'error:', 'Exception:', 'exception:',
    'Cannot find module', 'ECONNREFUSED', 'Uncaught TypeError'
  ];
  
  logFiles.forEach(file => {
    try {
      const content = fs.readFileSync(`${logDir}/${file}`, 'utf8');
      const errorLines = content.split('\n')
        .filter(line => errorPatterns.some(pattern => line.includes(pattern)))
        .slice(0, 3); // Show only first 3 errors
      
      if (errorLines.length > 0) {
        console.log(`⚠️ Found errors in ${file}:`);
        errorLines.forEach(line => {
          console.log(`   - ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
        });
        hasErrors = true;
      }
    } catch (error) {
      console.log(`⚠️ Could not read log file ${file}`);
    }
  });
  
  if (!hasErrors) {
    console.log('✅ No common errors found in logs');
  }
  
  return !hasErrors;
}

// Run tests
async function runTests() {
  const serverRunning = await checkServerHealth();
  const buildValid = checkBuildOutput();
  const logsClean = checkErrorLogs();
  
  console.log('\n=== Test Results ===');
  console.log(`Server Health: ${serverRunning ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Build Artifacts: ${buildValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Logs: ${logsClean ? '✅ PASS' : '⚠️ WARNING'}`);
  
  if (serverRunning && buildValid && logsClean) {
    console.log('\n✅ All basic tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed or produced warnings');
  }
}

// Execute the tests
runTests();
