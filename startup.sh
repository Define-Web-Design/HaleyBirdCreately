#!/bin/bash

# Startup script for the Never-Sleep system
# This script is designed to be run at Replit startup

# Create log directory if it doesn't exist
mkdir -p logs

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> logs/startup.log
}

log "Starting Never-Sleep system at boot..."

# Start the keep-alive system in the background
nohup node keep-alive.js > logs/never-sleep.log 2>&1 &
PID=$!

# Check if it started correctly
sleep 3
if ps -p $PID > /dev/null; then
  log "Never-Sleep system started successfully (PID: $PID)"
  echo $PID > .never-sleep.pid
  echo "Never-Sleep system started successfully (PID: $PID)"
else
  log "Failed to start Never-Sleep system"
  echo "Failed to start Never-Sleep system. Check logs/startup.log for details."
fi

exit 0