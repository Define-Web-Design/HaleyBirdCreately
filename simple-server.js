/**
 * Simple Server Implementation
 * 
 * This is a lightweight implementation of the server for development
 * and testing purposes.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Configuration
const PORT = process.env.PORT || 3100;
const publicDir = path.join(__dirname, 'public');

// Create Express app
const app = express();
const server = http.createServer(app);

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable logging
function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

app.use(logRequest);

// Helper function to serve static files
function serveFile(filePath, res) {
  try {
    if (fs.existsSync(filePath)) {
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      
      // Read and serve the file
      const data = fs.readFileSync(filePath);
      res.setHeader('Content-Type', contentType);
      res.end(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error serving file:', error.message);
    res.statusCode = 500;
    res.end('Internal server error');
    return true;
  }
}

// Function to handle API requests
function handleApiRequest(req, res) {
  const apiPath = req.url.substring('/api/'.length);
  
  // Simple API endpoints
  if (apiPath === 'status') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return true;
  }
  
  // Mock AI service endpoints
  if (apiPath.startsWith('ai/')) {
    const aiEndpoint = apiPath.substring('ai/'.length);
    
    if (aiEndpoint === 'status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        available: true,
        providers: ['mock-provider'],
        default: 'mock-provider'
      }));
      return true;
    }
    
    // Handle POST requests to AI endpoints
    if (req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }
        
        // Generate mock responses for different AI endpoints
        let response;
        
        if (aiEndpoint === 'generate-text') {
          response = {
            content: `Mock response for: ${data.prompt || 'No prompt provided'}`,
            provider: 'mock-provider',
            model: 'mock-model',
            usage: {
              promptTokens: 10,
              completionTokens: 20,
              totalTokens: 30
            }
          };
        } else if (aiEndpoint === 'generate-json') {
          response = {
            json: {
              result: "Mock JSON response",
              items: [1, 2, 3],
              success: true
            },
            provider: 'mock-provider',
            model: 'mock-model'
          };
        } else if (aiEndpoint === 'chat') {
          response = {
            message: {
              role: 'assistant',
              content: `Mock chat response to: ${data.messages ? data.messages.map(m => m.content).join(', ') : 'No messages provided'}`
            },
            provider: 'mock-provider',
            model: 'mock-model'
          };
        } else {
          response = {
            error: 'Unknown AI endpoint'
          };
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(response));
      });
      
      return true;
    }
  }
  
  return false;
}

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  
  // Create a basic index.html if it doesn't exist
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simple Server</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 { color: #2c3e50; }
            .status { color: #27ae60; font-weight: bold; }
            .endpoints { margin-top: 20px; }
            code {
              background: #f8f8f8;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <h1>Simple Server Running</h1>
          <p>Status: <span class="status">Online</span></p>
          
          <div class="endpoints">
            <h2>Available Endpoints:</h2>
            <ul>
              <li><code>GET /api/status</code> - Server status</li>
              <li><code>GET /api/ai/status</code> - AI service status</li>
              <li><code>POST /api/ai/generate-text</code> - Generate text</li>
              <li><code>POST /api/ai/generate-json</code> - Generate JSON</li>
              <li><code>POST /api/ai/chat</code> - Chat completion</li>
            </ul>
          </div>
          
          <div id="testArea">
            <h2>Test Area</h2>
            <button id="testStatusBtn">Test Status</button>
            <button id="testTextBtn">Test Text Generation</button>
            <button id="testChatBtn">Test Chat Completion</button>
            <pre id="result" style="background: #f8f8f8; padding: 10px; margin-top: 10px; border-radius: 5px;"></pre>
          </div>
          
          <script>
            // Simple test functions
            async function testStatus() {
              try {
                const response = await fetch('/api/status');
                const data = await response.json();
                document.getElementById('result').textContent = JSON.stringify(data, null, 2);
              } catch (error) {
                document.getElementById('result').textContent = 'Error: ' + error.message;
              }
            }
            
            async function testTextGeneration() {
              try {
                const response = await fetch('/api/ai/generate-text', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    prompt: 'Hello, world!'
                  })
                });
                const data = await response.json();
                document.getElementById('result').textContent = JSON.stringify(data, null, 2);
              } catch (error) {
                document.getElementById('result').textContent = 'Error: ' + error.message;
              }
            }
            
            async function testChatCompletion() {
              try {
                const response = await fetch('/api/ai/chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messages: [
                      { role: 'system', content: 'You are a helpful assistant.' },
                      { role: 'user', content: 'Hello, how are you?' }
                    ]
                  })
                });
                const data = await response.json();
                document.getElementById('result').textContent = JSON.stringify(data, null, 2);
              } catch (error) {
                document.getElementById('result').textContent = 'Error: ' + error.message;
              }
            }
            
            // Add event listeners
            document.getElementById('testStatusBtn').addEventListener('click', testStatus);
            document.getElementById('testTextBtn').addEventListener('click', testTextGeneration);
            document.getElementById('testChatBtn').addEventListener('click', testChatCompletion);
          </script>
        </body>
      </html>
    `;
    fs.writeFileSync(indexPath, htmlContent);
    console.log(`Created ${indexPath}`);
  }
}

// Handle all requests
app.use((req, res) => {
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    if (handleApiRequest(req, res)) {
      return;
    }
    
    // If API endpoint not found
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Handle static file requests
  let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  if (serveFile(filePath, res)) {
    return;
  }
  
  // Try to serve index.html for any other routes (SPA support)
  const indexPath = path.join(publicDir, 'index.html');
  if (serveFile(indexPath, res)) {
    return;
  }
  
  // If all else fails, return 404
  res.statusCode = 404;
  res.end('Not found');
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };