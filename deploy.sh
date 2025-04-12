#!/bin/bash

# Setup log directory
mkdir -p logs
DEPLOY_LOG="logs/deployment.log"

# Log function
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" >> "$DEPLOY_LOG"
}

log "Starting deployment process..."

# Use local Node.js binaries if available
if [ -f "./node_bin/node" ]; then
  export PATH="./node_bin:$PATH"
  chmod +x ./node_bin/node ./node_bin/npm
  log "Using local Node.js: $(node -v)"
else
  log "Using system Node.js: $(node -v)"
fi

# Install dependencies with fallback options
log "Installing dependencies..."
npm install || npm install --legacy-peer-deps || npm install --no-optional

# Build the application
log "Building the application..."
if npm run build; then
  log "Build completed successfully"
else
  log "Build failed!"
  exit 1
fi

# Start the application
log "Starting the application..."
export NODE_ENV=production
node dist/index.js