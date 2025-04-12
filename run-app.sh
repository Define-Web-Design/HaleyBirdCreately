
#!/bin/bash

# Setup log directory
mkdir -p logs

# Set default environment variables
export PORT="${PORT:-3000}"
export NODE_ENV="${NODE_ENV:-production}"

# Log function
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" >> logs/server.log
}

log "Starting application..."

# Check for Node.js and install if needed
if ! command -v node &> /dev/null; then
  log "Node.js not found, installing..."
  curl -fsSL https://npm.im/n | bash -s -- -y latest
  export PATH="$PATH:$HOME/n/bin:$HOME/.n/bin"
  log "Node.js installed: $(node -v)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.installed" ]; then
  log "Installing dependencies..."
  
  # Install build tools needed for native modules
  if [ -f "/usr/bin/apt-get" ]; then
    log "Installing build essentials..."
    apt-get update -y && apt-get install -y build-essential python3
  fi
  
  # Try to install dependencies with different strategies
  if npm install; then
    log "Dependencies installed successfully with npm"
  elif npm install --legacy-peer-deps; then
    log "Dependencies installed with --legacy-peer-deps"
  elif npm install --no-optional; then
    log "Dependencies installed with --no-optional"
  else
    log "WARNING: Could not install all dependencies, trying to continue..."
  fi
  
  touch node_modules/.installed
fi

# Build the application if needed
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  log "Building application..."
  npm run build
fi

# Start the application
log "Starting server on port $PORT..."
NODE_ENV=production node dist/index.js
