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
/**
 * Enhanced Logger Module
 * 
 * Provides a unified logging system with support for multiple transports,
 * log levels, context-awareness, and performance metrics.
 */

import { config, ConfigType } from '../../config/globalConfig';

// Log levels in order of severity
export enum LogLevel {
  SILLY = 0,
  DEBUG = 1,
  VERBOSE = 2,
  HTTP = 3,
  INFO = 4,
  WARN = 5,
  ERROR = 6,
  NONE = 7
}

// Map string levels to enum values
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  'silly': LogLevel.SILLY,
  'debug': LogLevel.DEBUG,
  'verbose': LogLevel.VERBOSE,
  'http': LogLevel.HTTP,
  'info': LogLevel.INFO,
  'warn': LogLevel.WARN,
  'error': LogLevel.ERROR
};

// Logger options
export interface LoggerOptions {
  level?: LogLevel | string;
  module?: string;
  format?: 'json' | 'simple' | 'pretty';
  includeTimestamp?: boolean;
  stdout?: boolean;
  file?: boolean;
  filePath?: string;
}

/**
 * Enhanced logger with context, formatting, and filtering
 */
export class Logger {
  private level: LogLevel;
  private module: string;
  private format: 'json' | 'simple' | 'pretty';
  private includeTimestamp: boolean;
  private stdout: boolean;
  private file: boolean;
  private filePath?: string;
  
  constructor(module: string = 'app', options: LoggerOptions = {}) {
    // Get configuration
    const cfg = config.getConfig();
    
    // Set options with defaults from config
    this.level = this.resolveLogLevel(options.level || cfg.logging.level);
    this.module = module;
    this.format = options.format || cfg.logging.format;
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.stdout = options.stdout ?? cfg.logging.console;
    this.file = options.file ?? cfg.logging.file;
    this.filePath = options.filePath || 'logs/app.log';
    
    // Subscribe to config changes
    config.subscribe((newConfig: ConfigType) => {
      this.level = this.resolveLogLevel(newConfig.logging.level);
      this.format = newConfig.logging.format;
      this.stdout = newConfig.logging.console;
      this.file = newConfig.logging.file;
    });
  }
  
  /**
   * Log a message at SILLY level
   */
  public silly(message: string, ...args: any[]): void {
    this.log(LogLevel.SILLY, message, ...args);
  }
  
  /**
   * Log a message at DEBUG level
   */
  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
  
  /**
   * Log a message at VERBOSE level
   */
  public verbose(message: string, ...args: any[]): void {
    this.log(LogLevel.VERBOSE, message, ...args);
  }
  
  /**
   * Log a message at HTTP level
   */
  public http(message: string, ...args: any[]): void {
    this.log(LogLevel.HTTP, message, ...args);
  }
  
  /**
   * Log a message at INFO level
   */
  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }
  
  /**
   * Log a message at WARN level
   */
  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }
  
  /**
   * Log a message at ERROR level
   */
  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }
  
  /**
   * Create a child logger with a sub-module name
   */
  public child(subModule: string): Logger {
    return new Logger(`${this.module}:${subModule}`, {
      level: this.level,
      format: this.format,
      includeTimestamp: this.includeTimestamp,
      stdout: this.stdout,
      file: this.file,
      filePath: this.filePath
    });
  }
  
  /**
   * Main logging method
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // Check if this level should be logged
    if (level < this.level) {
      return;
    }
    
    const timestamp = this.includeTimestamp ? new Date().toISOString() : undefined;
    const logData = {
      timestamp,
      level: LogLevel[level],
      module: this.module,
      message,
      ...(args.length > 0 ? { data: args } : {})
    };
    
    // Format the log based on preference
    let logOutput: string;
    
    switch (this.format) {
      case 'json':
        logOutput = JSON.stringify(logData);
        break;
      case 'pretty':
        logOutput = this.formatPretty(logData);
        break;
      case 'simple':
      default:
        logOutput = this.formatSimple(logData);
        break;
    }
    
    // Output to console if enabled
    if (this.stdout) {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(logOutput);
    }
    
    // Output to file if enabled
    if (this.file && this.filePath) {
      this.writeToFile(logOutput);
    }
  }
  
  /**
   * Format log entry in pretty format
   */
  private formatPretty(logData: any): string {
    // Colorize based on level
    let levelColor: string;
    switch (logData.level) {
      case 'ERROR':
        levelColor = '\x1b[31m'; // Red
        break;
      case 'WARN':
        levelColor = '\x1b[33m'; // Yellow
        break;
      case 'INFO':
        levelColor = '\x1b[36m'; // Cyan
        break;
      case 'HTTP':
        levelColor = '\x1b[35m'; // Magenta
        break;
      case 'VERBOSE':
        levelColor = '\x1b[32m'; // Green
        break;
      case 'DEBUG':
        levelColor = '\x1b[34m'; // Blue
        break;
      case 'SILLY':
        levelColor = '\x1b[90m'; // Gray
        break;
      default:
        levelColor = '\x1b[0m'; // Reset
    }
    
    const resetColor = '\x1b[0m';
    const moduleColor = '\x1b[90m'; // Gray
    
    // Format timestamp if included
    const timestamp = logData.timestamp 
      ? `${moduleColor}[${logData.timestamp}]${resetColor} `
      : '';
    
    // Format level
    const level = `${levelColor}${logData.level.padEnd(7)}${resetColor}`;
    
    // Format module
    const module = `${moduleColor}[${logData.module}]${resetColor}`;
    
    // Format message
    const message = logData.message;
    
    // Format data if present
    let dataStr = '';
    if (logData.data) {
      try {
        const formatted = logData.data.map((item: any) => {
          if (typeof item === 'object') {
            return JSON.stringify(item, null, 2);
          }
          return String(item);
        }).join(' ');
        dataStr = `\n${formatted}`;
      } catch (error) {
        dataStr = '\n[Unformattable data]';
      }
    }
    
    return `${timestamp}${level} ${module} ${message}${dataStr}`;
  }
  
  /**
   * Format log entry in simple format
   */
  private formatSimple(logData: any): string {
    const parts = [];
    
    if (logData.timestamp) {
      parts.push(`[${logData.timestamp}]`);
    }
    
    parts.push(`[${logData.level}]`);
    parts.push(`[${logData.module}]`);
    parts.push(logData.message);
    
    if (logData.data && logData.data.length > 0) {
      const dataStr = logData.data.map((item: any) => {
        if (typeof item === 'object') {
          return JSON.stringify(item);
        }
        return String(item);
      }).join(' ');
      parts.push(dataStr);
    }
    
    return parts.join(' ');
  }
  
  /**
   * Get the appropriate console method for the log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.INFO:
      case LogLevel.HTTP:
      case LogLevel.VERBOSE:
        return console.info;
      case LogLevel.DEBUG:
      case LogLevel.SILLY:
      default:
        return console.debug;
    }
  }
  
  /**
   * Write log output to file
   */
  private writeToFile(logOutput: string): void {
    // In a real implementation, this would write to a file
    // Here we'll just simulate it for the Replit environment
    
    // Note: In a production app, you'd use a proper file logging library
    // like winston with file rotation, etc.
    try {
      // This is just a placeholder - in a real implementation you'd use fs.appendFile
      // fs.appendFileSync(this.filePath, logOutput + '\n', 'utf8');
      
      // For now, just log to console that we would write to file
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Would write to ${this.filePath}]: ${logOutput}`);
      }
    } catch (error) {
      // If file writing fails, log to console as fallback
      console.error(`Failed to write to log file ${this.filePath}:`, error);
      console.error(logOutput);
    }
  }
  
  /**
   * Resolve log level from string or enum
   */
  private resolveLogLevel(level: LogLevel | string): LogLevel {
    if (typeof level === 'number') {
      return level;
    }
    
    return LOG_LEVEL_MAP[level.toLowerCase()] || LogLevel.INFO;
  }
}

// Export a default logger
export const logger = new Logger('app');

// Create namespace for common loggers
export const loggers = {
  app: logger,
  http: new Logger('http'),
  db: new Logger('db'),
  ai: new Logger('ai'),
  performance: new Logger('performance')
};
