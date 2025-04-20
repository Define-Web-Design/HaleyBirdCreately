/**
 * Global Configuration System
 * 
 * Provides a centralized configuration system with multi-environment support,
 * dynamic overrides, and runtime validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import winston from 'winston';

// Define supported environments
export type Environment = 'development' | 'test' | 'staging' | 'production';

// Configuration schema using Zod for validation
export const ConfigSchema = z.object({
  // Environment
  environment: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  
  // Server settings
  server: z.object({
    port: z.number().min(1).max(65535).default(3000),
    host: z.string().default('0.0.0.0'),
    apiPrefix: z.string().default('/api'),
    staticDir: z.string().default('public'),
    sessionSecret: z.string().min(8).default('change-in-production'),
    trustProxy: z.boolean().default(false),
    timeout: z.number().min(1000).default(30000),
    enableCors: z.boolean().default(true),
    corsOrigins: z.array(z.string()).default(['*']),
  }),
  
  // Database settings
  database: z.object({
    url: z.string().optional(),
    host: z.string().default('localhost'),
    port: z.number().min(1).max(65535).default(5432),
    username: z.string().optional(),
    password: z.string().optional(),
    database: z.string().optional(),
    ssl: z.boolean().default(false),
    poolSize: z.number().min(1).default(10),
    connectionTimeout: z.number().min(1000).default(30000),
  }),
  
  // Logging settings
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'http', 'debug', 'silly']).default('info'),
    format: z.enum(['json', 'simple', 'colorized']).default('colorized'),
    directory: z.string().default('logs'),
    maxSize: z.number().min(1).default(10 * 1024 * 1024), // 10MB
    maxFiles: z.number().min(1).default(5),
    console: z.boolean().default(true),
  }),
  
  // AI service settings
  ai: z.object({
    preferredProvider: z.string().optional(),
    openai: z.object({
      apiKey: z.string().optional(),
      organization: z.string().optional(),
      defaultModel: z.string().default('gpt-4o'),
    }),
    anthropic: z.object({
      apiKey: z.string().optional(),
      defaultModel: z.string().default('claude-3-7-sonnet-20250219'),
    }),
    perplexity: z.object({
      apiKey: z.string().optional(),
      defaultModel: z.string().default('llama-3.1-sonar-small-128k-online'),
    }),
  }),
  
  // Security settings
  security: z.object({
    jwtSecret: z.string().min(8).default('change-in-production'),
    jwtExpiresIn: z.string().default('1d'),
    rateLimitWindow: z.number().min(1).default(60 * 1000), // 1 minute
    rateLimitMax: z.number().min(1).default(100),
    csrfProtection: z.boolean().default(true),
    helmet: z.boolean().default(true),
  }),
  
  // Feature flags
  features: z.object({
    enableAI: z.boolean().default(true),
    enableAnalytics: z.boolean().default(false),
    enableWorkflows: z.boolean().default(true),
    experimentalFeatures: z.boolean().default(false),
  }),
  
  // Monitoring and metrics
  monitoring: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().min(1000).default(60 * 1000), // 1 minute
    metrics: z.object({
      system: z.boolean().default(true),
      http: z.boolean().default(true),
      database: z.boolean().default(true),
      ai: z.boolean().default(true),
    }),
  }),
  
  // Application specific settings
  app: z.object({
    name: z.string().default('Creately App'),
    version: z.string().default('1.0.0'),
    description: z.string().default('A powerful AI-driven application platform'),
    applicationUrl: z.string().url().optional(),
    maxUploadSize: z.number().min(1).default(10 * 1024 * 1024), // 10MB
    tempDir: z.string().default('tmp'),
    defaultLocale: z.string().default('en'),
    supportedLocales: z.array(z.string()).default(['en']),
  }),
});

// Export the config type
export type ConfigType = z.infer<typeof ConfigSchema>;

// Default configuration
const DEFAULT_CONFIG: ConfigType = {
  environment: 'development',
  server: {
    port: 3000,
    host: '0.0.0.0',
    apiPrefix: '/api',
    staticDir: 'public',
    sessionSecret: 'change-in-production',
    trustProxy: false,
    timeout: 30000,
    enableCors: true,
    corsOrigins: ['*'],
  },
  database: {
    host: 'localhost',
    port: 5432,
    ssl: false,
    poolSize: 10,
    connectionTimeout: 30000,
  },
  logging: {
    level: 'info',
    format: 'colorized',
    directory: 'logs',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    console: true,
  },
  ai: {
    openai: {
      defaultModel: 'gpt-4o',
    },
    anthropic: {
      defaultModel: 'claude-3-7-sonnet-20250219',
    },
    perplexity: {
      defaultModel: 'llama-3.1-sonar-small-128k-online',
    },
  },
  security: {
    jwtSecret: 'change-in-production',
    jwtExpiresIn: '1d',
    rateLimitWindow: 60 * 1000, // 1 minute
    rateLimitMax: 100,
    csrfProtection: true,
    helmet: true,
  },
  features: {
    enableAI: true,
    enableAnalytics: false,
    enableWorkflows: true,
    experimentalFeatures: false,
  },
  monitoring: {
    enabled: true,
    interval: 60 * 1000, // 1 minute
    metrics: {
      system: true,
      http: true,
      database: true,
      ai: true,
    },
  },
  app: {
    name: 'Creately App',
    version: '1.0.0',
    description: 'A powerful AI-driven application platform',
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    tempDir: 'tmp',
    defaultLocale: 'en',
    supportedLocales: ['en'],
  },
};

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'config-system' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Load environment variables from .env files
 */
function loadEnvVariables(): Record<string, string> {
  // Base .env file
  const baseEnvPath = path.resolve(process.cwd(), '.env');
  
  // Environment-specific .env file
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envSpecificPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
  
  // Local overrides .env file
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  
  // Load and merge all env files
  const baseEnv = fs.existsSync(baseEnvPath) 
    ? dotenv.parse(fs.readFileSync(baseEnvPath)) 
    : {};
    
  const envSpecific = fs.existsSync(envSpecificPath) 
    ? dotenv.parse(fs.readFileSync(envSpecificPath)) 
    : {};
    
  const localEnv = fs.existsSync(localEnvPath)
    ? dotenv.parse(fs.readFileSync(localEnvPath)) 
    : {};
  
  // Create a safe copy of process.env with only string values
  const safeProcessEnv: Record<string, string> = {};
  Object.entries(process.env).forEach(([key, value]) => {
    if (value !== undefined) {
      safeProcessEnv[key] = value;
    }
  });
  
  // Merge with process.env
  return {
    ...baseEnv,
    ...envSpecific,
    ...localEnv,
    ...safeProcessEnv
  };
}

/**
 * Convert env variable to proper type
 */
function parseEnvValue(value: string): string | number | boolean {
  // Check for boolean values
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Check for numeric values
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // Return as string for everything else
  return value;
}

/**
 * Convert environment variables to config object
 */
function envToConfig(env: Record<string, string>): Partial<ConfigType> {
  const config: Partial<ConfigType> = {};
  
  // Map environment variables to configuration properties
  for (const [key, value] of Object.entries(env)) {
    // Skip empty values
    if (!value) continue;
    
    // Convert key to config path
    const configPath = key
      .toLowerCase()
      .replace(/^app_/i, '')
      .split('_');
    
    // Parse value
    const parsedValue = parseEnvValue(value);
    
    // Set nested value
    let current: any = config;
    for (let i = 0; i < configPath.length; i++) {
      const part = configPath[i];
      
      if (i === configPath.length - 1) {
        // Set the value at the leaf
        current[part] = parsedValue;
      } else {
        // Create nested object if it doesn't exist
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }
  
  return config;
}

/**
 * Deep merge objects
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      // Skip undefined values
      if (sourceValue === undefined) continue;
      
      // Merge objects recursively
      if (
        targetValue && 
        sourceValue && 
        typeof targetValue === 'object' && 
        typeof sourceValue === 'object' &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        target[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Replace value
        target[key] = sourceValue as any;
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Global configuration class
 */
export class Config {
  private static instance: Config;
  private config: ConfigType;
  private currentEnv: Environment;
  private subscribers: Set<(config: ConfigType) => void> = new Set();
  
  /**
   * Private constructor to enforce singleton
   */
  private constructor() {
    // Load environment variables
    const env = loadEnvVariables();
    
    // Determine environment
    this.currentEnv = (env.NODE_ENV || 'development') as Environment;
    
    // Convert env variables to config
    const envConfig = envToConfig(env);
    
    // Merge with defaults
    this.config = deepMerge({} as ConfigType, DEFAULT_CONFIG, envConfig);
    
    // Ensure environment is set correctly
    this.config.environment = this.currentEnv;
    
    // Validate configuration
    try {
      this.config = ConfigSchema.parse(this.config);
    } catch (error) {
      logger.error('Configuration validation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Log configuration (masked)
    this.logConfiguration();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    
    return Config.instance;
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): ConfigType {
    return { ...this.config };
  }
  
  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.currentEnv;
  }
  
  /**
   * Update configuration at runtime
   */
  public updateConfig(partialConfig: Partial<ConfigType>): ConfigType {
    // Merge with current config
    const updatedConfig = deepMerge({} as ConfigType, this.config, partialConfig);
    
    // Validate updated config
    try {
      this.config = ConfigSchema.parse(updatedConfig);
    } catch (error) {
      logger.error('Configuration update validation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Configuration update validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Log changes
    logger.info('Configuration updated', { 
      changes: Object.keys(partialConfig).join(', ') 
    });
    
    // Notify subscribers
    this.notifySubscribers();
    
    return { ...this.config };
  }
  
  /**
   * Subscribe to configuration changes
   */
  public subscribe(callback: (config: ConfigType) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  /**
   * Save current configuration overrides to .env.local
   */
  public saveLocalOverrides(): void {
    // Get only values that differ from defaults
    const overrides: Record<string, string> = {};
    
    // Recursively compare with defaults
    const findOverrides = (
      current: any, 
      defaults: any, 
      path: string[] = []
    ) => {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          const currentValue = current[key];
          const defaultValue = defaults?.[key];
          const newPath = [...path, key];
          
          if (
            currentValue && 
            typeof currentValue === 'object' &&
            !Array.isArray(currentValue)
          ) {
            // Recurse into objects
            findOverrides(currentValue, defaultValue, newPath);
          } else if (currentValue !== defaultValue) {
            // Add primitive values that differ from defaults
            const envKey = newPath
              .map(part => part.toUpperCase())
              .join('_');
              
            overrides[envKey] = String(currentValue);
          }
        }
      }
    };
    
    findOverrides(this.config, DEFAULT_CONFIG);
    
    // Convert to .env format
    const envContent = Object.entries(overrides)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Write to .env.local
    const localEnvPath = path.resolve(process.cwd(), '.env.local');
    
    try {
      fs.writeFileSync(localEnvPath, envContent);
      logger.info('Saved configuration overrides to .env.local');
    } catch (error) {
      logger.error('Failed to save configuration overrides', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Failed to save configuration overrides: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Export configuration as JSON
   */
  public exportConfigAsJson(): string {
    // Create a sanitized copy (mask sensitive fields)
    const sanitized = this.getSanitizedConfig();
    
    return JSON.stringify(sanitized, null, 2);
  }
  
  /**
   * Get sanitized configuration (with sensitive info masked)
   */
  private getSanitizedConfig(): ConfigType {
    const sanitized = JSON.parse(JSON.stringify(this.config));
    
    // Mask sensitive fields
    if (sanitized.security?.jwtSecret) {
      sanitized.security.jwtSecret = '***********';
    }
    
    if (sanitized.server?.sessionSecret) {
      sanitized.server.sessionSecret = '***********';
    }
    
    if (sanitized.database?.password) {
      sanitized.database.password = '***********';
    }
    
    if (sanitized.ai?.openai?.apiKey) {
      sanitized.ai.openai.apiKey = '***********';
    }
    
    if (sanitized.ai?.anthropic?.apiKey) {
      sanitized.ai.anthropic.apiKey = '***********';
    }
    
    if (sanitized.ai?.perplexity?.apiKey) {
      sanitized.ai.perplexity.apiKey = '***********';
    }
    
    return sanitized;
  }
  
  /**
   * Log configuration (with sensitive info masked)
   */
  private logConfiguration(): void {
    const sanitized = this.getSanitizedConfig();
    
    logger.info('Configuration loaded', { 
      environment: this.currentEnv,
      config: sanitized
    });
  }
  
  /**
   * Notify subscribers of configuration changes
   */
  private notifySubscribers(): void {
    const config = { ...this.config };
    
    for (const callback of this.subscribers) {
      try {
        callback(config);
      } catch (error) {
        logger.error('Error in configuration subscriber', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  }
}

// Export singleton instance
export const config = Config.getInstance();

// Helper functions
export function getConfig(): ConfigType {
  return config.getConfig();
}

export function isDevelopment(): boolean {
  return config.getEnvironment() === 'development';
}

export function isProduction(): boolean {
  return config.getEnvironment() === 'production';
}

export function isTest(): boolean {
  return config.getEnvironment() === 'test';
}

export function isStaging(): boolean {
  return config.getEnvironment() === 'staging';
}