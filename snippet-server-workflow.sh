#!/bin/bash

# Set environment variables
export PORT=8080

# Kill any existing process
if [ -f snippet-server.pid ]; then
  PID=$(cat snippet-server.pid)
  if ps -p $PID > /dev/null; then
    echo "Stopping existing server with PID: $PID"
    kill $PID
  fi
  rm snippet-server.pid
fi

# Clear log file
echo "" > snippet-server.log

# Start the server in the background
echo "Starting snippet server..."
nohup ./node_bin/node snippet-server.cjs > snippet-server.log 2>&1 &

# Store the process ID
PID=$!
echo $PID > snippet-server.pid

echo "Started snippet server with PID: $PID"
echo "Logs are available in snippet-server.log"
echo "Access the server at: http://0.0.0.0:8080/"

# Keep script running to maintain the workflow
echo "Press CTRL+C to stop the server"
tail -f snippet-server.log