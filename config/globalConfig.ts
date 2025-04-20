
/**
 * Global Configuration System
 * 
 * This module centralizes all configuration settings for the application,
 * pulling from environment variables and providing type-safe access.
 */

// Import environment variables from .env files
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);

if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('Loading environment from default .env');
  dotenv.config();
}

// Type definitions for configuration
interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  session: {
    secret: string;
    maxAge: number;
  };
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
  connectionPoolSize: number;
}

interface AIConfig {
  openai: {
    apiKey: string;
    defaultModel: string;
    organization?: string;
  };
  mistral: {
    apiKey: string;
    defaultModel: string;
  };
  anthropic?: {
    apiKey: string;
    defaultModel: string;
  };
  perplexity?: {
    apiKey: string;
    defaultModel: string;
  };
  gemini?: {
    apiKey: string;
    defaultModel: string;
  };
}

interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google?: {
    clientId: string;
    clientSecret: string;
  };
}

interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'test' | 'production';
  debug: boolean;
  features: {
    aiChat: boolean;
    codeAssistance: boolean;
    analyticsEnabled: boolean;
    colorPalettes: boolean;
    moodCapsules: boolean;
  };
}

interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  outputs: ('console' | 'file')[];
  logFilePath?: string;
}

export interface Config {
  app: AppConfig;
  server: ServerConfig;
  database: DatabaseConfig;
  ai: AIConfig;
  auth: AuthConfig;
  logging: LoggingConfig;
}

// Build the configuration object
const config: Config = {
  app: {
    name: process.env.APP_NAME || 'Creately',
    version: process.env.APP_VERSION || '1.0.0',
    environment: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    debug: process.env.DEBUG === 'true',
    features: {
      aiChat: process.env.FEATURE_AI_CHAT === 'true',
      codeAssistance: process.env.FEATURE_CODE_ASSISTANCE === 'true',
      analyticsEnabled: process.env.FEATURE_ANALYTICS === 'true',
      colorPalettes: process.env.FEATURE_COLOR_PALETTES === 'true',
      moodCapsules: process.env.FEATURE_MOOD_CAPSULES === 'true'
    }
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    session: {
      secret: process.env.SESSION_SECRET || 'default-secret-change-me',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10) // 24 hours default
    }
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'creately',
    ssl: process.env.DB_SSL === 'true',
    connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10)
  },
  
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
      organization: process.env.OPENAI_ORGANIZATION
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY || '',
      defaultModel: process.env.MISTRAL_DEFAULT_MODEL || 'mistral-large-latest'
    },
    anthropic: process.env.ANTHROPIC_API_KEY ? {
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-opus-20240229'
    } : undefined,
    perplexity: process.env.PERPLEXITY_API_KEY ? {
      apiKey: process.env.PERPLEXITY_API_KEY,
      defaultModel: process.env.PERPLEXITY_DEFAULT_MODEL || 'llama-3-sonar-large-32k-online'
    } : undefined,
    gemini: process.env.GEMINI_API_KEY ? {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-pro'
    } : undefined
  },
  
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    google: process.env.GOOGLE_CLIENT_ID ? {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    } : undefined
  },
  
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    outputs: (process.env.LOG_OUTPUTS || 'console').split(',') as ('console' | 'file')[],
    logFilePath: process.env.LOG_FILE_PATH
  }
};

/**
 * Get the full configuration object
 */
export function getConfig(): Config {
  return config;
}

/**
 * Get a specific section of the configuration
 */
export function getAppConfig(): AppConfig {
  return config.app;
}

export function getServerConfig(): ServerConfig {
  return config.server;
}

export function getDatabaseConfig(): DatabaseConfig {
  return config.database;
}

export function getAIConfig(): AIConfig {
  return config.ai;
}

export function getAuthConfig(): AuthConfig {
  return config.auth;
}

export function getLoggingConfig(): LoggingConfig {
  return config.logging;
}

// Validate critical configuration
function validateConfig() {
  const missingEnv: string[] = [];
  
  // Required in production
  if (config.app.environment === 'production') {
    if (!config.auth.jwt.secret || config.auth.jwt.secret === 'default-jwt-secret-change-me') {
      missingEnv.push('JWT_SECRET');
    }
    
    if (!config.server.session.secret || config.server.session.secret === 'default-secret-change-me') {
      missingEnv.push('SESSION_SECRET');
    }
    
    if (!config.database.password) {
      missingEnv.push('DB_PASSWORD');
    }
  }
  
  // Required for features
  if (config.app.features.aiChat) {
    if (!config.ai.openai.apiKey && !config.ai.mistral.apiKey) {
      missingEnv.push('OPENAI_API_KEY or MISTRAL_API_KEY');
    }
  }
  
  // Log warnings for missing environment variables
  if (missingEnv.length > 0) {
    console.warn(`Missing critical environment variables: ${missingEnv.join(', ')}`);
    
    if (config.app.environment === 'production') {
      console.error('Missing required environment variables in production mode!');
      // In a real production app, you might want to exit the process
      // process.exit(1);
    }
  }
}

// Validate on module load
validateConfig();

// Export default config
export default config;
