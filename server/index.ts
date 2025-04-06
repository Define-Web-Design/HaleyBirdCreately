import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'node:http';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { rateLimit } from 'express-rate-limit';
import { Pool } from '@neondatabase/serverless';
import { serviceRegistry } from './services/serviceRegistry';
import dotenv from 'dotenv';
import ws from 'ws';

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

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
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

// Apply rate limiter to all requests
app.use(limiter);

// Add database connection to request object
app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = pool;
  next();
});

// Register API routes
registerRoutes(app).then(httpServer => {
  console.log('API routes registered successfully');
}).catch(error => {
  console.error('Error registering API routes:', error);
});

// Serve static files in production
if (isProduction) {
  app.use(express.static('dist'));
} else {
  // In development, use Vite's dev server
  setupVite(app, server).catch(error => {
    console.error('Error setting up Vite:', error);
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
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', result.rows[0].now);
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});