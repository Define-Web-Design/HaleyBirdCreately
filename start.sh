
#!/bin/bash

# Application Server Startup Script
# This script starts the main application server with fallbacks

echo "Starting application server..."

# Set default port if not specified
export PORT="${PORT:-3000}"
export NODE_ENV="${NODE_ENV:-production}"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" >> logs/server.log
}

# Check for .env file and create if it doesn't exist
if [ ! -f ".env" ]; then
  log "Creating default .env file"
  echo "PORT=3000" > .env
  echo "NODE_ENV=production" >> .env
fi

# Check if node_bin exists
if [ -f "./node_bin/node" ]; then
  NODE_CMD="./node_bin/node"
  NPM_CMD="./node_bin/npm"
  chmod +x ./node_bin/node ./node_bin/npm 2>/dev/null
  log "Using node_bin executables"
else
  NODE_CMD="node"
  NPM_CMD="npm"
  log "Using system node"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  $NPM_CMD install || $NPM_CMD install --legacy-peer-deps
  if [ $? -ne 0 ]; then
    log "⚠️ Warning: Dependency installation failed. Some features may not work correctly."
  else
    log "✅ Dependencies installed successfully"
  fi
fi

# Build the application if dist directory doesn't exist
if [ ! -d "dist" ]; then
  log "Building application..."
  $NPM_CMD run build
  if [ $? -ne 0 ]; then
    log "⚠️ Build failed, attempting to start from source"
  else
    log "✅ Build completed successfully"
  fi
fi

# Try to start the built app first
if [ -f "dist/index.js" ]; then
  log "Starting production server from dist/index.js"
  $NODE_CMD dist/index.js
  SERVER_EXIT_CODE=$?
  
  if [ $SERVER_EXIT_CODE -ne 0 ]; then
    log "⚠️ Production server failed with exit code $SERVER_EXIT_CODE"
    # Try development mode as fallback
    log "Falling back to development mode..."
    $NPM_CMD run dev
    exit $?
  fi
else
  # Fallback to dev mode if build failed
  log "Starting development server..."
  $NPM_CMD run dev
  exit $?
fi
