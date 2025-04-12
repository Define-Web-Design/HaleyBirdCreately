import express, { Application } from 'express';
import { Server } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sets up the Vite development server for the frontend
 */
export async function setupVite(app: Application, server: Server) {
  try {
    const { createServer: createViteServer } = await import('vite');
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '..'),
    });

    app.use(vite.middlewares);
    
    console.log('Vite development server set up successfully');
    return vite;
  } catch (error) {
    console.error('Failed to set up Vite development server:', error);
    throw error;
  }
}

/**
 * Serves static files for production
 */
export function serveStatic(app: Application) {
  const CLIENT_DIST_DIR = path.resolve(__dirname, '../dist/client');
  
  if (!fs.existsSync(CLIENT_DIST_DIR)) {
    console.error(`Production build directory not found: ${CLIENT_DIST_DIR}`);
    console.error('Please run "npm run build" before starting in production mode');
    process.exit(1);
  }
  
  // Serve static files
  app.use(express.static(CLIENT_DIST_DIR));
  
  // Serve index.html for all other routes for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });
  
  console.log('Static files configured for production');
}