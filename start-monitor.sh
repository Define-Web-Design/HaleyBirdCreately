
#!/bin/bash

# Set up logging
LOGS_DIR="logs"
mkdir -p "$LOGS_DIR"
LOG_FILE="$LOGS_DIR/monitor-startup.log"

# Log function
log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1" | tee -a "$LOG_FILE"
}

log "Starting monitor..."

# Make sure the logs directory exists
mkdir -p logs

# Set environment variables
export MONITOR_PORT="${MONITOR_PORT:-3001}"
export PORT="${PORT:-3000}"

# Ensure permissions
chmod +x run-app.sh
chmod +x monitor.js

# Ensure monitor.js is executable
chmod +x monitor.js

# Try different node binaries
if [ -f "./node_bin/node" ]; then
  log "Using node_bin/node"
  ./node_bin/node monitor.js
elif command -v node &> /dev/null; then
  log "Using system node"
  node monitor.js
else
  log "Installing Node.js..."
  
  # Try multiple installation methods with fallbacks
  if curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s -- -y latest; then
    log "Successfully installed Node.js using GitHub mirror"
  elif curl -fsSL https://githubusercontent.com/tj/n/master/bin/n | bash -s -- -y latest; then
    log "Successfully installed Node.js using GitHub alternate"
  elif curl -fsSL https://nodejs.org/dist/v20.0.0/node-v20.0.0-linux-x64.tar.gz -o node.tar.gz; then
    mkdir -p ./node_bin
    tar -xzf node.tar.gz -C ./node_bin --strip-components=1
    log "Installed Node.js from direct download"
  else
    log "WARNING: All Node.js installation attempts failed, checking for alternatives"
  fi
  
  # Update PATH to include all possible Node locations
  export PATH="$PATH:$HOME/n/bin:$HOME/.n/bin:./node_bin"
  
  if [ -f "./node_bin/node" ]; then
    log "Using node_bin/node"
    ./node_bin/node monitor.js
  elif command -v node &> /dev/null; then
    log "Using system node"
    node monitor.js
  else
    log "ERROR: Could not find or install Node.js. Monitor cannot start."
    exit 1
  fi
fi
