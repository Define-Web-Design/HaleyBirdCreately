#!/bin/bash

# Control script for keep-alive and deployment

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print styled header
print_header() {
  echo -e "\n${BLUE}===== Creately Application Control =====${NC}"
  echo -e "${BLUE}Manage application, deployment, and keep-alive${NC}\n"
}

# Function to check keep-alive status
check_keep_alive() {
  echo -e "${YELLOW}Checking Keep-Alive Status:${NC}"
  
  # More reliable check using ps grep for all possible script names
  if ps aux | grep -E "[n]ode.*keep-alive|[n]ode.*never-sleep|[n]ode.*replit-keep-alive|[n]ode.*replit-ping" > /dev/null; then
    local PID=$(ps aux | grep -E "[n]ode.*keep-alive|[n]ode.*never-sleep|[n]ode.*replit-keep-alive|[n]ode.*replit-ping" | awk '{print $2}')
    echo -e "${GREEN}Keep-Alive is RUNNING (PID: $PID)${NC}"
    echo -e "${BLUE}Your dev URL will stay active 24/7${NC}"
    
    # Update PID file
    echo $PID > .never-sleep.pid
    
    # Get dashboard port
    local PORT=$(grep -o "Dashboard available at: http://localhost:[0-9]*" logs/never-sleep.log | tail -1 | grep -o "[0-9]*$" || echo "3333")
    echo -e "${YELLOW}Dashboard URL:${NC} http://localhost:${PORT}/"
    return 0
  else
    echo -e "${RED}Keep-Alive is NOT RUNNING${NC}"
    echo -e "${YELLOW}Your dev URL will go to sleep after inactivity${NC}"
    
    # Clean up PID file if exists
    if [ -f .never-sleep.pid ]; then
      rm .never-sleep.pid
    fi
    return 1
  fi
}

# Function to start keep-alive
start_keep_alive() {
  echo -e "${YELLOW}Starting Keep-Alive System...${NC}"
  
  if check_keep_alive > /dev/null; then
    echo -e "${GREEN}Keep-Alive system is already running.${NC}"
    return 0
  fi
  
  # Create logs directory if it doesn't exist
  mkdir -p logs
  
  # Start the keep-alive process using a more reliable method
  
  # Start our reliable CommonJS keep-alive script
  echo -e "${BLUE}Starting keep-alive process...${NC}"
  
  # Use the simplified CommonJS version for maximum compatibility
  NODE_PATH=$(which node)
  nohup $NODE_PATH replit-ping.js > logs/never-sleep.log 2>&1 &
  
  local PID=$!
  echo $PID > .never-sleep.pid
  
  # Wait a bit to make sure it starts properly
  sleep 3
  
  # Check if it's running
  if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}Keep-Alive system started successfully (PID: $PID)${NC}"
    echo -e "${BLUE}Your dev URL will now stay active 24/7${NC}"
    
    # Get dashboard port from logs
    local PORT=$(grep -o "Dashboard available at: http://localhost:[0-9]*" logs/never-sleep.log | tail -1 | grep -o "[0-9]*$" || echo "3333")
    echo -e "${YELLOW}Dashboard:${NC} http://localhost:${PORT}/"
    return 0
  else
    echo -e "${RED}Failed to start Keep-Alive system. Check logs for details.${NC}"
    return 1
  fi
}

# Function to stop keep-alive
stop_keep_alive() {
  echo -e "${YELLOW}Stopping Keep-Alive System...${NC}"
  
  # Find and kill keep-alive processes
  local PIDS=$(ps aux | grep -E "[n]ode.*keep-alive|[n]ode.*never-sleep|[n]ode.*replit-keep-alive|[n]ode.*replit-ping" | awk '{print $2}')
  
  if [ -z "$PIDS" ]; then
    echo -e "${YELLOW}No Keep-Alive processes found to stop.${NC}"
  else
    for PID in $PIDS; do
      echo -e "Killing process $PID..."
      kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null
    done
    echo -e "${GREEN}Keep-Alive system stopped.${NC}"
  fi
  
  # Clean up PID file
  if [ -f .never-sleep.pid ]; then
    rm .never-sleep.pid
  fi
}

# Function to deploy application
deploy_app() {
  echo -e "${YELLOW}Preparing to Deploy Application...${NC}"
  echo -e "${BLUE}Building application for production...${NC}"
  
  # Build the application
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Cannot deploy.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Build successful!${NC}"
  echo -e "${BLUE}Your application is now ready to deploy.${NC}"
  echo -e "${YELLOW}Go to the 'Deployments' tab in Replit to deploy your application.${NC}"
  echo -e "${BLUE}Or click the 'Deploy' button in the top right corner.${NC}"
  
  # We could automate deployment further here in the future
}

# Function to display help
show_help() {
  echo -e "${YELLOW}Available commands:${NC}"
  echo -e "  ${GREEN}start-keep-alive${NC}  - Start the Keep-Alive system"
  echo -e "  ${GREEN}stop-keep-alive${NC}   - Stop the Keep-Alive system"
  echo -e "  ${GREEN}status${NC}            - Check the status of the Keep-Alive system"
  echo -e "  ${GREEN}deploy${NC}            - Build and prepare the application for deployment"
  echo -e "  ${GREEN}help${NC}              - Show this help message"
}

# Main command handler
print_header

case "$1" in
  start-keep-alive)
    start_keep_alive
    ;;
  stop-keep-alive)
    stop_keep_alive
    ;;
  status)
    check_keep_alive
    ;;
  deploy)
    deploy_app
    ;;
  help|*)
    show_help
    ;;
esac

exit 0