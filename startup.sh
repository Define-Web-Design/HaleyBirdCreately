#!/bin/bash

# Enhanced Startup Script with Never-Sleep System
# This script ensures your Replit dev URL stays active 24/7

# Make sure the script is run from the correct directory
cd "$(dirname "$0")"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a logs/startup.log
}

log "Starting application with Never-Sleep system..."

# Kill any existing node processes that might be running
log "Cleaning up any existing processes..."
pkill -f "node" || true
sleep 2

# Start the Keep-Alive service in the background
log "Starting Never-Sleep system..."
node never-sleep.js > logs/never-sleep.log 2>&1 &
KEEPALIVE_PID=$!
log "Never-Sleep system started with PID: $KEEPALIVE_PID"

# Wait for the Keep-Alive service to initialize
sleep 5

# Check if the Keep-Alive service is running
if kill -0 $KEEPALIVE_PID 2>/dev/null; then
  log "Never-Sleep system is running correctly"
  
  # Write the PID to a file for future reference
  echo $KEEPALIVE_PID > .never-sleep.pid
  
  log "You can now safely close this terminal. Your app will stay running 24/7."
  log "Monitor your app at: http://localhost:3333"
else
  log "ERROR: Never-Sleep system failed to start! Check logs/never-sleep.log for details"
  exit 1
fi

# Keep this script running to maintain the terminal session
while true; do
  # Check if the Keep-Alive service is still running
  if ! kill -0 $KEEPALIVE_PID 2>/dev/null; then
    log "WARNING: Never-Sleep process died! Restarting..."
    node never-sleep.js > logs/never-sleep.log 2>&1 &
    KEEPALIVE_PID=$!
    echo $KEEPALIVE_PID > .never-sleep.pid
    log "Never-Sleep system restarted with PID: $KEEPALIVE_PID"
  fi
  
  # Print a status update every 15 minutes
  log "Status: Never-Sleep system active. Your app will remain running 24/7."
  
  # Sleep for 15 minutes
  sleep 900
done