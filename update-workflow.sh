#!/bin/bash

# This script updates the Replit workflow configuration to include
# fallback mechanisms for when npm isn't available

# Colors for formatting output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log messages with timestamp
log() {
  echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "${YELLOW}Updating Replit workflow configuration...${NC}"

# Check if .replit exists
if [ ! -f .replit ]; then
  log "${RED}Error: .replit file not found!${NC}"
  exit 1
fi

# Create a backup of the .replit file
cp .replit .replit.bak
log "Created backup at .replit.bak"

# Now update the run command in .replit to include our fallback mechanism
cat > .replit.new <<'EOF'
run = "bash -c 'command -v npm &>/dev/null && npm run dev || ./run-static.sh'"
hidden = [
  ".config",
  "package-lock.json",
  ".replit.bak",
  ".gitignore",
  ".keep-alive.pid",
  ".never-sleep.pid",
  ".bash-keep-alive.pid",
  ".static-server.pid",
]
language = "nodejs"
entrypoint = "index.js"
modules = ["nodejs-20:v8-20230920-bd784b9"]

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "npm run dev"]
deploymentTarget = "cloudrun"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true
enabledForHosting = false

[env]
XDG_CONFIG_HOME = "$REPL_HOME/.config"
PORT = "5173"

[languages]

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[languages.typescript]
pattern = "**/{*.ts,*.tsx}"

[languages.typescript.languageServer]
start = "typescript-language-server --stdio"

[auth]
pageEnabled = true
buttonEnabled = false
EOF

# Replace the .replit file with our new version
mv .replit.new .replit
log "${GREEN}Updated .replit with fallback mechanism${NC}"

# Create a workflow update script
cat > .workflow-update.sh <<'EOF'
#!/bin/bash

# This script updates the Replit workflow when run
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Checking npm availability..."

if ! command -v npm &>/dev/null; then
  log "npm not available. Will use static server fallback."
  
  # If .workflow.update isn't executed in time, when this workflow launches,
  # it will still be using the npm command (which will fail).
  # So we need to force a switch to our static server
  
  # Kill any running npm process
  pkill -f "npm run dev" 2>/dev/null
  
  # Start our static server if it's not already running
  if [ -f run-static.sh ]; then
    log "Starting static server fallback..."
    nohup ./run-static.sh > logs/static-server.log 2>&1 &
    log "Static server started (PID: $!)"
  else
    log "Error: run-static.sh not found!"
  fi
else
  log "npm is available. No need for fallback."
fi
EOF

chmod +x .workflow-update.sh
log "${GREEN}Created workflow update script${NC}"

log "${GREEN}Done! Workflow configuration has been updated.${NC}"
log "${YELLOW}To apply changes, restart your repl.${NC}"