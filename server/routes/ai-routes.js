/**
 * AI Integration Routes
 * 
 * This module provides API endpoints for AI features, including
 * Mistral chat completions and Codestral code assistance.
 */

const express = require('express');
const router = express.Router();
const mistralAI = require('../services/mistral-ai');

// Middleware to check if Mistral AI services are available
function checkMistralAvailability(req, res, next) {
  const serviceStatus = mistralAI.getServiceStatus();
  
  if (!serviceStatus.mistralChat.available && !serviceStatus.codeAssistance.available) {
    return res.status(503).json({
      error: 'AI services unavailable',
      message: 'Mistral AI services are not configured. Please check your API keys.',
      status: serviceStatus
    });
  }
  
  next();
}

// Health check endpoint for AI services
router.get('/health', (req, res) => {
  const serviceStatus = mistralAI.getServiceStatus();
  
  res.json({
    status: 'online',
    services: serviceStatus,
    timestamp: new Date().toISOString()
  });
});

// Generate chat completion
router.post('/chat', checkMistralAvailability, async (req, res) => {
  const { prompt, options } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: 'Missing prompt',
      message: 'The prompt parameter is required'
    });
  }
  
  try {
    const result = await mistralAI.generateChatCompletion(prompt, options || {});
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in chat completion endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Generate code completion
router.post('/code', checkMistralAvailability, async (req, res) => {
  const { prompt, options } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: 'Missing prompt',
      message: 'The prompt parameter is required'
    });
  }
  
  try {
    const result = await mistralAI.generateCodeCompletion(prompt, options || {});
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in code completion endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Generate code completion with Fill-in-the-Middle (FIM)
router.post('/fim', checkMistralAvailability, async (req, res) => {
  const { prefix, suffix, options } = req.body;
  
  if (!prefix) {
    return res.status(400).json({
      error: 'Missing prefix',
      message: 'The prefix parameter is required for Fill-in-the-Middle completion'
    });
  }
  
  try {
    const result = await mistralAI.generateFimCompletion(
      prefix, 
      suffix || "", 
      options || {}
    );
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in FIM completion endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Test AI connection
router.get('/test-connection', async (req, res) => {
  try {
    const isConnected = await mistralAI.testMistralConnection();
    
    res.json({
      connected: isConnected,
      service: 'Mistral AI',
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