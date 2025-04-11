// Simple HTTP server using Node.js if available, otherwise will fail gracefully
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const WEBROOT = './public';

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
};

console.log(`[${new Date().toISOString()}] Starting static file server on port ${PORT}...`);

// Create HTTP server
const server = http.createServer((req, res) => {
  let url = req.url;
  
  // Default to index.html for root
  if (url === '/') {
    url = '/index.html';
  }
  
  // Remove query parameters
  url = url.split('?')[0];
  
  const filePath = path.join(WEBROOT, url);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found
      console.log(`[${new Date().toISOString()}] 404 ${req.method} ${req.url}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>404 Not Found</h1><p>The requested URL was not found.</p></body></html>');
      return;
    }
    
    // Get content type based on file extension
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.log(`[${new Date().toISOString()}] 500 ${req.method} ${req.url} - ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>500 Internal Server Error</h1><p>Sorry, something went wrong.</p></body></html>');
        return;
      }
      
      console.log(`[${new Date().toISOString()}] 200 ${req.method} ${req.url}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running at http://localhost:${PORT}/`);
  console.log(`[${new Date().toISOString()}] Serving files from ${WEBROOT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] Server error: ${err.message}`);
});
