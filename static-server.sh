#!/bin/bash

# Simple HTTP server using bash (fallback when Node.js is not available)
PORT=5173
WEBROOT="./public"

# Function to log messages
log() {
  local message="$1"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] $message" | tee -a logs/static-server.log
}

log "Starting static file server on port $PORT..."

# First try with Python if available
if command -v python3 &> /dev/null; then
  log "Using Python for static file serving"
  cd "$WEBROOT" && python3 -m http.server $PORT
  exit 0
elif command -v python &> /dev/null; then
  log "Using Python (v2) for static file serving"
  cd "$WEBROOT" && python -m SimpleHTTPServer $PORT
  exit 0
elif command -v busybox &> /dev/null; then
  log "Using busybox httpd for static file serving"
  busybox httpd -p $PORT -h "$WEBROOT"
  exit 0
else
  # Create a minimal index.html if it doesn't exist
  if [ ! -f "$WEBROOT/index.html" ]; then
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
  fi
  
  log "No web server available. Trying with netcat if available..."
  if command -v nc &> /dev/null; then
    while true; do
      echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n$(cat $WEBROOT/index.html)" | nc -l -p $PORT
      log "Served page with netcat"
      sleep 1
    done
  else
    log "No suitable web server found. Cannot serve static files."
    exit 1
  fi
fi
