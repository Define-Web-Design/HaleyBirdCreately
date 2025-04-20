
// Fallback server for emergency use
// This runs when the main application fails to build or start

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files if they exist
if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// API route for health checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'fallback',
    message: 'Running in fallback mode due to build failure',
    timestamp: new Date().toISOString()
  });
});

// Fallback route
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Under Maintenance</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          height: 100vh;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
          justify-content: center;
          align-items: center;
          background-color: #f7f9fc;
          color: #333;
        }
        .container {
          max-width: 600px;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          margin-top: 0;
          color: #2563eb;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
        }
        .emoji {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🛠️</div>
        <h1>We'll be back soon!</h1>
        <p>Sorry for the inconvenience. We're performing some maintenance at the moment. We'll be back up and running shortly.</p>
        <p>If you need immediate assistance, please contact support.</p>
        <div class="footer">© ${new Date().getFullYear()} Creately</div>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚠️ FALLBACK SERVER running on http://0.0.0.0:${PORT}`);
  console.log('This is a minimal emergency server running due to build failure');
});

/**
 * Enhanced Fallback Server with Improved Error Handling
 * 
 * This server activates when the main application fails to start, providing:
 * - Static file serving
 * - Basic API endpoints
 * - Informative error page
 * - Detailed diagnostic information
 * - Crash recovery
 */

// Using CommonJS format for maximum compatibility
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Server configuration
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  publicDir: process.env.PUBLIC_DIR || 'public',
  logFile: process.env.LOG_FILE || 'logs/fallback-server.log',
  diagnosticsEnabled: process.env.DIAGNOSTICS_ENABLED !== 'false',
  maxLogSize: 5 * 1024 * 1024, // 5MB
};

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Ensure public directory exists
if (!fs.existsSync(config.publicDir)) {
  fs.mkdirSync(config.publicDir, { recursive: true });
}

// Create basic index.html if it doesn't exist
if (!fs.existsSync(path.join(config.publicDir, 'index.html'))) {
  fs.writeFileSync(
    path.join(config.publicDir, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fallback Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    h1 {
      color: #555;
    }
    h2 {
      color: #777;
    }
    pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #0069d9;
    }
  </style>
</head>
<body>
  <h1>Fallback Server Running</h1>
  
  <div class="warning">
    <strong>Warning:</strong> This fallback server is running because the main application server failed to start.
  </div>
  
  <h2>What happened?</h2>
  <p>
    The main application encountered an error during startup. This could be due to:
  </p>
  <ul>
    <li>Missing dependencies</li>
    <li>Build errors</li>
    <li>Configuration issues</li>
    <li>Port conflicts</li>
  </ul>
  
  <h2>What to do next?</h2>
  <p>
    Check the application logs for more information:
  </p>
  <pre><code>cat logs/workflow-manager.log</code></pre>
  
  <p>
    You can also run the diagnostics tool to identify issues:
  </p>
  <pre><code>./diagnostics.sh</code></pre>
  
  <p>
    <a href="/" class="button">Refresh</a>
    <a href="/api/status" class="button">Server Status</a>
    <a href="/api/diagnostics" class="button">Diagnostics</a>
  </p>
</body>
</html>`
  );
}

// Custom logging functions
const logger = {
  /**
   * Log a message to the console and file
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(formattedMessage);
    
    try {
      // Rotate log if too large
      if (fs.existsSync(config.logFile) && 
          fs.statSync(config.logFile).size > config.maxLogSize) {
        const backupFile = `${config.logFile}.bak`;
        if (fs.existsSync(backupFile)) {
          fs.unlinkSync(backupFile);
        }
        fs.renameSync(config.logFile, backupFile);
      }
      
      fs.appendFileSync(
        config.logFile,
        formattedMessage + '\n'
      );
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  },
  
  /**
   * Log an info message
   * @param {string} message - Log message
   */
  info(message) {
    this.log('INFO', message);
  },
  
  /**
   * Log a warning message
   * @param {string} message - Log message
   */
  warn(message) {
    this.log('WARN', message);
  },
  
  /**
   * Log an error message
   * @param {string} message - Log message
   */
  error(message) {
    this.log('ERROR', message);
  }
};

/**
 * Get MIME type for a file extension
 * @param {string} ext - File extension
 * @returns {string} MIME type
 */
function getMimeType(ext) {
  const mimeTypes = {
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
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Serve a static file
 * @param {string} filePath - Path to the file
 * @param {http.ServerResponse} res - HTTP response object
 */
function serveFile(filePath, res) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = getMimeType(ext);
    
    const fileStream = fs.createReadStream(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      logger.error(`Error streaming file ${filePath}: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    });
  } catch (error) {
    logger.error(`Error serving file ${filePath}: ${error.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
}

/**
 * Get system diagnostics information
 * @returns {Object} Diagnostics data
 */
function getDiagnostics() {
  try {
    // Basic system info
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus().length,
    };
    
    // Node.js info
    const nodeInfo = {
      version: process.version,
      pid: process.pid,
      ppid: process.ppid,
      title: process.title,
      arch: process.arch,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
    };
    
    // Check for package.json
    let packageInfo = null;
    if (fs.existsSync('package.json')) {
      try {
        packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      } catch (e) {
        packageInfo = { error: e.message };
      }
    }
    
    // Check for workflow-manager.log
    let lastErrors = [];
    if (fs.existsSync('logs/workflow-manager.log')) {
      try {
        const logContent = fs.readFileSync('logs/workflow-manager.log', 'utf8');
        lastErrors = logContent
          .split('\n')
          .filter(line => line.includes('ERROR'))
          .slice(-5); // Get last 5 errors
      } catch (e) {
        lastErrors = [`Error reading log file: ${e.message}`];
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      system: systemInfo,
      node: nodeInfo,
      package: packageInfo,
      lastErrors,
    };
  } catch (error) {
    logger.error(`Error getting diagnostics: ${error.message}`);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Handle API requests
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {http.ServerResponse} res - HTTP response object
 * @returns {boolean} True if request was handled, false otherwise
 */
function handleApiRequest(req, res) {
  // Only handle API requests
  if (!req.url.startsWith('/api/')) {
    return false;
  }
  
  // Enable CORS for API endpoints
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  
  try {
    // Handle API endpoints
    switch (req.url) {
      case '/api/status':
        // Status endpoint
        const status = {
          status: 'running',
          mode: 'fallback',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          port: config.port,
          host: config.host
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
        return true;
        
      case '/api/diagnostics':
        // Only return diagnostics if enabled
        if (!config.diagnosticsEnabled) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Diagnostics are disabled' }, null, 2));
          return true;
        }
        
        // Diagnostics endpoint
        const diagnostics = getDiagnostics();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(diagnostics, null, 2));
        return true;
        
      default:
        // Unknown API endpoint
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }, null, 2));
        return true;
    }
  } catch (error) {
    logger.error(`API error: ${error.message}`);
    
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }, null, 2));
    return true;
  }
}

/**
 * Log HTTP request
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {http.ServerResponse} res - HTTP response object
 */
function logRequest(req, res) {
  const { method, url, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const referer = headers['referer'] || '-';
  
  // Log request before handling
  logger.info(`${method} ${url} - ${userAgent} - ${referer}`);
  
  // Capture response status when response finishes
  const originalEnd = res.end;
  res.end = function() {
    res.end = originalEnd;
    const result = res.end.apply(res, arguments);
    
    const statusCode = res.statusCode || 200;
    
    // Log complete request details
    logger.info(`${method} ${url} ${statusCode}`);
    
    return result;
  };
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.error(error.stack);
  
  // Instead of crashing, restart the server in 1 second
  setTimeout(() => {
    logger.info('Restarting server after uncaught exception...');
    
    const args = process.argv.slice(1);
    const cp = spawn(process.execPath, args, {
      detached: true,
      stdio: 'inherit'
    });
    
    cp.unref();
    process.exit(1);
  }, 1000);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
});

/**
 * Create the server
 */
const server = http.createServer((req, res) => {
  try {
    // Log all requests
    logRequest(req, res);
    
    // Handle API requests
    if (handleApiRequest(req, res)) {
      return;
    }
    
    // Handle static files
    let filePath = path.join(config.publicDir, req.url === '/' ? 'index.html' : req.url);
    
    // Clean the path to prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.resolve(config.publicDir))) {
      logger.warn(`Attempted directory traversal: ${filePath}`);
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }
    
    // If path ends with /, append index.html
    if (filePath.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }
    
    // Serve the file
    serveFile(filePath, res);
  } catch (error) {
    logger.error(`Error handling request: ${error.message}`);
    
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

/**
 * Start the server
 */
server.listen(config.port, config.host, () => {
  console.log(`⚠️ Fallback server running on http://${config.host}:${config.port}/`);
  console.log(`🔍 This fallback server is running because the main application server failed to start.`);
  console.log(`📝 Check the application logs for more information on why the main server failed.`);
  
  logger.info(`Fallback server started on http://${config.host}:${config.port}/`);
});

/**
 * Handle server errors
 */
server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
  
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use`);
    
    // Try another port
    config.port = parseInt(config.port) + 1;
    logger.info(`Trying port ${config.port}...`);
    
    setTimeout(() => {
      server.close();
      server.listen(config.port, config.host);
    }, 1000);
  }
});