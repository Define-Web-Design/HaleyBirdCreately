
#!/usr/bin/env node

/**
 * TypeScript Type Checking Utility
 * 
 * This script runs TypeScript type checking and reports errors in a more readable format.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n====== TYPESCRIPT TYPE CHECKING ======\n');

try {
  console.log('Running TypeScript type check...');
  
  // Run TypeScript compiler in noEmit mode to only check types
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  
  if (output.trim()) {
    console.log('⚠️ TypeScript warnings found:');
    console.log(output);
  } else {
    console.log('✅ No TypeScript errors found!');
  }
} catch (error) {
  console.error('❌ TypeScript errors found:');
  console.error(error.stdout);
  
  // Extract file paths with errors for easier debugging
  const errorFiles = new Set();
  const errorLines = error.stdout.split('\n');
  
  errorLines.forEach(line => {
    const match = line.match(/^([^(]+)\(\d+,\d+\)/);
    if (match && match[1]) {
      errorFiles.add(match[1]);
    }
  });
  
  if (errorFiles.size > 0) {
    console.log('\n--- Files with TypeScript errors ---');
    [...errorFiles].forEach(file => {
      console.log(`- ${file}`);
    });
  }
  
  console.log('\nRun with --fix flag to attempt automatic fixes for common issues');
  process.exit(1);
}
