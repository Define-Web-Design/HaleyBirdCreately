/**
 * Code Snippet Server Workflow Setup
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

// Promisify fs and exec functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const execPromise = promisify(exec);

/**
 * Print a banner
 */
function printBanner() {
  console.log(`
┌───────────────────────────────────────────────────┐
│                                                   │
│   Creately Code Snippet Server                    │
│                                                   │
│   Workflow Setup                                  │
│                                                   │
└───────────────────────────────────────────────────┘`);
}

/**
 * Log a message with timestamp and color
 */
function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  };

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Ensure public directory exists
 */
async function ensurePublicDirectory() {
  const publicDir = path.join(__dirname, 'public');
  
  try {
    await access(publicDir);
    log('Public directory already exists', 'green');
  } catch (error) {
    log('Creating public directory...', 'yellow');
    await mkdir(publicDir, { recursive: true });
    log('Public directory created', 'green');
  }
  
  const viewDir = path.join(publicDir, 'view');
  
  try {
    await access(viewDir);
    log('View directory already exists', 'green');
  } catch (error) {
    log('Creating view directory...', 'yellow');
    await mkdir(viewDir, { recursive: true });
    log('View directory created', 'green');
  }
}

/**
 * Create a basic index.html if it doesn't exist
 */
async function ensureIndexHtml() {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  try {
    await access(indexPath);
    log('index.html already exists', 'green');
    return;
  } catch (error) {
    log('Creating index.html...', 'yellow');
  }
  
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
    
    // Function to copy code
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
          console.error('Failed to copy code:', err);
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

  await writeFile(indexPath, indexHtml);
  log('index.html created', 'green');
}

/**
 * Start the server
 */
async function startServer() {
  log('Starting server...', 'yellow');
  
  try {
    // Use node from node_bin if available
    const nodePath = fs.existsSync('./node_bin/node') ? './node_bin/node' : 'node';
    
    // Run the server in the background
    const { stdout, stderr } = await execPromise(`${nodePath} snippet-server.cjs`);
    
    if (stdout) log(`Server output: ${stdout}`, 'green');
    if (stderr) log(`Server error: ${stderr}`, 'red');
    
    log('Server started successfully', 'green');
  } catch (error) {
    log(`Failed to start server: ${error.message}`, 'red');
    if (error.stdout) log(`Server output: ${error.stdout}`, 'yellow');
    if (error.stderr) log(`Server error: ${error.stderr}`, 'red');
  }
}

/**
 * Main function
 */
async function main() {
  printBanner();
  
  try {
    await ensurePublicDirectory();
    await ensureIndexHtml();
    await startServer();
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
}

// Execute main function
main();