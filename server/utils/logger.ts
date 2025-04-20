
/**
 * Structured Logger
 * 
 * A comprehensive logging utility using Winston to provide structured,
 * consistent logs with metadata such as timestamps, request IDs, and
 * log levels for better debugging and monitoring.
 */

import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5
};

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

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

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

// Create a custom Winston logger instance
const logger = winston.createLogger({
  level,
  levels,
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

// Export the logger instance
export default logger;

// Create a type for additional metadata
interface LogMetadata {
  [key: string]: any;
}

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
  logger.http(`${method} ${url}`, {
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
    
    logger.log(logLevel, `${method} ${url} ${statusCode} ${duration}ms`, {
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
  logger.error(`${error.name}: ${error.message}`, {
    ...metadata,
    stack: error.stack
  });
}

/**
 * Log info with consistent formatting
 */
export function logInfo(message: string, metadata: LogMetadata = {}): void {
  logger.info(message, metadata);
}

/**
 * Log debug information with consistent formatting
 */
export function logDebug(message: string, metadata: LogMetadata = {}): void {
  logger.debug(message, metadata);
}

/**
 * Log warning with consistent formatting
 */
export function logWarn(message: string, metadata: LogMetadata = {}): void {
  logger.warn(message, metadata);
}

/**
 * Log an API request with relevant details
 */
export function logApiRequest(
  req: Request, 
  endpoint: string,
  payload: any = null
): void {
  logger.http(`API Request: ${endpoint}`, {
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
  
  logger.log(logLevel, `API Response: ${endpoint} ${statusCode}`, {
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
  
  logger.log(logLevel, `WebSocket ${action}`, {
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
  
  logger.log(logLevel, `Performance: ${operation} took ${duration}ms`, {
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
  
  logger.log(logLevel, `Security: ${eventType}`, {
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
    error: (message, metadata = {}) => logger.error(message, { ...context, ...metadata }),
    warn: (message, metadata = {}) => logger.warn(message, { ...context, ...metadata }),
    info: (message, metadata = {}) => logger.info(message, { ...context, ...metadata }),
    debug: (message, metadata = {}) => logger.debug(message, { ...context, ...metadata }),
    http: (message, metadata = {}) => logger.http(message, { ...context, ...metadata })
  };
}

// Export a simpler API for quick access
export const log = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  http: (message: string, metadata?: LogMetadata) => logger.http(message, metadata),
  performance: logPerformance,
  api: {
    request: logApiRequest,
    response: logApiResponse
  },
  security: logSecurityEvent,
  websocket: logWebSocketActivity,
  createContext: createContextLogger
};
/**
 * Unified Logging System
 * 
 * This module provides consistent logging across the application with
 * configurable outputs and log levels.
 */

import fs from 'fs';
import path from 'path';
import { getLoggingConfig } from '../../config/globalConfig';

// Define log levels and their numeric values
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

type LogLevel = keyof typeof LOG_LEVELS;

// Base logger interface
interface Logger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Console logger implementation
class ConsoleLogger implements Logger {
  private level: LogLevel;
  
  constructor(level: LogLevel = 'info') {
    this.level = level;
  }
  
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }
  
  private formatMeta(meta: any): string {
    if (!meta) return '';
    
    if (meta instanceof Error) {
      return `\n${meta.stack || meta.message}`;
    }
    
    try {
      return `\n${JSON.stringify(meta, null, 2)}`;
    } catch (err) {
      return `\n[Unserializable Object]`;
    }
  }
  
  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}${meta ? this.formatMeta(meta) : ''}`);
    }
  }
  
  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}${meta ? this.formatMeta(meta) : ''}`);
    }
  }
  
  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}${meta ? this.formatMeta(meta) : ''}`);
    }
  }
  
  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}${meta ? this.formatMeta(meta) : ''}`);
    }
  }
}

// File logger implementation
class FileLogger implements Logger {
  private level: LogLevel;
  private logFilePath: string;
  
  constructor(level: LogLevel = 'info', logFilePath?: string) {
    this.level = level;
    this.logFilePath = logFilePath || path.join(process.cwd(), 'logs', 'app.log');
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }
  
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? this.formatMeta(meta) : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
  }
  
  private formatMeta(meta: any): string {
    if (!meta) return '';
    
    if (meta instanceof Error) {
      return `\n${meta.stack || meta.message}`;
    }
    
    try {
      return `\n${JSON.stringify(meta, null, 2)}`;
    } catch (err) {
      return `\n[Unserializable Object]`;
    }
  }
  
  private appendToLog(message: string): void {
    try {
      fs.appendFileSync(this.logFilePath, message);
    } catch (err) {
      console.error(`Error writing to log file: ${err}`);
    }
  }
  
  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      this.appendToLog(this.formatMessage('ERROR', message, meta));
    }
  }
  
  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      this.appendToLog(this.formatMessage('WARN', message, meta));
    }
  }
  
  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      this.appendToLog(this.formatMessage('INFO', message, meta));
    }
  }
  
  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      this.appendToLog(this.formatMessage('DEBUG', message, meta));
    }
  }
}

// Multi-logger that can output to multiple destinations
class MultiLogger implements Logger {
  private loggers: Logger[] = [];
  
  constructor(loggers: Logger[]) {
    this.loggers = loggers;
  }
  
  error(message: string, meta?: any): void {
    this.loggers.forEach(logger => logger.error(message, meta));
  }
  
  warn(message: string, meta?: any): void {
    this.loggers.forEach(logger => logger.warn(message, meta));
  }
  
  info(message: string, meta?: any): void {
    this.loggers.forEach(logger => logger.info(message, meta));
  }
  
  debug(message: string, meta?: any): void {
    this.loggers.forEach(logger => logger.debug(message, meta));
  }
}

// Create the application logger
function createLogger(): Logger {
  const config = getLoggingConfig();
  const loggers: Logger[] = [];
  
  if (config.outputs.includes('console')) {
    loggers.push(new ConsoleLogger(config.level));
  }
  
  if (config.outputs.includes('file')) {
    loggers.push(new FileLogger(config.level, config.logFilePath));
  }
  
  return new MultiLogger(loggers);
}

// Export the singleton logger instance
export const logger = createLogger();

// Export default logger
export default logger;
