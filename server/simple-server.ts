import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Simple HTTP server as a fallback
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
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
      status: 'ok', 
      timestamp: new Date().toISOString(),
      mode: 'fallback-server'
    }));
    return;
  }
  
  // Serve static HTML fallback
  try {
    let content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Clean App - Fallback Server</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; background: #f9f9f9; }
            .status { padding: 0.5rem 1rem; border-radius: 4px; display: inline-block; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
            code { background: #f1f1f1; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>Clean App - Fallback Server</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p class="status success">Server is running in fallback mode</p>
            <p>This is a simple fallback server that provides basic API and static file serving capabilities.</p>
          </div>
          <div class="card">
            <h2>API Endpoints</h2>
            <ul>
              <li><code>GET /api/status</code> - Check server status</li>
            </ul>
          </div>
          <div class="card">
            <h2>Troubleshooting</h2>
            <p>If you're seeing this page, it means the main application server encountered an issue during startup.</p>
            <p>Check the console logs for more information about what went wrong.</p>
          </div>
        </body>
      </html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } catch (error) {
    console.error('Error serving content:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fallback server running on http://0.0.0.0:${PORT}`);
});