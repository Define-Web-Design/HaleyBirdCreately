#!/bin/bash
# Consolidated Workflow Manager v2.0.0
# This script manages all workflows for the application

# Ensure the script exits on error
set -e

# Load the shared configuration loader
if [[ -f "config/workflow-loader.sh" ]]; then
  source config/workflow-loader.sh
else
  echo "Error: config/workflow-loader.sh not found. Cannot continue."
  exit 1
fi

# Print banner
print_banner

# Function to show usage
show_usage() {
  echo -e "${BLUE}=== Workflow Manager v$(jq -r '.version // "1.0.0"' workflow-config.json) ===${NC}\n"
  echo "Usage: $0 [workflow_name]"
  echo ""
  echo "Available workflows:"
  list_workflows
  echo ""
  echo "Examples:"
  echo "  $0 development    # Run development workflow"
  echo "  $0 production     # Run production workflow"
  echo "  $0 database       # Run database schema updates"
  echo "  $0                # Show interactive menu"
  echo ""
}

# Function to show interactive menu
show_menu() {
  echo -e "${BLUE}=== Workflow Manager v$(jq -r '.version // "1.0.0"' workflow-config.json) ===${NC}\n"
  echo "Select a workflow to run:"
  echo ""
  
  # List all workflows with numbers
  local i=1
  while IFS=: read -r name description; do
    echo -e "  ${GREEN}$i)${NC} $name - $description"
    names[$i]=$name
    i=$((i+1))
  done < <(list_workflows)
  
  echo ""
  echo -e "  ${RED}q)${NC} Quit"
  echo ""
  
  # Get user input
  read -p "Enter your choice: " choice
  
  if [[ "$choice" == "q" ]]; then
    echo "Exiting..."
    exit 0
  fi
  
  if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -lt "$i" ]]; then
    selected_workflow=${names[$choice]}
    echo "Selected workflow: $selected_workflow"
    return 0
  else
    echo -e "${RED}Invalid choice.${NC}"
    return 1
  fi
}

# Check if workflow name is provided as an argument
if [[ -n "$1" ]]; then
  workflow_name="$1"
  log_info "Workflow specified via command line: $workflow_name"
else
  # If no workflow is specified, show menu and get user selection
  log_info "No workflow specified, showing interactive menu"
  
  # Initialize empty array for workflow names
  declare -A names
  
  # Keep showing the menu until a valid choice is made
  while true; do
    if show_menu; then
      workflow_name="$selected_workflow"
      break
    fi
  done
fi

# Load workflow configuration
log_info "Loading workflow configuration"
if ! load_workflow_config; then
  log_error "Failed to load workflow configuration"
  exit 1
fi

# Validate environment
log_info "Validating environment"
if ! validate_environment; then
  log_error "Environment validation failed"
  exit 1
fi

# Execute the workflow
log_info "Executing workflow: $workflow_name"
if ! execute_workflow "$workflow_name"; then
  log_error "Workflow failed: $workflow_name"
  
  # Start fallback server if enabled
  if [[ "$FALLBACK_ENABLED" == "true" ]]; then
    log_warn "Workflow failed, attempting fallback..."
    log_warn "Starting simple-server.cjs as fallback..."
    if ! start_fallback_server; then
      log_error "Fallback server failed to start"
      exit 1
    fi
  else
    log_info "Fallback server is disabled, exiting"
    exit 1
  fi
fi

exit 0