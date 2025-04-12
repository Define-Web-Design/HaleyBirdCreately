#!/bin/bash

# Simple starter script for the Creately application

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}             Creately Application              ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check for server.js
if [ -f "server.js" ]; then
  echo -e "${GREEN}Found server.js - starting the application...${NC}"
  
  # Load environment variables from .env if it exists
  if [ -f .env ]; then
    echo -e "${CYAN}Loading environment from .env file...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
  else
    echo -e "${YELLOW}No .env file found. Using system environment variables.${NC}"
  fi
  
  # Check if we have a node command
  if command -v node &>/dev/null; then
    echo -e "${GREEN}Using node to start the server...${NC}"
    node server.js
  else
    # Try to use npm
    if command -v npm &>/dev/null; then
      echo -e "${YELLOW}Node command not found, trying npm start...${NC}"
      npm start
    else
      echo -e "${RED}Error: Neither node nor npm commands are available.${NC}"
      echo -e "${RED}Please make sure Node.js is installed.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${RED}Error: server.js not found!${NC}"
  echo -e "${RED}Please make sure you're in the correct directory.${NC}"
  exit 1
fi