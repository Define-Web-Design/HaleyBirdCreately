
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

# Try different node binaries
if [ -f "./node_bin/node" ]; then
  log "Using node_bin/node"
  ./node_bin/node monitor.js
elif command -v node &> /dev/null; then
  log "Using system node"
  node monitor.js
else
  log "Installing Node.js..."
  curl -fsSL https://npm.im/n | bash -s -- -y latest
  export PATH="$PATH:$HOME/n/bin"
  log "Node.js installed: $(node -v)"
  node monitor.js
fi
