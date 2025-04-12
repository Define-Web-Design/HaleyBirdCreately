/**
 * OpenAI API Routes
 * 
 * This module provides API endpoints for OpenAI-powered features.
 */

const express = require('express');
const router = express.Router();

// Import environment configuration
let environmentConfig;
try {
  environmentConfig = require('../../config/environment');
} catch (error) {
  console.warn('Could not load environment config');
  environmentConfig = {
    apiKeys: {
      openai: process.env.OPENAI_API_KEY || ''
    }
  };
}

// Import OpenAI service
let openaiService;
try {
  openaiService = require('../services/openai');
} catch (error) {
  console.error('Failed to load OpenAI service:', error.message);
  openaiService = null;
}

/**
 * Middleware to check if OpenAI service is available
 */
function checkOpenAIAvailability(req, res, next) {
  if (!openaiService) {
    return res.status(503).json({
      status: 'error',
      message: 'OpenAI service is not available'
    });
  }
  
  if (!environmentConfig.apiKeys.openai) {
    return res.status(503).json({
      status: 'error',
      message: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment.'
    });
  }
  
  next();
}

/**
 * @route GET /api/openai/status
 * @desc Get status of OpenAI integration
 * @access Public
 */
router.get('/status', (req, res) => {
  const apiAvailable = !!environmentConfig.apiKeys.openai && environmentConfig.apiKeys.openai !== 'OPENAI_API_KEY_NOT_SET';
  const serviceAvailable = !!openaiService;
  
  res.json({
    status: 'success',
    openai_api: apiAvailable ? 'available' : 'unavailable',
    service: serviceAvailable ? 'loaded' : 'not_loaded'
  });
});

/**
 * @route POST /api/openai/chat
 * @desc Generate text using OpenAI chat completion
 * @access Public
 */
router.post('/chat', checkOpenAIAvailability, async (req, res) => {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }
    
    const result = await openaiService.generateChatCompletion(prompt, {
      systemPrompt,
      model,
      temperature,
      maxTokens
    });
    
    res.json({
      status: 'success',
      response: result.text,
      model: result.model,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error in OpenAI chat endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate text response',
      error: error.message
    });
  }
});

/**
 * @route POST /api/openai/json
 * @desc Generate structured JSON response using OpenAI
 * @access Public
 */
router.post('/json', checkOpenAIAvailability, async (req, res) => {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }
    
    const result = await openaiService.generateJsonOutput(prompt, {
      systemPrompt,
      model,
      temperature,
      maxTokens
    });
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error in OpenAI JSON endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate JSON response',
      error: error.message
    });
  }
});

/**
 * @route POST /api/openai/analyze-image
 * @desc Analyze image using OpenAI Vision
 * @access Public
 */
router.post('/analyze-image', checkOpenAIAvailability, async (req, res) => {
  try {
    const { imageUrl, prompt, jsonMode } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Image URL is required'
      });
    }
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required'
      });
    }
    
    const result = await openaiService.analyzeImage(imageUrl, prompt, {
      jsonMode: !!jsonMode
    });
    
    res.json({
      status: 'success',
      response: jsonMode ? result.json : result.text,
      model: result.model,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error in OpenAI image analysis endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze image',
      error: error.message
    });
  }
});

/**
 * @route POST /api/openai/analyze-content
 * @desc Analyze text content for sentiment and topics
 * @access Public
 */
router.post('/analyze-content', checkOpenAIAvailability, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required'
      });
    }
    
    const result = await openaiService.generateJsonOutput(content, {
      systemPrompt: 'Analyze the provided content and output a JSON object with "sentiment" (positive, negative, neutral), "topics" (array of main topics), and "keywords" (array of relevant keywords).'
    });
    
    res.json({
      status: 'success',
      analysis: result
    });
  } catch (error) {
    console.error('Error in OpenAI content analysis endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze content',
      error: error.message
    });
  }
});

module.exports = router;