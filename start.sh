#!/bin/bash

# Simple script to start the Creately Code Snippet Server
echo "Starting Code Snippet Server..."

# Check for Node.js
if command -v node >/dev/null 2>&1; then
  echo "Using system Node.js"
  node simple-server.js
elif [ -f "./node_bin/node" ]; then
  echo "Using Node.js from node_bin"
  ./node_bin/node simple-server.js
else
  echo "Error: Node.js not found"
  exit 1
fi