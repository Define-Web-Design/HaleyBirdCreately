/**
 * AI-Driven Color Scheme Generator
 * 
 * This service provides color generation capabilities using multiple AI backends
 * (Mistral AI and OpenAI) with automatic fallback mechanisms.
 */

// Import AI service modules
let mistralService;
try {
  mistralService = require('./color-generator');
  console.log('Mistral color generator service loaded successfully');
} catch (error) {
  console.warn('Mistral color generator service not available:', error.message);
  mistralService = null;
}

let openaiService;
try {
  openaiService = require('./openai');
  console.log('OpenAI service loaded successfully');
} catch (error) {
  console.warn('OpenAI service not available:', error.message);
  openaiService = null;
}

// Environment configuration
let env;
try {
  env = require('../../config/environment');
} catch (error) {
  console.warn('Environment config not loaded, using defaults');
  env = {
    apiKeys: {
      mistral: process.env.MISTRAL_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || ''
    }
  };
}

// Determine available AI services
const MISTRAL_AVAILABLE = !!mistralService && !!env.apiKeys.mistral;
const OPENAI_AVAILABLE = !!openaiService && !!env.apiKeys.openai;

// Default color palettes for common themes when AI services are unavailable
const DEFAULT_PALETTES = {
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
  'energetic': {
    colors: [
      { hex: '#FF595E', name: 'Bright Red', role: 'primary' },
      { hex: '#FFCA3A', name: 'Golden Yellow', role: 'secondary' },
      { hex: '#8AC926', name: 'Lime Green', role: 'accent' },
      { hex: '#1982C4', name: 'Vivid Blue', role: 'accent' },
      { hex: '#6A4C93', name: 'Rich Purple', role: 'background' }
    ],
    description: 'A vibrant palette with bold reds, yellows, and electric blues'
  },
  'professional': {
    colors: [
      { hex: '#0A192F', name: 'Dark Navy', role: 'background' },
      { hex: '#112240', name: 'Midnight Blue', role: 'secondary' },
      { hex: '#233554', name: 'Slate Blue', role: 'accent' },
      { hex: '#8892B0', name: 'Muted Gray', role: 'text' },
      { hex: '#CCD6F6', name: 'Light Lavender', role: 'primary' }
    ],
    description: 'A sleek palette with deep blues and subtle gray undertones for professional contexts'
  },
  'creative': {
    colors: [
      { hex: '#F72585', name: 'Magenta', role: 'primary' },
      { hex: '#7209B7', name: 'Purple', role: 'secondary' },
      { hex: '#3A0CA3', name: 'Indigo', role: 'accent' },
      { hex: '#4361EE', name: 'Royal Blue', role: 'accent' },
      { hex: '#4CC9F0', name: 'Cyan', role: 'background' }
    ],
    description: 'An imaginative palette with bold purples and vibrant blues for creative projects'
  }
};

// Default design schemes for when AI services are unavailable
const DEFAULT_DESIGN_SCHEMES = {
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
  },
  'presentation': {
    scheme: {
      primary: '#3498db',
      secondary: '#2ecc71',
      accent: '#e74c3c',
      background: '#ecf0f1',
      text: '#2c3e50',
      success: '#27ae60',
      warning: '#f39c12',
      error: '#c0392b'
    },
    description: 'A professional presentation color scheme with high contrast for readability'
  }
};

/**
 * Generate a color palette based on a mood or description using available AI services
 * @param {string} description - The mood or description
 * @param {number} colors - Number of colors to generate (default: 5)
 * @returns {Promise<Object>} - The generated color palette
 */
async function generatePalette(description, colors = 5) {
  console.log(`Generating palette for: "${description}" with ${colors} colors`);
  
  // Check for keywords to use default palettes
  const lowerDesc = description.toLowerCase();
  for (const [mood, palette] of Object.entries(DEFAULT_PALETTES)) {
    if (lowerDesc.includes(mood)) {
      console.log(`Using default palette for "${mood}" mood`);
      return {
        theme: description,
        description: palette.description,
        colors: palette.colors,
        source: 'default',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Try Mistral first if available
  if (MISTRAL_AVAILABLE) {
    try {
      console.log('Attempting to generate palette with Mistral AI');
      const result = await mistralService.generatePalette(description, colors);
      
      // Check if the result has an error
      if (!result.error) {
        console.log('Successfully generated palette with Mistral AI');
        return result;
      }
      
      console.warn('Mistral AI returned an error:', result.error);
      // Fall through to OpenAI if there's an error
    } catch (error) {
      console.error('Error with Mistral AI palette generation:', error.message);
      // Fall through to OpenAI
    }
  }
  
  // Try OpenAI if available
  if (OPENAI_AVAILABLE) {
    try {
      console.log('Attempting to generate palette with OpenAI');
      
      // Format prompt for OpenAI JSON completion
      const prompt = `Generate a color palette with ${colors} colors that evokes a ${description} mood or feeling.`;
      const systemPrompt = `You are a professional color designer. Generate a harmonious color palette of exactly ${colors} colors as hex codes for the given mood or description. 
Return a JSON object with these fields:
- theme: The theme or mood described in the prompt
- description: A brief description of the palette and how it relates to the theme
- colors: An array of ${colors} objects, each with "hex" (color in #RRGGBB format), "name" (unique descriptive name), and "role" (primary, secondary, accent, background, or text)`;
      
      const result = await openaiService.generateJsonOutput(prompt, { systemPrompt });
      
      // Format the result to match the expected structure
      if (result && result.colors && Array.isArray(result.colors)) {
        console.log('Successfully generated palette with OpenAI');
        return {
          ...result,
          source: 'openai',
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn('OpenAI returned an unexpected response format');
      // Fall through to defaults
    } catch (error) {
      console.error('Error with OpenAI palette generation:', error.message);
      // Fall through to defaults
    }
  }
  
  // If no AI services could generate the palette, use a default
  console.log('All AI services failed or unavailable, using default palette');
  const defaultPalette = DEFAULT_PALETTES.professional;
  
  return {
    theme: description,
    description: `A default palette as no AI services were available to generate a custom "${description}" palette.`,
    colors: defaultPalette.colors,
    source: 'default',
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate color schemes for common design scenarios
 * @param {string} designType - The type of design (e.g., "website", "mobile app")
 * @returns {Promise<Object>} - The generated design color scheme
 */
async function generateDesignScheme(designType) {
  console.log(`Generating design scheme for: "${designType}"`);
  
  // Check if we have a default scheme for this design type
  const lowerType = designType.toLowerCase();
  for (const [type, scheme] of Object.entries(DEFAULT_DESIGN_SCHEMES)) {
    if (lowerType.includes(type)) {
      console.log(`Found matching default scheme for "${type}"`);
      return {
        designType: designType,
        description: scheme.description,
        scheme: scheme.scheme,
        recommendations: [
          "Maintain good contrast between text and background colors",
          "Use the primary color for main interface elements",
          "Reserve accent colors for calls to action"
        ],
        source: 'default',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Try Mistral first if available
  if (MISTRAL_AVAILABLE) {
    try {
      console.log('Attempting to generate design scheme with Mistral AI');
      const result = await mistralService.generateDesignScheme(designType);
      
      // Check if the result has an error
      if (!result.error) {
        console.log('Successfully generated design scheme with Mistral AI');
        return result;
      }
      
      console.warn('Mistral AI returned an error:', result.error);
      // Fall through to OpenAI if there's an error
    } catch (error) {
      console.error('Error with Mistral AI design scheme generation:', error.message);
      // Fall through to OpenAI
    }
  }
  
  // Try OpenAI if available
  if (OPENAI_AVAILABLE) {
    try {
      console.log('Attempting to generate design scheme with OpenAI');
      
      // Format prompt for OpenAI JSON completion
      const prompt = `Generate a comprehensive color scheme for a ${designType} design.`;
      const systemPrompt = `You are a UX/UI design expert. Generate a detailed color scheme for the specified design type.
Return a JSON object with these fields:
- designType: The type of design specified in the prompt
- description: A brief description of the overall scheme
- scheme: An object with color hex values for "primary", "secondary", "accent", "background", "text", "success", "warning", and "error"
- recommendations: An array of 3-5 brief design recommendations based on this color scheme`;
      
      const result = await openaiService.generateJsonOutput(prompt, { systemPrompt });
      
      // Format the result to match the expected structure
      if (result && result.scheme) {
        console.log('Successfully generated design scheme with OpenAI');
        return {
          ...result,
          source: 'openai',
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn('OpenAI returned an unexpected response format');
      // Fall through to defaults
    } catch (error) {
      console.error('Error with OpenAI design scheme generation:', error.message);
      // Fall through to defaults
    }
  }
  
  // If no AI services could generate the scheme, use a default
  console.log('All AI services failed or unavailable, using default design scheme');
  const defaultType = DEFAULT_DESIGN_SCHEMES.website;
  
  return {
    designType: designType,
    description: `A default design scheme as no AI services were available to generate a custom "${designType}" scheme.`,
    scheme: defaultType.scheme,
    recommendations: [
      "Maintain good contrast between text and background colors",
      "Use the primary color for main interface elements",
      "Reserve accent colors for calls to action"
    ],
    source: 'default',
    timestamp: new Date().toISOString()
  };
}

/**
 * Suggest color adjustments for accessibility
 * @param {string} baseColor - The base color in hex format (#RRGGBB)
 * @param {string} purpose - The purpose of the color (e.g., "background", "text")
 * @returns {Promise<Object>} - Suggested color adjustments for accessibility
 */
async function suggestAccessibleColors(baseColor, purpose) {
  console.log(`Generating accessible color variations for ${baseColor} as ${purpose}`);
  
  // Try Mistral first if available
  if (MISTRAL_AVAILABLE) {
    try {
      console.log('Attempting to generate accessible colors with Mistral AI');
      const result = await mistralService.suggestAccessibleColors(baseColor, purpose);
      
      // Check if the result has an error
      if (!result.error) {
        console.log('Successfully generated accessible colors with Mistral AI');
        return result;
      }
      
      console.warn('Mistral AI returned an error:', result.error);
      // Fall through to OpenAI if there's an error
    } catch (error) {
      console.error('Error with Mistral AI accessible colors generation:', error.message);
      // Fall through to OpenAI
    }
  }
  
  // Try OpenAI if available
  if (OPENAI_AVAILABLE) {
    try {
      console.log('Attempting to generate accessible colors with OpenAI');
      
      // Format prompt for OpenAI JSON completion
      const prompt = `Suggest accessible color variations for a ${purpose} color with hex value ${baseColor}.`;
      const systemPrompt = `You are an accessibility expert. Generate accessible color variations for the specified color and purpose.
Return a JSON object with these fields:
- baseColor: The original hex color provided
- purpose: The purpose of the color (background, text, etc.)
- variations: An object with "normal" (original color), "highContrast", "lowLight", and "colorBlindFriendly" hex values
- complementaryColors: An object with "text" and "border" hex values that work well with the base color
- wcagRating: WCAG accessibility rating (AA or AAA)
- tips: Array of brief accessibility tips related to this color`;
      
      const result = await openaiService.generateJsonOutput(prompt, { systemPrompt });
      
      // Format the result to match the expected structure
      if (result && result.variations) {
        console.log('Successfully generated accessible colors with OpenAI');
        return {
          ...result,
          source: 'openai',
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn('OpenAI returned an unexpected response format');
      // Fall through to defaults
    } catch (error) {
      console.error('Error with OpenAI accessible colors generation:', error.message);
      // Fall through to defaults
    }
  }
  
  // If no AI services could generate accessible colors, use a simple algorithm
  console.log('All AI services failed or unavailable, using algorithmic accessible colors');
  
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Calculate luminance for accessibility
  const calculateLuminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  // Generate variants
  const rgb = hexToRgb(baseColor);
  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
  
  // High contrast - increase or decrease brightness based on current luminance
  const highContrast = luminance > 0.5
    ? rgbToHex(Math.max(rgb.r - 50, 0), Math.max(rgb.g - 50, 0), Math.max(rgb.b - 50, 0))
    : rgbToHex(Math.min(rgb.r + 50, 255), Math.min(rgb.g + 50, 255), Math.min(rgb.b + 50, 255));
  
  // Low light - reduce saturation
  const lowLight = rgbToHex(
    Math.round((rgb.r + 50) / 2),
    Math.round((rgb.g + 50) / 2),
    Math.round((rgb.b + 50) / 2)
  );
  
  // Color blind friendly - adjust red/green balance
  const colorBlindFriendly = rgbToHex(
    Math.round((rgb.r + rgb.b) / 2),
    Math.round((rgb.g + rgb.b) / 2),
    rgb.b
  );
  
  // Text color - black or white based on luminance
  const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
  
  // Border color - slightly darker/lighter than base
  const borderColor = luminance > 0.5
    ? rgbToHex(Math.max(rgb.r - 30, 0), Math.max(rgb.g - 30, 0), Math.max(rgb.b - 30, 0))
    : rgbToHex(Math.min(rgb.r + 30, 255), Math.min(rgb.g + 30, 255), Math.min(rgb.b + 30, 255));
  
  return {
    baseColor: baseColor,
    purpose: purpose,
    variations: {
      normal: baseColor,
      highContrast: highContrast,
      lowLight: lowLight,
      colorBlindFriendly: colorBlindFriendly
    },
    complementaryColors: {
      text: textColor,
      border: borderColor
    },
    wcagRating: luminance > 0.2 ? 'AA' : 'AAA',
    tips: [
      `Ensure a contrast ratio of at least 4.5:1 for normal text`,
      `Use larger text for better readability with this color`,
      `Test your design with color blindness simulators`
    ],
    source: 'algorithm',
    timestamp: new Date().toISOString()
  };
}

/**
 * Get available services
 * @returns {Object} - Status of available AI services
 */
function getServiceStatus() {
  return {
    mistral: MISTRAL_AVAILABLE,
    openai: OPENAI_AVAILABLE,
    usingFallbacks: !(MISTRAL_AVAILABLE || OPENAI_AVAILABLE)
  };
}

/**
 * Get all default palettes
 * @returns {Object} - Default color palettes
 */
function getDefaultPalettes() {
  return DEFAULT_PALETTES;
}

/**
 * Get all default design schemes
 * @returns {Object} - Default design schemes
 */
function getDefaultDesignSchemes() {
  return DEFAULT_DESIGN_SCHEMES;
}

// Export the API
module.exports = {
  generatePalette,
  generateDesignScheme,
  suggestAccessibleColors,
  getServiceStatus,
  getDefaultPalettes,
  getDefaultDesignSchemes
};