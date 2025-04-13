#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Using Node.js from node_bin directory${NC}"

# Make node binaries executable
chmod +x ./node_bin/node
chmod +x ./node_bin/npm

echo -e "${CYAN}Starting Code Snippet Server...

   ______                __       __          
  / ____/_______  ____ _/ /____  / /_  __     
 / /   / ___/ _ \/ __ \`/ __/ _ \/ / / / /  
/ /___/ /  /  __/ /_/ / /_/  __/ / /_/ /      
\____/_/   \___/\__,_/\__/\___/_/\__, /  
                                 /____/        
                                              
  Code Snippet Server - Workflow Runner         
"

echo -e "${YELLOW}Setting up environment..."

# Create necessary directories
if [ ! -d "public" ]; then
  mkdir -p public
fi

if [ ! -d "public/view" ]; then
  mkdir -p public/view
fi

if [ ! -d "logs" ]; then
  mkdir -p logs
fi

echo -e "${GREEN}Created necessary directories"

# Start the server
echo "Starting Code Snippet Server on port 8080..."
./node_bin/node server.js

# Keep the workflow alive
while true; do
  sleep 10
done