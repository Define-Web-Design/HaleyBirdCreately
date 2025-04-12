/**
 * Color Generator API Routes
 * 
 * This module provides API endpoints for AI-powered color palette generation features.
 */

const express = require('express');
const router = express.Router();
const colorGenerator = require('../services/color-generator');
const mistralAI = require('../services/mistral-ai');

// Middleware to check if AI services are available
function checkAIAvailability(req, res, next) {
  const serviceStatus = mistralAI.getServiceStatus();
  
  if (!serviceStatus.mistralChat.available) {
    return res.status(503).json({
      error: 'AI services unavailable',
      message: 'Mistral AI service is not configured. Please check your API keys.',
      status: serviceStatus
    });
  }
  
  next();
}

// Health check endpoint for color generation service
router.get('/health', (req, res) => {
  const serviceStatus = mistralAI.getServiceStatus();
  
  res.json({
    status: 'online',
    aiServices: serviceStatus,
    features: {
      paletteGeneration: serviceStatus.mistralChat.available,
      designSchemes: serviceStatus.mistralChat.available,
      accessibilityAdjustments: serviceStatus.mistralChat.available
    },
    timestamp: new Date().toISOString()
  });
});

// Generate color palette based on mood/description
router.post('/generate-palette', checkAIAvailability, async (req, res) => {
  const { description, colors } = req.body;
  
  if (!description) {
    return res.status(400).json({
      error: 'Missing description',
      message: 'A mood or description is required to generate a palette'
    });
  }
  
  try {
    const result = await colorGenerator.generatePalette(
      description, 
      colors || 5
    );
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in palette generation endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Generate design color scheme
router.post('/design-scheme', checkAIAvailability, async (req, res) => {
  const { designType } = req.body;
  
  if (!designType) {
    return res.status(400).json({
      error: 'Missing design type',
      message: 'A design type (e.g., "website", "mobile app") is required'
    });
  }
  
  try {
    const result = await colorGenerator.generateDesignScheme(designType);
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in design scheme generation endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Suggest accessible color variations
router.post('/accessible-colors', checkAIAvailability, async (req, res) => {
  const { baseColor, purpose } = req.body;
  
  if (!baseColor) {
    return res.status(400).json({
      error: 'Missing base color',
      message: 'A base color in hex format (#RRGGBB) is required'
    });
  }
  
  if (!purpose) {
    return res.status(400).json({
      error: 'Missing purpose',
      message: 'The purpose of the color (e.g., "background", "text") is required'
    });
  }
  
  try {
    const result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in accessible colors endpoint:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;