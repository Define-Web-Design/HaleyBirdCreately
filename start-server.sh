#!/bin/bash

# Creately Code Snippet Server Launcher
# This script is specifically designed for Replit's environment

# Display banner
echo -e "\033[0;36m"
echo "   ______                __       __          "
echo "  / ____/_______  ____ _/ /____  / /_  __     "
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /  "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /  "
echo "                                 /____/        "
echo "                                              "
echo "  Code Snippet Server - Replit Edition        "
echo -e "\033[0m"

# Set the PORT environment variable
export PORT=8080

# Ensure the public directory exists
mkdir -p public

# Check if index.html exists, create a simple one if not
if [ ! -f "./public/index.html" ]; then
  echo "Creating basic index.html..."
  cat > ./public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creately - Code Snippets</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Creately Code Snippets</h1>
    <div>
      <button class="btn" onclick="location.reload()">Refresh</button>
    </div>
  </div>
  
  <div id="status">Loading snippets...</div>
  <div id="snippets"></div>

  <script>
    // Fetch snippets from API
    fetch('/api/snippets')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        document.getElementById('status').textContent = 
          data.snippets && data.snippets.length 
            ? `Found ${data.snippets.length} snippet(s)` 
            : 'No snippets available';
        
        if (data.snippets && data.snippets.length) {
          const container = document.getElementById('snippets');
          
          data.snippets.forEach(snippet => {
            const el = document.createElement('div');
            el.className = 'snippet';
            
            const title = document.createElement('h2');
            title.textContent = snippet.title;
            
            const description = document.createElement('p');
            description.textContent = snippet.description || '';
            
            const codeBlock = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = snippet.code;
            codeBlock.appendChild(code);
            
            const meta = document.createElement('p');
            meta.textContent = `Author: ${snippet.author || 'Anonymous'} • Share ID: ${snippet.shareId} • Views: ${snippet.viewCount || 0}`;
            
            el.appendChild(title);
            el.appendChild(description);
            el.appendChild(codeBlock);
            el.appendChild(meta);
            
            container.appendChild(el);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching snippets:', error);
        document.getElementById('status').textContent = 'Error loading snippets. Please try again.';
      });
  </script>
</body>
</html>
EOL
fi

# Start the server using node from node_bin
echo -e "\033[0;32mStarting Code Snippet Server on port $PORT...\033[0m"
./node_bin/node simple-server.js