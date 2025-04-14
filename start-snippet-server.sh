#!/bin/bash

# Set environment variables
export PORT=8080

# Start the server in the background
nohup ./node_bin/node snippet-server.cjs > snippet-server.log 2>&1 &

# Store the process ID
PID=$!
echo $PID > snippet-server.pid

echo "Started snippet server with PID: $PID"
echo "Logs are available in snippet-server.log"
echo "Access the server at: http://localhost:8080/"