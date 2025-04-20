
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Creately Environment Diagnostic ===\n');

// Check Node.js version
try {
  const nodeVersion = execSync('node -v').toString().trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Failed to detect Node.js version');
}

// Check npm version
try {
  const npmVersion = execSync('npm -v').toString().trim();
  console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
  console.log('❌ Failed to detect npm version');
}

// Check for package.json
if (fs.existsSync('package.json')) {
  console.log('✅ package.json exists');
  
  // Parse and check dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    
    console.log(`✅ Dependencies: ${depCount}, DevDependencies: ${devDepCount}`);
    
    // Check for critical dependencies
    const criticalDeps = ['express', 'react', 'typescript', 'vite'];
    const missingCritical = criticalDeps.filter(dep => 
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );
    
    if (missingCritical.length > 0) {
      console.log(`⚠️ Missing critical dependencies: ${missingCritical.join(', ')}`);
    } else {
      console.log('✅ All critical dependencies found');
    }
  } catch (error) {
    console.log('❌ Failed to parse package.json');
  }
} else {
  console.log('❌ package.json not found');
}

// Check node_modules
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
  
  // Check if node_modules matches package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = {...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {})};
    
    const missingModules = Object.keys(deps).filter(dep => 
      !fs.existsSync(`node_modules/${dep}`)
    ).slice(0, 5); // Show only first 5 to avoid verbose output
    
    if (missingModules.length > 0) {
      console.log(`⚠️ Some dependencies not installed: ${missingModules.join(', ')}${missingModules.length > 5 ? '...' : ''}`);
    } else {
      console.log('✅ All dependencies appear to be installed');
    }
  } catch (error) {
    console.log('❌ Failed to check node_modules consistency');
  }
} else {
  console.log('❌ node_modules not found');
}

// Check for build artifacts
if (fs.existsSync('dist')) {
  console.log('✅ Build directory exists');
} else {
  console.log('⚠️ Build directory not found');
}

// Check environment variables
const envFiles = ['.env', '.env.local', '.env.example'];
const foundEnvFiles = envFiles.filter(file => fs.existsSync(file));

if (foundEnvFiles.length > 0) {
  console.log(`✅ Environment files found: ${foundEnvFiles.join(', ')}`);
  
  // Check for critical env vars
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

console.log('\n=== Diagnostic Complete ===');
