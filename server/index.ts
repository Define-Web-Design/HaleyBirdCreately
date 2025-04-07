import express from 'express';
import session from 'express-session';
import path from 'path';
import { createServer } from 'http';
import { registerRoutes } from './routes';
import storage from './storage';
import { ServiceRegistry } from './services/registry';
import { AuthService } from './services/auth';
import dotenv from 'dotenv';
import { setupVite, serveStatic } from './vite';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Register services
const serviceRegistry = ServiceRegistry.getInstance();

// IMPORTANT: Ensure storage registration happens first and only once
if (!serviceRegistry.hasService('storage')) {
  console.log('Registering storage service...');
  serviceRegistry.registerService('storage', storage);
}

// Create and register auth service
try {
  const authService = new AuthService(storage);
  serviceRegistry.registerService('auth', authService);
  console.log('Auth service registered successfully');
} catch (error) {
  console.error('Failed to register auth service:', error);
}

// Setup middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Start the application
async function startServer() {
  try {
    // Register API routes
    await registerRoutes(app);

    // Setup Vite development server or serve static production build
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      await setupVite(app, httpServer);
    }

    // Start listening
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Using ${process.env.USE_IN_MEMORY_DB === 'true' ? 'in-memory' : 'PostgreSQL'} storage`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Import modules needed for keep-alive functionality
import * as http from 'http';
import * as fs from 'fs';
// Use the existing path import rather than importing it again

// Configure keep-alive mechanism for Replit environment
try {
  // Only enable in development mode
  if (process.env.NODE_ENV !== 'production') {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const LOG_FILE = path.join(logsDir, 'keep-alive.log');
    const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    // Log function
    const logKeepAlive = (message: string) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;
      console.log(logMessage);
      fs.appendFileSync(LOG_FILE, logMessage + '\n');
    };
    
    // Simple keep-alive server
    const keepAliveServer = http.createServer((req, res) => {
      if (req.url === '/health' || req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }));
        logKeepAlive('Received health check ping');
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    // Start on a different port to avoid conflicts
    const KEEP_ALIVE_PORT = 3333;
    keepAliveServer.listen(KEEP_ALIVE_PORT, '0.0.0.0', () => {
      logKeepAlive(`Keep-alive server listening on port ${KEEP_ALIVE_PORT}`);
    });
    
    // Set up self-ping interval
    const pingInterval = setInterval(() => {
      logKeepAlive('Sending self-ping to keep application alive...');
      
      const req = http.request({
        hostname: 'localhost',
        port: KEEP_ALIVE_PORT,
        path: '/ping',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            logKeepAlive('Self-ping successful');
          } else {
            logKeepAlive(`Self-ping failed with status code ${res.statusCode}`);
          }
        });
      });
      
      req.on('error', (error) => {
        logKeepAlive(`Self-ping error: ${error.message}`);
      });
      
      req.end();
    }, PING_INTERVAL);
    
    // Handle process termination
    process.on('SIGINT', () => {
      clearInterval(pingInterval);
      keepAliveServer.close();
    });
    
    process.on('SIGTERM', () => {
      clearInterval(pingInterval);
      keepAliveServer.close();
    });
    
    logKeepAlive('Keep-alive service initialized to prevent app from sleeping');
  }
} catch (error) {
  console.error('Failed to initialize keep-alive service:', error);
}

// Start the server
startServer();
