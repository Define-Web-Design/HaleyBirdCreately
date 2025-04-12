/**
 * AI-Driven Color Scheme Generator
 * 
 * This service uses Mistral AI to generate mood-based color palettes
 * based on natural language descriptions.
 */

const mistralAI = require('./mistral-ai');

/**
 * Generate a color palette based on a mood or description
 * @param {string} description - The mood or description (e.g., "calming", "energetic", "professional")
 * @param {number} colors - Number of colors to generate (default: 5)
 * @returns {Promise<Object>} - The generated color palette
 */
async function generatePalette(description, colors = 5) {
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
    const result = await mistralAI.generateChatCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    if (result.error) {
      return {
        error: 'Failed to generate color palette',
        message: result.message || 'The AI service encountered an error.',
        originalError: result.error
      };
    }

    // Parse the JSON response from the AI
    try {
      // Extract JSON from the response (the AI might include markdown code blocks)
      let jsonText = result.text;
      
      // If the response contains a code block, extract just the JSON
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const palette = JSON.parse(jsonText);
      
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
    const result = await mistralAI.generateChatCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    if (result.error) {
      return {
        error: 'Failed to generate design scheme',
        message: result.message || 'The AI service encountered an error.',
        originalError: result.error
      };
    }

    // Parse the JSON response from the AI
    try {
      // Extract JSON from the response (the AI might include markdown code blocks)
      let jsonText = result.text;
      
      // If the response contains a code block, extract just the JSON
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const scheme = JSON.parse(jsonText);
      
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
    const result = await mistralAI.generateChatCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    if (result.error) {
      return {
        error: 'Failed to generate accessible colors',
        message: result.message || 'The AI service encountered an error.',
        originalError: result.error
      };
    }

    // Parse the JSON response from the AI
    try {
      // Extract JSON from the response (the AI might include markdown code blocks)
      let jsonText = result.text;
      
      // If the response contains a code block, extract just the JSON
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const accessibleColors = JSON.parse(jsonText);
      
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

module.exports = {
  generatePalette,
  generateDesignScheme,
  suggestAccessibleColors
};