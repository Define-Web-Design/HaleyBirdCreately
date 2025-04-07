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
// Register storage service
serviceRegistry.registerService('storage', storage);
// Create and register auth service
const authService = new AuthService(storage);
serviceRegistry.registerService('auth', authService);

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

// Start the server
startServer();
