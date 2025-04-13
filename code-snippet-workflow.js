/**
 * Code Snippet Server Workflow Setup
 */

import { spawn } from 'child_process';
import process from 'process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print a banner
 */
function printBanner() {
  console.log(colors.cyan);
  console.log('   ______                __       __          ');
  console.log('  / ____/_______  ____ _/ /____  / /_  __     ');
  console.log(' / /   / ___/ _ \\/ __ `/ __/ _ \\/ / / / /  ');
  console.log('/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      ');
  console.log('\\____/_/   \\___/\\__,_/\\__/\\___/_/\\__, /  ');
  console.log('                                 /____/        ');
  console.log('                                              ');
  console.log('  Code Snippet Server - Workflow Runner       ');
  console.log(colors.reset);
}

/**
 * Log a message with timestamp and color
 */
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Ensure public directory exists
 */
async function ensurePublicDirectory() {
  try {
    await fs.mkdir(path.join(__dirname, 'public'), { recursive: true });
    log('Public directory exists', 'green');
    return true;
  } catch (error) {
    log(`Error creating public directory: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Create a basic index.html if it doesn't exist
 */
async function ensureIndexHtml() {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  try {
    await fs.access(indexPath);
    log('Index.html already exists', 'green');
    return true;
  } catch (error) {
    // File doesn't exist, create it
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creately Code Snippets</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    h1 {
      color: #2563eb;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .snippet {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: transform 0.2s ease;
    }
    .snippet:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .snippet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .snippet-title {
      margin: 0;
      color: #1e40af;
    }
    .snippet-meta {
      color: #666;
      font-size: 0.9em;
    }
    .code-block {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      position: relative;
      border: 1px solid #eaeaea;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      padding: 8px 15px;
      background-color: #eaeaea;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      font-size: 0.9em;
      color: #555;
    }
    .copy-btn {
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.9em;
      transition: background-color 0.2s ease;
    }
    .copy-btn:hover {
      background-color: #1e40af;
    }
    .loader {
      text-align: center;
      padding: 40px;
      font-style: italic;
      color: #666;
    }
    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Creately Code Snippets</h1>
    <p>Share and discover code snippets with your team</p>
  </header>
  
  <main>
    <div class="container" id="snippets-container">
      <div class="loader">Loading snippets...</div>
    </div>
  </main>

  <script>
    // Fetch snippets from the API
    async function fetchSnippets() {
      try {
        const response = await fetch('/api/snippets');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displaySnippets(data.snippets);
      } catch (error) {
        console.error('Error fetching snippets:', error);
        document.getElementById('snippets-container').innerHTML = \`
          <div style="text-align: center; padding: 40px; color: #e53e3e;">
            <p>Error loading snippets. Please try again later.</p>
          </div>
        \`;
      }
    }

    // Display snippets in the DOM
    function displaySnippets(snippets) {
      const container = document.getElementById('snippets-container');
      
      if (!snippets || snippets.length === 0) {
        container.innerHTML = \`
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>No snippets available. Be the first to share a code snippet!</p>
          </div>
        \`;
        return;
      }
      
      const snippetsHtml = snippets.map(snippet => {
        return `
          <div class="snippet">
            <div class="snippet-header">
              <h2 class="snippet-title">${snippet.title}</h2>
              <span class="snippet-meta">By ${snippet.author || 'Anonymous'} • ${formatDate(snippet.createdAt)}</span>
            </div>
            <p>${snippet.description || ''}</p>
            <div>
              <div class="code-header">
                <span>${snippet.language || 'plaintext'}</span>
                <button class="copy-btn" onclick="copyCode(this, '${snippet.code.replace(/'/g, "\\'")}')">Copy</button>
              </div>
              <pre class="code-block"><code>${escapeHtml(snippet.code)}</code></pre>
            </div>
            <div class="snippet-meta" style="margin-top: 15px;">
              Share ID: <a href="/snippet/${snippet.shareId}">${snippet.shareId}</a>
              • Views: ${snippet.viewCount || 0}
            </div>
          </div>
        `;
      }).join('');
      
      container.innerHTML = snippetsHtml;
    }

    // Format date function
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Copy code to clipboard
    function copyCode(button, code) {
      navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '#2563eb';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Error!';
        button.style.backgroundColor = '#ef4444';
        setTimeout(() => {
          button.textContent = 'Copy';
          button.style.backgroundColor = '#2563eb';
        }, 2000);
      });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', fetchSnippets);
  </script>
</body>
</html>`;
      
      await fs.writeFile(indexPath, htmlContent);
      log('Created index.html', 'green');
      return true;
    } catch (writeError) {
      log(`Error creating index.html: ${writeError.message}`, 'red');
      return false;
    }
  }
}

/**
 * Start the server
 */
async function startServer() {
  log('Starting the Code Snippet Server...', 'yellow');
  
  // Use node from system path
  const serverProcess = spawn('node', ['simple-server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '8080' }
  });
  
  // Log server process information
  log(`Server process started with PID: ${serverProcess.pid}`, 'green');
  
  // Handle errors
  serverProcess.on('error', (error) => {
    log(`Error starting server: ${error.message}`, 'red');
  });
  
  // Handle server process exit
  serverProcess.on('exit', (code, signal) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`, 'red');
    } else {
      log('Server process exited normally', 'yellow');
    }
  });
  
  return serverProcess;
}

/**
 * Main function
 */
async function main() {
  // Print banner
  printBanner();
  
  // Ensure directories and files
  const publicDirExists = await ensurePublicDirectory();
  const indexHtmlExists = await ensureIndexHtml();
  
  if (!publicDirExists || !indexHtmlExists) {
    log('Failed to create required files or directories', 'red');
    process.exit(1);
  }
  
  // Start server
  const serverProcess = await startServer();
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Stopping server (SIGINT)...', 'yellow');
    serverProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Stopping server (SIGTERM)...', 'yellow');
    serverProcess.kill();
    process.exit(0);
  });
  
  log('Server started successfully!', 'green');
  log('API available at: http://localhost:8080/api', 'cyan');
  log('Web interface available at: http://localhost:8080/', 'cyan');
}

// Run main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});