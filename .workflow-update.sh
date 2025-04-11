#!/bin/bash

# This script updates the Replit workflow when run
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Checking npm availability..."

if ! command -v npm &>/dev/null; then
  log "npm not available. Will use static server fallback."
  
  # If .workflow.update isn't executed in time, when this workflow launches,
  # it will still be using the npm command (which will fail).
  # So we need to force a switch to our static server
  
  # Kill any running npm process
  pkill -f "npm run dev" 2>/dev/null
  
  # Start our static server if it's not already running
  if [ -f run-static.sh ]; then
    log "Starting static server fallback..."
    nohup ./run-static.sh > logs/static-server.log 2>&1 &
    log "Static server started (PID: $!)"
  else
    log "Error: run-static.sh not found!"
  fi
else
  log "npm is available. No need for fallback."
fi
