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
echo " / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /  "
echo "/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      "
echo "\____/_/   \___/\__,_/\__/\___/_/\__, /  "
echo "                                 /____/        "
echo ""
echo "  Code Snippet Server - Run Script         "
echo -e "${NC}"

# Ensure public directory exists
echo -e "${YELLOW}Setting up environment...${NC}"
mkdir -p public
mkdir -p public/view
mkdir -p logs

# Use node from the node_bin directory
echo -e "${GREEN}Using Node.js from node_bin directory${NC}"
NODE="./node_bin/node"

# Make it executable
chmod +x $NODE 2>/dev/null || echo "Could not make node executable"

# Check if Node.js is working
if $NODE -v > /dev/null 2>&1; then
  echo -e "${GREEN}Node.js is available: $($NODE -v)${NC}"
else
  echo -e "${RED}Failed to run Node.js${NC}"
  exit 1
fi

# Check if the server file exists
if [ -f "server.js" ]; then
  SERVER_FILE="server.js"
  echo -e "${GREEN}Using ESM server.js${NC}"
elif [ -f "simple-server.js" ]; then
  SERVER_FILE="simple-server.js"
  echo -e "${GREEN}Using CommonJS simple-server.js${NC}"
else
  echo -e "${RED}No server file found${NC}"
  exit 1
fi

# Start the server
echo -e "${GREEN}Starting Code Snippet Server on port 8080...${NC}"
$NODE $SERVER_FILE