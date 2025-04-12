#!/bin/bash

echo "Starting Creately Code Snippet Server"

# Try different Node.js paths
NODE_PATH="/home/runner/workspace/node_bin/node"
if [ -f "$NODE_PATH" ]; then
  echo "Using Node.js at $NODE_PATH"
  $NODE_PATH server.js
else
  # Check for 'node' command
  if command -v node >/dev/null 2>&1; then
    echo "Using system Node.js"
    node server.js
  # Check for global Node.js installations
  elif [ -f "/nix/store/wfxq6w9bkp5dcfr8yb6789b0w7128gnb-nodejs-20.18.1/bin/node" ]; then
    echo "Using Nix Node.js"
    /nix/store/wfxq6w9bkp5dcfr8yb6789b0w7128gnb-nodejs-20.18.1/bin/node server.js
  else
    echo "ERROR: Could not find Node.js. Please install Node.js to run this server."
    exit 1
  fi
fi