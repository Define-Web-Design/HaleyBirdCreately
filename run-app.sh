
#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${CYAN}"
echo "   ______                __       __          "
echo "  / ____/_______  ____ _/ /____  / /_  __     "
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /   "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /       "
echo "                                 /____/        "
echo ""
echo "  Code Snippet Server - Unified Launcher"
echo -e "${NC}"

# Ensure necessary directories exist
mkdir -p logs
mkdir -p public
mkdir -p public/view

# Set environment variables
export PATH="$PATH:./node_bin"
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}

# Detect Node.js
if command -v node &> /dev/null; then
  echo -e "${GREEN}Using system Node.js${NC}"
  NODE="node"
elif [ -f "./node_bin/node" ]; then
  echo -e "${GREEN}Using Node.js from node_bin directory${NC}"
  chmod +x ./node_bin/node
  NODE="./node_bin/node"
else
  echo -e "${RED}No Node.js installation found!${NC}"
  echo "Please install Node.js or create a node_bin directory with Node.js binaries."
  exit 1
fi

# Check for npm and install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  if command -v npm &> /dev/null; then
    npm install || npm install --legacy-peer-deps
  elif [ -f "./node_bin/npm" ]; then
    chmod +x ./node_bin/npm
    ./node_bin/npm install || ./node_bin/npm install --legacy-peer-deps
  else
    echo -e "${YELLOW}npm not found, skipping dependency installation${NC}"
  fi
fi

# Start the server
echo -e "${GREEN}Starting the server...${NC}"

# Try to start the server in this priority order:
# 1. server/index.ts (TypeScript server with Vite)
# 2. simple-server.js (Simple HTTP server)
# 3. index.js (Emergency fallback)

if [ -f "server/index.ts" ] && command -v npm &> /dev/null; then
  echo -e "${GREEN}Starting TypeScript server with Vite...${NC}"
  npm run dev || {
    echo -e "${YELLOW}Failed to start TypeScript server, trying simple-server.js...${NC}"
    if [ -f "simple-server.js" ]; then
      $NODE simple-server.js
    elif [ -f "index.js" ]; then
      echo -e "${YELLOW}Falling back to index.js...${NC}"
      $NODE index.js
    else
      echo -e "${RED}No server files found!${NC}"
      exit 1
    fi
  }
else
  if [ -f "simple-server.js" ]; then
    echo -e "${YELLOW}Starting simple-server.js...${NC}"
    $NODE simple-server.js
  elif [ -f "index.js" ]; then
    echo -e "${YELLOW}Starting index.js...${NC}"
    $NODE index.js
  else
    echo -e "${RED}No server files found!${NC}"
    exit 1
  fi
fi
