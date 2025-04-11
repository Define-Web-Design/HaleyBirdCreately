/**
 * Application Status Checker
 * 
 * This script provides a simple way to check if your application is running
 * and restart it if needed.
 */

import http from 'http';
import { exec } from 'child_process';

// Configuration
const APP_URL = 'http://localhost:5000'; // The URL of your application
const MONITOR_URL = 'http://localhost:3999'; // The monitor URL

console.log('\n=== Creately Application Status Checker ===\n');

// Check if the monitor is running
function checkMonitor() {
  console.log('Checking if monitor is running...');
  
  const req = http.get(MONITOR_URL, (res) => {
    console.log(`✅ Monitor is running (status code: ${res.statusCode})`);
    console.log(`\n📊 Monitor dashboard: ${MONITOR_URL}`);
    res.resume();
    checkApplication();
  });
  
  req.on('error', () => {
    console.log('❌ Monitor is not running');
    console.log('Starting monitor...');
    
    exec('node scripts/monitor-app-status.cjs &', (error) => {
      if (error) {
        console.error(`Failed to start monitor: ${error.message}`);
        console.log('\nTry starting it manually with:');
        console.log('  node scripts/monitor-app-status.cjs');
        return;
      }
      
      console.log('✅ Monitor started successfully');
      console.log(`\n📊 Monitor dashboard: ${MONITOR_URL}`);
      
      // Give the monitor a moment to start up
      setTimeout(checkApplication, 2000);
    });
  });
  
  req.setTimeout(3000, () => {
    req.abort();
    console.log('❌ Monitor check timed out');
    console.log('Starting monitor...');
    
    exec('node scripts/monitor-app-status.cjs &', (error) => {
      if (error) {
        console.error(`Failed to start monitor: ${error.message}`);
        console.log('\nTry starting it manually with:');
        console.log('  node scripts/monitor-app-status.cjs');
        return;
      }
      
      console.log('✅ Monitor started successfully');
      console.log(`\n📊 Monitor dashboard: ${MONITOR_URL}`);
      
      // Give the monitor a moment to start up
      setTimeout(checkApplication, 2000);
    });
  });
}

// Check if the application is running
function checkApplication() {
  console.log('\nChecking if application is running...');
  
  const req = http.get(APP_URL, (res) => {
    console.log(`✅ Application is running (status code: ${res.statusCode})`);
    console.log(`\n🚀 Application URL: ${APP_URL}`);
    res.resume();
    
    console.log('\n=== Status Summary ===');
    console.log('✅ Monitor: Running');
    console.log('✅ Application: Running');
    console.log('\nEverything is working properly!');
    console.log('\nTo restart the application at any time, visit:');
    console.log(`  ${MONITOR_URL}/restart (POST request)`);
    console.log('\nTo view application logs, visit:');
    console.log(`  ${MONITOR_URL}/logs`);
  });
  
  req.on('error', () => {
    console.log('❌ Application is not running or not responding');
    console.log('Requesting restart through monitor...');
    
    const restartReq = http.request({
      hostname: 'localhost',
      port: 3999,
      path: '/restart',
      method: 'POST'
    }, (res) => {
      console.log('✅ Restart request sent to monitor');
      console.log('Please wait a moment for the application to start...');
      
      // Give the app a moment to start up
      setTimeout(() => {
        console.log('\nTo check status again, run:');
        console.log('  npm run status');
        console.log('\nTo view the monitor dashboard:');
        console.log(`  ${MONITOR_URL}`);
      }, 1000);
      
      res.resume();
    });
    
    restartReq.on('error', (error) => {
      console.error(`Failed to request restart: ${error.message}`);
      console.log('\nTry restarting manually:');
      console.log('  npm run dev');
    });
    
    restartReq.end();
  });
  
  req.setTimeout(3000, () => {
    req.abort();
    console.log('❌ Application check timed out');
    console.log('Requesting restart through monitor...');
    
    const restartReq = http.request({
      hostname: 'localhost',
      port: 3999,
      path: '/restart',
      method: 'POST'
    }, (res) => {
      console.log('✅ Restart request sent to monitor');
      console.log('Please wait a moment for the application to start...');
      
      // Give the app a moment to start up
      setTimeout(() => {
        console.log('\nTo check status again, run:');
        console.log('  npm run status');
        console.log('\nTo view the monitor dashboard:');
        console.log(`  ${MONITOR_URL}`);
      }, 1000);
      
      res.resume();
    });
    
    restartReq.on('error', (error) => {
      console.error(`Failed to request restart: ${error.message}`);
      console.log('\nTry restarting manually:');
      console.log('  npm run dev');
    });
    
    restartReq.end();
  });
}

// Start the process
checkMonitor();