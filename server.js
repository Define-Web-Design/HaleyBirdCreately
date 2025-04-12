/**
 * Creately - Color Palette Generator
 * Simple server implementation for the Creately application.
 * This server provides endpoints for color palette generation and image analysis.
 */

// Import built-in Node.js modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');
const https = require('https');

// Environment variables
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const CODESTRAL_API_KEY = process.env.CODESTRAL_API_KEY || '';

// Load color generator service if available
let colorGenerator;
try {
  colorGenerator = require('./server/services/color-generator');
  console.log('Color generator service loaded successfully');
} catch (error) {
  console.warn('Color generator service not available:', error.message);
  colorGenerator = null;
}

// MIME types for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Color palettes for common moods when OpenAI API is not available
const DEFAULT_PALETTES = {
  'happy': ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'],
  'calm': ['#A8DADC', '#E0FBFC', '#457B9D', '#1D3557', '#F1FAEE'],
  'energetic': ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'],
  'professional': ['#0A192F', '#112240', '#233554', '#8892B0', '#CCD6F6'],
  'romantic': ['#FF8CC6', '#F7B2BD', '#FFDBE5', '#D291BC', '#957DAD'],
  'mysterious': ['#2D3142', '#4F5D75', '#BFC0C0', '#FFFFFF', '#EF8354'],
  'playful': ['#FF9F1C', '#FFBF69', '#CBF3F0', '#2EC4B6', '#FDFFFC'],
  'elegant': ['#331832', '#694E52', '#886F68', '#9A8F97', '#DCE3F4'],
  'bold': ['#D7263D', '#F46036', '#2E294E', '#1B998B', '#C5D86D'],
  'serene': ['#5F7481', '#A2B6B4', '#DBD3C9', '#FAF9F9', '#E1BB80']
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  setCorsHeaders(res);

  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API Endpoints
  if (pathname === '/api/generate-palette' && req.method === 'POST') {
    handleGeneratePalette(req, res);
    return;
  }

  if (pathname === '/api/analyze-image' && req.method === 'POST') {
    handleAnalyzeImage(req, res);
    return;
  }

  if (pathname === '/api/status' && req.method === 'GET') {
    const status = {
      server: 'online',
      openai_api: OPENAI_API_KEY ? 'connected' : 'not_connected',
      mistral_api: MISTRAL_API_KEY ? 'connected' : 'not_connected',
      codestral_api: CODESTRAL_API_KEY ? 'connected' : 'not_connected',
      version: '1.0.0'
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
    return;
  }
  
  // Enhanced AI-powered color routes with built-in fallbacks
  // These routes handle color palette generation, design schemes, and accessible colors
  // with automatic fallback between Mistral AI and OpenAI
  
  // Color palette generation endpoint
  if (pathname === '/api/colors/generate-palette' && req.method === 'POST') {
    try {
      // Parse the request body
      const data = await parseRequestBody(req);
      const description = data.description || '';
      const colors = data.colors || 5;
      
      if (!description) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Description is required for palette generation'
        }));
        return;
      }
      
      // Check for AI service availability
      let result;
      let serviceUsed = 'none';
      
      // Try to use Mistral AI first (preferred)
      if (colorGenerator && MISTRAL_API_KEY) {
        try {
          console.log(`Generating palette with Mistral AI: "${description}"`);
          result = await colorGenerator.generatePalette(description, colors);
          serviceUsed = 'mistral';
        } catch (mistralError) {
          console.error('Error using Mistral AI for palette generation:', mistralError);
          // Fall through to OpenAI or default
        }
      }
      
      // Try OpenAI as fallback if Mistral failed or is unavailable
      if (!result && OPENAI_API_KEY) {
        try {
          console.log(`Falling back to OpenAI for palette generation: "${description}"`);
          
          // Create a prompt for OpenAI
          const prompt = `Generate a color palette of 5 hex codes for the mood: ${description}.`;
          const systemPrompt = `You are a professional color designer. Generate a harmonious color palette of exactly 5 colors as hex codes for the given mood. Respond with a JSON object containing two properties: 'palette' as an array of 5 hex color codes, and 'explanation' as a short description of the palette.`;
          
          const openaiResponse = await callOpenAI(OPENAI_API_KEY, prompt, systemPrompt);
          result = {
            theme: description,
            description: openaiResponse.explanation || `A palette for "${description}"`,
            colors: openaiResponse.palette.map((hex, i) => ({
              hex: hex,
              name: `Color ${i+1}`,
              role: i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'accent' : i === 3 ? 'background' : 'text'
            })),
            source: 'openai',
            timestamp: new Date().toISOString()
          };
          serviceUsed = 'openai';
        } catch (openaiError) {
          console.error('Error using OpenAI for palette generation:', openaiError);
          // Fall through to default palettes
        }
      }
      
      // Use default palette as last resort
      if (!result) {
        console.log(`Using default palette for: "${description}"`);
        // Find a matching default palette or use 'happy' as fallback
        const lowerDesc = description.toLowerCase();
        let matchedMood = 'happy';
        
        for (const mood of Object.keys(DEFAULT_PALETTES)) {
          if (lowerDesc.includes(mood)) {
            matchedMood = mood;
            break;
          }
        }
        
        const defaultPalette = DEFAULT_PALETTES[matchedMood];
        result = {
          theme: description,
          description: `A default ${matchedMood} palette as no AI services were available for custom generation.`,
          palette: defaultPalette,
          source: 'default',
          timestamp: new Date().toISOString()
        };
        serviceUsed = 'default';
      }
      
      // Return the result
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        service_used: serviceUsed,
        ...result
      }));
    } catch (error) {
      console.error('Error in palette generation endpoint:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Server error during palette generation',
        error: error.message
      }));
    }
    return;
  }
  
  // Design scheme generation endpoint
  if (pathname === '/api/colors/design-scheme' && req.method === 'POST') {
    try {
      // Parse the request body
      const data = await parseRequestBody(req);
      const designType = data.designType || '';
      
      if (!designType) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Design type is required for scheme generation'
        }));
        return;
      }
      
      // Check for AI service availability
      let result;
      let serviceUsed = 'none';
      
      // Try to use our specialized service if available
      if (colorGenerator) {
        try {
          console.log(`Generating design scheme with AI color generator: "${designType}"`);
          result = await colorGenerator.generateDesignScheme(designType);
          serviceUsed = result.source || 'service';
        } catch (serviceError) {
          console.error('Error using AI service for design scheme generation:', serviceError);
          // Fall through to OpenAI or default
        }
      }
      
      // Use default scheme as last resort
      if (!result) {
        console.log(`Using default design scheme for: "${designType}"`);
        // Find a matching default scheme or use 'website' as fallback
        const lowerType = designType.toLowerCase();
        let matchedType = 'website';
        
        if (lowerType.includes('mobile') || lowerType.includes('app')) {
          matchedType = 'mobile app';
        } else if (lowerType.includes('presentation') || lowerType.includes('slide')) {
          matchedType = 'presentation';
        }
        
        // Simple default schemes
        const defaultSchemes = {
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
        
        const defaultScheme = defaultSchemes[matchedType];
        result = {
          designType: designType,
          description: defaultScheme.description,
          scheme: defaultScheme.scheme,
          recommendations: [
            "Maintain good contrast between text and background colors",
            "Use the primary color for main interface elements",
            "Reserve accent colors for calls to action"
          ],
          source: 'default',
          timestamp: new Date().toISOString()
        };
        serviceUsed = 'default';
      }
      
      // Return the result
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        service_used: serviceUsed,
        ...result
      }));
    } catch (error) {
      console.error('Error in design scheme generation endpoint:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Server error during design scheme generation',
        error: error.message
      }));
    }
    return;
  }
  
  // Accessible colors generation endpoint
  if (pathname === '/api/colors/accessible-colors' && req.method === 'POST') {
    try {
      // Parse the request body
      const data = await parseRequestBody(req);
      const baseColor = data.baseColor || '';
      const purpose = data.purpose || '';
      
      if (!baseColor) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Base color is required for accessible color generation'
        }));
        return;
      }
      
      if (!purpose) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Purpose is required for accessible color generation'
        }));
        return;
      }
      
      // Check color format
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(baseColor)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Base color must be a valid hex color in format #RRGGBB'
        }));
        return;
      }
      
      // Check for AI service availability
      let result;
      let serviceUsed = 'none';
      
      // Try to use our specialized service if available
      if (colorGenerator) {
        try {
          console.log(`Generating accessible colors with AI color generator for ${baseColor} as ${purpose}`);
          result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
          serviceUsed = result.source || 'service';
        } catch (serviceError) {
          console.error('Error using AI service for accessible colors generation:', serviceError);
          // Fall through to algorithmic approach
        }
      }
      
      // Use algorithmic approach as last resort
      if (!result) {
        console.log(`Using algorithmic accessible colors for ${baseColor} as ${purpose}`);
        
        // Convert hex to RGB
        const hexToRgb = (hex) => {
          const r = parseInt(hex.substring(1, 3), 16);
          const g = parseInt(hex.substring(3, 5), 16);
          const b = parseInt(hex.substring(5, 7), 16);
          return { r, g, b };
        };
        
        // Convert RGB to hex
        const rgbToHex = (r, g, b) => {
          return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
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
        
        result = {
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
        serviceUsed = 'algorithm';
      }
      
      // Return the result
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        service_used: serviceUsed,
        ...result
      }));
    } catch (error) {
      console.error('Error in accessible colors generation endpoint:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Server error during accessible colors generation',
        error: error.message
      }));
    }
    return;
  }
  
  // Get default color palettes
  if (pathname === '/api/colors/default-palettes' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      message: 'Default palettes for when AI services are unavailable',
      palettes: DEFAULT_PALETTES
    }));
    return;
  }

  // Serve the static HTML file
  if (pathname === '/' || pathname === '') {
    serveStaticFile(res, './static_version.html');
    return;
  }

  // Serve other static files
  serveStaticFile(res, `.${pathname}`);
});

/**
 * Set CORS headers for cross-origin requests
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Serve a static file with appropriate content type
 */
function serveStaticFile(res, filePath) {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    // Successful response
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

/**
 * Parse JSON from request body
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Handle palette generation requests
 */
async function handleGeneratePalette(req, res) {
  try {
    const data = await parseRequestBody(req);
    const mood = data.mood || 'happy';
    const description = data.description || '';

    // If OpenAI API key is not available, return default palette
    if (!OPENAI_API_KEY) {
      const defaultPalette = DEFAULT_PALETTES[mood] || DEFAULT_PALETTES.happy;
      const response = {
        status: 'success',
        message: 'Generated using default palette (OpenAI API not configured)',
        palette: defaultPalette,
        explanation: `A pre-defined palette for the mood "${mood}". To get AI-generated palettes, add your OpenAI API key.`
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      return;
    }

    // Use OpenAI to generate a palette
    const prompt = `Generate a color palette of 5 hex codes for the mood: ${mood}. ${description ? 'Additional description: ' + description : ''}`;
    const systemPrompt = `You are a professional color designer. Generate a harmonious color palette of exactly 5 colors as hex codes for the given mood. Respond with a JSON object containing two properties: 'palette' as an array of 5 hex color codes, and 'explanation' as a short description of the palette.`;

    const openaiResponse = await callOpenAI(OPENAI_API_KEY, prompt, systemPrompt);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      ...openaiResponse
    }));
  } catch (error) {
    console.error('Error generating palette:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Failed to generate palette',
      error: error.message
    }));
  }
}

/**
 * Handle image analysis requests
 */
async function handleAnalyzeImage(req, res) {
  try {
    const data = await parseRequestBody(req);
    const imageUrl = data.imageUrl;
    
    if (!imageUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Image URL is required'
      }));
      return;
    }

    // If OpenAI API key is not available, return error
    if (!OPENAI_API_KEY) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'OpenAI API key is required for image analysis',
        error: 'API key not configured'
      }));
      return;
    }

    // Use OpenAI Vision API to analyze the image
    const prompt = "Extract a color palette from this image. Identify the 5 most prominent or harmonious colors and provide their hex codes.";
    const systemPrompt = "You are a color palette extraction expert. Analyze the image and extract exactly 5 colors that form a harmonious palette. Return a JSON with 'palette' (array of 5 hex codes) and 'explanation' (brief description of the palette).";
    
    const openaiResponse = await callOpenAI(OPENAI_API_KEY, prompt, systemPrompt, imageUrl);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      ...openaiResponse
    }));
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Failed to analyze image',
      error: error.message
    }));
  }
}

/**
 * Call OpenAI API for palette generation or image analysis
 */
async function callOpenAI(apiKey, prompt, systemPrompt, imageUrl = null) {
  return new Promise((resolve, reject) => {
    // Create message array based on whether we're using vision or not
    let messages = [
      { role: 'system', content: systemPrompt },
    ];
    
    if (imageUrl) {
      // For image analysis, add image URL to the content
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else {
      // For text-based generation
      messages.push({ role: 'user', content: prompt });
    }
    
    // Determine which model to use based on whether we have an image
    const model = imageUrl ? 'gpt-4-vision-preview' : 'gpt-3.5-turbo';
    
    // Prepare the request data
    const data = JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Set up the request options
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedResponse = JSON.parse(responseData);
          
          if (res.statusCode !== 200) {
            console.error('OpenAI API error:', parsedResponse);
            reject(new Error(parsedResponse.error ? parsedResponse.error.message : 'Unknown API error'));
            return;
          }
          
          // Extract the content from the response
          if (parsedResponse.choices && parsedResponse.choices.length > 0) {
            const content = parsedResponse.choices[0].message.content;
            
            try {
              // Parse the JSON from the content
              const result = JSON.parse(content);
              resolve(result);
            } catch (error) {
              // If we can't parse JSON, try to extract palette from the text
              console.warn('Failed to parse JSON response, attempting to extract palette from text');
              console.log('Content received:', content);
              
              // Fallback extraction using regex to find hex codes
              const hexCodes = content.match(/#[0-9A-Fa-f]{6}/g) || [];
              const palette = hexCodes.slice(0, 5);
              
              while (palette.length < 5) {
                // Add default colors if we don't have enough
                palette.push(DEFAULT_PALETTES.professional[palette.length]);
              }
              
              resolve({
                palette: palette,
                explanation: "Palette extracted from OpenAI response (non-JSON format)."
              });
            }
          } else {
            reject(new Error('No response choices returned from OpenAI'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Handle Mistral AI-powered palette generation
 */
async function handleMistralPaletteGeneration(req, res) {
  try {
    const data = await parseRequestBody(req);
    const description = data.description;
    const colors = data.colors || 5;
    
    if (!description) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Description is required for palette generation'
      }));
      return;
    }
    
    // Use Mistral AI to generate a color palette
    const result = await colorGenerator.generatePalette(description, colors);
    
    if (result.error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: result.message || 'Failed to generate palette',
        error: result.error
      }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      ...result
    }));
  } catch (error) {
    console.error('Error in Mistral palette generation:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Failed to generate palette',
      error: error.message
    }));
  }
}

/**
 * Handle Mistral AI-powered design scheme generation
 */
async function handleDesignSchemeGeneration(req, res) {
  try {
    const data = await parseRequestBody(req);
    const designType = data.designType;
    
    if (!designType) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Design type is required for scheme generation'
      }));
      return;
    }
    
    // Use Mistral AI to generate a design scheme
    const result = await colorGenerator.generateDesignScheme(designType);
    
    if (result.error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: result.message || 'Failed to generate design scheme',
        error: result.error
      }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      ...result
    }));
  } catch (error) {
    console.error('Error in design scheme generation:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Failed to generate design scheme',
      error: error.message
    }));
  }
}

/**
 * Handle Mistral AI-powered accessible color generation
 */
async function handleAccessibleColorsGeneration(req, res) {
  try {
    const data = await parseRequestBody(req);
    const baseColor = data.baseColor;
    const purpose = data.purpose;
    
    if (!baseColor) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Base color is required for accessible color generation'
      }));
      return;
    }
    
    if (!purpose) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Purpose is required for accessible color generation'
      }));
      return;
    }
    
    // Use Mistral AI to generate accessible colors
    const result = await colorGenerator.suggestAccessibleColors(baseColor, purpose);
    
    if (result.error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: result.message || 'Failed to generate accessible colors',
        error: result.error
      }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      ...result
    }));
  } catch (error) {
    console.error('Error in accessible colors generation:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Failed to generate accessible colors',
      error: error.message
    }));
  }
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`OpenAI API: ${OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`Mistral AI: ${MISTRAL_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`Codestral: ${CODESTRAL_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`Environment: NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`Server start time: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});

// Generate a random ID for server instance
const serverId = crypto.randomBytes(4).toString('hex');
console.log(`Server instance ID: ${serverId}`);