/**
 * Unified Logging System
 * 
 * This module provides consistent logging across the application with
 * configurable outputs and log levels.
 */

import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLoggingConfig } from '../../config/globalConfig';

// Define log levels and their numeric values
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5
};

type LogLevel = keyof typeof LOG_LEVELS;

// Define log level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  trace: 'cyan'
};

// Add colors to winston
winston.addColors(colors);

// Create a type for additional metadata
interface LogMetadata {
  [key: string]: any;
}

// Determine log level based on environment
const getLogLevel = (): LogLevel => {
  const config = getLoggingConfig();
  return config.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
};

// Create a custom timestamp format
const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS'
});

// Create a custom format for console output
const consoleFormat = winston.format.printf(({ level, message, timestamp, requestId, ...metadata }) => {
  const requestIdStr = requestId ? `[${requestId}] ` : '';
  const metadataStr = Object.keys(metadata).length > 0 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';

  return `${timestamp} ${level.toUpperCase()} ${requestIdStr}${message}${metadataStr}`;
});

// Create custom formats for different outputs
const formats = {
  console: winston.format.combine(
    timestampFormat,
    winston.format.colorize({ all: true }),
    consoleFormat
  ),
  file: winston.format.combine(
    timestampFormat,
    winston.format.json()
  )
};

// Create a winston logger instance
const createWinstonLogger = () => {
  const level = getLogLevel();

  const logger = winston.createLogger({
    level,
    levels: LOG_LEVELS,
    format: formats.file,
    defaultMeta: { service: 'creately-app' },
    transports: [
      // Write logs to a file for all levels
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ]
  });

  // Add console transport in development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: formats.console
    }));
  }

  return logger;
};

// Create the primary winston logger
const winstonLogger = createWinstonLogger();

/**
 * Generate a request ID for identifying request logs
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Express middleware to attach a request ID to each request
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header('X-Request-ID') || generateRequestId();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Express middleware to log HTTP requests
 */
export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const { method, url, ip } = req;
  const userAgent = req.get('user-agent') || '';
  const requestId = req.requestId;

  // Log the request
  winstonLogger.http(`${method} ${url}`, {
    requestId,
    ip,
    userAgent
  });

  // Record response metrics
  const start = Date.now();

  // Once the response is finished, log the response details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logLevel = statusCode >= 500 ? 'error' 
      : statusCode >= 400 ? 'warn' 
      : 'http';

    winstonLogger.log(logLevel, `${method} ${url} ${statusCode} ${duration}ms`, {
      requestId,
      statusCode,
      duration,
      ip,
      userAgent
    });
  });

  next();
}

/**
 * Log an error with consistent formatting
 */
export function logError(error: Error, metadata: LogMetadata = {}): void {
  winstonLogger.error(`${error.name}: ${error.message}`, {
    ...metadata,
    stack: error.stack
  });
}

/**
 * Log info with consistent formatting
 */
export function logInfo(message: string, metadata: LogMetadata = {}): void {
  winstonLogger.info(message, metadata);
}

/**
 * Log debug information with consistent formatting
 */
export function logDebug(message: string, metadata: LogMetadata = {}): void {
  winstonLogger.debug(message, metadata);
}

/**
 * Log warning with consistent formatting
 */
export function logWarn(message: string, metadata: LogMetadata = {}): void {
  winstonLogger.warn(message, metadata);
}

/**
 * Log an API request with relevant details
 */
export function logApiRequest(
  req: Request, 
  endpoint: string,
  payload: any = null
): void {
  winstonLogger.http(`API Request: ${endpoint}`, {
    requestId: req.requestId,
    method: req.method,
    endpoint,
    payload: payload || req.body,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
}

/**
 * Log an API response with relevant details
 */
export function logApiResponse(
  req: Request,
  endpoint: string,
  statusCode: number,
  responseData: any = null,
  duration: number = 0
): void {
  const logLevel = statusCode >= 500 ? 'error' 
    : statusCode >= 400 ? 'warn' 
    : 'http';

  winstonLogger.log(logLevel, `API Response: ${endpoint} ${statusCode}`, {
    requestId: req.requestId,
    method: req.method,
    endpoint,
    statusCode,
    duration,
    response: responseData
  });
}

/**
 * Log WebSocket activity
 */
export function logWebSocketActivity(
  action: 'connect' | 'disconnect' | 'message' | 'error',
  connectionId: string,
  details: any = {}
): void {
  const logLevel = action === 'error' ? 'error' : 'http';

  winstonLogger.log(logLevel, `WebSocket ${action}`, {
    connectionId,
    ...details
  });
}

/**
 * Log performance metrics
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata: LogMetadata = {}
): void {
  const logLevel = duration > 1000 ? 'warn' : 'debug';

  winstonLogger.log(logLevel, `Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...metadata
  });
}

/**
 * Log security events
 */
export function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any = {}
): void {
  const logLevel = 
    severity === 'critical' ? 'error' :
    severity === 'high' ? 'error' :
    severity === 'medium' ? 'warn' :
    'info';

  winstonLogger.log(logLevel, `Security: ${eventType}`, {
    eventType,
    severity,
    ...details
  });
}

/**
 * Create a child logger with additional metadata
 */
export function createContextLogger(context: LogMetadata): {
  error: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  debug: (message: string, metadata?: LogMetadata) => void;
  http: (message: string, metadata?: LogMetadata) => void;
} {
  return {
    error: (message, metadata = {}) => winstonLogger.error(message, { ...context, ...metadata }),
    warn: (message, metadata = {}) => winstonLogger.warn(message, { ...context, ...metadata }),
    info: (message, metadata = {}) => winstonLogger.info(message, { ...context, ...metadata }),
    debug: (message, metadata = {}) => winstonLogger.debug(message, { ...context, ...metadata }),
    http: (message, metadata = {}) => winstonLogger.http(message, { ...context, ...metadata })
  };
}

// Export a simpler API for quick access
export const log = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  http: (message: string, metadata?: LogMetadata) => winstonLogger.http(message, metadata),
  performance: logPerformance,
  api: {
    request: logApiRequest,
    response: logApiResponse
  },
  security: logSecurityEvent,
  websocket: logWebSocketActivity,
  createContext: createContextLogger
};

// Export the winston logger instance
export const logger = winstonLogger;

// Default export
export default winstonLogger;