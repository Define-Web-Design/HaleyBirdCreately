#!/bin/bash

# Start application with auto-restart capability
# This script ensures that the application stays running in Replit

# Configuration
MAX_RESTARTS=10
RESTART_DELAY=5
LOG_FILE="./logs/restart.log"
RESTART_WINDOW=300 # 5 minutes in seconds

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Function to log messages
log_message() {
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] $1"
  echo "[$timestamp] $1" >> "$LOG_FILE"
}

# Initialize restart tracking
restart_attempts=0
restart_start_time=$(date +%s)

log_message "Starting application with auto-restart capability"

# Main loop to restart the application when it exits
while true; do
  # Start the application
  log_message "Starting the application..."
  npm run dev
  
  # Get the exit code
  exit_code=$?
  
  # Check if we should restart
  current_time=$(date +%s)
  elapsed_time=$((current_time - restart_start_time))
  
  # Reset counter if window has passed
  if [ $elapsed_time -gt $RESTART_WINDOW ]; then
    restart_attempts=0
    restart_start_time=$current_time
    log_message "Restart window elapsed, resetting counter"
  fi
  
  # Increment restart attempts
  restart_attempts=$((restart_attempts + 1))
  
  if [ $exit_code -eq 0 ]; then
    log_message "Application exited cleanly with code 0"
    break
  else
    log_message "Application crashed with exit code $exit_code"
    
    if [ $restart_attempts -le $MAX_RESTARTS ]; then
      log_message "Restarting application in $RESTART_DELAY seconds (attempt $restart_attempts of $MAX_RESTARTS)"
      sleep $RESTART_DELAY
    else
      log_message "Maximum restart attempts ($MAX_RESTARTS) reached. Exiting."
      break
    fi
  fi
done

log_message "Application auto-restart script terminated"