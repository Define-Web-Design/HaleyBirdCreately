#!/bin/bash

# Configuration
PORT=8080
SERVER_FILE="simple-server.cjs"
NODE_PATH="./node_bin/node"
PID_FILE="snippet-server.pid"
LOG_FILE="snippet-server.log"

# Print banner
echo "┌───────────────────────────────────────────────────┐"
echo "│                                                   │"
echo "│   Creately Code Snippet Server                    │"
echo "│                                                   │"
echo "└───────────────────────────────────────────────────┘"

# Kill any existing process
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  echo "Checking for existing server process (PID: $PID)..."
  
  if kill -0 $PID 2>/dev/null; then
    echo "Stopping existing server with PID: $PID"
    kill $PID
    sleep 1
  else
    echo "No running server found with PID: $PID"
  fi
  
  rm -f "$PID_FILE"
fi

# Clear log file
echo "" > "$LOG_FILE"
echo "[$(date)] Starting Creately Code Snippet Server..." >> "$LOG_FILE"

# Start the server in the background
echo "Starting server..."
nohup "$NODE_PATH" "$SERVER_FILE" >> "$LOG_FILE" 2>&1 &

# Store the process ID
PID=$!
echo $PID > "$PID_FILE"

echo "Server started with PID: $PID"
echo "Log file: $LOG_FILE"
echo "Server URL: http://localhost:$PORT/"

# Wait a moment to ensure server starts
sleep 2

# Check if process is still running
if kill -0 $PID 2>/dev/null; then
  echo "Server is running."
  
  # Test if server is responding
  if curl -s http://localhost:$PORT/ > /dev/null; then
    echo "Server is responding to HTTP requests."
    echo "Server is ready at: http://localhost:$PORT/"
  else
    echo "Warning: Server is running but not responding to HTTP requests."
    echo "Check logs for details: $LOG_FILE"
  fi
else
  echo "Error: Server failed to start."
  echo "--- Server logs ---"
  cat "$LOG_FILE"
  exit 1
fi