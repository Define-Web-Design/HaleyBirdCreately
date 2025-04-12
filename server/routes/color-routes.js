/**
 * Color Generator API Routes
 * 
 * This module provides API endpoints for AI-powered color palette generation features
 * with automatic fallback between Mistral AI and OpenAI.
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

// Import enhanced AI color generator service with fallbacks
let colorGenerator;
try {
  colorGenerator = require('../services/ai-color-generator');
  console.log('Successfully loaded AI color generator with fallback support');
} catch (error) {
  console.error('Failed to load AI color generator service:', error.message);
  
  // Try loading original color generator as fallback
  try {
    colorGenerator = require('../services/color-generator');
    console.log('Loaded Mistral-only color generator as fallback');
  } catch (secondError) {
    console.error('Also failed to load original color generator:', secondError.message);
    colorGenerator = null;
  }
}

/**
 * Middleware to check if color generation services are available
 */
function checkColorGeneratorAvailability(req, res, next) {
  if (!colorGenerator) {
    return res.status(503).json({
      status: 'error',
      message: 'Color Generator service is not available',
      suggestion: 'Try again later or check server configuration'
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
  let servicesStatus = {
    mistral: environmentConfig.apiKeys.mistral ? 'available' : 'unavailable',
    openai: environmentConfig.apiKeys.openai ? 'available' : 'unavailable',
    colorGeneratorLoaded: !!colorGenerator
  };
  
  // If enhanced generator is loaded, get detailed status
  if (colorGenerator && colorGenerator.getServiceStatus) {
    const detailedStatus = colorGenerator.getServiceStatus();
    servicesStatus = {
      ...servicesStatus,
      aiServices: detailedStatus,
      usingFallbacks: detailedStatus.usingFallbacks
    };
  }
  
  res.json({
    status: 'success',
    services: servicesStatus,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route POST /api/colors/generate-palette
 * @desc Generate a color palette based on a mood or description
 * @access Public
 */
router.post('/generate-palette', checkColorGeneratorAvailability, async (req, res) => {
  try {
    const { description, colors } = req.body;
    
    if (!description) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required for palette generation'
      });
    }
    
    console.log(`Generating palette for "${description}" with ${colors || 5} colors`);
    const result = await colorGenerator.generatePalette(description, colors || 5);
    
    // Check for error in result
    if (result && result.error) {
      console.error('Error in palette generation:', result.error);
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate palette',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result,
      requestedAt: new Date().toISOString()
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
router.post('/design-scheme', checkColorGeneratorAvailability, async (req, res) => {
  try {
    const { designType } = req.body;
    
    if (!designType) {
      return res.status(400).json({
        status: 'error',
        message: 'Design type is required for scheme generation'
      });
    }
    
    console.log(`Generating design scheme for "${designType}"`);
    const result = await colorGenerator.generateDesignScheme(designType);
    
    // Check for error in result
    if (result && result.error) {
      console.error('Error in design scheme generation:', result.error);
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate design scheme',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result,
      requestedAt: new Date().toISOString()
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
router.post('/accessible-colors', checkColorGeneratorAvailability, async (req, res) => {
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
    
    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(baseColor)) {
      return res.status(400).json({
        status: 'error',
        message: 'Base color must be a valid hex color in format #RRGGBB'
      });
    }
    
    console.log(`Generating accessible colors for ${baseColor} as ${purpose}`);
    const result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
    
    // Check for error in result
    if (result && result.error) {
      console.error('Error in accessible colors generation:', result.error);
      return res.status(400).json({
        status: 'error',
        message: result.message || 'Failed to generate accessible colors',
        error: result.error
      });
    }
    
    res.json({
      status: 'success',
      ...result,
      requestedAt: new Date().toISOString()
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
 * @route GET /api/colors/default-palettes
 * @desc Get default color palettes for common moods
 * @access Public
 */
router.get('/default-palettes', (req, res) => {
  try {
    // If enhanced generator is loaded, use its default palettes
    let defaultPalettes = {};
    
    if (colorGenerator && colorGenerator.getDefaultPalettes) {
      defaultPalettes = colorGenerator.getDefaultPalettes();
    } else {
      // Fallback default palettes
      defaultPalettes = {
        'happy': {
          colors: [
            { hex: '#FFD166', name: 'Sunny Yellow', role: 'primary' },
            { hex: '#06D6A0', name: 'Bright Mint', role: 'secondary' },
            { hex: '#118AB2', name: 'Ocean Blue', role: 'accent' },
            { hex: '#EF476F', name: 'Coral Pink', role: 'accent' },
            { hex: '#073B4C', name: 'Deep Navy', role: 'background' }
          ],
          description: 'A cheerful palette with bright yellows, turquoise, and vibrant accents'
        },
        'calm': {
          colors: [
            { hex: '#A8DADC', name: 'Soft Blue', role: 'primary' },
            { hex: '#E0FBFC', name: 'Pale Cyan', role: 'background' },
            { hex: '#457B9D', name: 'Steel Blue', role: 'secondary' },
            { hex: '#1D3557', name: 'Navy Blue', role: 'accent' },
            { hex: '#F1FAEE', name: 'Off White', role: 'text' }
          ],
          description: 'A tranquil palette with soft blues and gentle neutral tones'
        },
        'professional': {
          colors: [
            { hex: '#0A192F', name: 'Dark Navy', role: 'background' },
            { hex: '#112240', name: 'Midnight Blue', role: 'secondary' },
            { hex: '#233554', name: 'Slate Blue', role: 'accent' },
            { hex: '#8892B0', name: 'Muted Gray', role: 'text' },
            { hex: '#CCD6F6', name: 'Light Lavender', role: 'primary' }
          ],
          description: 'A sleek palette with deep blues and subtle gray undertones'
        }
      };
    }
    
    res.json({
      status: 'success',
      message: 'Default palettes for common moods',
      palettes: defaultPalettes
    });
  } catch (error) {
    console.error('Error retrieving default palettes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving default palettes',
      error: error.message
    });
  }
});

/**
 * @route GET /api/colors/default-schemes
 * @desc Get default design schemes
 * @access Public
 */
router.get('/default-schemes', (req, res) => {
  try {
    // If enhanced generator is loaded, use its default schemes
    let defaultSchemes = {};
    
    if (colorGenerator && colorGenerator.getDefaultDesignSchemes) {
      defaultSchemes = colorGenerator.getDefaultDesignSchemes();
    } else {
      // Fallback default schemes
      defaultSchemes = {
        'website': {
          scheme: {
            primary: '#3498db',
            secondary: '#2ecc71',
            accent: '#9b59b6',
            background: '#f5f5f5',
            text: '#333333',
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c'
          },
          description: 'A balanced website color scheme with good contrast and readability'
        },
        'mobile app': {
          scheme: {
            primary: '#1abc9c',
            secondary: '#3498db',
            accent: '#9b59b6',
            background: '#ffffff',
            text: '#2c3e50',
            success: '#2ecc71',
            warning: '#f1c40f',
            error: '#e74c3c'
          },
          description: 'A vibrant mobile app color scheme optimized for small screens and touch interactions'
        }
      };
    }
    
    res.json({
      status: 'success',
      message: 'Default design schemes',
      schemes: defaultSchemes
    });
  } catch (error) {
    console.error('Error retrieving default schemes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving default schemes',
      error: error.message
    });
  }
});

module.exports = router;