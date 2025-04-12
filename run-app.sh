
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

# Check for Node.js
if ! command -v node &> /dev/null; then
  log "Node.js not found, installing..."
  curl -fsSL https://npm.im/n | bash -s -- -y latest
  PATH="$PATH:$HOME/n/bin"
  log "Node.js installed: $(node -v)"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  log "Installing dependencies..."
  npm install
  touch node_modules/.package-lock.json
fi

# Build the application if needed
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  log "Building application..."
  npm run build
fi

# Start the application
log "Starting server..."
NODE_ENV=production node dist/index.js
