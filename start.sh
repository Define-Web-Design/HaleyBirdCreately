#!/bin/bash

# Update the 'Start application' workflow to use this command
# First, install nodejs if needed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Attempting to find it in the Nix store..."
  
  # Try to find Node.js executable in various possible locations
  for NODE_PATH in \
    "/nix/store/sxw7i3pyw8v1ycw2sph0zq2byh1prrwm-nodejs-20.18.1/bin/node" \
    "/nix/store/*/nodejs-*/bin/node" \
    "/nix/var/nix/profiles/default/bin/node" \
    "$(command -v node 2>/dev/null)"
  do
    if [ -x "$NODE_PATH" ]; then
      echo "Found Node.js at: $NODE_PATH"
      NODE_BIN="$NODE_PATH"
      NODE_DIR=$(dirname "$NODE_PATH")
      export PATH="$NODE_DIR:$PATH"
      break
    fi
  done
  
  if [ -z "$NODE_BIN" ]; then
    echo "Error: Could not find Node.js executable"
    exit 1
  fi
else
  NODE_BIN=$(command -v node)
  echo "Node.js is installed at: $NODE_BIN"
fi

echo "Starting Creately application..."

# Get current directory
CURRENT_DIR=$(pwd)

# Load environment variables if .env file exists
if [ -f "$CURRENT_DIR/.env" ]; then
  echo "Loading environment variables from .env file"
  export $(grep -v '^#' "$CURRENT_DIR/.env" | xargs)
fi

# Log environment for debugging
echo "Database URL available: $([ -n "$DATABASE_URL" ] && echo "Yes" || echo "No")"
echo "PageSpeed API key available: $([ -n "$PAGESPEED_INSIGHTS_API_KEY" ] && echo "Yes" || echo "No")"
echo "OpenAI API key available: $([ -n "$OPENAI_API_KEY" ] && echo "Yes" || echo "No")"

# Run the server with ES modules support
exec "$NODE_BIN" --experimental-modules index.js