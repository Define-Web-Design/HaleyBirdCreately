#!/bin/bash

# Configuration
PORT=8080
PID_FILE="snippet-server.pid"
LOG_FILE="snippet-server.log"

# Function to check if server is running
check_server() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
      # Process is running
      echo "Server is already running with PID: $PID"
      return 0
    else
      # Process is not running but PID file exists
      echo "PID file exists but process is not running. Cleaning up..."
      rm -f "$PID_FILE"
    fi
  fi
  
  # Check if port is in use (alternative check)
  if netstat -tuln 2>/dev/null | grep ":$PORT " > /dev/null; then
    echo "Warning: Port $PORT is already in use"
    return 0
  fi
  
  # Try a direct curl to the server
  if curl -s http://localhost:$PORT/ > /dev/null; then
    echo "Server is responding on port $PORT but no PID file found"
    return 0
  fi
  
  # Server is not running
  return 1
}

# Function to start the server
start_server() {
  echo "Starting Creately Code Snippet Server on port $PORT..."
  
  # Create the public directories if they don't exist
  mkdir -p public/view
  
  # Start the server in the background
  nohup ./node_bin/node snippet-server.cjs > "$LOG_FILE" 2>&1 &
  
  # Store the process ID
  PID=$!
  echo $PID > "$PID_FILE"
  
  echo "Started server with PID: $PID"
  echo "Log file: $LOG_FILE"
  echo "Server URL: http://localhost:$PORT/"
  
  # Wait a moment to ensure the server starts successfully
  sleep 2
  
  # Check if server started successfully
  if ps -p $PID > /dev/null; then
    echo "Server started successfully!"
    
    # Try to access the server to verify it's responding
    if curl -s http://localhost:$PORT/ > /dev/null; then
      echo "Server is responding to HTTP requests."
    else
      echo "Warning: Server started but is not responding to HTTP requests."
    fi
  else
    echo "Error: Server failed to start."
    cat "$LOG_FILE"
    return 1
  fi
  
  return 0
}

# Function to show server status
show_status() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
      echo "Server is running with PID: $PID"
      echo "Log file: $LOG_FILE"
      echo "Server URL: http://localhost:$PORT/"
      
      # Show recent log entries
      echo -e "\nRecent log entries:"
      tail -5 "$LOG_FILE"
    else
      echo "Server is not running (stale PID file)."
    fi
  else
    echo "Server is not running (no PID file)."
  fi
}

# Main function
if check_server; then
  show_status
else
  start_server
fi