#!/bin/bash
# Creately Application Runner
# This script provides a user-friendly way to start the Creately application

# Set terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to display timestamp
timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

# Function to display a status message
status_message() {
  local type=$1
  local message=$2
  local color=""
  local icon=""
  
  case $type in
    "info")
      color=$CYAN
      icon="ℹ️"
      ;;
    "success")
      color=$GREEN
      icon="✅"
      ;;
    "warning")
      color=$YELLOW
      icon="⚠️"
      ;;
    "error")
      color=$RED
      icon="❌"
      ;;
    *)
      color=$NC
      icon=""
      ;;
  esac
  
  echo -e "${color}${icon} [$(timestamp)] ${message}${NC}"
}

# Print banner
echo -e "${BLUE}"
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃                                                                   ┃"
echo -e "┃   ${CYAN}${BOLD}Creately Application${NC}${BLUE}                                        ┃"
echo -e "┃   ${YELLOW}Advanced Intelligent Collaborative Platform${BLUE}                   ┃"
echo "┃                                                                   ┃"
echo -e "┃   ${CYAN}Version 1.0.0${BLUE}                       ${PURPLE}https://creately.app${BLUE}    ┃"
echo "┃                                                                   ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo -e "${NC}"

# System checks section
echo -e "${BOLD}System Checks${NC}"
echo "-------------------------------------"

# Check Node.js installation
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  status_message "success" "Node.js ${NODE_VERSION} installed"
  
  # Check npm installation
  if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    status_message "success" "npm ${NPM_VERSION} installed"
  else
    status_message "warning" "npm not found. Some features may not work correctly."
  fi
else
  status_message "error" "Node.js not found. Application may not run correctly."
fi

# Check for key directories and files
if [ -d "./server" ]; then
  status_message "success" "Server directory found"
else
  status_message "error" "Server directory not found. Application may not start properly."
fi

if [ -d "./client" ]; then
  status_message "success" "Client directory found"
else
  status_message "warning" "Client directory not found. Frontend may not be available."
fi

if [ -f "./package.json" ]; then
  status_message "success" "package.json found"
else
  status_message "warning" "package.json not found. Application may be using a non-standard configuration."
fi

echo ""
echo -e "${BOLD}Environment Configuration${NC}"
echo "-------------------------------------"

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  status_message "warning" "No DATABASE_URL found. Will use in-memory database."
else
  status_message "success" "Database URL found and configured"
fi

# Check for required API keys
if [ -z "$OPENAI_API_KEY" ]; then
  status_message "warning" "No OPENAI_API_KEY found. AI-powered palette generation will be limited."
else
  status_message "success" "OpenAI API key configured"
fi

if [ -z "$MISTRAL_API_KEY" ]; then
  status_message "warning" "No MISTRAL_API_KEY found. Alternative AI features will be limited."
else
  status_message "success" "Mistral API key configured"
fi

if [ -z "$CODESTRAL_API_KEY" ]; then
  status_message "warning" "No CODESTRAL_API_KEY found. Code completion features will be limited."
else
  status_message "success" "Codestral API key configured"
fi

# Check authentication configuration
if [ "$BYPASS_AUTH" = "true" ]; then
  status_message "info" "Authentication bypass is enabled (development mode)"
else
  status_message "success" "Authentication is enabled"
fi

# Ensure scripts are executable
echo ""
echo -e "${BOLD}Preparing Startup Scripts${NC}"
echo "-------------------------------------"

if [ ! -x "./start.sh" ]; then
  status_message "info" "Making start.sh executable..."
  chmod +x ./start.sh
  if [ $? -eq 0 ]; then
    status_message "success" "start.sh is now executable"
  else
    status_message "error" "Failed to make start.sh executable"
  fi
else
  status_message "success" "start.sh is executable"
fi

if [ -f "./start-app.js" ]; then
  status_message "success" "Enhanced starter script found"
else
  status_message "warning" "Enhanced starter script not found. Using standard startup method."
fi

# Check for fallback server
if [ -f "./server/simple-server.js" ]; then
  status_message "success" "Fallback server available"
else
  status_message "warning" "No fallback server found. If main server fails, application will not run."
fi

# Final preparations
echo ""
echo -e "${BOLD}Starting Application${NC}"
echo "-------------------------------------"
status_message "info" "Starting Creately application on port ${PORT:-3000}..."

# Start the application
echo ""
./start.sh

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  status_message "error" "Application exited with code $EXIT_CODE"
  echo ""
  echo -e "${RED}If you're experiencing issues, try running 'node start-app.js' directly${NC}"
else
  echo ""
  status_message "success" "Application has terminated normally"
fi

exit $EXIT_CODE