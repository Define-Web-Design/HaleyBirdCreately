
#!/bin/bash

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
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
echo "  Unified Workflow Manager v1.0"
echo -e "${NC}"

# Ensure necessary directories exist
mkdir -p logs
mkdir -p public
mkdir -p public/view

# Log file
LOG_FILE="logs/workflow-manager.log"

# Function to log messages
log() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[${timestamp}] $1" >> "${LOG_FILE}"
  echo -e "$1"
}

# Function to print a section header
print_section() {
  echo -e "\n${BLUE}${BOLD}=== $1 ===${NC}\n"
}

# Set environment variables
export PATH="./node_bin:$PATH:$HOME/n/bin:$HOME/.n/bin"
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}

# Detect Node.js
if command -v node &> /dev/null; then
  log "${GREEN}Using system Node.js${NC}"
  NODE="node"
elif [ -f "./node_bin/node" ]; then
  log "${GREEN}Using Node.js from node_bin directory${NC}"
  chmod +x ./node_bin/node
  NODE="./node_bin/node"
else
  log "${RED}No Node.js installation found!${NC}"
  log "Please install Node.js or create a node_bin directory with Node.js binaries."
  exit 1
fi

# Install dependencies function
install_dependencies() {
  log "${YELLOW}Installing dependencies...${NC}"
  
  if [ ! -d "node_modules" ]; then
    if command -v npm &> /dev/null; then
      npm install || npm install --legacy-peer-deps
    elif [ -f "./node_bin/npm" ]; then
      chmod +x ./node_bin/npm
      ./node_bin/npm install || ./node_bin/npm install --legacy-peer-deps
    else
      log "${YELLOW}npm not found, skipping dependency installation${NC}"
      return 1
    fi
  else
    log "${GREEN}Dependencies already installed${NC}"
  fi
  
  return 0
}

# Function to run development mode
run_development() {
  print_section "Running Development Mode"
  export NODE_ENV="development"
  log "${GREEN}Starting application in development mode...${NC}"
  npm run dev
}

# Function to run production build
run_production() {
  print_section "Running Production Build"
  export NODE_ENV="production"
  log "${GREEN}Building and starting application in production mode...${NC}"
  npm run build && NODE_ENV=production $NODE dist/index.js
}

# Function to run code snippet server
run_snippet_server() {
  print_section "Running Code Snippet Server"
  log "${GREEN}Starting Code Snippet Server...${NC}"
  
  if [ -f "simple-server.cjs" ]; then
    $NODE simple-server.cjs
  elif [ -f "snippet-server.cjs" ]; then
    $NODE snippet-server.cjs
  elif [ -f "server.js" ]; then
    $NODE server.js
  else
    log "${RED}No snippet server file found!${NC}"
    exit 1
  fi
}

# Function to handle deployment
run_deployment() {
  print_section "Deploying Application"
  log "${GREEN}Building for production...${NC}"
  npm run build
  
  log "${GREEN}Starting production server...${NC}"
  export NODE_ENV=production
  $NODE dist/index.js
}

# Function to run database management
run_database_management() {
  print_section "Database Management"
  log "${GREEN}Updating database schema...${NC}"
  npm run db:push
}

# Function for emergency server
run_emergency_server() {
  print_section "Emergency Server"
  log "${RED}Starting emergency fallback server...${NC}"
  
  PORT=${PORT:-3000}
  
  $NODE -e "
    const http = require('http');
    const fs = require('fs');
    const path = require('path');
    
    const server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(\`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset='UTF-8'>
            <title>Creately Emergency Server</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Creately Emergency Server</h1>
            <div class='card'>
              <p>The main application server is currently unavailable.</p>
              <p>Please check the server logs for more information.</p>
            </div>
          </body>
        </html>
      \`);
    });
    
    server.listen(${PORT}, '0.0.0.0', () => {
      console.log('Emergency server running at http://0.0.0.0:${PORT}');
    });
  "
}

# Show list of workflows
show_workflows() {
  print_section "Available Workflows"
  
  echo -e "1. ${BOLD}Development Mode${NC} - Start the application in development mode with live reloading"
  echo -e "2. ${BOLD}Production Build${NC} - Build and run the application in production mode"
  echo -e "3. ${BOLD}Code Snippet Server${NC} - Run the simple code snippet server"
  echo -e "4. ${BOLD}Deploy Application${NC} - Build and deploy the application"
  echo -e "5. ${BOLD}Database Management${NC} - Update database schema"
  echo -e "6. ${BOLD}Emergency Server${NC} - Run a minimal emergency server"
  echo ""
}

# Main workflow execution
main() {
  # Install dependencies first
  install_dependencies
  
  # If workflow is specified as an argument
  if [ -n "$1" ]; then
    WORKFLOW="$1"
  else
    # Show workflows and prompt for selection
    show_workflows
    
    # Default workflow
    WORKFLOW=${WORKFLOW_NAME:-"Development Mode"}
    
    # Prompt for workflow selection
    echo -e "Select workflow [${BOLD}${WORKFLOW}${NC}]: \c"
    read -r selection
    
    # If user entered something, use that
    if [ -n "$selection" ]; then
      case "$selection" in
        1) WORKFLOW="Development Mode" ;;
        2) WORKFLOW="Production Build" ;;
        3) WORKFLOW="Code Snippet Server" ;;
        4) WORKFLOW="Deploy Application" ;;
        5) WORKFLOW="Database Management" ;;
        6) WORKFLOW="Emergency Server" ;;
        *) WORKFLOW="$selection" ;;
      esac
    fi
  fi
  
  # Run the selected workflow
  log "${GREEN}Running workflow: ${WORKFLOW}${NC}"
  
  case "$WORKFLOW" in
    "Development Mode"|"1")
      run_development || run_emergency_server
      ;;
    "Production Build"|"2")
      run_production || run_emergency_server
      ;;
    "Code Snippet Server"|"3")
      run_snippet_server || run_emergency_server
      ;;
    "Deploy Application"|"4")
      run_deployment || run_emergency_server
      ;;
    "Database Management"|"5")
      run_database_management
      ;;
    "Emergency Server"|"6")
      run_emergency_server
      ;;
    *)
      log "${RED}Unknown workflow: $WORKFLOW${NC}"
      show_workflows
      exit 1
      ;;
  esac
}

# Execute main function
main "$@"
