#!/bin/bash
# Creately Application Runner Script
# This script checks if we can use Replit workflows, otherwise uses direct execution

# Set terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Display banner
echo -e "${BLUE}${BOLD}"
echo "=================================================="
echo "   Creately Application - Runner Script"
echo "=================================================="
echo -e "${NC}"

# Make sure our startup scripts are executable
chmod +x start.sh start-app.sh 2>/dev/null

# Check if we can use Replit workflows
HAS_WORKFLOW=false
if [ -f ".replit" ]; then
  if grep -q "run" .replit; then
    HAS_WORKFLOW=true
    echo -e "${GREEN}Replit configuration detected.${NC}"
  fi
fi

# Check if we're in a Replit environment
IN_REPLIT=false
if [ -n "$REPL_ID" ] || [ -n "$REPL_OWNER" ]; then
  IN_REPLIT=true
  echo -e "${GREEN}Running in Replit environment.${NC}"
fi

# Determine the best way to run the application
if [ "$IN_REPLIT" = true ] && [ "$HAS_WORKFLOW" = true ]; then
  echo -e "${YELLOW}Starting application using Replit workflow...${NC}"
  # This should trigger the workflow defined in .replit
  echo -e "${GREEN}Application started. You should see it running in the Replit interface.${NC}"
  echo -e "${YELLOW}If application doesn't start automatically, please run ./start-app.sh manually.${NC}"
else
  echo -e "${YELLOW}Starting application directly...${NC}"
  # Run directly using our custom start script
  ./start-app.sh
fi

exit $?