/**
 * Main Server Entry Point
 * 
 * This is the unified server implementation that handles API endpoints,
 * static file serving, and AI service integration.
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import performance middleware and logger
const { logger } = require('./dist/server/utils/logger');
const performanceMiddleware = require('./dist/server/middleware/performance').default;

// AI service integration (if available)
let aiService = null;
try {
  const { AIService } = require('./dist/server/ai/aiService');
  const { initAdapters } = require('./dist/server/ai/initAdapters');
  const adapterRegistry = initAdapters();
  aiService = new AIService(adapterRegistry);
  logger.info('AI service initialized');
} catch (error) {
  logger.warn('AI service initialization failed', { error: error.message });
}

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Initialize Express app
const app = express();
const httpServer = http.createServer(app);

// Apply middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply performance monitoring
app.use(performanceMiddleware.middleware({
  detailed: !isProduction,
  trackAiCalls: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    ai_service: aiService ? 'available' : 'unavailable'
  });
});

// Performance metrics endpoint
app.get('/metrics', (req, res) => {
  res.status(200).json(performanceMiddleware.getMetrics());
});

// API routes
const apiRouter = express.Router();
app.use('/api', apiRouter);

// AI API endpoints (if AI service is available)
if (aiService) {
  const aiRouter = express.Router();
  apiRouter.use('/ai', aiRouter);
  
  // AI status endpoint
  aiRouter.get('/status', (req, res) => {
    res.status(200).json(aiService.getStatus());
  });
  
  // Text generation endpoint
  aiRouter.post('/generate-text', async (req, res) => {
    try {
      const { prompt, options } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      const result = await aiService.generateText(prompt, options);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Text generation error', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // JSON generation endpoint
  aiRouter.post('/generate-json', async (req, res) => {
    try {
      const { prompt, options } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      const result = await aiService.generateJson(prompt, options);
      res.status(200).json(result);
    } catch (error) {
      logger.error('JSON generation error', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // Chat completion endpoint
  aiRouter.post('/chat', async (req, res) => {
    try {
      const { messages, options } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }
      
      const result = await aiService.chatCompletion(messages, options);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Chat completion error', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // Image analysis endpoint
  aiRouter.post('/analyze-image', async (req, res) => {
    try {
      const { imageUrl, base64Image, prompt, options } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      if (!imageUrl && !base64Image) {
        return res.status(400).json({ error: 'Either imageUrl or base64Image is required' });
      }
      
      const result = await aiService.analyzeImage({
        imageUrl,
        base64Image,
        prompt,
        ...options
      });
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Image analysis error', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
  
  // Embedding generation endpoint
  aiRouter.post('/generate-embedding', async (req, res) => {
    try {
      const { text, options } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const result = await aiService.generateEmbedding(text, options);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Embedding generation error', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });
}

// Serve static files from /public directory
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  // Check if the request is for an API endpoint
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other requests, serve the index.html file
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Running</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 { color: #2c3e50; }
            .status { color: #27ae60; font-weight: bold; }
            .endpoints { margin-top: 20px; }
            code {
              background: #f8f8f8;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <h1>Server Running</h1>
          <p>Status: <span class="status">Online</span></p>
          <p>Environment: ${NODE_ENV}</p>
          <p>AI Service: ${aiService ? 'Available' : 'Unavailable'}</p>
          
          <div class="endpoints">
            <h2>Available Endpoints:</h2>
            <ul>
              <li><code>GET /health</code> - Health check endpoint</li>
              <li><code>GET /metrics</code> - Server performance metrics</li>
              ${aiService ? `
              <li><code>GET /api/ai/status</code> - AI service status</li>
              <li><code>POST /api/ai/generate-text</code> - Generate text</li>
              <li><code>POST /api/ai/generate-json</code> - Generate JSON</li>
              <li><code>POST /api/ai/chat</code> - Chat completion</li>
              <li><code>POST /api/ai/analyze-image</code> - Analyze image</li>
              <li><code>POST /api/ai/generate-embedding</code> - Generate embedding</li>
              ` : ''}
            </ul>
          </div>
        </body>
      </html>
    `);
  }
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} (${NODE_ENV} mode)`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Metrics available at http://localhost:${PORT}/metrics`);
  
  if (aiService) {
    const availableProviders = aiService.getStatus().available;
    logger.info(`AI service available with providers: ${availableProviders.join(', ') || 'none'}`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 5 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 5 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
});

// Export for testing
module.exports = { app, httpServer };