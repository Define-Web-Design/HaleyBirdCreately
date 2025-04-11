#!/bin/bash

# Main control script for the Never-Sleep System
# This script provides easy commands to manage your application's 24/7 uptime

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Function to print a styled header
print_header() {
  echo -e "\n${BLUE}===== Creately Keep-URL-Alive System =====${NC}"
  echo -e "${BLUE}Ensures your dev URL never goes to sleep${NC}\n"
}

# Function to print command help
print_help() {
  echo -e "${YELLOW}Commands:${NC}"
  echo -e "  ${GREEN}start${NC}     - Start the never-sleep system"
  echo -e "  ${GREEN}stop${NC}      - Stop the never-sleep system"
  echo -e "  ${GREEN}status${NC}    - Check if the never-sleep system is running"
  echo -e "  ${GREEN}restart${NC}   - Restart the never-sleep system"
  echo -e "  ${GREEN}logs${NC}      - View the never-sleep system logs"
  echo -e "  ${GREEN}dashboard${NC} - Access the monitoring dashboard (shows URL)"
  echo
  echo -e "${YELLOW}Examples:${NC}"
  echo -e "  ${GREEN}./keep-url-alive.sh start${NC}"
  echo -e "  ${GREEN}./keep-url-alive.sh status${NC}"
}

# Function to start the system
start_system() {
  echo -e "${YELLOW}Starting Never-Sleep system...${NC}"
  if [ -f .never-sleep.pid ] && ps -p $(cat .never-sleep.pid 2>/dev/null) > /dev/null 2>&1; then
    echo -e "${GREEN}Never-Sleep system is already running.${NC}"
    exit 0
  fi
  
  mkdir -p logs
  nohup node keep-alive.js > logs/never-sleep.log 2>&1 &
  PID=$!
  echo $PID > .never-sleep.pid
  
  # Wait a moment to make sure it starts correctly
  sleep 3
  
  if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}Never-Sleep system started successfully (PID: $PID).${NC}"
    echo -e "${BLUE}Your dev URL will now stay active 24/7.${NC}"
    
    # Check for actual port being used (may change if 3333 is occupied)
    local DASHBOARD_PORT
    DASHBOARD_PORT=$(grep -o "Dashboard available at: http://localhost:[0-9]*" logs/never-sleep.log | tail -1 | grep -o "[0-9]*$" || echo "3333")
    echo -e "${YELLOW}Access dashboard:${NC} http://localhost:${DASHBOARD_PORT}/"
  else
    echo -e "${RED}Failed to start Never-Sleep system. Check logs for details.${NC}"
    exit 1
  fi
}

# Function to stop the system
stop_system() {
  echo -e "${YELLOW}Stopping Never-Sleep system...${NC}"
  if [ -f .never-sleep.pid ]; then
    PID=$(cat .never-sleep.pid)
    if ps -p $PID > /dev/null 2>&1; then
      kill $PID
      sleep 2
      
      if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Force terminating process...${NC}"
        kill -9 $PID
      fi
      
      rm .never-sleep.pid
      echo -e "${GREEN}Never-Sleep system stopped.${NC}"
    else
      echo -e "${YELLOW}Process not running. Cleaning up stale PID file.${NC}"
      rm .never-sleep.pid
    fi
  else
    echo -e "${YELLOW}Never-Sleep system is not running (no PID file found).${NC}"
  fi
  
  # Kill any other related processes
  pkill -f "keep-alive.js" > /dev/null 2>&1
}

# Function to check system status
check_status() {
  # More reliable way to check if our script is running
  if pgrep -f "node.*keep-alive.js" > /dev/null 2>&1 || pgrep -f "node.*never-sleep.js" > /dev/null 2>&1; then
    # Get PID of the running process
    local PID=$(pgrep -f "node.*keep-alive.js" || pgrep -f "node.*never-sleep.js")
    echo -e "${GREEN}Never-Sleep system is RUNNING (PID: $PID)${NC}"
    echo -e "${BLUE}Your dev URL is being kept alive.${NC}"
    
    # Check for actual port being used (may change if 3333 is occupied)
    local DASHBOARD_PORT
    DASHBOARD_PORT=$(grep -o "Dashboard available at: http://localhost:[0-9]*" logs/never-sleep.log | tail -1 | grep -o "[0-9]*$" || echo "3333")
    echo -e "${YELLOW}Access dashboard:${NC} http://localhost:${DASHBOARD_PORT}/"
    
    # Update PID file if it's different or doesn't exist
    if [ ! -f .never-sleep.pid ] || [ "$(cat .never-sleep.pid)" != "$PID" ]; then
      echo $PID > .never-sleep.pid
    fi
    
    return 0
  else
    # Remove stale PID file if it exists
    if [ -f .never-sleep.pid ]; then
      rm .never-sleep.pid
      echo -e "${RED}Never-Sleep system is NOT RUNNING (removed stale PID file)${NC}"
    else
      echo -e "${RED}Never-Sleep system is NOT RUNNING (no process found)${NC}"
    fi
    echo -e "${YELLOW}Your dev URL will go to sleep after inactivity.${NC}"
    return 1
  fi
}

# Function to open dashboard
open_dashboard() {
  echo -e "${YELLOW}Opening dashboard...${NC}"
  
  if ! check_status > /dev/null; then
    echo -e "${RED}Never-Sleep system is not running. Starting it first...${NC}"
    start_system
    sleep 2
  fi
  
  # Check for actual port being used
  local DASHBOARD_PORT
  DASHBOARD_PORT=$(grep -o "Dashboard available at: http://localhost:[0-9]*" logs/never-sleep.log | tail -1 | grep -o "[0-9]*$" || echo "3333")
  
  # Print URL and instructions
  echo -e "${GREEN}Dashboard URL:${NC} http://localhost:${DASHBOARD_PORT}/"
  echo -e "${BLUE}The dashboard shows stats and allows manual control.${NC}"
  
  # Try to open the URL automatically (works in some environments)
  if command -v open &> /dev/null; then
    open "http://localhost:${DASHBOARD_PORT}/"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:${DASHBOARD_PORT}/"
  else
    echo -e "${YELLOW}Please open the URL manually in your browser.${NC}"
  fi
}

# Function to view logs
view_logs() {
  if [ -f "logs/never-sleep.log" ]; then
    echo -e "${YELLOW}Showing last 50 lines of never-sleep.log:${NC}"
    echo "========================================"
    tail -n 50 logs/never-sleep.log
    echo "========================================"
    echo -e "${BLUE}To view full logs:${NC} cat logs/never-sleep.log"
  else
    echo -e "${RED}No log file found at logs/never-sleep.log${NC}"
  fi
}

# Main command handler
print_header

case "$1" in
  start)
    start_system
    ;;
  stop)
    stop_system
    ;;
  restart)
    stop_system
    sleep 2
    start_system
    ;;
  status)
    check_status
    ;;
  logs)
    view_logs
    ;;
  dashboard)
    open_dashboard
    ;;
  *)
    print_help
    ;;
esac

exit 0