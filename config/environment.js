/**
 * Centralized environment configuration for Creately
 * 
 * This file loads environment variables from .env and provides
 * a unified configuration object for the application.
 */
require('dotenv').config();

// Default values for required environment variables
const defaults = {
  PORT: 3000,
  NODE_ENV: 'development',
  SESSION_SECRET: 'creately-development-session-secret',
  USE_IN_MEMORY_DB: !process.env.DATABASE_URL,
};

// Configuration object with environment variables and defaults
const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || defaults.PORT, 10),
    env: process.env.NODE_ENV || defaults.NODE_ENV,
    isProduction: (process.env.NODE_ENV || defaults.NODE_ENV) === 'production',
    isDevelopment: (process.env.NODE_ENV || defaults.NODE_ENV) === 'development',
  },
  
  // Authentication configuration
  auth: {
    sessionSecret: process.env.SESSION_SECRET || defaults.SESSION_SECRET,
    jwtSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET || defaults.SESSION_SECRET,
    bypassAuth: process.env.BYPASS_AUTH === 'true',
    autoLogin: process.env.VITE_AUTO_LOGIN === 'true',
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    useInMemory: process.env.USE_IN_MEMORY_DB === 'true' || defaults.USE_IN_MEMORY_DB,
  },
  
  // API keys for external services
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
  },
};

// Log configuration (sanitized to avoid exposing secrets)
if (config.server.isDevelopment) {
  console.log('Environment Configuration:');
  console.log('- Server Port:', config.server.port);
  console.log('- Environment:', config.server.env);
  console.log('- Auth Bypass:', config.auth.bypassAuth);
  console.log('- Auto Login:', config.auth.autoLogin);
  console.log('- Database Type:', config.database.useInMemory ? 'In-Memory' : 'PostgreSQL');
  console.log('- OpenAI API Key:', config.apiKeys.openai ? 'Set' : 'Not Set');
  console.log('- Mistral API Key:', config.apiKeys.mistral ? 'Set' : 'Not Set');
}

module.exports = config;