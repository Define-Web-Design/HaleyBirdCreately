
/**
 * Checks for required environment variables and logs warnings if they're missing
 */
export function checkRequiredEnvVars() {
  const requiredVars = [
    // Add your app's required environment variables
    'PORT',
    'NODE_ENV'
  ];
  
  const missingVars = requiredVars.filter(name => !process.env[name]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('Some features may not work correctly!');
  } else {
    console.log('✅ All required environment variables are set.');
  }
}
