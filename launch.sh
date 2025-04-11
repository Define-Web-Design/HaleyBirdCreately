#!/bin/bash

# Simplified launcher for Creately application
# Detects available resources and launches the appropriate script

# Function to log messages
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Creately application..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Check for Node.js and npm availability
if command -v npm &>/dev/null; then
  log "npm is available, starting the full application..."
  npm run dev
else
  log "npm is not available, starting fallback mode..."
  # Make sure the script is executable
  chmod +x forever-alive.sh
  # Start the forever-alive script in the foreground
  ./forever-alive.sh
fi