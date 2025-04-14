// Simple entry point - redirects to the main server file
console.log('Starting server from index.js...');

try {
  // Try to load dotenv for environment variables
  require('dotenv').config();
} catch (err) {
  console.log('dotenv not available, using process.env directly');
}

// Create logs directory if it doesn't exist
try {
  const fs = require('fs');
  const path = require('path');
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


// Load the main server file
try {
  require('./simple-server.js');
} catch (error) {
  console.error('Failed to load simple-server.js:', error);

  // Create a very basic HTTP server as last resort
  const http = require('http');
  const port = process.env.PORT || 3000;

  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Emergency Server</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Emergency Server Mode</h1>
          <div class="card">
            <p>The main server failed to start. This is a minimal emergency server.</p>
            <p>Check the console logs for more information.</p>
          </div>
        </body>
      </html>
    `);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Emergency server running at http://0.0.0.0:${port}`);
  });
}