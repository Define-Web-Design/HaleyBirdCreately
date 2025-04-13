/**
 * Simplified Server for Code Snippet Sharing
 * 
 * This server provides a minimal implementation for serving the code snippet sharing 
 * application with proper port binding for the Replit environment.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './server/db-simple.js';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
await db.initDatabase();
console.log('Database initialized');

// MIME types map
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Log the request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // API routes
  if (req.url.startsWith('/api')) {
    // Return code snippets
    if (req.url === '/api/snippets' && req.method === 'GET') {
      try {
        const snippets = await db.getPublicCodeSnippets();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ snippets }));
      } catch (error) {
        console.error('Error fetching snippets:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to fetch snippets' }));
      }
      return;
    }
    
    // Get snippet by ID
    if (req.url.match(/^\/api\/snippets\/[^\/]+$/) && req.method === 'GET') {
      const shareId = req.url.split('/')[3];
      
      try {
        const snippet = await db.getCodeSnippetByShareId(shareId);
        
        if (snippet) {
          // Increment view count
          if (snippet.id) {
            db.incrementCodeSnippetViewCount(snippet.id).catch(console.error);
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ snippet }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Snippet not found' }));
        }
      } catch (error) {
        console.error('Error fetching snippet:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to fetch snippet' }));
      }
      return;
    }
    
    // Default API response
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'online',
      message: 'Creately Code Snippet Server API',
      endpoints: [
        { path: '/api/snippets', method: 'GET', description: 'Get all public snippets' },
        { path: '/api/snippets/:shareId', method: 'GET', description: 'Get a snippet by share ID' }
      ]
    }));
    return;
  }

  // Serve static files
  let filePath;
  
  // Default to index.html for root or HTML requests
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else {
    // Remove query string and hash
    const cleanUrl = req.url.split('?')[0].split('#')[0];
    filePath = path.join(__dirname, 'public', cleanUrl);
  }

  // Get file extension
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'text/plain';
  
  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist, serve the default HTML
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading default page');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success! Serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Set port (use environment variable or default to 8080)
const PORT = process.env.PORT || 8080;

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
  console.log('Created public directory');
}

// Create a basic index.html if it doesn't exist
const indexPath = path.join(__dirname, 'public', 'index.html');
if (!fs.existsSync(indexPath)) {
  const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creately Code Snippets</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; }
    .snippet {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #eaeaea;
      padding: 8px 15px;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      font-size: 0.9em;
      color: #555;
    }
    .copy-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .copy-btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
    <p>Loading snippets...</p>
  </header>
  <div id="snippets"></div>
  <script>
    // Fetch snippets from API
    fetch('/api/snippets')
      .then(res => res.json())
      .then(data => {
        document.querySelector('header p').textContent = 
          data.snippets && data.snippets.length 
            ? 'Found ' + data.snippets.length + ' snippets' 
            : 'No snippets available';
        
        const snippetsContainer = document.getElementById('snippets');
        
        if (data.snippets && data.snippets.length) {
          data.snippets.forEach(snippet => {
            const el = document.createElement('div');
            el.className = 'snippet';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'snippet-header';
            
            const title = document.createElement('h2');
            title.textContent = snippet.title;
            title.style.margin = '0';
            
            const meta = document.createElement('div');
            meta.textContent = 'By ' + (snippet.author || 'Anonymous');
            meta.style.color = '#666';
            meta.style.fontSize = '0.9em';
            
            header.appendChild(title);
            header.appendChild(meta);
            
            // Create description
            const desc = document.createElement('p');
            desc.textContent = snippet.description || '';
            
            // Create code block with copy button
            const codeWrapper = document.createElement('div');
            
            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            
            const langLabel = document.createElement('span');
            langLabel.textContent = snippet.language || 'plaintext';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.onclick = function() {
              navigator.clipboard.writeText(snippet.code).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                  copyBtn.textContent = 'Copy';
                }, 2000);
              }).catch(err => {
                console.error('Failed to copy', err);
                copyBtn.textContent = 'Error!';
                setTimeout(() => {
                  copyBtn.textContent = 'Copy';
                }, 2000);
              });
            };
            
            codeHeader.appendChild(langLabel);
            codeHeader.appendChild(copyBtn);
            
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = snippet.code;
            pre.appendChild(code);
            
            codeWrapper.appendChild(codeHeader);
            codeWrapper.appendChild(pre);
            
            // Create footer
            const footer = document.createElement('div');
            footer.style.fontSize = '0.85em';
            footer.style.color = '#666';
            footer.style.marginTop = '10px';
            footer.textContent = 'Share ID: ' + snippet.shareId + ' • Views: ' + (snippet.viewCount || 0);
            
            // Add all elements to container
            el.appendChild(header);
            el.appendChild(desc);
            el.appendChild(codeWrapper);
            el.appendChild(footer);
            
            snippetsContainer.appendChild(el);
          });
        }
      })
      .catch(err => {
        console.error('Error fetching snippets:', err);
        document.querySelector('header p').textContent = 'Error loading snippets';
      });
  </script>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, basicHtml);
  console.log('Created basic index.html');
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`To access the server in your browser, visit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});