#!/bin/bash

# Simple script to start the Creately application
echo "Starting Creately application..."

# Try to find Node.js and npm
echo "Looking for Node.js and npm..."
find /nix/store -name node -type f -executable | grep -v "bootstrap" | head -1
find /nix/store -name npm -type f | head -1

# Check environment
echo "Checking environment modules..."
echo $REPL_SLUG
echo $PATH

echo "Unable to start the application. Please run 'npm run dev' manually."