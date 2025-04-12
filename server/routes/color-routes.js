/**
 * Color Generator API Routes
 * 
 * This module provides API endpoints for AI-powered color palette generation features.
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
      mistral: process.env.MISTRAL_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || ''
    }
  };
}

// Import color generator service
let colorGenerator;
try {
  colorGenerator = require('../services/color-generator');
} catch (error) {
  console.error('Failed to load color generator service:', error.message);
  colorGenerator = null;
}

/**
 * Middleware to check if AI services are available
 */
function checkAIAvailability(req, res, next) {
  if (!colorGenerator) {
    return res.status(503).json({
      status: 'error',
      message: 'AI Color Generator service is not available'
    });
  }
  
  // If the request specifically requires Mistral AI
  if (req.path.includes('/mistral') && !environmentConfig.apiKeys.mistral) {
    return res.status(503).json({
      status: 'error',
      message: 'Mistral AI service is not available. Please configure MISTRAL_API_KEY.'
    });
  }
  
  // If the request specifically requires OpenAI
  if (req.path.includes('/openai') && !environmentConfig.apiKeys.openai) {
    return res.status(503).json({
      status: 'error',
      message: 'OpenAI service is not available. Please configure OPENAI_API_KEY.'
    });
  }
  
  next();
}

/**
 * @route GET /api/colors/status
 * @desc Get status of color generation services
 * @access Public
 */
router.get('/status', (req, res) => {
  const status = {
    mistral: environmentConfig.apiKeys.mistral ? 'available' : 'unavailable',
    openai: environmentConfig.apiKeys.openai ? 'available' : 'unavailable'
  };
  
  res.json({
    status: 'success',
    services: status,
    colorGeneratorLoaded: !!colorGenerator
  });
});

/**
 * @route POST /api/colors/generate-palette
 * @desc Generate a color palette based on a mood or description
 * @access Public
 */
router.post('/generate-palette', checkAIAvailability, async (req, res) => {
  try {
    const { description, colors } = req.body;
    
    if (!description) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required for palette generation'
      });
    }
    
    const result = await colorGenerator.generatePalette(description, colors || 5);
    
    if (result.error) {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate palette',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error('Error in palette generation route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during palette generation',
      error: error.message
    });
  }
});

/**
 * @route POST /api/colors/design-scheme
 * @desc Generate color schemes for common design scenarios
 * @access Public
 */
router.post('/design-scheme', checkAIAvailability, async (req, res) => {
  try {
    const { designType } = req.body;
    
    if (!designType) {
      return res.status(400).json({
        status: 'error',
        message: 'Design type is required for scheme generation'
      });
    }
    
    const result = await colorGenerator.generateDesignScheme(designType);
    
    if (result.error) {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate design scheme',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error('Error in design scheme generation route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during design scheme generation',
      error: error.message
    });
  }
});

/**
 * @route POST /api/colors/accessible-colors
 * @desc Generate accessible color suggestions based on a base color
 * @access Public
 */
router.post('/accessible-colors', checkAIAvailability, async (req, res) => {
  try {
    const { baseColor, purpose } = req.body;
    
    if (!baseColor) {
      return res.status(400).json({
        status: 'error',
        message: 'Base color is required for accessible color generation'
      });
    }
    
    if (!purpose) {
      return res.status(400).json({
        status: 'error',
        message: 'Purpose is required for accessible color generation'
      });
    }
    
    const result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
    
    if (result.error) {
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate accessible colors',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error('Error in accessible colors generation route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during accessible colors generation',
      error: error.message
    });
  }
});

/**
 * @route GET /api/colors/fallback-palettes
 * @desc Get fallback color palettes when AI services are unavailable
 * @access Public
 */
router.get('/fallback-palettes', (req, res) => {
  // Default color palettes for common moods and themes
  const fallbackPalettes = {
    'happy': {
      colors: ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'],
      description: 'A cheerful palette with bright yellows, turquoise, and vibrant accents'
    },
    'calm': {
      colors: ['#A8DADC', '#E0FBFC', '#457B9D', '#1D3557', '#F1FAEE'],
      description: 'A tranquil palette with soft blues and gentle neutral tones'
    },
    'energetic': {
      colors: ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'],
      description: 'A vibrant palette with bold reds, yellows, and electric blues'
    },
    'professional': {
      colors: ['#0A192F', '#112240', '#233554', '#8892B0', '#CCD6F6'],
      description: 'A sleek palette with deep blues and subtle gray undertones'
    },
    'creative': {
      colors: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'],
      description: 'An imaginative palette with bold purples and vibrant blues'
    }
  };
  
  res.json({
    status: 'success',
    message: 'Fallback palettes for when AI services are unavailable',
    palettes: fallbackPalettes
  });
});

module.exports = router;