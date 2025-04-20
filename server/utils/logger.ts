/**
 * Centralized Logging System
 * 
 * This module provides a consistent logging interface across the application
 * with structured logging capabilities and environment-specific behaviors.
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

// Create console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, metadata }) => {
    // Handle objects and errors in metadata
    let metaStr = '';
    if (metadata && Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      // Exclude empty objects and handle errors
      const cleanMeta = { ...metadata };
      
      // Format errors
      if (cleanMeta.error instanceof Error) {
        cleanMeta.error = {
          message: cleanMeta.error.message,
          stack: cleanMeta.error.stack
        };
      }
      
      metaStr = JSON.stringify(cleanMeta, null, 0);
      
      // Format the metadata output
      if (metaStr !== '{}') {
        metaStr = ` ${metaStr}`;
      } else {
        metaStr = '';
      }
    }
    
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Set default log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'api' },
  transports: [
    // Always log to console
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // Log errors to a dedicated file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    
    // Log everything to a combined file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ]
});

// Add special handling for unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason,
    promise
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  
  // Give logger time to log the error before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Export the logger instance
export { logger };