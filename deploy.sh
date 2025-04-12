
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

# Check for Node.js in standard locations
if command -v node &> /dev/null; then
  NODE_CMD="node"
  NPM_CMD="npm"
  log "Using system Node.js: $(node -v)"
elif [ -f "./node_bin/node" ]; then
  NODE_CMD="./node_bin/node"
  NPM_CMD="./node_bin/npm"
  # Ensure execute permissions
  chmod +x ./node_bin/node ./node_bin/npm
  log "Using local Node.js binary: $(./node_bin/node -v)"
else
  log "Node.js not found in standard locations. Attempting direct download..."
  
  # Direct download of Node.js binary
  mkdir -p node_bin
  curl -fsSL https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.gz -o node.tar.gz
  tar -xzf node.tar.gz -C node_bin --strip-components=1
  chmod +x ./node_bin/node ./node_bin/npm
  rm -f node.tar.gz
  
  NODE_CMD="./node_bin/node"
  NPM_CMD="./node_bin/npm"
  log "Installed Node.js directly: $(./node_bin/node -v)"
fi

# Install dependencies
log "Installing dependencies..."
if $NPM_CMD install; then
  log "Dependencies installed successfully"
else
  log "Standard install failed, trying with legacy peer deps..."
  $NPM_CMD install --legacy-peer-deps
fi

# Build the application
log "Building the application..."
if $NPM_CMD run build; then
  log "Build completed successfully"
else
  log "Build failed!"
  exit 1
fi

# Start the application
log "Starting the application..."
export NODE_ENV=production
$NODE_CMD dist/index.js
