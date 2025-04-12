/**
 * AI-Driven Color Scheme Generator
 * 
 * This service uses Mistral AI to generate mood-based color palettes
 * based on natural language descriptions.
 */

const https = require('https');

// API Configuration
let MISTRAL_API_KEY;
try {
  // Try to load from environment or config
  MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || require('../../config/environment.js').apiKeys.mistral;
} catch (error) {
  MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
  console.warn('Could not load environment config, using environment variable directly');
}

// API Endpoints
const MISTRAL_CHAT_ENDPOINT = 'api.mistral.ai';
const MISTRAL_CHAT_PATH = '/v1/chat/completions';

/**
 * Make a request to the Mistral AI API
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} - The response from the API
 */
function callMistralAI(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    // Default options
    const requestOptions = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 500,
      model: options.model || 'mistral-tiny'
    };
    
    // Prepare the request data
    const requestData = JSON.stringify({
      model: requestOptions.model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: requestOptions.maxTokens,
      temperature: requestOptions.temperature
    });
    
    // Set up the API request options
    const apiOptions = {
      hostname: MISTRAL_CHAT_ENDPOINT,
      path: MISTRAL_CHAT_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    // Make the API request
    const req = https.request(apiOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (res.statusCode !== 200) {
            console.error('Mistral API error:', response);
            reject(new Error(response.error ? response.error.message : 'API request failed'));
            return;
          }
          
          if (response.choices && response.choices.length > 0) {
            resolve({
              text: response.choices[0].message.content,
              usage: response.usage,
              model: response.model
            });
          } else {
            reject(new Error('No response choices returned from API'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(requestData);
    req.end();
  });
}

/**
 * Extract JSON from AI response text that might contain markdown
 * @param {string} text - The AI response text
 * @returns {Object} - The parsed JSON object
 */
function extractJsonFromText(text) {
  // If the response contains a code block, extract just the JSON
  let jsonText = text;
  
  if (jsonText.includes('```json')) {
    jsonText = jsonText.split('```json')[1].split('```')[0].trim();
  } else if (jsonText.includes('```')) {
    jsonText = jsonText.split('```')[1].split('```')[0].trim();
  }
  
  return JSON.parse(jsonText);
}

/**
 * Generate a color palette based on a mood or description
 * @param {string} description - The mood or description (e.g., "calming", "energetic", "professional")
 * @param {number} colors - Number of colors to generate (default: 5)
 * @returns {Promise<Object>} - The generated color palette
 */
async function generatePalette(description, colors = 5) {
  // Check if API key is available
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'MISTRAL_API_KEY_NOT_SET') {
    return {
      error: 'Missing API key',
      message: 'Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment.'
    };
  }
  
  // Create a detailed prompt for the AI
  const prompt = `Generate a color palette with ${colors} colors that evokes a ${description} mood or feeling. 
Return only a JSON object with the following structure:
{
  "theme": "${description}",
  "description": "A brief description of the palette and how it relates to the theme",
  "colors": [
    {
      "hex": "#RRGGBB",
      "name": "Name of the color",
      "role": "primary|secondary|accent|background|text"
    }
    // More colors...
  ]
}

Do not include any explanations or other text outside of the JSON object.
Ensure each color has a unique and descriptive name.
Make sure the colors work well together and are appropriate for the mood.`;

  try {
    // Call the Mistral AI service
    const result = await callMistralAI(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    // Parse the JSON response from the AI
    try {
      const palette = extractJsonFromText(result.text);
      
      // Add timestamp and source information
      palette.timestamp = new Date().toISOString();
      palette.source = 'mistral-ai';
      
      return palette;
    } catch (parseError) {
      console.error('Error parsing color palette JSON:', parseError.message);
      console.error('Raw AI response:', result.text);
      
      return {
        error: 'Failed to parse color palette',
        message: 'The AI generated an invalid response format.',
        rawResponse: result.text
      };
    }
  } catch (error) {
    console.error('Error generating color palette:', error.message);
    
    return {
      error: 'Color palette generation failed',
      message: error.message
    };
  }
}

/**
 * Generate color schemes for common design scenarios
 * @param {string} type - The type of design (e.g., "website", "mobile app", "presentation")
 * @returns {Promise<Object>} - The generated design color scheme
 */
async function generateDesignScheme(type) {
  // Check if API key is available
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'MISTRAL_API_KEY_NOT_SET') {
    return {
      error: 'Missing API key',
      message: 'Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment.'
    };
  }
  
  // Create a detailed prompt for the AI
  const prompt = `Generate a comprehensive color scheme for a ${type} design.
Return only a JSON object with the following structure:
{
  "designType": "${type}",
  "description": "A brief description of the overall scheme",
  "scheme": {
    "primary": "#RRGGBB",
    "secondary": "#RRGGBB",
    "accent": "#RRGGBB",
    "background": "#RRGGBB",
    "text": "#RRGGBB",
    "success": "#RRGGBB",
    "warning": "#RRGGBB",
    "error": "#RRGGBB"
  },
  "recommendations": [
    "Brief design recommendation based on this color scheme"
  ]
}

Do not include any explanations or other text outside of the JSON object.
Ensure the colors are accessible and follow design best practices.`;

  try {
    // Call the Mistral AI service
    const result = await callMistralAI(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    // Parse the JSON response from the AI
    try {
      const scheme = extractJsonFromText(result.text);
      
      // Add timestamp and source information
      scheme.timestamp = new Date().toISOString();
      scheme.source = 'mistral-ai';
      
      return scheme;
    } catch (parseError) {
      console.error('Error parsing design scheme JSON:', parseError.message);
      console.error('Raw AI response:', result.text);
      
      return {
        error: 'Failed to parse design scheme',
        message: 'The AI generated an invalid response format.',
        rawResponse: result.text
      };
    }
  } catch (error) {
    console.error('Error generating design scheme:', error.message);
    
    return {
      error: 'Design scheme generation failed',
      message: error.message
    };
  }
}

/**
 * Suggest color adjustments for accessibility
 * @param {string} baseColor - The base color in hex format (#RRGGBB)
 * @param {string} purpose - The purpose of the color (e.g., "background", "text")
 * @returns {Promise<Object>} - Suggested color adjustments for accessibility
 */
async function suggestAccessibleColors(baseColor, purpose) {
  // Check if API key is available
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'MISTRAL_API_KEY_NOT_SET') {
    return {
      error: 'Missing API key',
      message: 'Mistral API key is not configured. Please add MISTRAL_API_KEY to your environment.'
    };
  }
  
  // Create a detailed prompt for the AI
  const prompt = `Suggest accessible color variations for a ${purpose} color with hex value ${baseColor}.
Return only a JSON object with the following structure:
{
  "baseColor": "${baseColor}",
  "purpose": "${purpose}",
  "variations": {
    "normal": "${baseColor}",
    "highContrast": "#RRGGBB",
    "lowLight": "#RRGGBB",
    "colorBlindFriendly": "#RRGGBB"
  },
  "complementaryColors": {
    "text": "#RRGGBB",
    "border": "#RRGGBB"
  },
  "wcagRating": "AA or AAA",
  "tips": [
    "Brief accessibility tip related to this color"
  ]
}

Do not include any explanations or other text outside of the JSON object.
Ensure the colors meet WCAG accessibility guidelines.`;

  try {
    // Call the Mistral AI service
    const result = await callMistralAI(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    // Parse the JSON response from the AI
    try {
      const accessibleColors = extractJsonFromText(result.text);
      
      // Add timestamp and source information
      accessibleColors.timestamp = new Date().toISOString();
      accessibleColors.source = 'mistral-ai';
      
      return accessibleColors;
    } catch (parseError) {
      console.error('Error parsing accessible colors JSON:', parseError.message);
      console.error('Raw AI response:', result.text);
      
      return {
        error: 'Failed to parse accessible colors',
        message: 'The AI generated an invalid response format.',
        rawResponse: result.text
      };
    }
  } catch (error) {
    console.error('Error generating accessible colors:', error.message);
    
    return {
      error: 'Accessible colors generation failed',
      message: error.message
    };
  }
}

/**
 * Test the connection to the Mistral AI API
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
async function testConnection() {
  if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'MISTRAL_API_KEY_NOT_SET') {
    console.error('Cannot test connection: Mistral API key is not configured');
    return false;
  }
  
  try {
    await callMistralAI('Hello, are you working? Please respond briefly.', {
      maxTokens: 10
    });
    return true;
  } catch (error) {
    console.error('Mistral API connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  generatePalette,
  generateDesignScheme,
  suggestAccessibleColors,
  testConnection
};