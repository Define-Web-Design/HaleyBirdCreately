
/**
 * Checks for required environment variables and logs warnings if they're missing
 * Sets reasonable fallbacks even in production for non-critical variables
 */
export function checkRequiredEnvVars() {
  // Always set these fallbacks regardless of environment
  if (!process.env.PORT) process.env.PORT = '3000';
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
  
  const requiredVars = [
    'DATABASE_URL'
  ];

  const optionalVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'OPENAI_API_KEY',
    'MISTRAL_API_KEY',
    'CODESTRAL_API_KEY'
  ];
  
  const missingRequiredVars = requiredVars.filter(name => !process.env[name]);
  const missingOptionalVars = optionalVars.filter(name => !process.env[name]);
  
  // Set fallbacks for optional variables
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'creately-default-session-secret';
    console.warn('⚠️ Using default SESSION_SECRET (not secure for production)');
  }
  
  if (missingRequiredVars.length > 0) {
    console.error('❌ Critical environment variables missing:', missingRequiredVars.join(', '));
    
    // Special handling for DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ Using in-memory storage as DATABASE_URL is not set');
      process.env.USE_IN_MEMORY_DB = 'true';
    }
  }
  
  if (missingOptionalVars.length > 0) {
    console.warn('⚠️ Optional environment variables missing:', missingOptionalVars.join(', '));
    console.warn('Some features will be disabled:');
    if (!process.env.OPENAI_API_KEY) console.warn('- AI color palette generation');
    if (!process.env.MISTRAL_API_KEY) console.warn('- AI chat features');
    if (!process.env.CODESTRAL_API_KEY) console.warn('- Code assistance');
  }
  
  console.log(`✅ Environment initialized (${process.env.NODE_ENV} mode, port ${process.env.PORT})`);
}
