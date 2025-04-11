#!/bin/bash

# Enhanced Startup script for the Creately Keep-Alive system
# This script is designed to be run at Replit startup
# It now supports both Node.js-based and Bash-based keep-alive solutions
# Additionally, it provides a static server fallback when npm is not available

# Create log directory if it doesn't exist
mkdir -p logs

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a logs/startup.log
}

log "Starting Creately Keep-Alive system at boot..."

# Check if Node.js is available
if command -v node &> /dev/null && [ -f keep-alive.js ]; then
  log "Node.js is available. Using Node.js-based keep-alive system..."
  
  # Start the Node.js keep-alive system in the background
  nohup node keep-alive.js > logs/never-sleep.log 2>&1 &
  PID=$!
  
  # Check if it started correctly
  sleep 3
  if ps -p $PID > /dev/null; then
    log "Node.js keep-alive system started successfully (PID: $PID)"
    echo $PID > .never-sleep.pid
  else
    log "Failed to start Node.js keep-alive system"
    USE_BASH_FALLBACK=true
  fi
else
  log "Node.js is not available or keep-alive.js not found"
  USE_BASH_FALLBACK=true
fi

# Use bash-based keep-alive as fallback if needed
if [ "$USE_BASH_FALLBACK" = true ] || [ ! -f .never-sleep.pid ]; then
  log "Using bash-based keep-alive system as fallback..."
  
  # Make sure the script is executable
  chmod +x keep-url-alive.sh
  
  # Start the bash keep-alive system in the background
  nohup ./keep-url-alive.sh > logs/bash-keep-alive.log 2>&1 &
  BASH_PID=$!
  
  # Check if it started correctly
  sleep 3
  if ps -p $BASH_PID > /dev/null; then
    log "Bash keep-alive system started successfully (PID: $BASH_PID)"
    echo $BASH_PID > .bash-keep-alive.pid
    echo "Creately Keep-Alive system started successfully (PID: $BASH_PID)"
  else
    log "Failed to start bash keep-alive system"
    echo "Failed to start Creately Keep-Alive system. Check logs/startup.log for details."
    exit 1
  fi
fi

# Check if npm is available for the main application
if ! command -v npm &> /dev/null; then
  log "npm not found - creating a static file server as fallback for the main application..."
  
  # Create public directory if it doesn't exist
  mkdir -p public
  
  # Make sure our enhanced persistence scripts are executable
  chmod +x run-static.sh
  
  # Start the ultra-reliable static server
  log "Starting robust static file server..."
  nohup ./run-static.sh > /dev/null 2>&1 &
  STATIC_PID=$!
  log "Static server controller started (PID: $STATIC_PID)"
  
  # Give it a moment to initialize
  sleep 2
  
  # Verify it's running
  if ps -p $STATIC_PID > /dev/null; then
    log "Static server successfully started"
  else
    log "Warning: Static server may have failed to start. Check logs for details."
  fi
fi

log "Creately Keep-Alive system initialization completed successfully"
exit 0