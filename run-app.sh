
#!/bin/bash

# Ensure logs directory exists
mkdir -p logs

# Set environment variables
export PATH="$PATH:./node_bin"
export NODE_ENV=development

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install || npm install --legacy-peer-deps
fi

# Run the application in development mode
npm run dev || node simple-server.js

# If the development server fails, this fallback ensures something is running
# Fixed version to resolve 'unexpected end of file' error

# ANSI color escape codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RESET='\033[0m'

# Display banner
echo -e "${CYAN}"
echo "   ______                __       __          "
echo "  / ____/_______  ____ _/ /____  / /_  __     "
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /   "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /       "
echo "                                 /____/        "
echo "                                               "
echo "  Code Snippet Server - Replit Edition         "
echo -e "${RESET}"

# Set environment variables
export PORT=8080

# Create necessary directories
mkdir -p public

# Detect Node.js
if [ -f "./node_bin/node" ]; then
  echo -e "${YELLOW}Using Node.js from node_bin directory${RESET}"
  NODE_CMD="./node_bin/node"
else
  echo -e "${YELLOW}Using system Node.js${RESET}"
  NODE_CMD="node"
fi

# Start the server
echo -e "${GREEN}Starting Code Snippet Server on port $PORT...${RESET}"
$NODE_CMD simple-server.js