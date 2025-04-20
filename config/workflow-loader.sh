#!/bin/bash
# Workflow Configuration Loader
# This script provides common functionality for loading workflow configurations
# Can be sourced by other scripts using: source config/workflow-loader.sh

# Ensure the script exits on error
set -e

# Colors for terminal output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export NC='\033[0m' # No Color

# Define log levels
export LOG_LEVEL_DEBUG=0
export LOG_LEVEL_INFO=1
export LOG_LEVEL_WARN=2
export LOG_LEVEL_ERROR=3

# Default log level (can be overridden by environment variable)
export WORKFLOW_LOG_LEVEL=${WORKFLOW_LOG_LEVEL:-$LOG_LEVEL_INFO}

# Timestamp format
export TIMESTAMP_FORMAT="%Y-%m-%d %H:%M:%S"

# Ensure logs directory exists
mkdir -p logs

# Log file path
export WORKFLOW_LOG_FILE="logs/workflow-manager.log"

# Function to log messages to file with timestamp and level
log_to_file() {
  local level="$1"
  local message="$2"
  local timestamp
  timestamp=$(date +"$TIMESTAMP_FORMAT")
  echo "[$timestamp] [$level] $message" >> "$WORKFLOW_LOG_FILE"
}

# Log functions with different levels
log_debug() {
  if [[ $WORKFLOW_LOG_LEVEL -le $LOG_LEVEL_DEBUG ]]; then
    echo -e "${CYAN}DEBUG:${NC} $1"
  fi
  log_to_file "DEBUG" "$1"
}

log_info() {
  if [[ $WORKFLOW_LOG_LEVEL -le $LOG_LEVEL_INFO ]]; then
    echo -e "${GREEN}INFO:${NC} $1"
  fi
  log_to_file "INFO" "$1"
}

log_warn() {
  if [[ $WORKFLOW_LOG_LEVEL -le $LOG_LEVEL_WARN ]]; then
    echo -e "${YELLOW}WARNING:${NC} $1"
  fi
  log_to_file "WARNING" "$1"
}

log_error() {
  if [[ $WORKFLOW_LOG_LEVEL -le $LOG_LEVEL_ERROR ]]; then
    echo -e "${RED}ERROR:${NC} $1"
  fi
  log_to_file "ERROR" "$1"
}

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

# Function to load workflow configuration
load_workflow_config() {
  local config_file="${1:-workflow-config.json}"
  
  if ! file_exists "$config_file"; then
    log_error "Workflow configuration file not found: $config_file"
    return 1
  fi
  
  log_debug "Loading workflow configuration from $config_file"
  
  # Check if jq is available
  if command_exists jq; then
    log_debug "Using jq to parse JSON"
    
    # Load configuration using jq
    export WORKFLOWS_COUNT=$(jq '.workflows | length' "$config_file")
    export DEFAULT_WORKFLOW=$(jq -r '.defaultWorkflow // "development"' "$config_file")
    export DEFAULT_NODE_ENV=$(jq -r '.defaultNodeEnv // "development"' "$config_file")
    export FALLBACK_ENABLED=$(jq -r '.fallbackEnabled // "true"' "$config_file")
    
    log_debug "Found $WORKFLOWS_COUNT workflows, default: $DEFAULT_WORKFLOW"
  else
    log_warn "jq not found, using fallback parsing method"
    
    # Fallback to grep/sed
    export DEFAULT_WORKFLOW=$(grep -o '"defaultWorkflow"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | sed 's/.*: *"\([^"]*\)".*/\1/' || echo "development")
    export DEFAULT_NODE_ENV=$(grep -o '"defaultNodeEnv"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | sed 's/.*: *"\([^"]*\)".*/\1/' || echo "development")
    export FALLBACK_ENABLED=$(grep -o '"fallbackEnabled"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | sed 's/.*: *"\([^"]*\)".*/\1/' || echo "true")
    
    # Count workflows by counting opening braces in the workflows array
    export WORKFLOWS_COUNT=$(grep -o '{' "$config_file" | wc -l)
    # Adjust count to account for the outer object
    WORKFLOWS_COUNT=$((WORKFLOWS_COUNT - 1))
    
    log_debug "Found approximately $WORKFLOWS_COUNT workflows, default: $DEFAULT_WORKFLOW"
  fi
  
  return 0
}

# Function to get workflow command by name
get_workflow_command() {
  local workflow_name="$1"
  local config_file="${2:-workflow-config.json}"
  
  if [[ -z "$workflow_name" ]]; then
    log_error "No workflow name provided"
    return 1
  fi
  
  log_debug "Getting command for workflow: $workflow_name"
  
  # Check if jq is available
  if command_exists jq; then
    # Find the workflow by name and get its command
    local command
    command=$(jq -r --arg name "$workflow_name" '.workflows[] | select(.name == $name) | .command // ""' "$config_file")
    
    if [[ -z "$command" ]]; then
      log_error "Workflow not found: $workflow_name"
      return 1
    fi
    
    echo "$command"
  else
    log_warn "jq not found, using fallback parsing method"
    
    # Extract a section that contains the workflow name
    local section
    section=$(grep -A 10 "\"name\"[[:space:]]*:[[:space:]]*\"$workflow_name\"" "$config_file")
    
    if [[ -z "$section" ]]; then
      log_error "Workflow not found: $workflow_name"
      return 1
    fi
    
    # Extract the command from the section
    local command
    command=$(echo "$section" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    
    if [[ -z "$command" ]]; then
      log_error "Command not found for workflow: $workflow_name"
      return 1
    fi
    
    echo "$command"
  fi
  
  return 0
}

# Function to get workflow description by name
get_workflow_description() {
  local workflow_name="$1"
  local config_file="${2:-workflow-config.json}"
  
  if [[ -z "$workflow_name" ]]; then
    log_error "No workflow name provided"
    return 1
  fi
  
  log_debug "Getting description for workflow: $workflow_name"
  
  # Check if jq is available
  if command_exists jq; then
    # Find the workflow by name and get its description
    local description
    description=$(jq -r --arg name "$workflow_name" '.workflows[] | select(.name == $name) | .description // ""' "$config_file")
    
    if [[ -z "$description" ]]; then
      log_warn "Description not found for workflow: $workflow_name"
      echo "No description available"
      return 0
    fi
    
    echo "$description"
  else
    log_warn "jq not found, using fallback parsing method"
    
    # Extract a section that contains the workflow name
    local section
    section=$(grep -A 10 "\"name\"[[:space:]]*:[[:space:]]*\"$workflow_name\"" "$config_file")
    
    if [[ -z "$section" ]]; then
      log_error "Workflow not found: $workflow_name"
      return 1
    fi
    
    # Extract the description from the section
    local description
    description=$(echo "$section" | grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    
    if [[ -z "$description" ]]; then
      log_warn "Description not found for workflow: $workflow_name"
      echo "No description available"
      return 0
    fi
    
    echo "$description"
  fi
  
  return 0
}

# Function to list all available workflows
list_workflows() {
  local config_file="${1:-workflow-config.json}"
  
  log_debug "Listing all workflows"
  
  # Check if jq is available
  if command_exists jq; then
    # Use jq to extract all workflow names and descriptions
    jq -r '.workflows[] | "\(.name): \(.description // "No description")"' "$config_file"
  else
    log_warn "jq not found, using fallback parsing method"
    
    # Use grep to find all workflow names
    local names
    names=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$config_file" | sed 's/.*: *"\([^"]*\)".*/\1/')
    
    # Print each name
    while IFS= read -r name; do
      local description
      description=$(get_workflow_description "$name" "$config_file")
      echo "$name: $description"
    done <<< "$names"
  fi
  
  return 0
}

# Function to validate environment
validate_environment() {
  log_debug "Validating environment"
  
  # Check if Node.js is installed
  if ! command_exists node; then
    log_warn "Node.js not found in PATH"
    
    # Check if we have a local Node.js binary
    if file_exists "node_bin/node"; then
      log_info "Using local Node.js binary"
      export PATH="$PWD/node_bin:$PATH"
      
      if ! command_exists node; then
        log_error "Local Node.js binary not executable"
        return 1
      fi
    else
      log_error "Node.js not found and no local binary available"
      return 1
    fi
  fi
  
  # Check if npm is installed
  if ! command_exists npm; then
    log_warn "npm not found in PATH"
    
    # Check if we have a local npm binary
    if file_exists "node_bin/npm"; then
      log_info "Using local npm binary"
      export PATH="$PWD/node_bin:$PATH"
      
      if ! command_exists npm; then
        log_error "Local npm binary not executable"
        return 1
      fi
    else
      log_error "npm not found and no local binary available"
      return 1
    fi
  fi
  
  log_info "Environment validation successful"
  return 0
}

# Function to start the fallback server
start_fallback_server() {
  log_warn "Starting fallback server"
  
  if [[ "$FALLBACK_ENABLED" != "true" ]]; then
    log_warn "Fallback server is disabled in configuration"
    return 1
  fi
  
  if ! file_exists "simple-server.cjs"; then
    log_error "Fallback server not found: simple-server.cjs"
    return 1
  fi
  
  # Ensure public directory exists
  mkdir -p public
  
  # Create index.html if it doesn't exist
  if ! file_exists "public/index.html"; then
    cat > "public/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fallback Server</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    h1 {
      color: #555;
    }
    h2 {
      color: #777;
    }
    pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #0069d9;
    }
  </style>
</head>
<body>
  <h1>Fallback Server Running</h1>
  
  <div class="warning">
    <strong>Warning:</strong> This fallback server is running because the main application server failed to start.
  </div>
  
  <h2>What happened?</h2>
  <p>
    The main application encountered an error during startup. This could be due to:
  </p>
  <ul>
    <li>Missing dependencies</li>
    <li>Build errors</li>
    <li>Configuration issues</li>
    <li>Port conflicts</li>
  </ul>
  
  <h2>What to do next?</h2>
  <p>
    Check the application logs for more information:
  </p>
  <pre><code>cat logs/workflow-manager.log</code></pre>
  
  <p>
    You can also run the diagnostics tool to identify issues:
  </p>
  <pre><code>./diagnostics.sh</code></pre>
  
  <p>
    <a href="/" class="button">Refresh</a>
  </p>
</body>
</html>
EOF
  fi
  
  # Start the fallback server
  log_info "Starting fallback server: simple-server.cjs"
  node simple-server.cjs
  
  return 0
}

# Function to handle workflow execution
execute_workflow() {
  local workflow_name="$1"
  local config_file="${2:-workflow-config.json}"
  
  log_info "Executing workflow: $workflow_name"
  
  # Get workflow command
  local command
  command=$(get_workflow_command "$workflow_name" "$config_file")
  
  if [[ $? -ne 0 || -z "$command" ]]; then
    log_error "Failed to get command for workflow: $workflow_name"
    return 1
  fi
  
  log_info "Running command: $command"
  
  # Execute the command
  eval "$command"
  local result=$?
  
  if [[ $result -ne 0 ]]; then
    log_error "Workflow failed with exit code: $result"
    return $result
  fi
  
  log_info "Workflow completed successfully"
  return 0
}

# Print a banner message
print_banner() {
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
}

# Load configuration if the script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  print_banner
  log_info "This script is meant to be sourced by other scripts"
  log_info "Example: source config/workflow-loader.sh"
  exit 1
fi

# Log that the loader was successfully sourced
log_debug "Workflow loader successfully sourced"