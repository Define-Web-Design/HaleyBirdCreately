const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  // Handle API requests
  if (req.url.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
    
    // Simple health check endpoint
    if (req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    // Default API response
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Serve index.html for root path
  if (req.url === '/' || req.url === '/index.html') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(content);
    } else {
      // Create a default HTML page if index.html doesn't exist
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Creately - Code Snippet Sharing</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              line-height: 1.6;
            }
            h1 { color: #333; }
            .card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 1.5rem;
              margin-bottom: 1rem;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            pre {
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
            }
            button {
              background: #4a7bff;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background: #3a6bef;
            }
          </style>
        </head>
        <body>
          <h1>Creately - Code Snippet Sharing</h1>
          <div class="card">
            <h2>Sample Code Snippet</h2>
            <pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));</code></pre>
            <p>Language: JavaScript</p>
            <button>Copy Code</button>
          </div>
          <p>Server is running. API health check available at <a href="/api/health">/api/health</a></p>
        </body>
        </html>
      `);
    }
    return;
  }
  
  // Handle static files
  try {
    const filePath = path.join(__dirname, 'public', req.url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      
      // Set content type based on file extension
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
      }
      
      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      res.end(content);
      return;
    }
  } catch (err) {
    console.error('Error serving static file:', err);
  }
  
  // Default 404 response
  res.writeHead(404);
  res.end('Not Found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});