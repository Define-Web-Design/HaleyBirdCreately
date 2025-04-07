import express from 'express';
import session from 'express-session';
import path from 'path';
import { registerRoutes } from './routes';
import storage from './storage';
import { ServiceRegistry } from './services/registry';
import { AuthService } from './services/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Register services
const serviceRegistry = ServiceRegistry.getInstance();
const authService = new AuthService(storage);
serviceRegistry.registerService('auth', authService);

// Setup middleware
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

// Register routes
const httpServer = registerRoutes(app);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Using ${process.env.USE_IN_MEMORY_DB === 'true' ? 'in-memory' : 'PostgreSQL'} storage`);
});
