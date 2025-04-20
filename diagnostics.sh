#!/bin/bash
# Workflow System Diagnostics Tool
# This script helps diagnose issues with the workflow system

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print the header
echo -e "${CYAN}"
echo "   _____                __      __         ____  _                           __   _          "
echo "  / ___/______  ____ _/ /____ / /_  __   / __ \(_)___ _____ _____  _______/ /_ (_)_______ _"
echo "  \__ \/ ___/ / / / // __/ _ \/ / / / /  / / / / / __ \`/ __ \`/ __ \/ ___/ __ \/ / ___/ _ \`/"
echo " ___/ / /__/ /_/ / // /_/  __/ / /_/ /  / /_/ / / /_/ / /_/ / / / (__  ) / / / / /__/  __/"
echo "/____/\___/\__,_/_/\__/\___/_/\__, /  /_____/_/\__, /\__,_/_/ /_/____/_/ /_/_/\___/\___/ "
echo "                             /____/           /____/                                      "
echo -e "${NC}"

echo -e "${BLUE}=== Workflow System Diagnostics Tool ===${NC}\n"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a file exists
file_exists() {
  [[ -f "$1" ]]
}

# Function to check if a directory exists
dir_exists() {
  [[ -d "$1" ]]
}

# Function to check environment configuration
check_environment() {
  echo -e "${BLUE}Checking environment configuration...${NC}"
  
  # Check Node.js
  if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "  ${GREEN}✓${NC} Node.js is installed: ${NODE_VERSION}"
  else
    echo -e "  ${RED}✗${NC} Node.js is not installed or not in PATH"
  fi
  
  # Check npm
  if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "  ${GREEN}✓${NC} npm is installed: ${NPM_VERSION}"
  else
    echo -e "  ${RED}✗${NC} npm is not installed or not in PATH"
  fi
  
  # Check jq
  if command_exists jq; then
    JQ_VERSION=$(jq --version)
    echo -e "  ${GREEN}✓${NC} jq is installed: ${JQ_VERSION}"
  else
    echo -e "  ${YELLOW}!${NC} jq is not installed (will use grep/sed fallback)"
  fi
  
  # Check .env file
  if file_exists .env; then
    echo -e "  ${GREEN}✓${NC} .env file exists"
  else
    echo -e "  ${YELLOW}!${NC} .env file does not exist (will use defaults)"
  fi
  
  echo ""
}

# Function to check workflow configuration
check_workflow_config() {
  echo -e "${BLUE}Checking workflow configuration...${NC}"
  
  # Check workflow-config.json
  if file_exists workflow-config.json; then
    echo -e "  ${GREEN}✓${NC} workflow-config.json exists"
    
    # Check if it's valid JSON
    if command_exists jq && jq empty workflow-config.json 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} workflow-config.json is valid JSON"
      
      # Count workflows
      if command_exists jq; then
        WORKFLOW_COUNT=$(jq '.workflows | length' workflow-config.json)
        echo -e "  ${GREEN}✓${NC} Found ${WORKFLOW_COUNT} workflows in configuration"
      else
        echo -e "  ${YELLOW}!${NC} Can't count workflows (jq not available)"
      fi
    else
      echo -e "  ${RED}✗${NC} workflow-config.json contains invalid JSON"
    fi
  else
    echo -e "  ${RED}✗${NC} workflow-config.json does not exist"
  fi
  
  # Check shortcut scripts
  for script in dev.sh prod.sh deploy.sh db.sh; do
    if file_exists "$script"; then
      if [[ -x "$script" ]]; then
        echo -e "  ${GREEN}✓${NC} $script exists and is executable"
      else
        echo -e "  ${YELLOW}!${NC} $script exists but is not executable (run: chmod +x $script)"
      fi
    else
      echo -e "  ${RED}✗${NC} $script does not exist"
    fi
  done
  
  echo ""
}

# Function to check application files
check_application_files() {
  echo -e "${BLUE}Checking application files...${NC}"
  
  # Check package.json
  if file_exists package.json; then
    echo -e "  ${GREEN}✓${NC} package.json exists"
  else
    echo -e "  ${RED}✗${NC} package.json does not exist"
  fi
  
  # Check run-app.sh
  if file_exists run-app.sh; then
    if [[ -x run-app.sh ]]; then
      echo -e "  ${GREEN}✓${NC} run-app.sh exists and is executable"
    else
      echo -e "  ${YELLOW}!${NC} run-app.sh exists but is not executable (run: chmod +x run-app.sh)"
    fi
  else
    echo -e "  ${RED}✗${NC} run-app.sh does not exist"
  fi
  
  # Check fallback server
  if file_exists simple-server.cjs; then
    echo -e "  ${GREEN}✓${NC} simple-server.cjs (fallback server) exists"
  else
    echo -e "  ${RED}✗${NC} simple-server.cjs (fallback server) does not exist"
  fi
  
  # Check node_modules
  if dir_exists node_modules; then
    echo -e "  ${GREEN}✓${NC} node_modules directory exists"
  else
    echo -e "  ${YELLOW}!${NC} node_modules directory does not exist (run: npm install)"
  fi
  
  # Check public directory
  if dir_exists public; then
    echo -e "  ${GREEN}✓${NC} public directory exists"
  else
    echo -e "  ${YELLOW}!${NC} public directory does not exist (will be created on first run)"
  fi
  
  echo ""
}

# Function to check log files
check_logs() {
  echo -e "${BLUE}Checking log files...${NC}"
  
  # Check logs directory
  if dir_exists logs; then
    echo -e "  ${GREEN}✓${NC} logs directory exists"
    
    # Check workflow-manager.log
    if file_exists logs/workflow-manager.log; then
      LOG_SIZE=$(du -h logs/workflow-manager.log | cut -f1)
      echo -e "  ${GREEN}✓${NC} workflow-manager.log exists (size: ${LOG_SIZE})"
      
      # Show recent errors
      if command_exists grep; then
        ERROR_COUNT=$(grep -i "error" logs/workflow-manager.log | wc -l)
        if [[ $ERROR_COUNT -gt 0 ]]; then
          echo -e "  ${YELLOW}!${NC} Found ${ERROR_COUNT} error messages in log"
          echo -e "  ${YELLOW}!${NC} Most recent errors:"
          grep -i "error" logs/workflow-manager.log | tail -n 3 | sed 's/^/      /'
        else
          echo -e "  ${GREEN}✓${NC} No error messages found in log"
        fi
      fi
    else
      echo -e "  ${YELLOW}!${NC} workflow-manager.log does not exist (will be created on first run)"
    fi
  else
    echo -e "  ${YELLOW}!${NC} logs directory does not exist (will be created on first run)"
  fi
  
  echo ""
}

# Function to provide recommendations
provide_recommendations() {
  echo -e "${BLUE}Recommendations:${NC}"
  
  # Check if there are any serious issues
  local serious_issues=false
  
  if ! command_exists node; then
    serious_issues=true
    echo -e "  ${RED}•${NC} Install Node.js or ensure it's in your PATH"
  fi
  
  if ! file_exists workflow-config.json; then
    serious_issues=true
    echo -e "  ${RED}•${NC} Create workflow-config.json (see WORKFLOW.md for format)"
  fi
  
  if ! file_exists run-app.sh; then
    serious_issues=true
    echo -e "  ${RED}•${NC} Create run-app.sh script (see WORKFLOW.md)"
  fi
  
  # Check for executable permissions
  for script in run-app.sh dev.sh prod.sh deploy.sh db.sh; do
    if file_exists "$script" && ! [[ -x "$script" ]]; then
      echo -e "  ${YELLOW}•${NC} Make $script executable: chmod +x $script"
    fi
  done
  
  # Check if node_modules doesn't exist
  if ! dir_exists node_modules; then
    echo -e "  ${YELLOW}•${NC} Run 'npm install' to install dependencies"
  fi
  
  # If no serious issues, provide standard recommendations
  if [[ $serious_issues == false ]]; then
    echo -e "  ${GREEN}•${NC} All critical components are in place"
    echo -e "  ${GREEN}•${NC} Use ./dev.sh for development"
    echo -e "  ${GREEN}•${NC} Use ./prod.sh for production"
    echo -e "  ${GREEN}•${NC} See WORKFLOW.md for more details"
  fi
  
  echo ""
}

# Run all checks
check_environment
check_workflow_config
check_application_files
check_logs
provide_recommendations

echo -e "${BLUE}Diagnostics complete.${NC}"
echo -e "For more information, see ${CYAN}WORKFLOW.md${NC}"