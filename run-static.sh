#!/bin/bash

# Simple static server with persistence guarantees
# Designed to keep running even in resource-constrained environments

PORT=5173
WEBROOT="./public"
LOG_FILE="./logs/static-server.log"
PID_FILE=".static-server.pid"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log() {
  local message="$1"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Write our PID to file
echo $$ > "$PID_FILE"
log "Static server controller started (PID: $$)"

# Create a minimal index.html if it doesn't exist
if [ ! -f "$WEBROOT/index.html" ]; then
  log "No index.html found, creating one..."
  mkdir -p "$WEBROOT"
  
  cat > "$WEBROOT/index.html" <<'END'
<!DOCTYPE html>
<html>
<head>
  <title>Creately</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Creately</h1>
  <p>The application is currently in maintenance mode. Please check back soon.</p>
</body>
</html>
END
  log "Created default index.html"
fi

# Function to clean up on exit
cleanup() {
  log "Shutting down static server..."
  rm -f "$PID_FILE"
  exit 0
}

# Register trap for graceful shutdown
trap cleanup SIGINT SIGTERM

# Try multiple server approaches with automatic fallback
server_started=false

# Try Python 3 HTTP server
if ! $server_started && command -v python3 &> /dev/null; then
  log "Using Python 3 HTTP server..."
  (cd "$WEBROOT" && python3 -m http.server $PORT) &
  PYTHON_PID=$!
  sleep 2
  if ps -p $PYTHON_PID > /dev/null; then
    log "Python 3 server started successfully on port $PORT (PID: $PYTHON_PID)"
    wait $PYTHON_PID
    server_started=true
  else
    log "Python 3 server failed to start or crashed"
  fi
fi

# Try Python 2 HTTP server
if ! $server_started && command -v python &> /dev/null; then
  log "Using Python 2 HTTP server..."
  (cd "$WEBROOT" && python -m SimpleHTTPServer $PORT) &
  PYTHON_PID=$!
  sleep 2
  if ps -p $PYTHON_PID > /dev/null; then
    log "Python 2 server started successfully on port $PORT (PID: $PYTHON_PID)"
    wait $PYTHON_PID
    server_started=true
  else
    log "Python 2 server failed to start or crashed"
  fi
fi

# Try busybox httpd
if ! $server_started && command -v busybox &> /dev/null; then
  log "Using busybox httpd..."
  busybox httpd -p $PORT -h "$WEBROOT" &
  BUSYBOX_PID=$!
  sleep 2
  if ps -p $BUSYBOX_PID > /dev/null; then
    log "Busybox httpd started successfully on port $PORT (PID: $BUSYBOX_PID)"
    wait $BUSYBOX_PID
    server_started=true
  else
    log "Busybox httpd failed to start or crashed"
  fi
fi

# Netcat fallback - guarantees to stay running
if ! $server_started && command -v nc &> /dev/null; then
  log "Using netcat as fallback web server..."
  
  # Function to serve a simple HTML response
  serve_page() {
    while true; do
      log "Starting netcat server on port $PORT..."
      (echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n$(cat $WEBROOT/index.html)"; sleep 1) | nc -l -p $PORT 2>/dev/null || true
      log "Netcat server restarting..."
      sleep 1
    done
  }
  
  serve_page &
  NC_PID=$!
  log "Netcat server controller started (PID: $NC_PID)"
  wait $NC_PID
  server_started=true
fi

# Ultimate fallback - just keep the script running
if ! $server_started; then
  log "No suitable web server found. Running in standby mode."
  
  # Just keep the script alive
  while true; do
    log "Static server controller still running... (no active server)"
    sleep 60
  done
fi

# We should never reach here, but just in case
log "Static server controller exited unexpectedly"
rm -f "$PID_FILE"