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
echo "  Deployment Script"
echo -e "${NC}"

# Setup log directory
mkdir -p logs
DEPLOY_LOG="logs/deployment.log"

# Log function
log() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[${timestamp}] $1" >> "${DEPLOY_LOG}"
  echo -e "$1"
}

log "${GREEN}Starting deployment process...${NC}"

# Determine Node.js path
if command -v node &> /dev/null; then
  log "${GREEN}Using system Node.js${NC}"
  NODE="node"
  NPM="npm"
elif [ -f "./node_bin/node" ]; then
  log "${GREEN}Using Node.js from node_bin directory${NC}"
  export PATH="./node_bin:$PATH"
  chmod +x ./node_bin/node ./node_bin/npm 2>/dev/null
  NODE="./node_bin/node"
  NPM="./node_bin/npm"
else
  log "${RED}No Node.js installation found! Attempting to continue anyway...${NC}"
  NODE="node"
  NPM="npm"
fi

# Install dependencies with fallback options
log "${GREEN}Installing dependencies...${NC}"
$NPM install --production || $NPM install --no-optional || $NPM install --legacy-peer-deps

# Build the application
log "${GREEN}Building the application...${NC}"
if $NPM run build; then
  log "${GREEN}Build completed successfully${NC}"
else
  log "${RED}Build failed! Attempting fallback...${NC}"
  
  # Attempt to use esbuild directly if available
  if command -v esbuild &> /dev/null; then
    log "${YELLOW}Attempting direct build with esbuild...${NC}"
    esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
  else
    log "${RED}Build failed and no fallback build method available${NC}"
    exit 1
  fi
fi

# Start the application using the workflow manager
if [ -f "run-app.sh" ]; then
  log "${GREEN}Starting application via workflow manager...${NC}"
  chmod +x run-app.sh
  export WORKFLOW_NAME="Production Build"
  ./run-app.sh
else
  # Fallback to direct start if workflow manager is not available
  log "${YELLOW}Workflow manager not found, attempting to start application directly...${NC}"
  export NODE_ENV=production
  
  # Try to start the application, with fallback to simple server if it fails
  $NODE dist/index.js || {
    log "${RED}Failed to start application directly. Attempting fallback server...${NC}"
    if [ -f "simple-server.cjs" ]; then
      log "${YELLOW}Starting fallback server (simple-server.cjs)...${NC}"
      $NODE simple-server.cjs
    elif [ -f "simple-server.js" ]; then
      log "${YELLOW}Starting fallback server (simple-server.js)...${NC}"
      $NODE simple-server.js
    else
      log "${RED}No fallback server available. Deployment failed.${NC}"
      exit 1
    fi
  }
fi