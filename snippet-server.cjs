/**
 * All-in-One Code Snippet Server for Creately
 * This server contains everything needed in a single file
 */

// Import required built-in modules
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const crypto = require('crypto');

// Configuration
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// In-memory storage for code snippets
const snippets = [];
let nextId = 1;

// Supported MIME types
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
  '.txt': 'text/plain',
};

/**
 * Generate a random ID for sharing
 * @param {number} length - The length of the ID
 * @returns {string} The generated ID
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

/**
 * Add a sample snippet if none exist
 */
function addSampleSnippet() {
  const id = nextId++;
  const shareId = generateId(8);
  const createdAt = new Date().toISOString();
  
  snippets.push({
    id,
    shareId,
    title: 'Welcome to Creately Code Snippets',
    language: 'javascript',
    code: `/**
 * Welcome to Creately Code Snippets
 * 
 * This is a sample code snippet to demonstrate the functionality.
 * You can create your own snippets and share them with others.
 */
function greeting(name) {
  return \`Hello, \${name}! Welcome to Creately Code Snippets.\`;
}

// Example usage
const message = greeting('User');
console.log(message);

// Features:
// - Syntax highlighting
// - Line numbers
// - Copy to clipboard
// - Public/private snippets
// - Share via URL
`,
    description: 'A sample code snippet to demonstrate the functionality of Creately Code Snippets.',
    author: 'Creately Team',
    isPublic: true,
    createdAt,
    viewCount: 0
  });
  
  console.log('Sample snippet added with ID:', id, 'and ShareID:', shareId);
  return snippets[0];
}

/**
 * Get all public code snippets
 * @returns {Array} Array of public code snippets
 */
function getPublicCodeSnippets() {
  return snippets.filter(snippet => snippet.isPublic)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get a code snippet by shareId
 * @param {string} shareId - The snippet share ID
 * @returns {Object|null} The snippet or null if not found
 */
function getCodeSnippetByShareId(shareId) {
  const snippet = snippets.find(s => s.shareId === shareId);
  
  if (snippet) {
    // Increment view count
    snippet.viewCount += 1;
  }
  
  return snippet || null;
}

/**
 * Create a new code snippet
 * @param {Object} snippet - The snippet to create
 * @returns {Object} The created snippet
 */
function createCodeSnippet(snippet) {
  const id = nextId++;
  const shareId = generateId(8);
  const createdAt = new Date().toISOString();
  
  const newSnippet = {
    id,
    shareId,
    createdAt,
    viewCount: 0,
    ...snippet
  };
  
  snippets.push(newSnippet);
  return newSnippet;
}

/**
 * Parse JSON request body
 * @param {http.IncomingMessage} req - The HTTP request
 * @returns {Promise<Object>} The parsed request body
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Send JSON response
 * @param {http.ServerResponse} res - The HTTP response
 * @param {number} statusCode - The HTTP status code
 * @param {Object} data - The response data
 */
function sendJsonResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Send HTML response
 * @param {http.ServerResponse} res - The HTTP response
 * @param {string} html - The HTML content
 */
function sendHtmlResponse(res, html) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

/**
 * Send static file
 * @param {http.ServerResponse} res - The HTTP response
 * @param {string} filePath - The file path
 */
function sendStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.statusCode = 404;
        res.end('File not found');
      } else {
        // Server error
        res.statusCode = 500;
        res.end('Server error');
      }
      return;
    }
    
    // Get the file extension
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

/**
 * Handle API requests
 * @param {http.IncomingMessage} req - The HTTP request
 * @param {http.ServerResponse} res - The HTTP response
 * @param {string} pathname - The request path
 */
async function handleApiRequest(req, res, pathname) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (for CORS)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Handle API endpoints
  if (pathname === '/api/snippets' && req.method === 'GET') {
    // Get all public snippets
    const publicSnippets = getPublicCodeSnippets();
    sendJsonResponse(res, 200, { snippets: publicSnippets });
    return;
  }
  
  if (pathname.startsWith('/api/snippets/') && req.method === 'GET') {
    // Get a specific snippet by shareId
    const shareId = pathname.split('/').pop();
    const snippet = getCodeSnippetByShareId(shareId);
    
    if (!snippet) {
      sendJsonResponse(res, 404, { error: 'Snippet not found' });
      return;
    }
    
    sendJsonResponse(res, 200, { snippet });
    return;
  }
  
  if (pathname === '/api/snippets' && req.method === 'POST') {
    // Create a new snippet
    try {
      const body = await parseRequestBody(req);
      const { title, language, code, description, author, isPublic } = body;
      
      // Validate required fields
      if (!title || !language || !code) {
        sendJsonResponse(res, 400, { error: 'Title, language, and code are required' });
        return;
      }
      
      const snippet = createCodeSnippet({
        title,
        language,
        code,
        description: description || '',
        author: author || 'Anonymous',
        isPublic: isPublic !== false
      });
      
      sendJsonResponse(res, 201, { snippet });
    } catch (error) {
      console.error('Error parsing request body:', error);
      sendJsonResponse(res, 400, { error: 'Invalid request body' });
    }
    return;
  }
  
  // API endpoint not found
  sendJsonResponse(res, 404, { error: 'API endpoint not found' });
}

/**
 * Create simple HTML page
 * @param {string} title - The page title
 * @param {string} content - The page content
 * @returns {string} The HTML content
 */
function createHtmlPage(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
}

/**
 * Create a basic index.html if it doesn't exist
 */
function ensureIndexHtml() {
  const publicDir = path.join(__dirname, 'public');
  const indexPath = path.join(publicDir, 'index.html');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (!fs.existsSync(indexPath)) {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creately Code Snippets</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <!-- Load common languages -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 { color: #2563eb; }
    .header-links {
      display: flex;
      gap: 20px;
    }
    .header-links a {
      color: #2563eb;
      text-decoration: none;
    }
    .header-links a:hover {
      text-decoration: underline;
    }
    .snippet-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .snippet-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .snippet-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
    .snippet-meta {
      font-size: 0.9rem;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
    }
    .snippet-preview {
      padding: 15px;
      height: 150px;
      overflow: hidden;
      position: relative;
      background-color: #282c34;
    }
    .snippet-preview code {
      font-family: 'SFMono-Regular', Consolas, monospace;
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
      font-size: 0.9rem;
      color: #6b7280;
    }
    .view-btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #2563eb;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
    .view-btn:hover {
      background-color: #1d4ed8;
      text-decoration: none;
    }
    .create-btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
      margin-bottom: 30px;
    }
    .create-btn:hover {
      background-color: #1d4ed8;
      text-decoration: none;
    }
    .empty-state {
      text-align: center;
      padding: 50px;
      background-color: #f9fafb;
      border-radius: 8px;
      margin-top: 30px;
    }
    .error {
      padding: 20px;
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #b91c1c;
    }
    .loading {
      text-align: center;
      padding: 30px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
    <div class="header-links">
      <a href="/">Home</a>
      <a href="/create-snippet.html">Create Snippet</a>
    </div>
  </header>

  <main>
    <a href="/create-snippet.html" class="create-btn">+ Create New Snippet</a>
    
    <div id="snippetContainer" class="loading">
      Loading snippets...
    </div>
  </main>

  <script>
    // Function to format date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Function to escape HTML
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Function to truncate text
    function truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    }

    // Function to load all public snippets
    async function loadSnippets() {
      try {
        const response = await fetch('/api/snippets');
        
        if (!response.ok) {
          throw new Error(\`Server responded with status: \${response.status}\`);
        }
        
        const data = await response.json();
        
        if (!data.snippets || !Array.isArray(data.snippets)) {
          throw new Error('Invalid response format');
        }
        
        const snippetContainer = document.getElementById('snippetContainer');
        
        if (data.snippets.length === 0) {
          snippetContainer.innerHTML = \`
            <div class="empty-state">
              <h2>No code snippets found</h2>
              <p>Be the first to create a code snippet!</p>
              <a href="/create-snippet.html" class="create-btn">Create Snippet</a>
            </div>
          \`;
          return;
        }
        
        const snippetsHtml = data.snippets.map(snippet => \`
          <div class="snippet-card">
            <div class="snippet-header">
              <h3 class="snippet-title">\${escapeHtml(snippet.title)}</h3>
              <div class="snippet-meta">
                <span>By: \${escapeHtml(snippet.author)}</span>
                <span>\${snippet.language}</span>
              </div>
            </div>
            <div class="snippet-preview">
              <pre><code class="\${snippet.language}">\${escapeHtml(truncateText(snippet.code, 500))}</code></pre>
            </div>
            <div class="snippet-footer">
              <span>\${formatDate(snippet.createdAt)}</span>
              <a href="/view/\${snippet.shareId}" class="view-btn">View Snippet</a>
            </div>
          </div>
        \`).join('');
        
        snippetContainer.innerHTML = \`<div class="snippet-list">\${snippetsHtml}</div>\`;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
        
      } catch (error) {
        console.error('Error loading snippets:', error);
        document.getElementById('snippetContainer').innerHTML = \`
          <div class="error">
            <h2>Error loading snippets</h2>
            <p>\${error.message}</p>
          </div>
        \`;
      }
    }

    // Load snippets on page load
    document.addEventListener('DOMContentLoaded', loadSnippets);
  </script>
</body>
</html>`;

    fs.writeFileSync(indexPath, indexHtml);
    console.log('Created index.html');
  }

  // Create view directory and view/index.html
  const viewDir = path.join(publicDir, 'view');
  const viewIndexPath = path.join(viewDir, 'index.html');
  
  if (!fs.existsSync(viewDir)) {
    fs.mkdirSync(viewDir, { recursive: true });
  }
  
  if (!fs.existsSync(viewIndexPath)) {
    const viewIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>View Snippet - Creately</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <!-- Load common languages -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/python.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/java.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/csharp.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/go.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/ruby.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/php.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/css.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/xml.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/markdown.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/json.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/bash.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/sql.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 { color: #2563eb; }
    .header-links {
      display: flex;
      gap: 20px;
    }
    .header-links a {
      color: #2563eb;
      text-decoration: none;
    }
    .header-links a:hover {
      text-decoration: underline;
    }
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
    .snippet-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .snippet-description {
      padding: 20px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
      font-size: 1rem;
      line-height: 1.7;
    }
    .code-container {
      position: relative;
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
      text-transform: uppercase;
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
    .copy-btn:hover {
      background-color: #374151;
    }
    pre {
      margin: 0;
      padding: 20px;
      overflow-x: auto;
    }
    pre code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.95rem;
      line-height: 1.6;
      padding: 0 !important;
    }
    .code-with-line-numbers {
      counter-reset: line;
    }
    .code-with-line-numbers .hljs-line {
      position: relative;
      display: block;
      padding-left: 3.5em;
    }
    .code-with-line-numbers .hljs-line:before {
      counter-increment: line;
      content: counter(line);
      position: absolute;
      left: 0;
      color: #777;
      text-align: right;
      width: 3em;
      padding-right: 0.5em;
      border-right: 1px solid #ddd;
      user-select: none;
    }
    .snippet-footer {
      padding: 15px 20px;
      background-color: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #6b7280;
    }
    .share-section {
      margin-top: 30px;
      padding: 20px;
      background-color: #f9fafb;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .share-section h3 {
      margin-top: 0;
      color: #1e40af;
    }
    .share-url {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    .share-url input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .copy-url-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .copy-url-btn:hover {
      background-color: #1d4ed8;
    }
    .loading {
      text-align: center;
      padding: 40px;
      font-size: 1.1rem;
      color: #6b7280;
    }
    .error {
      text-align: center;
      padding: 40px;
      color: #b91c1c;
      background-color: #fee2e2;
      border-radius: 8px;
      border: 1px solid #fecaca;
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
    .back-btn:hover {
      background-color: #e5e7eb;
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
    <div class="header-links">
      <a href="/">Home</a>
      <a href="/create-snippet.html">Create Snippet</a>
    </div>
  </header>

  <main>
    <a href="/" class="back-btn">← Back to all snippets</a>
    
    <div id="snippetContainer" class="loading">
      Loading snippet...
    </div>
    
    <div id="shareSection" class="share-section" style="display: none;">
      <h3>Share this snippet</h3>
      <p>Use the link below to share this code snippet with others:</p>
      <div class="share-url">
        <input type="text" id="shareUrl" readonly>
        <button class="copy-url-btn" onclick="copyShareUrl()">Copy URL</button>
      </div>
    </div>
  </main>

  <script>
    // Function to format date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Function to copy code to clipboard
    function copyCode(button, code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy code', err);
        });
    }

    // Function to copy share URL
    function copyShareUrl() {
      const shareUrlInput = document.getElementById('shareUrl');
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          const copyBtn = document.querySelector('.copy-url-btn');
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy URL', err);
        });
    }

    // Function to escape HTML
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Function to add line numbers to code
    function addLineNumbers(code) {
      const lines = code.split('\\n');
      return lines.map(line => \`<span class="hljs-line">\${line}</span>\`).join('\\n');
    }

    // Function to get share ID from URL
    function getShareIdFromUrl() {
      const pathParts = window.location.pathname.split('/');
      return pathParts[pathParts.length - 1];
    }

    // Function to load snippet by share ID
    async function loadSnippet() {
      const shareId = getShareIdFromUrl();
      
      if (!shareId) {
        document.getElementById('snippetContainer').innerHTML = \`
          <div class="error">
            <h2>Error: Missing Share ID</h2>
            <p>No share ID was provided in the URL.</p>
            <a href="/" class="back-btn">Go to Home</a>
          </div>
        \`;
        return;
      }
      
      try {
        const response = await fetch(\`/api/snippets/\${shareId}\`);
        
        if (!response.ok) {
          throw new Error(\`Error: \${response.status}\`);
        }
        
        const data = await response.json();
        
        if (!data.snippet) {
          throw new Error('Snippet not found');
        }
        
        const snippet = data.snippet;
        const codeWithLineNumbers = addLineNumbers(escapeHtml(snippet.code));
        
        // Update page title
        document.title = \`\${snippet.title} - Creately Code Snippet\`;
        
        // Render snippet
        document.getElementById('snippetContainer').innerHTML = \`
          <div class="snippet-container">
            <div class="snippet-header">
              <h2 class="snippet-title">\${escapeHtml(snippet.title)}</h2>
              <div class="snippet-meta">
                <div class="snippet-meta-item">
                  <span>Author: \${escapeHtml(snippet.author)}</span>
                </div>
                <div class="snippet-meta-item">
                  <span>Created: \${formatDate(snippet.createdAt)}</span>
                </div>
                <div class="snippet-meta-item">
                  <span>Language: \${snippet.language}</span>
                </div>
                <div class="snippet-meta-item">
                  <span>Views: \${snippet.viewCount}</span>
                </div>
              </div>
            </div>
            
            \${snippet.description ? \`
              <div class="snippet-description">
                \${escapeHtml(snippet.description)}
              </div>
            \` : ''}
            
            <div class="code-container">
              <span class="language-badge">\${snippet.language}</span>
              <button class="copy-btn" onclick="copyCode(this, '\${escapeHtml(snippet.code).replace(/'/g, "\\'")}')">Copy</button>
              <pre><code class="code-with-line-numbers \${snippet.language}">\${codeWithLineNumbers}</code></pre>
            </div>
            
            <div class="snippet-footer">
              <span>Share ID: \${snippet.shareId}</span>
            </div>
          </div>
        \`;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
        
        // Show share section
        document.getElementById('shareSection').style.display = 'block';
        document.getElementById('shareUrl').value = window.location.href;
        
      } catch (error) {
        console.error('Error loading snippet:', error);
        document.getElementById('snippetContainer').innerHTML = \`
          <div class="error">
            <h2>Error loading snippet</h2>
            <p>\${error.message}</p>
            <a href="/" class="back-btn">Go to Home</a>
          </div>
        \`;
      }
    }

    // Load snippet on page load
    document.addEventListener('DOMContentLoaded', loadSnippet);
  </script>
</body>
</html>`;

    fs.writeFileSync(viewIndexPath, viewIndexHtml);
    console.log('Created view/index.html');
  }

  // Create create-snippet.html
  const createSnippetPath = path.join(publicDir, 'create-snippet.html');
  
  if (!fs.existsSync(createSnippetPath)) {
    const createSnippetHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Snippet - Creately</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 { color: #2563eb; }
    .header-links {
      display: flex;
      gap: 20px;
    }
    .header-links a {
      color: #2563eb;
      text-decoration: none;
    }
    .header-links a:hover {
      text-decoration: underline;
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
    .back-btn:hover {
      background-color: #e5e7eb;
    }
    .form-container {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 30px;
    }
    .form-title {
      margin-top: 0;
      color: #1e40af;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #4b5563;
    }
    input[type="text"],
    input[type="email"],
    select,
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus,
    input[type="email"]:focus,
    select:focus,
    textarea:focus {
      border-color: #2563eb;
      outline: none;
    }
    textarea {
      height: 200px;
      font-family: 'SFMono-Regular', Consolas, monospace;
      resize: vertical;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }
    .checkbox-group label {
      margin-bottom: 0;
    }
    .form-actions {
      margin-top: 30px;
      display: flex;
      gap: 15px;
    }
    .submit-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .submit-btn:hover {
      background-color: #1d4ed8;
    }
    .cancel-btn {
      background-color: #f3f4f6;
      color: #4b5563;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .cancel-btn:hover {
      background-color: #e5e7eb;
    }
    .note {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #6b7280;
      font-style: italic;
    }
    .form-error {
      color: #b91c1c;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    .success-message {
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
      color: #065f46;
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
    <div class="header-links">
      <a href="/">Home</a>
      <a href="/create-snippet.html">Create Snippet</a>
    </div>
  </header>

  <main>
    <a href="/" class="back-btn">← Back to all snippets</a>
    
    <div class="form-container">
      <h2 class="form-title">Create a New Code Snippet</h2>
      
      <form id="snippetForm">
        <div class="form-group">
          <label for="title">Title *</label>
          <input type="text" id="title" name="title" required>
          <div id="titleError" class="form-error"></div>
        </div>
        
        <div class="form-group">
          <label for="author">Author</label>
          <input type="text" id="author" name="author" placeholder="Anonymous">
          <div class="note">Leave blank to post as 'Anonymous'</div>
        </div>
        
        <div class="form-group">
          <label for="language">Language *</label>
          <select id="language" name="language" required>
            <option value="">Select a language</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="markdown">Markdown</option>
            <option value="plaintext">Plain Text</option>
          </select>
          <div id="languageError" class="form-error"></div>
        </div>
        
        <div class="form-group">
          <label for="code">Code *</label>
          <textarea id="code" name="code" required></textarea>
          <div id="codeError" class="form-error"></div>
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" name="description" style="height: 100px;"></textarea>
          <div class="note">Optional: Add context or explanation for your code snippet</div>
        </div>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="isPublic" name="isPublic" checked>
            <label for="isPublic">Make this snippet public</label>
          </div>
          <div class="note">Public snippets will be visible to everyone on the home page</div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="submit-btn" id="submitBtn">Create Snippet</button>
          <button type="button" class="cancel-btn" onclick="window.location.href='/'">Cancel</button>
        </div>
      </form>
      
      <div id="successMessage" class="success-message" style="display: none;"></div>
    </div>
  </main>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const snippetForm = document.getElementById('snippetForm');
      const submitBtn = document.getElementById('submitBtn');
      const successMessage = document.getElementById('successMessage');
      
      snippetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset errors
        document.getElementById('titleError').textContent = '';
        document.getElementById('languageError').textContent = '';
        document.getElementById('codeError').textContent = '';
        
        // Get form values
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim() || 'Anonymous';
        const language = document.getElementById('language').value;
        const code = document.getElementById('code').value;
        const description = document.getElementById('description').value.trim();
        const isPublic = document.getElementById('isPublic').checked;
        
        // Validate form
        let isValid = true;
        
        if (!title) {
          document.getElementById('titleError').textContent = 'Title is required';
          isValid = false;
        }
        
        if (!language) {
          document.getElementById('languageError').textContent = 'Please select a language';
          isValid = false;
        }
        
        if (!code) {
          document.getElementById('codeError').textContent = 'Code is required';
          isValid = false;
        }
        
        if (!isValid) {
          return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Creating...';
        
        try {
          const response = await fetch('/api/snippets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title,
              author,
              language,
              code,
              description,
              isPublic
            })
          });
          
          if (!response.ok) {
            throw new Error(\`Server responded with status: \${response.status}\`);
          }
          
          const data = await response.json();
          
          // Show success message
          snippetForm.reset();
          snippetForm.style.display = 'none';
          successMessage.innerHTML = \`
            <h3>Snippet Created Successfully!</h3>
            <p>Your code snippet has been created and is now available.</p>
            <p>You can <a href="/view/\${data.snippet.shareId}" style="color: #065f46; font-weight: bold;">view your snippet</a> or <a href="/" style="color: #065f46; font-weight: bold;">return to the home page</a>.</p>
          \`;
          successMessage.style.display = 'block';
          
        } catch (error) {
          console.error('Error creating snippet:', error);
          alert(\`Failed to create snippet: \${error.message}\`);
        } finally {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Create Snippet';
        }
      });
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(createSnippetPath, createSnippetHtml);
    console.log('Created create-snippet.html');
  }
}

/**
 * Main function - Creates the HTTP server
 */
function createServer() {
  // Add sample snippet to the database
  addSampleSnippet();
  
  // Ensure HTML files exist
  ensureIndexHtml();
  
  // Create the server
  const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url || '/', true);
    let pathname = parsedUrl.pathname || '/';
    
    // Fix double slashes and normalize
    pathname = path.normalize(pathname).replace(/\\/g, '/');
    
    // Log the request
    console.log(`${req.method} ${pathname}`);
    
    // Handle API requests
    if (pathname.startsWith('/api/')) {
      handleApiRequest(req, res, pathname);
      return;
    }
    
    // Handle view/:shareId routes
    if (pathname.startsWith('/view/')) {
      sendStaticFile(res, path.join(__dirname, 'public', 'view', 'index.html'));
      return;
    }
    
    // Check if the requested file exists in public directory
    const filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // If file doesn't exist, check if it's a directory
        if (pathname.endsWith('/')) {
          // Try to serve index.html from that directory
          const indexPath = path.join(filePath, 'index.html');
          fs.access(indexPath, fs.constants.F_OK, (err) => {
            if (err) {
              // No index.html found, serve the main index.html
              sendStaticFile(res, path.join(__dirname, 'public', 'index.html'));
            } else {
              // Serve the directory's index.html
              sendStaticFile(res, indexPath);
            }
          });
        } else {
          // Not a directory, check if it's a file without extension
          fs.stat(filePath + '.html', (err, stats) => {
            if (err || !stats.isFile()) {
              // No matching file found, serve the main index.html
              sendStaticFile(res, path.join(__dirname, 'public', 'index.html'));
            } else {
              // Serve the file with .html extension
              sendStaticFile(res, filePath + '.html');
            }
          });
        }
        return;
      }
      
      // File exists, check if it's a directory
      fs.stat(filePath, (err, stats) => {
        if (err) {
          sendStaticFile(res, path.join(__dirname, 'public', 'index.html'));
          return;
        }
        
        if (stats.isDirectory()) {
          // If it's a directory, serve its index.html
          sendStaticFile(res, path.join(filePath, 'index.html'));
        } else {
          // If it's a file, serve it
          sendStaticFile(res, filePath);
        }
      });
    });
  });
  
  // Start the server
  server.listen(PORT, HOST, () => {
    console.log(`
┌───────────────────────────────────────────────────┐
│                                                   │
│   Creately Code Snippet Server                    │
│                                                   │
│   Server running at http://${HOST}:${PORT}/          │
│                                                   │
└───────────────────────────────────────────────────┘`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  return server;
}

// Create the server
createServer();