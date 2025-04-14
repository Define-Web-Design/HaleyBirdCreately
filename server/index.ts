import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes';
import storage from './storage';
import { setupVite, serveStatic } from './vite';

// Load environment variables
dotenv.config();

// Import environment variable check
import { checkRequiredEnvVars } from './utils/env-check';
checkRequiredEnvVars();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import and use performance monitoring middleware
import { performanceMonitor } from './middleware/performance';
app.use(performanceMonitor);

// Initialize database
(async () => {
  try {
    await (storage as any).init();
    console.log('✅ Database initialized successfully');

    // Test database connection with a simple query
    try {
      await (storage as any).testConnection();
      console.log('✅ Database connection verified');
    } catch (testError) {
      console.error('❌ Database connection test failed:', testError);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
})();

// API routes
app.use('/api', routes);

// Determine environment and start server accordingly
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  try {
    // Setup Vite development server
    const server = app.listen(port, '0.0.0.0');
    setupVite(app, server).catch(err => {
      console.error('Failed to setup Vite:', err);
      console.log('Continuing with basic server setup...');
    });
    console.log(`Development server running at http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('Error starting development server:', error);
    // Fallback to standard server without Vite
    app.listen(port, '0.0.0.0', () => {
      console.log(`Fallback server running at http://0.0.0.0:${port}`);
    });
  }
} else {
  // Serve static files in production
  serveStatic(app);

  // Default route (for SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  });

  // Start server
  app.listen(port, '0.0.0.0', () => {
    console.log(`Production server running at http://0.0.0.0:${port} (PORT=${process.env.PORT || 3000})`);
  });
}

export default app;