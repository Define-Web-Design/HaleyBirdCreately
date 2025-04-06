#!/bin/bash

# This script is used to start the application in a Replit environment
# It checks for the availability of Node.js and launches the app

echo "Starting application..."

# Check for existing node installation
if command -v /nix/store/*/bin/node &> /dev/null; then
    NODE_PATH=$(command -v /nix/store/*/bin/node)
    echo "Found Node.js at: $NODE_PATH"
    $NODE_PATH node_modules/.bin/tsx server/index.ts
else
    echo "Node.js not found in expected location. Checking for alternative paths..."
    # Fallback to environment node if available
    if command -v node &> /dev/null; then
        echo "Using system Node.js"
        node node_modules/.bin/tsx server/index.ts
    else
        echo "ERROR: Node.js not found. Please ensure Node.js is installed."
        exit 1
    fi
fi