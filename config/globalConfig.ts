
/**
 * Global Configuration System
 * 
 * Provides a centralized configuration system with multi-environment support,
 * dynamic overrides, and runtime validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import dotenv from 'dotenv';

// Environment types
export type Environment = 'development' | 'test' | 'staging' | 'production';

// Base configuration schema
const ConfigSchema = z.object({
  // App configuration
  app: z.object({
    name: z.string().default('Creately'),
    port: z.number().default(3000),
    apiUrl: z.string().default('/api'),
    timeout: z.number().default(30000),
    debug: z.boolean().default(false),
    version: z.string().default('1.0.0')
  }),
  
  // Server configuration
  server: z.object({
    host: z.string().default('0.0.0.0'),
    cors: z.object({
      enabled: z.boolean().default(true),
      origins: z.array(z.string()).default(['*']),
      methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
      maxAge: z.number().default(86400)
    }),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      max: z.number().default(100),
      windowMs: z.number().default(60000)
    }),
    compression: z.boolean().default(true),
    timeout: z.number().default(30000)
  }),
  
  // Database configuration
  database: z.object({
    type: z.enum(['postgres', 'mysql', 'sqlite', 'mongodb']).default('postgres'),
    host: z.string().default('localhost'),
    port: z.number().optional(),
    database: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    connection: z.string().optional(),
    ssl: z.boolean().default(false),
    poolSize: z.number().default(10)
  }),
  
  // Auth configuration
  auth: z.object({
    jwt: z.object({
      secret: z.string().default('default-jwt-secret'),
      expiresIn: z.string().default('1d')
    }),
    session: z.object({
      enabled: z.boolean().default(true),
      secret: z.string().default('default-session-secret'),
      maxAge: z.number().default(86400000)
    })
  }),
  
  // AI service configuration
  ai: z.object({
    defaultProvider: z.enum(['mistral', 'openai']).default('mistral'),
    fallbackStrategy: z.enum(['sequential', 'racing', 'hybrid']).default('sequential'),
    providers: z.object({
      mistral: z.object({
        enabled: z.boolean().default(true),
        apiKey: z.string().optional(),
        model: z.string().default('mistral-large-latest')
      }),
      openai: z.object({
        enabled: z.boolean().default(true),
        apiKey: z.string().optional(),
        model: z.string().default('gpt-4o'),
        organization: z.string().optional()
      })
    })
  }),
  
  // Feature flags
  features: z.object({
    lazyLoading: z.boolean().default(true),
    analytics: z.boolean().default(true),
    darkMode: z.boolean().default(true),
    moodCapsules: z.boolean().default(true),
    collaborativeEditing: z.boolean().default(false),
    betaFeatures: z.boolean().default(false)
  }),
  
  // Logging configuration
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
    format: z.enum(['json', 'simple', 'pretty']).default('pretty'),
    file: z.boolean().default(true),
    console: z.boolean().default(true),
    maxFiles: z.number().default(5),
    maxSize: z.string().default('10m')
  })
});

// Configuration type
export type ConfigType = z.infer<typeof ConfigSchema>;

// Environment-specific values
const environments: Record<Environment, Partial<ConfigType>> = {
  development: {
    app: {
      debug: true
    },
    logging: {
      level: 'debug'
    },
    features: {
      betaFeatures: true
    }
  },
  test: {
    app: {
      port: 3001
    },
    logging: {
      level: 'warn',
      file: false
    }
  },
  staging: {
    server: {
      cors: {
        origins: ['https://staging.creately.com']
      }
    },
    features: {
      betaFeatures: true
    }
  },
  production: {
    app: {
      debug: false
    },
    server: {
      cors: {
        origins: ['https://creately.com']
      },
      rateLimit: {
        max: 50
      }
    },
    logging: {
      level: 'warn',
      format: 'json'
    }
  }
};

// Load environment variables
function loadEnvVariables(): Record<string, string> {
  // Determine which .env files to load
  const envFiles = [
    '.env',
    `.env.${process.env.NODE_ENV || 'development'}`
  ];
  
  // Local overrides (not in git)
  if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
    envFiles.push('.env.local');
  }
  
  // Load all env files
  const envVars: Record<string, string> = {};
  
  for (const file of envFiles) {
    try {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const result = dotenv.parse(fs.readFileSync(filePath));
        Object.assign(envVars, result);
      }
    } catch (error) {
      console.warn(`Error loading env file ${file}:`, error);
    }
  }
  
  // Also include process.env values
  Object.assign(envVars, process.env);
  
  return envVars;
}

/**
 * Convert env variable to proper type
 */
function parseEnvValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

/**
 * Convert environment variables to config object
 */
function envToConfig(env: Record<string, string>): Partial<ConfigType> {
  const config: any = {};
  
  // Process each environment variable
  Object.entries(env).forEach(([key, value]) => {
    // Skip non-config variables
    if (!key.startsWith('CONFIG_')) {
      return;
    }
    
    // Remove CONFIG_ prefix
    const configPath = key.replace('CONFIG_', '').toLowerCase();
    
    // Split into path segments
    const segments = configPath.split('_');
    
    // Build nested object
    let current = config;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }
    
    // Set the final value
    const lastSegment = segments[segments.length - 1];
    current[lastSegment] = parseEnvValue(value);
  });
  
  // Set specific variables that don't follow CONFIG_ pattern
  if (env.PORT) {
    if (!config.app) config.app = {};
    config.app.port = parseInt(env.PORT, 10);
  }
  
  if (env.DATABASE_URL) {
    if (!config.database) config.database = {};
    config.database.connection = env.DATABASE_URL;
  }
  
  if (env.MISTRAL_API_KEY) {
    if (!config.ai) config.ai = {};
    if (!config.ai.providers) config.ai.providers = {};
    if (!config.ai.providers.mistral) config.ai.providers.mistral = {};
    config.ai.providers.mistral.apiKey = env.MISTRAL_API_KEY;
    config.ai.providers.mistral.enabled = true;
  }
  
  if (env.OPENAI_API_KEY) {
    if (!config.ai) config.ai = {};
    if (!config.ai.providers) config.ai.providers = {};
    if (!config.ai.providers.openai) config.ai.providers.openai = {};
    config.ai.providers.openai.apiKey = env.OPENAI_API_KEY;
    config.ai.providers.openai.enabled = true;
  }
  
  return config;
}

// Deep merge objects
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Global configuration class
 */
export class Config {
  private static instance: Config;
  private config: ConfigType;
  private currentEnv: Environment;
  private subscribers: Set<(config: ConfigType) => void> = new Set();
  
  private constructor() {
    // Get environment
    this.currentEnv = (process.env.NODE_ENV as Environment) || 'development';
    
    // Create base configuration from schema defaults
    const baseConfig = ConfigSchema.parse({});
    
    // Load environment variables
    const envVars = loadEnvVariables();
    
    // Convert env vars to config
    const envConfig = envToConfig(envVars);
    
    // Merge configurations
    this.config = deepMerge(
      baseConfig,
      deepMerge(
        environments[this.currentEnv] || {},
        envConfig
      )
    );
    
    // Validate complete configuration
    this.config = ConfigSchema.parse(this.config);
    
    // Log initial configuration
    if (this.currentEnv !== 'test') {
      this.logConfiguration();
    }
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
    return this.config;
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
    // Update the config
    this.config = deepMerge(this.config, partialConfig);
    
    // Validate updated config
    this.config = ConfigSchema.parse(this.config);
    
    // Notify subscribers
    this.notifySubscribers();
    
    return this.config;
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
    try {
      // Generate override strings
      const lines: string[] = [
        '# Local environment overrides',
        '# Generated on ' + new Date().toISOString(),
        ''
      ];
      
      // Add specific overrides based on differences from base + env
      const baseConfig = ConfigSchema.parse({});
      const envConfig = environments[this.currentEnv] || {};
      const baseWithEnv = deepMerge(baseConfig, envConfig);
      
      // Helper to generate flattened keys
      const flattenConfig = (
        obj: any,
        prefix: string = 'CONFIG',
        result: Record<string, string> = {}
      ): Record<string, string> => {
        for (const key in obj) {
          const path = `${prefix}_${key.toUpperCase()}`;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenConfig(obj[key], path, result);
          } else if (obj[key] !== undefined) {
            result[path] = obj[key].toString();
          }
        }
        return result;
      };
      
      // Get flattened keys for current config
      const currentFlat = flattenConfig(this.config);
      const baseFlat = flattenConfig(baseWithEnv);
      
      // Find differences
      for (const [key, value] of Object.entries(currentFlat)) {
        if (baseFlat[key] !== value) {
          lines.push(`${key}=${value}`);
        }
      }
      
      // Write to file
      const localEnvPath = path.resolve(process.cwd(), '.env.local');
      fs.writeFileSync(localEnvPath, lines.join('\n'), 'utf8');
      
      console.log(`Local overrides saved to ${localEnvPath}`);
    } catch (error) {
      console.error('Error saving local overrides:', error);
    }
  }
  
  /**
   * Export configuration as JSON
   */
  public exportConfigAsJson(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * Log configuration (with sensitive info masked)
   */
  private logConfiguration(): void {
    // Clone the config
    const sanitizedConfig = JSON.parse(JSON.stringify(this.config));
    
    // Mask sensitive values
    if (sanitizedConfig.ai?.providers?.mistral?.apiKey) {
      sanitizedConfig.ai.providers.mistral.apiKey = '********';
    }
    
    if (sanitizedConfig.ai?.providers?.openai?.apiKey) {
      sanitizedConfig.ai.providers.openai.apiKey = '********';
    }
    
    if (sanitizedConfig.database?.password) {
      sanitizedConfig.database.password = '********';
    }
    
    if (sanitizedConfig.auth?.jwt?.secret) {
      sanitizedConfig.auth.jwt.secret = '********';
    }
    
    if (sanitizedConfig.auth?.session?.secret) {
      sanitizedConfig.auth.session.secret = '********';
    }
    
    console.log('Configuration loaded for environment:', this.currentEnv);
    console.log(JSON.stringify(sanitizedConfig, null, 2));
  }
  
  /**
   * Notify subscribers of configuration changes
   */
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.config);
      } catch (error) {
        console.error('Error in configuration subscriber:', error);
      }
    }
  }
}

// Export a singleton instance
export const config = Config.getInstance();

// Export config getter for convenience
export function getConfig(): ConfigType {
  return config.getConfig();
}

// Export some helpful functions
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
