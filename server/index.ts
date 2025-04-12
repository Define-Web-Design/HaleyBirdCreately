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

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
(async () => {
  try {
    await (storage as any).init();
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
})();

// API routes
app.use('/api', routes);

// Vite or static file serving
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  // Setup Vite development server
  const server = app.listen(port);
  setupVite(app, server);
  console.log(`Development server running at http://localhost:${port}`);
} else {
  // Serve static files in production
  serveStatic(app);
  
  // Default route (for SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`Production server running at http://0.0.0.0:${port}`);
  });
}

export default app;