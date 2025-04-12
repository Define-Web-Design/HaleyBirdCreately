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
  
  // New Mistral AI-powered color routes
  if (pathname === '/api/colors/generate-palette' && req.method === 'POST') {
    if (colorGenerator && MISTRAL_API_KEY) {
      handleMistralPaletteGeneration(req, res);
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Mistral AI-powered color generation is not available. Please configure MISTRAL_API_KEY.'
      }));
    }
    return;
  }
  
  if (pathname === '/api/colors/design-scheme' && req.method === 'POST') {
    if (colorGenerator && MISTRAL_API_KEY) {
      handleDesignSchemeGeneration(req, res);
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Mistral AI-powered design scheme generation is not available. Please configure MISTRAL_API_KEY.'
      }));
    }
    return;
  }
  
  if (pathname === '/api/colors/accessible-colors' && req.method === 'POST') {
    if (colorGenerator && MISTRAL_API_KEY) {
      handleAccessibleColorsGeneration(req, res);
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Mistral AI-powered accessible color generation is not available. Please configure MISTRAL_API_KEY.'
      }));
    }
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