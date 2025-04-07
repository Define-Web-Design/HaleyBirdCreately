
import winston from 'winston';

// Define the log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message} ${
      Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : ''
    }`;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
    ...(process.env.NODE_ENV === 'production' 
      ? [new winston.transports.File({ filename: 'logs/app.log' })]
      : [])
  ],
});

// Create a request logger middleware
export const requestLogger = (req, res, next) => {
  // Generate a unique request ID
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  req.requestId = requestId;

  // Log the request
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Calculate response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Response: ${res.statusCode}`, {
      requestId,
      duration: `${duration}ms`,
      statusCode: res.statusCode
    });
  });

  next();
};

// Export the logger
export default logger;
