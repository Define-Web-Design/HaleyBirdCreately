import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration interface
interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  cookieSecret: string;
  sessionMaxAge: number;
  dbUrl: string;
  apiRateLimit: {
    windowMs: number;
    max: number;
  };
  authRateLimit: {
    windowMs: number;
    max: number;
  };
}

// Default values
const defaultConfig: Config = {
  port: 3000,
  nodeEnv: 'development',
  jwtSecret: 'default_jwt_secret_change_in_production',
  jwtExpiresIn: '15m', // Set to 15 minutes for short-lived access tokens
  refreshTokenSecret: 'default_refresh_token_secret_change_in_production',
  refreshTokenExpiresIn: '7d', // 7 days for refresh tokens
  cookieSecret: 'default_cookie_secret_change_in_production',
  sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  dbUrl: 'postgres://localhost:5432/creately',
  apiRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per windowMs
  },
  authRateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 requests per windowMs
  }
};

// Create config object with environment variables or defaults
export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || defaultConfig.nodeEnv,
  jwtSecret: process.env.JWT_SECRET || defaultConfig.jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || defaultConfig.jwtExpiresIn,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || defaultConfig.refreshTokenExpiresIn,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || defaultConfig.refreshTokenSecret,
  cookieSecret: process.env.COOKIE_SECRET || defaultConfig.cookieSecret,
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || defaultConfig.sessionMaxAge.toString(), 10),
  dbUrl: process.env.DATABASE_URL || defaultConfig.dbUrl,
  apiRateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || defaultConfig.apiRateLimit.windowMs.toString(), 10),
    max: parseInt(process.env.API_RATE_LIMIT_MAX || defaultConfig.apiRateLimit.max.toString(), 10)
  },
  authRateLimit: {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || defaultConfig.authRateLimit.windowMs.toString(), 10),
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || defaultConfig.authRateLimit.max.toString(), 10)
  }
};

// Warn if JWT_SECRET is using the default value in production
if (config.nodeEnv === 'production' && config.jwtSecret === defaultConfig.jwtSecret) {
  console.warn('WARNING: Using default JWT_SECRET in production environment. This is a security risk!');
}

// Warn if COOKIE_SECRET is using the default value in production
if (config.nodeEnv === 'production' && config.cookieSecret === defaultConfig.cookieSecret) {
  console.warn('WARNING: Using default COOKIE_SECRET in production environment. This is a security risk!');
}

// Warn if REFRESH_TOKEN_SECRET is using the default value in production
if (config.nodeEnv === 'production' && config.refreshTokenSecret === defaultConfig.refreshTokenSecret) {
  console.warn('WARNING: Using default REFRESH_TOKEN_SECRET in production environment. This is a security risk!');
}

export default config;