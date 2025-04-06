#!/bin/bash

# Script to start the Node.js application on Replit
# This will be called by the workflow

NODE_BIN="/nix/store/sxw7i3pyw8v1ycw2sph0zq2byh1prrwm-nodejs-20.18.1/bin/node"

echo "Starting Creately application using Node.js at $NODE_BIN"

# Run the server
$NODE_BIN index.js