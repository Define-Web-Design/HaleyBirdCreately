/**
 * Simple Express Server for Code Snippet Sharing
 * Minimal version to ensure functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// In-memory database
const snippets = [];
let nextId = 1;

/**
 * Generate a random ID for sharing
 */
function generateId(length = 6) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % characters.length;
    result += characters[index];
  }
  
  return result;
}

// Add a sample snippet
function addSampleSnippet() {
  const shareId = generateId(8);
  const snippet = {
    id: nextId++,
    shareId,
    title: 'Welcome to Creately Code Snippets',
    language: 'javascript',
    code: `// Welcome to Creately Code Snippets
function greeting(name) {
  return \`Hello, \${name}! Welcome to Creately.\`;
}

// Test the function
console.log(greeting('User'));`,
    description: 'A sample code snippet to demonstrate functionality.',
    author: 'Creately',
    isPublic: true,
    createdAt: new Date().toISOString(),
    viewCount: 0
  };
  
  snippets.push(snippet);
  console.log(`Added sample snippet with ID: ${snippet.id} and shareId: ${snippet.shareId}`);
  return snippet;
}

// Create server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Log the request
  console.log(`${req.method} ${req.url}`);
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Handle GET requests
  if (req.method === 'GET') {
    // API endpoints
    if (req.url === '/api/snippets') {
      const publicSnippets = snippets.filter(s => s.isPublic);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ snippets: publicSnippets }));
      return;
    }
    
    if (req.url.startsWith('/api/snippets/')) {
      const shareId = req.url.split('/').pop();
      const snippet = snippets.find(s => s.shareId === shareId);
      
      res.setHeader('Content-Type', 'application/json');
      
      if (snippet) {
        snippet.viewCount++;
        res.end(JSON.stringify({ snippet }));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Snippet not found' }));
      }
      
      return;
    }
    
    // Serve index.html for the root path
    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creately Code Snippets</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 { color: #2563eb; }
    .snippet-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .snippet-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
    }
    .snippet-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .snippet-header {
      padding: 15px;
      background-color: #f9fafb;
      border-bottom: 1px solid #ddd;
    }
    .snippet-title {
      margin: 0 0 10px 0;
      font-size: 1.2rem;
      color: #1e40af;
    }
    .snippet-preview {
      padding: 15px;
      max-height: 200px;
      overflow: hidden;
      position: relative;
      background-color: #282c34;
    }
    .snippet-preview code {
      font-size: 0.9rem;
      color: #abb2bf;
    }
    .snippet-preview::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(transparent, #282c34);
    }
    .snippet-footer {
      padding: 15px;
      background-color: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .view-btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #2563eb;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .view-btn:hover {
      background-color: #1d4ed8;
    }
    .create-btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 30px;
    }
    pre {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
  </header>

  <main>
    <div class="snippet-list" id="snippetList"></div>
  </main>

  <script>
    // Fetch snippets and render them
    async function loadSnippets() {
      try {
        const response = await fetch('/api/snippets');
        const data = await response.json();
        
        const snippetList = document.getElementById('snippetList');
        
        if (data.snippets && data.snippets.length > 0) {
          snippetList.innerHTML = data.snippets.map(snippet => \`
            <div class="snippet-card">
              <div class="snippet-header">
                <h3 class="snippet-title">\${snippet.title}</h3>
                <div>By: \${snippet.author}</div>
              </div>
              <div class="snippet-preview">
                <pre><code>\${snippet.code}</code></pre>
              </div>
              <div class="snippet-footer">
                <span>Language: \${snippet.language}</span>
                <a href="/view/\${snippet.shareId}" class="view-btn">View Snippet</a>
              </div>
            </div>
          \`).join('');
        } else {
          snippetList.innerHTML = '<p>No snippets found</p>';
        }
      } catch (error) {
        console.error('Error loading snippets:', error);
      }
    }
    
    // Load snippets when the page loads
    document.addEventListener('DOMContentLoaded', loadSnippets);
  </script>
</body>
</html>`);
      return;
    }
    
    // Serve view page
    if (req.url.startsWith('/view/')) {
      const shareId = req.url.split('/').pop();
      const snippet = snippets.find(s => s.shareId === shareId);
      
      if (!snippet) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Snippet not found</h1><p>The requested snippet could not be found.</p>');
        return;
      }
      
      res.setHeader('Content-Type', 'text/html');
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${snippet.title} - Creately Code Snippets</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 { color: #2563eb; }
    .snippet-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    .snippet-header {
      background-color: #f9fafb;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }
    .snippet-title {
      margin: 0 0 10px 0;
      font-size: 1.8rem;
      color: #1e40af;
    }
    .snippet-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 0.9rem;
      color: #6b7280;
    }
    .snippet-description {
      padding: 20px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
    }
    .code-container {
      position: relative;
      background-color: #282c34;
    }
    .language-badge {
      position: absolute;
      top: 10px;
      right: 60px;
      background-color: #4b5563;
      color: #fff;
      font-size: 0.8rem;
      padding: 3px 8px;
      border-radius: 4px;
      z-index: 2;
    }
    .copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #4b5563;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 0.8rem;
      cursor: pointer;
      z-index: 2;
    }
    pre {
      margin: 0;
      padding: 20px;
      overflow-x: auto;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.95rem;
    }
    .back-btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      color: #4b5563;
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
  </header>

  <main>
    <a href="/" class="back-btn">← Back to all snippets</a>
    
    <div class="snippet-container">
      <div class="snippet-header">
        <h2 class="snippet-title">${snippet.title}</h2>
        <div class="snippet-meta">
          <div>Author: ${snippet.author}</div>
          <div>Created: ${new Date(snippet.createdAt).toLocaleDateString()}</div>
          <div>Language: ${snippet.language}</div>
          <div>Views: ${snippet.viewCount}</div>
        </div>
      </div>
      
      ${snippet.description ? `
        <div class="snippet-description">
          ${snippet.description}
        </div>
      ` : ''}
      
      <div class="code-container">
        <span class="language-badge">${snippet.language}</span>
        <button class="copy-btn" onclick="copyCode()">Copy</button>
        <pre><code class="${snippet.language}">${snippet.code}</code></pre>
      </div>
    </div>
    
    <div>
      <h3>Share this snippet</h3>
      <p>Share ID: ${snippet.shareId}</p>
      <p>Share URL: ${req.headers.host}/view/${snippet.shareId}</p>
    </div>
  </main>

  <script>
    // Function to copy code to clipboard
    function copyCode() {
      const code = \`${snippet.code.replace(/`/g, '\\`')}\`;
      navigator.clipboard.writeText(code)
        .then(() => {
          const copyBtn = document.querySelector('.copy-btn');
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy code:', err);
        });
    }
    
    // Initialize syntax highlighting
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    });
  </script>
</body>
</html>`);
      return;
    }
    
    // Handle other paths
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Not Found</h1><p>The requested resource was not found on this server.</p>');
  }
  
  // Handle POST requests
  if (req.method === 'POST' && req.url === '/api/snippets') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { title, language, code, description, author, isPublic } = data;
        
        if (!title || !language || !code) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Title, language, and code are required' }));
          return;
        }
        
        const snippet = {
          id: nextId++,
          shareId: generateId(8),
          title,
          language,
          code,
          description: description || '',
          author: author || 'Anonymous',
          isPublic: isPublic !== false,
          createdAt: new Date().toISOString(),
          viewCount: 0
        };
        
        snippets.push(snippet);
        
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ snippet }));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
    return;
  }
  
  // Handle unknown methods
  res.statusCode = 405;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Method Not Allowed');
});

// Add sample snippet and start server
addSampleSnippet();

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple code snippet server running at http://0.0.0.0:${PORT}/`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});