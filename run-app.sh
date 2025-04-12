
#!/bin/bash

# Setup log directory
mkdir -p logs
LOG_FILE="logs/app.log"

# Log function
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" >> "$LOG_FILE"
}

log "Starting application..."

# Use local Node.js if available, otherwise use system Node.js
if [ -f "./node_bin/node" ]; then
  export PATH="./node_bin:$PATH"
  chmod +x ./node_bin/node ./node_bin/npm 2>/dev/null
  log "Using local Node.js: $(node -v)"
else
  log "Using system Node.js: $(node -v)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  npm install || npm install --legacy-peer-deps
else
  log "Dependencies already installed"
fi

# Build the application
log "Building the application..."
npm run build

# Start the application
log "Starting the application..."
export NODE_ENV=production
node dist/index.js
