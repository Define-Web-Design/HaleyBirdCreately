#!/bin/bash

# Creately Code Snippet Server Launcher
# This script launches the code snippet server in the Replit environment

# Print banner
echo -e "\033[0;36m"
echo "   ______                __       __          "
echo "  / ____/_______  ____ _/ /____  / /_  __     "
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /  "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /  "
echo "                                 /____/        "
echo "                                              "
echo "  Code Snippet Server - Shell Launcher        "
echo -e "\033[0m"

# Set environment variables
export PORT=8080

# Check if node_bin directory exists and use it if available
if [ -d "./node_bin" ] && [ -f "./node_bin/node" ]; then
  echo -e "\033[0;33mUsing Node.js from node_bin directory\033[0m"
  NODE_CMD="./node_bin/node"
else
  echo -e "\033[0;33mUsing system Node.js\033[0m"
  NODE_CMD="node"
fi

# Create public directory if it doesn't exist
if [ ! -d "./public" ]; then
  echo -e "\033[0;32mCreating public directory\033[0m"
  mkdir -p ./public
fi

# Create a basic index.html if it doesn't exist
if [ ! -f "./public/index.html" ]; then
  echo -e "\033[0;32mCreating basic index.html\033[0m"
  cat > ./public/index.html << 'EOL'
<!DOCTYPE html>
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
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
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
    fetch('/api/snippets')
      .then(res => res.json())
      .then(data => {
        document.querySelector('header p').textContent = 
          data.snippets && data.snippets.length 
            ? `Found ${data.snippets.length} snippets` 
            : 'No snippets available';
        
        const snippetsContainer = document.getElementById('snippets');
        
        if (data.snippets && data.snippets.length) {
          data.snippets.forEach(snippet => {
            const el = document.createElement('div');
            el.className = 'snippet';
            el.innerHTML = `
              <h2>${snippet.title}</h2>
              <p>${snippet.description || ''}</p>
              <pre><code>${snippet.code}</code></pre>
              <p>Author: ${snippet.author} • Share ID: ${snippet.shareId}</p>
            `;
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
</html>
EOL
fi

# Start the server
echo -e "\033[0;32mStarting Code Snippet Server on port $PORT...\033[0m"
$NODE_CMD simple-server.js

# This script should never reach here unless the server crashes
echo -e "\033[0;31mServer stopped unexpectedly\033[0m"
exit 1