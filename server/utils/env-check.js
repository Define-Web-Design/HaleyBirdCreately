/**
 * Environment Variables Checker
 * 
 * This utility checks required environment variables and provides warnings
 * if any are missing. It also handles fallbacks for development.
 */

// List of required environment variables
const REQUIRED_ENV_VARS = [
  // Database settings
  'DATABASE_URL',
  
  // Security settings
  'JWT_SECRET'
];

/**
 * Check if required environment variables are set and warn if not
 */
export function checkRequiredEnvVars() {
  const missing = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.warn('⚠️ Warning: Missing required environment variables:');
    missing.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    
    // Setup default JWT_SECRET if missing in development
    if (missing.includes('JWT_SECRET')) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.JWT_SECRET = 'creately_dev_jwt_secret';
        console.warn('⚠️ Using default JWT_SECRET for development. DO NOT use in production!');
      } else {
        console.error('❌ ERROR: JWT_SECRET is required in production mode!');
      }
    }
    
    // Missing DATABASE_URL is critical
    if (missing.includes('DATABASE_URL')) {
      console.error('❌ ERROR: DATABASE_URL is required for Creately to function properly.');
      console.error('   Database functionality will not be available.');
    }
  } else {
    console.log('✅ All required environment variables are set');
  }
}