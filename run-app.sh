
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
echo "  Consolidated Workflow Manager"
echo -e "${NC}"

# Version
VERSION="1.0.0"

# Path to workflow config
CONFIG_FILE="workflow-config.json"

# Check if jq is available
JQ_AVAILABLE=false
if command -v jq &> /dev/null; then
  JQ_AVAILABLE=true
fi

# Log file
LOG_FILE="logs/workflow-manager.log"

# Ensure necessary directories exist
mkdir -p logs
mkdir -p public
mkdir -p public/view

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
export PATH="$PATH:./node_bin"
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

# Function to parse JSON without jq
parse_json_value() {
  local json_file=$1
  local key=$2
  local regex="\"$key\"[[:space:]]*:[[:space:]]*\"([^\"]*)\""
  
  if [[ -f $json_file ]]; then
    if [[ $JQ_AVAILABLE == true ]]; then
      jq -r ".$key" "$json_file" 2>/dev/null || echo ""
    else
      # Fallback to grep and sed if jq not available
      grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$json_file" | 
        sed -E "s/$regex/\\1/" 2>/dev/null || echo ""
    fi
  else
    echo ""
  fi
}

# Function to list available workflows
list_workflows() {
  print_section "Available Workflows"
  
  if [[ $JQ_AVAILABLE == true && -f $CONFIG_FILE ]]; then
    echo -e "${BOLD}ID  | Name                | Description${NC}"
    echo "----|---------------------|-------------------------------"
    jq -r '.workflows | to_entries[] | "\(.key+1)   | \(.value.name)      | \(.value.description)"' "$CONFIG_FILE"
  else
    # Fallback method if jq is not available
    echo -e "${YELLOW}Basic workflow options (install jq for more details):${NC}"
    echo -e "1. Development Mode - Start with live reloading"
    echo -e "2. Production Build - Build and run in production mode"
    echo -e "3. Deploy Application - Build and deploy for production"
    echo -e "4. Database Management - Update database schema"
  fi
  
  echo ""
}

# Function to get default workflow
get_default_workflow() {
  if [[ $JQ_AVAILABLE == true && -f $CONFIG_FILE ]]; then
    local default=$(jq -r '.defaultWorkflow' "$CONFIG_FILE")
    echo "$default"
  else
    echo "Development Mode"
  fi
}

# Install dependencies function
install_dependencies() {
  log "${YELLOW}Installing dependencies...${NC}"
  
  if command -v npm &> /dev/null; then
    npm install || npm install --legacy-peer-deps
  elif [ -f "./node_bin/npm" ]; then
    chmod +x ./node_bin/npm
    ./node_bin/npm install || ./node_bin/npm install --legacy-peer-deps
  else
    log "${YELLOW}npm not found, skipping dependency installation${NC}"
    return 1
  fi
  
  return 0
}

# Function to run a specific workflow
run_workflow() {
  local workflow_name=$1
  local workflow_cmd=""
  local workflow_env=""
  
  print_section "Running workflow: $workflow_name"
  
  # Check for dependencies
  if [ ! -d "node_modules" ]; then
    install_dependencies
  fi
  
  # Get workflow command based on name
  case "$workflow_name" in
    "Development Mode"|"1")
      workflow_cmd="npm run dev"
      export NODE_ENV="development"
      ;;
    "Production Build"|"2")
      workflow_cmd="npm run build && NODE_ENV=production node dist/index.js"
      export NODE_ENV="production"
      ;;
    "Deploy Application"|"3")
      # Use deploy.sh if exists, otherwise fallback
      if [ -f "deploy.sh" ]; then
        chmod +x deploy.sh
        workflow_cmd="./deploy.sh"
      else
        workflow_cmd="npm run build && NODE_ENV=production node dist/index.js"
      fi
      export NODE_ENV="production"
      ;;
    "Database Management"|"4")
      workflow_cmd="npm run db:push"
      ;;
    *)
      # Default to dev mode if unknown workflow
      log "${YELLOW}Unknown workflow: $workflow_name. Defaulting to Development Mode.${NC}"
      workflow_cmd="npm run dev"
      export NODE_ENV="development"
      ;;
  esac
  
  # Execute the workflow command
  log "${GREEN}Executing: $workflow_cmd${NC}"
  eval "$workflow_cmd" || {
    log "${RED}Workflow failed, attempting fallback...${NC}"
    # Fallback handling
    if [ -f "simple-server.cjs" ]; then
      log "${YELLOW}Starting simple-server.cjs as fallback...${NC}"
      $NODE simple-server.cjs
    elif [ -f "simple-server.js" ]; then
      log "${YELLOW}Starting simple-server.js as fallback...${NC}"
      $NODE simple-server.js
    elif [ -f "index.js" ]; then
      log "${YELLOW}Starting index.js as fallback...${NC}"
      $NODE index.js
    else
      log "${RED}No fallback server files found!${NC}"
      exit 1
    fi
  }
}

# Main script execution starts here
print_section "Workflow Manager v${VERSION}"

# Check if workflow name is provided as an argument
if [ -n "$1" ]; then
  WORKFLOW_NAME="$1"
else
  # If no argument, use from environment or default
  WORKFLOW_NAME=${WORKFLOW_NAME:-$(get_default_workflow)}
  
  # In interactive mode, show the list of workflows
  if [ -t 1 ]; then # Check if stdout is a terminal
    list_workflows
    
    # Prompt for workflow selection
    echo -e "Select workflow [${BOLD}${WORKFLOW_NAME}${NC}]: \c"
    read -r selection
    
    # If user entered something, use that instead
    if [ -n "$selection" ]; then
      WORKFLOW_NAME="$selection"
    fi
  fi
fi

# Run the selected workflow
run_workflow "$WORKFLOW_NAME"
