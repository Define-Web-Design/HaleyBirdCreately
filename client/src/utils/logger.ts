/**
 * Client-side Logging Utility
 * 
 * This module provides a simple logging interface for client-side code
 * with different log levels and environment-specific behaviors.
 */

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define logger configuration
interface LoggerConfig {
  /** Minimum level to output logs (debug < info < warn < error) */
  minLevel: LogLevel;
  
  /** Whether to include timestamps in log output */
  timestamps: boolean;
  
  /** Whether to send critical logs to the server */
  reportErrors: boolean;
  
  /** Endpoint to report errors to */
  errorEndpoint: string;
}

// Log level priorities (lower is less severe)
const LOG_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Default configuration based on environment
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  timestamps: true,
  reportErrors: process.env.NODE_ENV === 'production',
  errorEndpoint: '/api/logs/client-error'
};

// Current configuration
let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the logger
 * @param newConfig Configuration options to apply
 */
function configure(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Format a log message
 */
function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = config.timestamps ? `[${new Date().toISOString()}] ` : '';
  const formattedMeta = meta ? ` ${JSON.stringify(meta, formatErrorObjects)}` : '';
  
  return `${timestamp}${level.toUpperCase()}: ${message}${formattedMeta}`;
}

/**
 * Custom JSON replacer that handles Error objects
 */
function formatErrorObjects(_key: string, value: any): any {
  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack,
      name: value.name
    };
  }
  return value;
}

/**
 * Send an error log to the server
 */
function reportError(message: string, meta?: any): void {
  if (!config.reportErrors || typeof window === 'undefined') {
    return;
  }
  
  try {
    const payload = {
      message,
      timestamp: new Date().toISOString(),
      level: 'error',
      meta,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Use sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        config.errorEndpoint, 
        JSON.stringify(payload)
      );
      return;
    }
    
    // Fall back to fetch
    fetch(config.errorEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // Ignore errors - this is just telemetry
    });
  } catch (e) {
    // Ignore errors in error reporting
  }
}

/**
 * Log a message if the level is at or above the minimum level
 */
function log(level: LogLevel, message: string, meta?: any): void {
  if (LOG_PRIORITIES[level] < LOG_PRIORITIES[config.minLevel]) {
    return;
  }
  
  const formattedMessage = formatMessage(level, message, meta);
  
  // Use the appropriate console method
  switch (level) {
    case 'debug':
      console.debug(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      
      // Report errors to the server if enabled
      if (config.reportErrors) {
        reportError(message, meta);
      }
      break;
  }
}

/**
 * Logger interface
 */
export const logger = {
  configure,
  
  debug(message: string, meta?: any): void {
    log('debug', message, meta);
  },
  
  info(message: string, meta?: any): void {
    log('info', message, meta);
  },
  
  warn(message: string, meta?: any): void {
    log('warn', message, meta);
  },
  
  error(message: string, meta?: any): void {
    log('error', message, meta);
  },
  
  /**
   * Create a child logger with additional context
   * @param context Additional context to include with all logs
   */
  child(context: Record<string, any>) {
    return {
      debug(message: string, meta?: any): void {
        log('debug', message, { ...context, ...meta });
      },
      
      info(message: string, meta?: any): void {
        log('info', message, { ...context, ...meta });
      },
      
      warn(message: string, meta?: any): void {
        log('warn', message, { ...context, ...meta });
      },
      
      error(message: string, meta?: any): void {
        log('error', message, { ...context, ...meta });
      }
    };
  }
};