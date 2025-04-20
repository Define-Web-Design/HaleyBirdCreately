/**
 * Logger Utility
 * 
 * Provides a consistent logging interface with configurable levels and
 * optional structured data output.
 */

// Log levels in order of increasing severity
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4
};

// Get log level from environment or default to 'info'
const getCurrentLogLevel = (): number => {
  const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLogLevel && envLogLevel in LOG_LEVELS) {
    return LOG_LEVELS[envLogLevel as keyof typeof LOG_LEVELS];
  }
  // Default log level: info in production, debug in development
  return process.env.NODE_ENV === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;
};

// Get current log level
let currentLogLevel = getCurrentLogLevel();

/**
 * Generic log function
 */
function log(level: keyof typeof LOG_LEVELS, message: string, data?: any): void {
  // Skip if this log level is below the current level
  if (LOG_LEVELS[level] < currentLogLevel) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...(data ? { data } : {})
  };
  
  // Format log based on environment
  if (process.env.NODE_ENV === 'production') {
    // Production: JSON format for machine parsing
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](JSON.stringify(logData));
  } else {
    // Development: Formatted for human readability
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
    
    if (data) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        prefix, 
        message, 
        '\nData:', 
        typeof data === 'object' ? data : { value: data }
      );
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message);
    }
  }
}

/**
 * Set the current log level
 */
export function setLogLevel(level: keyof typeof LOG_LEVELS): void {
  if (level in LOG_LEVELS) {
    currentLogLevel = LOG_LEVELS[level];
  }
}

/**
 * Get the current log level
 */
export function getLogLevel(): string {
  return Object.keys(LOG_LEVELS).find(
    key => LOG_LEVELS[key as keyof typeof LOG_LEVELS] === currentLogLevel
  ) || 'unknown';
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug level logging
   */
  debug(message: string, data?: any): void {
    log('debug', message, data);
  },
  
  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    log('info', message, data);
  },
  
  /**
   * Warning level logging
   */
  warn(message: string, data?: any): void {
    log('warn', message, data);
  },
  
  /**
   * Error level logging
   */
  error(message: string, data?: any): void {
    log('error', message, data);
  }
};

/**
 * Export default logger
 */
export default logger;