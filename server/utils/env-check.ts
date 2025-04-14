
/**
 * Checks for required environment variables and logs warnings if they're missing
 * Sets reasonable fallbacks even in production for non-critical variables
 */
export function checkRequiredEnvVars() {
  // Always set these fallbacks regardless of environment
  if (!process.env.PORT) process.env.PORT = '3000';
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missing = [];
  
  for (const envVar of requiredVars) {
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
    if (missing.includes('JWT_SECRET') && process.env.NODE_ENV !== 'production') {
      process.env.JWT_SECRET = 'dev_jwt_secret';
      console.warn('⚠️ Using default JWT_SECRET for development. DO NOT use in production!');
    }
    
    // Missing DATABASE_URL is critical
    if (missing.includes('DATABASE_URL')) {
      console.error('❌ ERROR: DATABASE_URL is required for the application to function properly.');
      console.error('   Database functionality will not be available.');
    }
  } else {
    console.log('✅ All required environment variables are set.');
  }
  
  // Check optional API keys
  const optionalVars = [
    'OPENAI_API_KEY',
    'MISTRAL_API_KEY',
    'CODESTRAL_API_KEY',
    'PAGESPEED_INSIGHTS_API_KEY'
  ];
  
  const missingOptional = optionalVars.filter(name => !process.env[name]);
  
  if (missingOptional.length > 0) {
    console.warn('⚠️ Some optional API keys are missing:', missingOptional.join(', '));
    console.warn('Some features will be disabled:');
    
    if (!process.env.OPENAI_API_KEY) console.warn('- AI color palette generation');
    if (!process.env.MISTRAL_API_KEY) console.warn('- AI chat features');
    if (!process.env.CODESTRAL_API_KEY) console.warn('- Code assistance');
    if (!process.env.PAGESPEED_INSIGHTS_API_KEY) console.warn('- PageSpeed analysis');
  }
}
