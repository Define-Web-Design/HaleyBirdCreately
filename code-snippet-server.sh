#!/bin/bash

# Creately Code Snippet Server
# Improved workflow script with better error handling

echo -e "\033[0;36m"
echo "   ______                __       __          "
echo "  / ____/_______  ____ _/ /____  / /_  __     "
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /  "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /  "
echo "                                 /____/        "
echo "                                              "
echo "  Code Snippet Server - Workflow Script         "
echo -e "\033[0m"

# Check for and create necessary directories
mkdir -p public logs

# Environment variables
export PORT=8080
export NODE_ENV="production"

# Path setup for Node.js
export PATH="$PATH:./node_bin"

# Check for Node.js (try multiple options)
if command -v node &> /dev/null; then
  echo -e "\033[0;32mUsing system Node.js\033[0m"
  NODE="node"
elif [ -f "./node_bin/node" ]; then
  echo -e "\033[0;32mUsing Node.js from node_bin directory\033[0m"
  chmod +x ./node_bin/node ./node_bin/npm
  NODE="./node_bin/node"
else
  echo -e "\033[0;31mError: Node.js not found. Attempting to proceed anyway...\033[0m"
  NODE="node"
fi

# Start the server with proper error handling
echo -e "\033[0;32mStarting Code Snippet Server on port $PORT...\033[0m"

# Try to run the optimized server.js first
$NODE server.js || {
  echo -e "\033[0;33mFallback to simple server implementation...\033[0m"
  $NODE simple-server.js
}