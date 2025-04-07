const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;

// Default colors to use when OpenAI API is not available
const DEFAULT_COLORS = ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"];

// Load environment variables from .env file
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, value] = trimmedLine.split('=', 2);
      process.env[key] = value;
    }
  });
  console.log("Environment variables loaded from .env file");
} catch (error) {
  console.log(`Error loading .env file: ${error.message}`);
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Handle POST requests
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      let requestData = {};
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      
      if (pathname === '/api/palette/generate') {
        await handleGeneratePalette(req, res, requestData);
      } else if (pathname === '/api/palette/analyze') {
        await handleAnalyzeImage(req, res, requestData);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Not Found',
          message: `The POST endpoint ${pathname} is not supported`,
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    return;
  }
  
  // Handle GET requests
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/api') {
      // Serve the HTML front-end
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(generateHtml());
    } else if (pathname === '/api/status') {
      // Return API status
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: process.env.DATABASE_URL ? 'connected' : 'not configured',
        apiKeys: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
        }
      }));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Not Found',
        message: `The requested path ${pathname} was not found`,
        timestamp: new Date().toISOString()
      }));
    }
  }
});

async function handleGeneratePalette(req, res, data) {
  // Extract parameters
  const mood = data.mood || 'happy';
  const description = data.description || '';
  const count = data.count || 5;
  
  // Get OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      colors: DEFAULT_COLORS,
      explanation: 'A default color palette (OpenAI API key not provided)',
      generated: false
    }));
    return;
  }
  
  try {
    // Format the request for OpenAI
    const moodDesc = description ? `${mood} mood and this description: '${description}'` : `${mood} mood`;
    const prompt = `Generate a cohesive color palette of ${count} colors that represents a ${moodDesc}. The colors should work well together and convey the right emotional tone.`;
    
    const systemPrompt = `You are a professional color theory expert and designer who creates perfect color palettes based on moods and emotions. 
    Return a JSON object with these keys: 
    "colors" (array of exactly ${count} hex color codes like "#RRGGBB"), and 
    "explanation" (a brief description of the palette and how it relates to the requested mood).
    Ensure all colors work well together, have good contrast ratios when appropriate, and truly capture the essence of the requested mood.`;
    
    // Call OpenAI API
    const response = await callOpenAI(apiKey, prompt, systemPrompt);
    
    // Process the OpenAI response
    if (response && response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      const palette = JSON.parse(content);
      
      // Ensure we have the right number of colors
      if (palette.colors && palette.colors.length !== count) {
        palette.colors = palette.colors.slice(0, count);
        
        // If we still don't have enough, add some default colors
        while (palette.colors.length < count) {
          palette.colors.push(DEFAULT_COLORS[palette.colors.length % DEFAULT_COLORS.length]);
        }
      }
      
      // Add generated flag
      palette.generated = true;
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(palette));
    } else {
      // Return default if there's an issue with the OpenAI response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        colors: DEFAULT_COLORS,
        explanation: `A default palette for '${mood}' mood (OpenAI API provided an invalid response)`,
        generated: false
      }));
    }
  } catch (error) {
    console.error(`Error generating palette: ${error.message}`);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: `Failed to generate color palette: ${error.message}`,
      colors: DEFAULT_COLORS,
      explanation: `A default palette (error occurred during generation)`,
      generated: false
    }));
  }
}

async function handleAnalyzeImage(req, res, data) {
  // Extract parameters
  const imageBase64 = data.image || '';
  const prompt = data.prompt || 'What colors are prominent in this image?';
  
  // Get OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || !imageBase64) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Missing API key or image data',
      analysis: 'Unable to analyze image'
    }));
    return;
  }
  
  try {
    // Prepare the request for OpenAI vision API
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };
    
    // Call OpenAI API
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };
    
    const response = await httpRequest(options, JSON.stringify(requestBody));
    const responseData = JSON.parse(response);
    
    // Process the OpenAI response
    if (responseData.choices && responseData.choices.length > 0) {
      const analysis = responseData.choices[0].message.content;
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        analysis: analysis,
        success: true
      }));
    } else {
      // Return error if there's an issue with the OpenAI response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Failed to analyze image',
        analysis: 'OpenAI API provided an invalid response',
        success: false
      }));
    }
  } catch (error) {
    console.error(`Error analyzing image: ${error.message}`);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: `Failed to analyze image: ${error.message}`,
      analysis: 'An error occurred during analysis',
      success: false
    }));
  }
}

// Helper function for HTTP requests
function httpRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve(responseData);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Helper function for OpenAI API calls
async function callOpenAI(apiKey, prompt, systemPrompt) {
  const requestBody = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  };
  
  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  };
  
  const response = await httpRequest(options, JSON.stringify(requestBody));
  return JSON.parse(response);
}

// Generate HTML for frontend
function generateHtml() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Creately - Color Palette Generator</title>
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
          }
          h1 {
              color: #2563EB;
              margin-bottom: 10px;
          }
          h2 {
              color: #4B5563;
              margin-top: 30px;
          }
          .status {
              background-color: #F3F4F6;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 30px;
          }
          .palette-form {
              background-color: #F9FAFB;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 30px;
          }
          label {
              display: block;
              margin-bottom: 5px;
              font-weight: 500;
          }
          input, select, textarea {
              width: 100%;
              padding: 8px;
              margin-bottom: 15px;
              border: 1px solid #D1D5DB;
              border-radius: 4px;
          }
          button {
              background-color: #2563EB;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 4px;
              cursor: pointer;
          }
          button:hover {
              background-color: #1D4ED8;
          }
          .palette-display {
              display: flex;
              margin-top: 20px;
              height: 100px;
          }
          .color-box {
              flex: 1;
              margin-right: 2px;
          }
          .explanation {
              margin-top: 15px;
              padding: 10px;
              background-color: #F3F4F6;
              border-radius: 4px;
          }
          .color-code {
              text-align: center;
              margin-top: 5px;
              font-family: monospace;
          }
      </style>
  </head>
  <body>
      <h1>Creately - Color Palette Generator</h1>
      <p>An AI-powered creative platform that revolutionizes color palette generation through emotion-driven design solutions.</p>
      
      <div class="status">
          <h3>API Status</h3>
          <p>Database: <span id="db-status">Checking...</span></p>
          <p>OpenAI API: <span id="openai-status">Checking...</span></p>
      </div>
      
      <div class="palette-form">
          <h2>Generate Mood-Based Color Palette</h2>
          <form id="palette-form">
              <label for="mood">Mood:</label>
              <select id="mood" name="mood" required>
                  <option value="happy">Happy</option>
                  <option value="calm">Calm</option>
                  <option value="energetic">Energetic</option>
                  <option value="professional">Professional</option>
                  <option value="romantic">Romantic</option>
                  <option value="mysterious">Mysterious</option>
                  <option value="playful">Playful</option>
                  <option value="elegant">Elegant</option>
                  <option value="bold">Bold</option>
                  <option value="serene">Serene</option>
              </select>
              
              <label for="description">Additional Description (optional):</label>
              <textarea id="description" name="description" rows="3" placeholder="Describe the feeling or context for more precise results..."></textarea>
              
              <button type="submit">Generate Palette</button>
          </form>
          
          <div id="results" style="display: none;">
              <h3>Your Palette</h3>
              <div class="palette-display" id="palette-display"></div>
              <div class="color-codes" id="color-codes"></div>
              <div class="explanation" id="explanation"></div>
          </div>
      </div>
      
      <script>
          // Check API status on page load
          fetch('/api/status')
              .then(response => response.json())
              .then(data => {
                  document.getElementById('db-status').textContent = data.database;
                  document.getElementById('openai-status').textContent = data.apiKeys.openai;
              })
              .catch(error => {
                  document.getElementById('db-status').textContent = 'Error checking status';
                  document.getElementById('openai-status').textContent = 'Error checking status';
              });
          
          // Handle form submission
          document.getElementById('palette-form').addEventListener('submit', function(e) {
              e.preventDefault();
              
              const mood = document.getElementById('mood').value;
              const description = document.getElementById('description').value;
              
              // Show loading state
              const submitButton = this.querySelector('button[type="submit"]');
              const originalButtonText = submitButton.textContent;
              submitButton.textContent = 'Generating...';
              submitButton.disabled = true;
              
              // Make API request
              fetch('/api/palette/generate', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      mood: mood,
                      description: description,
                      count: 5
                  })
              })
              .then(response => response.json())
              .then(data => {
                  // Reset button
                  submitButton.textContent = originalButtonText;
                  submitButton.disabled = false;
                  
                  // Display results
                  const paletteDisplay = document.getElementById('palette-display');
                  const colorCodes = document.getElementById('color-codes');
                  const explanation = document.getElementById('explanation');
                  
                  // Clear previous results
                  paletteDisplay.innerHTML = '';
                  colorCodes.innerHTML = '';
                  
                  // Display new palette
                  data.colors.forEach(color => {
                      const colorBox = document.createElement('div');
                      colorBox.className = 'color-box';
                      colorBox.style.backgroundColor = color;
                      paletteDisplay.appendChild(colorBox);
                      
                      const colorCode = document.createElement('div');
                      colorCode.className = 'color-code';
                      colorCode.textContent = color;
                      colorCodes.appendChild(colorCode);
                  });
                  
                  // Set explanation
                  explanation.textContent = data.explanation;
                  
                  // Show results
                  document.getElementById('results').style.display = 'block';
              })
              .catch(error => {
                  console.error('Error:', error);
                  submitButton.textContent = originalButtonText;
                  submitButton.disabled = false;
                  alert('An error occurred while generating the palette. Please try again.');
              });
          });
      </script>
  </body>
  </html>
  `;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

console.log(`
====================================
Creately - Color Palette Generator
====================================
- Database Status: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
- OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured (will use default colors)'}
- PORT: ${PORT}

Server is now running! 🚀
====================================
`);