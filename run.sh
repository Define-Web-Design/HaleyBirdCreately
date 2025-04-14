#!/bin/bash

echo "Starting Creately Code Snippet Server..."

# Clear log file
echo "" > snippet-server.log

# Start the server
exec ./node_bin/node snippet-server.cjs