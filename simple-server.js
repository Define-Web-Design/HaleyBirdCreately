
const http = require('http');
const fs = require('fs');
const path = require('path');

// Port configuration
const PORT = process.env.PORT || 3000;

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

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }
  
  // Serve static files
  let filePath = 'public' + req.url;
  
  // Default to index.html for root requests
  if (filePath === 'public/') {
    filePath = 'public/index.html';
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Fallback to index.html for client-side routing
      if (!path.extname(filePath)) {
        filePath = 'public/index.html';
        serveFile(filePath, res);
      } else {
        res.writeHead(404);
        res.end('404 Not Found');
      }
      return;
    }
    
    serveFile(filePath, res);
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

// Handle API requests
function handleApiRequest(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0' 
    }));
    return;
  }
  
  // Handle other API routes
  res.writeHead(501);
  res.end(JSON.stringify({ error: 'Not implemented' }));
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
