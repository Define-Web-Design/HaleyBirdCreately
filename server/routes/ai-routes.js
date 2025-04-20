
/**
 * AI Integration Routes
 * 
 * This module provides API endpoints for AI features using the unified AIService.
 */

const express = require('express');
const router = express.Router();
const { getAIService } = require('../ai/aiService');
const aiMiddleware = require('../middleware/aiMiddleware');

// Apply AI middleware to all routes
router.use(aiMiddleware.checkAIHealth);
router.use(aiMiddleware.addAIProviderInfo);
router.use(aiMiddleware.aiRateLimiter);

// Health check endpoint for AI services
router.get('/health', (req, res) => {
  const aiService = getAIService();
  const serviceHealth = aiService.getServiceHealth();
  const providers = aiService.getProviderStatus();
  
  res.json({
    status: serviceHealth.healthy ? 'online' : 'degraded',
    message: serviceHealth.message,
    lastCheck: serviceHealth.lastCheck,
    providers: providers,
    timestamp: new Date().toISOString()
  });
});

// Generate text completion
router.post('/generate-text', async (req, res) => {
  const { prompt, options } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: 'Missing prompt',
      message: 'The prompt parameter is required'
    });
  }
  
  try {
    const aiService = getAIService();
    const result = await aiService.generateText(prompt, options || {});
    res.json(result);
  } catch (error) {
    console.error('Error in text generation endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Generate JSON response
router.post('/generate-json', async (req, res) => {
  const { prompt, options } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: 'Missing prompt',
      message: 'The prompt parameter is required'
    });
  }
  
  try {
    const aiService = getAIService();
    const result = await aiService.generateJson(prompt, options || {});
    res.json(result);
  } catch (error) {
    console.error('Error in JSON generation endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Analyze content (specialized endpoint)
router.post('/analyze-content', async (req, res) => {
  const { content, options } = req.body;
  
  if (!content) {
    return res.status(400).json({
      error: 'Missing content',
      message: 'The content parameter is required'
    });
  }
  
  try {
    const aiService = getAIService();
    
    const prompt = `
      Analyze the following content and provide an assessment of:
      1. The overall sentiment (positive, negative, neutral)
      2. Key topics covered
      3. Important keywords for categorization

      Content: ${content}
    `;
    
    const systemPrompt = `
      You are an AI content analyst. Provide a JSON response with these fields:
      - sentiment: string (positive, negative, or neutral)
      - topics: string[] (array of main topics)
      - keywords: string[] (array of relevant keywords)
    `;
    
    const result = await aiService.generateJson(prompt, {
      ...options,
      systemPrompt
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error in content analysis endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Test AI connection
router.get('/test-connection', async (req, res) => {
  try {
    const aiService = getAIService();
    await aiService.checkHealth();
    
    const providers = aiService.getProviderStatus();
    const anyConnected = providers.some(p => p.available);
    
    res.json({
      connected: anyConnected,
      providers: providers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Connection test failed',
      message: error.message
    });
  }
});

module.exports = router;
