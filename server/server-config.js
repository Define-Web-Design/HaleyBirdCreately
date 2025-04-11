/**
 * Server Configuration for Creately Application
 * 
 * This file provides server configuration and setup helpers,
 * integrating with our centralized environment configuration.
 */

const path = require('path');
let config;

try {
  // Try to load the centralized config
  config = require('../config/environment');
} catch (error) {
  console.log('Could not load centralized config, using defaults');
  // Minimal fallback config if centralized config is unavailable
  config = {
    server: {
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
      isDevelopment: (process.env.NODE_ENV || 'development') === 'development'
    },
    database: {
      url: process.env.DATABASE_URL,
      useInMemory: !process.env.DATABASE_URL
    },
    auth: {
      sessionSecret: process.env.SESSION_SECRET || 'creately-development-session-secret',
      bypassAuth: process.env.BYPASS_AUTH === 'true'
    }
  };
}

/**
 * Configure database connection
 * @returns {Object} Database configuration
 */
function getDatabaseConfig() {
  if (config.database.useInMemory) {
    console.log('Using in-memory database');
    return { type: 'memory' };
  }
  
  console.log('Using PostgreSQL database');
  return {
    type: 'postgres',
    url: config.database.url
  };
}

/**
 * Get middleware configuration based on environment
 * @returns {Object} Middleware configuration
 */
function getMiddlewareConfig() {
  const middleware = {
    cors: {
      origin: '*', // For development; should be restricted in production
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    session: {
      secret: config.auth.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: !config.server.isDevelopment,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }
  };
  
  return middleware;
}

/**
 * Configure authentication
 * @returns {Object} Authentication configuration
 */
function getAuthConfig() {
  return {
    bypass: config.auth.bypassAuth,
    jwtSecret: config.auth.jwtSecret || config.auth.sessionSecret
  };
}

/**
 * Get complete server configuration
 * @returns {Object} Server configuration
 */
function getServerConfig() {
  return {
    port: config.server.port,
    environment: config.server.env,
    database: getDatabaseConfig(),
    middleware: getMiddlewareConfig(),
    auth: getAuthConfig(),
    apiKeys: config.apiKeys || {}
  };
}

module.exports = {
  getServerConfig,
  getDatabaseConfig,
  getMiddlewareConfig,
  getAuthConfig
};