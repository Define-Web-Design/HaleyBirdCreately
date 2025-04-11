/**
 * Simple Fallback Server for Creately
 * 
 * This server is used as a fallback when the main server cannot start.
 * It provides essential functionality while minimizing dependencies.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Use environment variables or defaults
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Track server state
let serverState = {
  startTime: new Date(),
  requests: 0,
  errors: 0
};

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

// Simple database check - will use environment variables if available
function checkDatabase() {
  if (process.env.DATABASE_URL) {
    return {
      status: 'available',
      type: 'postgresql',
      url: '[redacted]' // Don't expose the full URL
    };
  }
  
  return {
    status: 'unavailable',
    type: 'in-memory',
    message: 'Using in-memory storage as fallback'
  };
}

// Simple health check endpoint
function getHealthStatus() {
  return {
    status: 'running',
    uptime: `${Math.floor((new Date() - serverState.startTime) / 1000)} seconds`,
    requests: serverState.requests,
    errors: serverState.errors,
    database: checkDatabase(),
    environment: process.env.NODE_ENV || 'development',
    serverType: 'fallback'
  };
}

// Handle API requests
function handleApiRequest(req, res, parsedUrl) {
  const endpoint = parsedUrl.pathname.split('/').pop();
  
  // Set CORS headers for API requests
  setCorsHeaders(res);
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (endpoint === 'health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getHealthStatus()));
    return;
  }
  
  if (endpoint === 'version') {
    // Version information
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      version: '1.0.0',
      serverType: 'fallback',
      mode: process.env.NODE_ENV || 'development'
    }));
    return;
  }
  
  // Default not found response for API endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

// Set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Serve a static file with appropriate content-type
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        serveNotFound(res);
      } else {
        // Server error
        serverState.errors++;
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    // Serve the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

// Serve a 404 Not Found page
function serveNotFound(res) {
  // First check if we have a custom 404 page
  const notFoundPath = path.join(PUBLIC_DIR, '404.html');
  
  fs.access(notFoundPath, fs.constants.F_OK, (err) => {
    if (!err) {
      // We have a custom 404 page
      serveStaticFile(res, notFoundPath, 'text/html');
    } else {
      // Generate a basic 404 page
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - Not Found</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #e74c3c; }
            p { color: #333; line-height: 1.6; }
            a { color: #3498db; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <p><a href="/">Go to Homepage</a></p>
            <p><small>Creately Fallback Server</small></p>
          </div>
        </body>
        </html>
      `);
    }
  });
}

// Create and start the server
const server = http.createServer((req, res) => {
  serverState.requests++;
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  
  // Check if this is an API request
  if (parsedUrl.pathname.startsWith('/api/')) {
    handleApiRequest(req, res, parsedUrl);
    return;
  }
  
  // Handle static file requests
  let filePath = path.join(
    PUBLIC_DIR,
    parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname
  );
  
  // Check if path is a directory, if so serve index.html from that directory
  const extname = path.extname(filePath);
  if (!extname) {
    // Might be a directory or a file without extension
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch (err) {
      // If there's an error, just continue and we'll return 404 if needed
    }
  }
  
  // Determine content type based on file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Serve the file
  serveStaticFile(res, filePath, contentType);
});

// Handle server errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  serverState.errors++;
  
  // Try to restart on a different port if the port is in use
  if (err.code === 'EADDRINUSE') {
    const newPort = parseInt(PORT) + 1;
    console.log(`Port ${PORT} is in use, trying port ${newPort}`);
    
    process.env.PORT = newPort;
    server.listen(newPort, () => {
      console.log(`Fallback server running on port ${newPort}`);
    });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`
  🚨 FALLBACK SERVER RUNNING 🚨
  
  This is the fallback server for Creately, which is a simplified version
  with limited functionality. It's running because the main server could
  not start properly.
  
  Server Information:
  - Port: ${PORT}
  - Mode: ${process.env.NODE_ENV || 'development'}
  - Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'In-Memory'}
  - Started: ${serverState.startTime.toISOString()}
  
  Available API endpoints:
  - GET /api/health - Server health information
  - GET /api/version - Server version information
  
  Visit http://localhost:${PORT} in your browser to view the application.
  Visit http://localhost:${PORT}/api/health to check server status.
  `);
});