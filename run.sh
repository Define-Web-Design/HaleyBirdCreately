#!/bin/bash

# Script to start the Node.js application on Replit
# This will be called by the workflow

# Try to find Node.js in various possible locations
for NODE_PATH in \
  "/nix/store/sxw7i3pyw8v1ycw2sph0zq2byh1prrwm-nodejs-20.18.1/bin/node" \
  "/nix/store/*/nodejs-*/bin/node" \
  "/nix/var/nix/profiles/default/bin/node" \
  "$(which node 2>/dev/null)"
do
  if [ -x "$NODE_PATH" ]; then
    NODE_BIN="$NODE_PATH"
    break
  fi
done

if [ -z "$NODE_BIN" ]; then
  echo "Error: Could not find Node.js executable"
  exit 1
fi

echo "Starting Creately application using Node.js at $NODE_BIN"

# Run the server
$NODE_BIN index.js
