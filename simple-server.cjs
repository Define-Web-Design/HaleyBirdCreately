/**
 * Simple fallback server for use when the main application fails to start
 * This file uses CommonJS format to ensure compatibility
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create or ensure the public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Create a basic index.html if it doesn't exist
const indexPath = path.join(PUBLIC_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fallback Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 2rem; margin-bottom: 1rem; }
    .status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; background: #edf2f7; }
    .fallback { color: #805ad5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Application Fallback Server</h1>
    <p>The main application is currently unavailable. This is a fallback server.</p>
  </div>
  
  <div class="card">
    <h2>Status</h2>
    <p><span class="status fallback">Fallback Mode</span></p>
    <p>Server started at: ${new Date().toISOString()}</p>
    <p>Check the application logs for more information on why the main server failed to start.</p>
  </div>

  <div class="card">
    <h2>API Status</h2>
    <p>Basic API functionality is available at <code>/api/status</code></p>
  </div>
</body>
</html>
  `;
  fs.writeFileSync(indexPath, html);
}

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // API status endpoint
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'limited',
      mode: 'fallback-server',
      timestamp: new Date().toISOString(),
      message: 'Main application server is unavailable. Limited functionality is available.'
    }));
    return;
  }
  
  // Serve static files
  let filePath = req.url === '/' 
    ? indexPath 
    : path.join(PUBLIC_DIR, req.url);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚠️ Fallback server running on http://0.0.0.0:${PORT}/`);
  console.log(`🔍 This fallback server is running because the main application server failed to start.`);
  console.log(`📝 Check the application logs for more information on why the main server failed.`);
});