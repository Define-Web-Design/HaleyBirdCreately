#!/bin/bash

# Creately Application Runner
# This script checks the environment and starts the application using the best method

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}${BOLD}================================================${NC}"
echo -e "${BLUE}${BOLD}             Creately Application              ${NC}"
echo -e "${BLUE}${BOLD}================================================${NC}"
echo ""

# Load environment variables from .env if it exists
if [ -f .env ]; then
  echo -e "${GREEN}Loading environment from .env file...${NC}"
  export $(cat .env | grep -v '^#' | xargs)
else
  echo -e "${YELLOW}No .env file found. Using system environment variables.${NC}"
fi

# Check API keys
echo -e "${CYAN}Checking API keys...${NC}"

# Check Mistral API Key
if [ -z "$MISTRAL_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Warning: MISTRAL_API_KEY is not set.${NC}"
  echo -e "${YELLOW}    AI chat features will be disabled.${NC}"
else
  echo -e "${GREEN}✅ MISTRAL_API_KEY is configured${NC}"
fi

# Check Codestral API Key
if [ -z "$CODESTRAL_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Warning: CODESTRAL_API_KEY is not set.${NC}"
  echo -e "${YELLOW}    Code assistance features will be disabled.${NC}"
else
  echo -e "${GREEN}✅ CODESTRAL_API_KEY is configured${NC}"
fi

# Check OpenAI API Key
if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Warning: OPENAI_API_KEY is not set.${NC}"
  echo -e "${YELLOW}    AI palette generation will be disabled.${NC}"
else
  echo -e "${GREEN}✅ OPENAI_API_KEY is configured${NC}"
fi

# Check if any AI keys are missing and offer to set them up
if [ -z "$MISTRAL_API_KEY" ] || [ -z "$CODESTRAL_API_KEY" ] || [ -z "$OPENAI_API_KEY" ]; then
  echo -e ""
  echo -e "${YELLOW}Some AI API keys are missing. Would you like to set them up now?${NC}"
  read -p "Run setup-ai-keys.js? (y/n): " answer
  
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo -e "${CYAN}Running AI keys setup utility...${NC}"
    node setup-ai-keys.js
    
    # Reload environment
    if [ -f .env ]; then
      echo -e "${GREEN}Reloading environment from .env file...${NC}"
      export $(cat .env | grep -v '^#' | xargs)
    fi
  else
    echo -e "${YELLOW}Skipping API key setup. Some AI features will be limited.${NC}"
  fi
fi

echo ""
echo -e "${CYAN}Starting Creately application...${NC}"

# Check if the enhanced starter script exists and is executable
if [ -x "./start-app.js" ]; then
  echo -e "${GREEN}Using enhanced JavaScript starter...${NC}"
  node start-app.js
  exit $?
elif [ -x "./start-app.sh" ]; then
  echo -e "${GREEN}Using enhanced shell starter...${NC}"
  ./start-app.sh
  exit $?
elif [ -x "./start.sh" ]; then
  echo -e "${YELLOW}Using basic shell starter...${NC}"
  ./start.sh
  exit $?
elif [ -f "./server.js" ]; then
  echo -e "${YELLOW}Using simple node starter...${NC}"
  node server.js
  exit $?
elif [ -f "./simple_server.py" ]; then
  echo -e "${YELLOW}Using Python fallback server...${NC}"
  python3 simple_server.py
  exit $?
else
  echo -e "${RED}${BOLD}Error: No suitable starter script found!${NC}"
  echo -e "${RED}Please make sure one of the following files exists:${NC}"
  echo -e "${RED}- start-app.js${NC}"
  echo -e "${RED}- start-app.sh${NC}"
  echo -e "${RED}- start.sh${NC}"
  echo -e "${RED}- server.js${NC}"
  echo -e "${RED}- simple_server.py${NC}"
  exit 1
fi