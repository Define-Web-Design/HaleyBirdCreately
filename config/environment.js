/**
 * Centralized environment configuration for Creately
 * 
 * This file loads environment variables from .env and provides
 * a unified configuration object for the application.
 */
try {
  // Try to load dotenv if available
  require('dotenv').config();
} catch (error) {
  console.log('dotenv package not available, using environment variables as is');
}

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
  
  // API keys for external services with fallbacks for missing keys
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || 'OPENAI_API_KEY_NOT_SET',
    mistral: process.env.MISTRAL_API_KEY || 'MISTRAL_API_KEY_NOT_SET',
    codestral: process.env.CODESTRAL_API_KEY || 'CODESTRAL_API_KEY_NOT_SET',
  },
  
  // Feature flags based on available API keys
  features: {
    aiPalette: process.env.OPENAI_API_KEY ? true : false,
    aiChat: process.env.MISTRAL_API_KEY ? true : false,
    codeAssistance: process.env.CODESTRAL_API_KEY ? true : false
  }
};

// Check for missing API keys and log warnings
const missingKeys = [];
if (!process.env.OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY');
if (!process.env.MISTRAL_API_KEY) missingKeys.push('MISTRAL_API_KEY');
if (!process.env.CODESTRAL_API_KEY) missingKeys.push('CODESTRAL_API_KEY');

if (missingKeys.length > 0) {
  console.warn(`⚠️  Warning: The following API keys are missing: ${missingKeys.join(', ')}`);
  console.warn('Some AI features will be limited or unavailable.');
}

// Log configuration (sanitized to avoid exposing secrets)
if (config.server.isDevelopment) {
  console.log('Environment Configuration:');
  console.log('- Server Port:', config.server.port);
  console.log('- Environment:', config.server.env);
  console.log('- Auth Bypass:', config.auth.bypassAuth);
  console.log('- Auto Login:', config.auth.autoLogin);
  console.log('- Database Type:', config.database.useInMemory ? 'In-Memory' : 'PostgreSQL');
  console.log('- OpenAI API Key:', config.apiKeys.openai !== 'OPENAI_API_KEY_NOT_SET' ? 'Set' : 'Not Set');
  console.log('- Mistral API Key:', config.apiKeys.mistral !== 'MISTRAL_API_KEY_NOT_SET' ? 'Set' : 'Not Set');
  console.log('- Codestral API Key:', config.apiKeys.codestral !== 'CODESTRAL_API_KEY_NOT_SET' ? 'Set' : 'Not Set');
  console.log('- Enabled Features:');
  console.log('  ├─ AI Palette Generation:', config.features.aiPalette ? 'Enabled' : 'Disabled');
  console.log('  ├─ AI Chat Assistant:', config.features.aiChat ? 'Enabled' : 'Disabled');
  console.log('  └─ Code Assistance:', config.features.codeAssistance ? 'Enabled' : 'Disabled');
}

module.exports = config;