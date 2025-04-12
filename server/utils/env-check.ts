
/**
 * Checks for required environment variables and logs warnings if they're missing
 */
export function checkRequiredEnvVars() {
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'DATABASE_URL'
  ];

  const optionalVars = [
    'JWT_SECRET',
    'SESSION_SECRET'
  ];
  
  const missingRequiredVars = requiredVars.filter(name => !process.env[name]);
  const missingOptionalVars = optionalVars.filter(name => !process.env[name]);
  
  if (missingRequiredVars.length > 0) {
    console.error('❌ Critical environment variables missing:', missingRequiredVars.join(', '));
    console.error('The application may not function correctly without these variables!');
    
    // Set fallbacks for development if possible
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Using fallback values for development only');
      if (!process.env.PORT) process.env.PORT = '3000';
    }
  }
  
  if (missingOptionalVars.length > 0) {
    console.warn('⚠️ Optional environment variables missing:', missingOptionalVars.join(', '));
    console.warn('Some features may not work optimally.');
  }
  
  if (missingRequiredVars.length === 0) {
    console.log('✅ All required environment variables are set.');
  }
}
