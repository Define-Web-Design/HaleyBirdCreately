import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'node:http';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { rateLimit } from 'express-rate-limit';
import { Pool } from '@neondatabase/serverless';
import { serviceRegistry } from './services/serviceRegistry';
import { initializeWebSocketServer } from './websocket';
import { storage } from './storage';
import dotenv from 'dotenv';
import ws from 'ws';
import logger, { requestLogger } from './utils/logger'; //Import the logger

// Extend the request type to include database connection
declare global {
  namespace Express {
    interface Request {
      db?: Pool;
    }
  }
}

// Load environment variables
dotenv.config();

// Initialize database connection with WebSocket for Replit environment
// @ts-ignore - WebSocket is needed by Neon in serverless environments
globalThis.WebSocket = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? true : false, // Only use SSL in production
});

// Initialize service registry with database connection
serviceRegistry.registerServices(pool);

// Rate limiter to prevent abuse - increased limits for local development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit to 1000 requests per window for development
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
});

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000; // Use port 5000 as required by Replit
const isProduction = process.env.NODE_ENV === 'production';

// Set trust proxy to handle X-Forwarded-For header correctly in Replit environment
app.set('trust proxy', 1);

// Enhanced session store
const SessionStore = MemoryStore(session);

// Session middleware
app.use(session({
  cookie: { maxAge: 86400000 }, // 24 hours
  store: new SessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'creately-secret-key'
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Add request logging

// Apply rate limiter to all requests
app.use(limiter);

// Add database connection to request object
app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = pool;
  next();
});

// Register API routes
registerRoutes(app).then(httpServer => {
  logger.info('API routes registered successfully'); //Use the structured logger
}).catch(error => {
  logger.error('Error registering API routes:', error); //Use the structured logger
});

// Serve static files in production
if (isProduction) {
  app.use(express.static('dist'));
} else {
  // In development, use Vite's dev server
  setupVite(app, server).catch(error => {
    logger.error('Error setting up Vite:', error); //Use the structured logger
  });
}

// Fallback for client-side routing in production
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

// Check database connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    logger.error('Database connection error:', err); //Use the structured logger
  } else {
    logger.info('Database connected successfully at:', result.rows[0].now); //Use the structured logger
  }
});

// Initialize WebSocket server with the HTTP server
// Note: We need to pass the HTTP server to the WebSocket server
initializeWebSocketServer(server);

server.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`, {port}); //Use the structured logger
});


// Global error handler
process.on('uncaughtException', (error) => {
  logger.error(error, {
    type: 'uncaughtException',
    fatal: true
  });

  // Give logger time to write to files before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    type: 'unhandledRejection',
    reason,
    promise
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server'); //Use the structured logger
  await pool.end();
  server.close(() => {
    logger.info('HTTP server closed'); //Use the structured logger
    process.exit(0);
  });
});