import express from 'express';
import { configureVite } from './vite';
import routes from './routes';

async function createServer() {
  const app = express();

  // Parse JSON request bodies
  app.use(express.json());

  // Configure Vite for development
  await configureVite(app);

  // API routes
  app.use(routes);

  // Fallback route for SPA
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile('index.html');
  });

  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[express] serving on port ${port}`);
  });
}

createServer();