#!/bin/bash

echo "Starting Creately Simple Code Snippet Server..."

# Use explicit node path
NODE_PATH=./node_bin/node

# Run the server
exec $NODE_PATH simple-server.cjs