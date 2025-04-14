
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
  
  if (req.url === '/api/health' || req.url === '/api/status') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: 'simple-server'
    }));
    return;
  }
  
  if (req.url === '/api/info') {
    const response = {
      message: 'Creately API Info',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      database: process.env.DATABASE_URL ? 'Available (PostgreSQL)' : 'Not configured',
      apiKeys: {
        openai: process.env.OPENAI_API_KEY ? 'Available' : 'Missing',
        pagespeed: process.env.PAGESPEED_INSIGHTS_API_KEY ? 'Available' : 'Missing'
      }
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  // Handle other API routes
  res.writeHead(501);
  res.end(JSON.stringify({ error: 'Not implemented' }));
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
   ______                __       __          
  / ____/_______  ____ _/ /____  / /_  __     
 / /   / ___/ _ \\/ __ \`/ __/ _ \\/ / / / /   
/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      
\\____/_/   \\___/\\__,_/\\__/\\___/_/\\__, /       
                                 /____/        
  
  Code Snippet Server - Simple Mode
  Server running at http://0.0.0.0:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
