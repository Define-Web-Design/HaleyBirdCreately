import { Application } from 'express';

export async function registerRoutes(app: Application) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Add your API routes here
  app.get('/api/users', (req, res) => {
    res.json({ message: 'User API endpoint' });
  });

  // Default API route
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  return app;
}