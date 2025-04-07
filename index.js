// Simple Node.js HTTP server

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.log('dotenv module not available, using process.env directly');
}

// Create logs directory if it doesn't exist
try {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Create PageSpeed logs directory
  const pageSpeedLogsDir = path.join(logsDir, 'pagespeed');
  if (!fs.existsSync(pageSpeedLogsDir)) {
    fs.mkdirSync(pageSpeedLogsDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating log directories:', error);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; // No content
    res.end();
    return;
  }
  
  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Handle routes
  if (req.url === '/' || req.url === '/api') {
    const response = {
      message: 'Hello from Creately API!',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      database: process.env.DATABASE_URL ? 'Available (PostgreSQL)' : 'Not configured',
      apiKeys: {
        openai: process.env.OPENAI_API_KEY ? 'Available' : 'Missing',
        pagespeed: process.env.PAGESPEED_INSIGHTS_API_KEY ? 'Available' : 'Missing'
      }
    };
    
    res.statusCode = 200;
    res.end(JSON.stringify(response, null, 2));
  } 
  // Route to test PageSpeed Insights API
  else if (req.url.startsWith('/pagespeed')) {
    const response = {
      message: 'PageSpeed Insights API route',
      timestamp: new Date().toISOString()
    };
    
    if (!process.env.PAGESPEED_INSIGHTS_API_KEY) {
      response.error = 'PageSpeed Insights API key is not configured';
      res.statusCode = 400;
    } else {
      response.status = 'API key is configured';
      res.statusCode = 200;
    }
    
    res.end(JSON.stringify(response, null, 2));
  }
  // Not found
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ 
      error: 'Not Found',
      message: `The requested path ${req.url} was not found`,
      timestamp: new Date().toISOString()
    }, null, 2));
  }
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});