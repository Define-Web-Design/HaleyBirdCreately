#!/bin/bash

# Ultimate Keep-Alive Solution for Replit
# Designed to be the most robust possible approach that will never terminate
# This script runs in the foreground and ensures the application stays alive

# Configuration
APP_PORT="5173"  # Default Vite server port for our application
CHECK_INTERVAL=55  # Seconds between checks (just under 1 minute)
LOG_FILE="./logs/forever-alive.log"
PID_FILE=".forever-alive.pid"

# Ensure logs directory exists
mkdir -p ./logs

# Write our PID to file for potential management
echo $$ > "$PID_FILE"

# Function to log messages with timestamp
log() {
  local message="$1"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Function to clean up on exit
cleanup() {
  log "Shutting down Forever-Alive system..."
  rm -f "$PID_FILE"
  exit 0
}

# Register trap for graceful shutdown
trap cleanup SIGINT SIGTERM

# PART 1: KEEP-ALIVE PINGING FUNCTIONALITY
# --------------------------------------

# Function to get application URL with multiple fallbacks
get_app_url() {
  # Try to get the IP address - fallback to localhost if not available
  local ip_address
  
  # Method 1: hostname -I (Linux)
  ip_address=$(hostname -I 2>/dev/null | awk '{print $1}')
  
  # Method 2: ifconfig (Unix/Linux)
  if [ -z "$ip_address" ]; then
    ip_address=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
  fi
  
  # Method 3: ip addr (Modern Linux)
  if [ -z "$ip_address" ]; then
    ip_address=$(ip addr 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
  fi
  
  # Fallback to localhost if all methods fail
  if [ -z "$ip_address" ]; then
    ip_address="localhost"
  fi
  
  echo "${ip_address}:${APP_PORT}"
}

# Function to ping the application with fallbacks
ping_app() {
  local replit_url=$(get_app_url)
  log "Pinging application at http://$replit_url..."
  
  local http_code
  local success=false
  
  # Method 1: Try with curl
  if command -v curl &>/dev/null; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://$replit_url" 2>/dev/null || echo "failed")
    
    # Check if the HTTP code starts with 2 or 3 (success or redirect)
    if [[ "$http_code" =~ ^[23] ]]; then
      log "✅ Ping successful (curl, Status: $http_code)"
      success=true
    else
      log "❌ Ping failed (curl, Status: $http_code)"
    fi
  else
    log "curl not available, trying alternative methods..."
  fi
  
  # Method 2: Try with wget if curl failed
  if [ "$success" = false ] && command -v wget &>/dev/null; then
    http_code=$(wget -q -O /dev/null --server-response "http://$replit_url" 2>&1 | awk '/^  HTTP/{print $2}' || echo "failed")
    
    if [[ "$http_code" =~ ^[23] ]]; then
      log "✅ Ping successful (wget, Status: $http_code)"
      success=true
    else
      log "❌ Ping failed (wget, Status: $http_code)"
    fi
  fi
  
  # Method 3: Try with netcat as last resort
  if [ "$success" = false ] && command -v nc &>/dev/null; then
    if nc -z -w5 "$replit_url" 2>/dev/null; then
      log "✅ Ping successful (netcat, port open)"
      success=true
    else
      log "❌ Ping failed (netcat, port closed)"
    fi
  fi
  
  # Return success or failure
  if [ "$success" = true ]; then
    return 0
  else
    return 1
  fi
}

# PART 2: STATIC SERVER FUNCTIONALITY
# --------------------------------------

# Variables for the static server component
WEBROOT="./public"
static_server_running=false
static_server_pid=""

# Ensure public directory and index.html exist
ensure_public_files() {
  mkdir -p "$WEBROOT"
  
  # Create a minimal index.html if it doesn't exist
  if [ ! -f "$WEBROOT/index.html" ]; then
    log "Creating default index.html..."
    
    cat > "$WEBROOT/index.html" <<'END'
<!DOCTYPE html>
<html>
<head>
  <title>Creately</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    
    .container {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 2rem;
    }
    
    header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    h1 {
      color: #0ea5e9;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    p.tagline {
      color: #64748b;
      font-size: 1.25rem;
      margin-top: 0;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }
    
    .feature {
      padding: 1.5rem;
      border-radius: 0.375rem;
      background-color: #f0f9ff;
      border-left: 4px solid #0ea5e9;
    }
    
    .feature h3 {
      margin-top: 0;
      color: #0369a1;
    }
    
    footer {
      text-align: center;
      margin-top: 2rem;
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .status {
      background-color: #fef2f2;
      border-radius: 0.375rem;
      padding: 1rem;
      margin: 2rem 0;
      border-left: 4px solid #ef4444;
    }
    
    .status h3 {
      margin-top: 0;
      color: #b91c1c;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Creately</h1>
      <p class="tagline">Transforming ideas into reality</p>
    </header>
    
    <div class="status">
      <h3>Maintenance Mode</h3>
      <p>The application is currently in maintenance mode. We're updating our systems to serve you better.</p>
      <p>Please check back soon. Thank you for your patience.</p>
    </div>
    
    <div class="features">
      <div class="feature">
        <h3>Adaptive Content</h3>
        <p>Analyze and optimize your stored media for platform-specific enhancements.</p>
      </div>
      
      <div class="feature">
        <h3>Collaboration Tools</h3>
        <p>Encourage teamwork with real-time editing and gamification elements.</p>
      </div>
      
      <div class="feature">
        <h3>Accessibility</h3>
        <p>Inclusive interface that fosters emotional resonance through personalized dashboards.</p>
      </div>
    </div>
    
    <footer>
      <p>&copy; 2025 Creately. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
END
    log "Created default index.html"
  fi
}

# Function to start a static server
start_static_server() {
  if [ "$static_server_running" = true ]; then
    log "Static server already running."
    return
  fi
  
  # Ensure we have the required files
  ensure_public_files
  
  # Try various methods to start a static server
  
  # Method 1: Python 3 HTTP server
  if command -v python3 &>/dev/null; then
    log "Starting Python 3 HTTP server..."
    python3 -m http.server $APP_PORT --directory "$WEBROOT" &
    static_server_pid=$!
    
    # Check if server started successfully
    sleep 2
    if kill -0 $static_server_pid 2>/dev/null; then
      log "Python 3 HTTP server started (PID: $static_server_pid)"
      static_server_running=true
      return
    else
      log "Failed to start Python 3 HTTP server"
    fi
  fi
  
  # Method 2: Python 2 SimpleHTTPServer
  if command -v python &>/dev/null; then
    log "Starting Python 2 SimpleHTTPServer..."
    (cd "$WEBROOT" && python -m SimpleHTTPServer $APP_PORT) &
    static_server_pid=$!
    
    # Check if server started successfully
    sleep 2
    if kill -0 $static_server_pid 2>/dev/null; then
      log "Python 2 SimpleHTTPServer started (PID: $static_server_pid)"
      static_server_running=true
      return
    else
      log "Failed to start Python 2 SimpleHTTPServer"
    fi
  fi
  
  # Method 3: Busybox httpd
  if command -v busybox &>/dev/null; then
    log "Starting Busybox httpd..."
    busybox httpd -p $APP_PORT -h "$WEBROOT" &
    static_server_pid=$!
    
    # Check if server started successfully
    sleep 2
    if kill -0 $static_server_pid 2>/dev/null; then
      log "Busybox httpd started (PID: $static_server_pid)"
      static_server_running=true
      return
    else
      log "Failed to start Busybox httpd"
    fi
  fi
  
  # Method 4: Netcat trick (most compatible but needs to restart frequently)
  if command -v nc &>/dev/null; then
    log "No proper HTTP server available. Will serve via netcat in the ping loop."
    # We don't start a separate process here - the ping loop will handle serving
    # This is handled in the main loop
    return
  fi
  
  log "No suitable static server method found."
}

# Function to serve a simple page with netcat
# This is used as a last resort when no proper HTTP server is available
serve_page_with_netcat() {
  log "Serving page with netcat on port $APP_PORT..."
  (echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n$(cat $WEBROOT/index.html)" | nc -l -p $APP_PORT) 2>/dev/null || true
  log "Netcat server connection closed"
}

# Function to check if npm is available
check_npm_available() {
  if command -v npm &>/dev/null; then
    log "npm is available - no need for static server fallback"
    return 0
  else
    log "npm is not available - static server fallback needed"
    return 1
  fi
}

# PART 3: MAIN EXECUTION
# --------------------------------------

log "=== Forever-Alive System Starting ==="
log "Application port: $APP_PORT"
log "Check interval: $CHECK_INTERVAL seconds"
log "Log file: $LOG_FILE"
log "PID: $$ (saved to $PID_FILE)"

# Check if npm is available, if not start static server
if ! check_npm_available; then
  start_static_server
fi

# Main loop stats
ping_count=0
success_count=0
fail_count=0
consecutive_fails=0

# MAIN LOOP - This will keep running forever
while true; do
  # Check if server is still running (might have died)
  if [ "$static_server_running" = true ] && ! kill -0 $static_server_pid 2>/dev/null; then
    log "⚠️ Static server died, restarting..."
    static_server_running=false
    start_static_server
  fi
  
  # Ping the application
  ping_count=$((ping_count + 1))
  
  if ping_app; then
    success_count=$((success_count + 1))
    consecutive_fails=0
  else
    fail_count=$((fail_count + 1))
    consecutive_fails=$((consecutive_fails + 1))
    
    # If too many consecutive failures and npm is not available, try serving with netcat
    if [ $consecutive_fails -gt 3 ] && ! check_npm_available && ! $static_server_running && command -v nc &>/dev/null; then
      log "Multiple failures detected. Attempting to serve page with netcat..."
      serve_page_with_netcat
      # Don't count this as a ping attempt
      ping_count=$((ping_count - 1))
      consecutive_fails=$((consecutive_fails - 1))
      continue
    elif [ $consecutive_fails -gt 5 ]; then
      # Adjust check interval if too many failures
      temp_interval=$((CHECK_INTERVAL / 2))
      log "⚠️ Multiple consecutive failures. Reducing check interval to $temp_interval seconds..."
      sleep $temp_interval
      continue
    fi
  fi
  
  # Simple statistics
  log "Stats: $ping_count pings, $success_count successful, $fail_count failed"
  
  # Calculate success rate
  success_rate=0
  if [ "$ping_count" -gt 0 ]; then
    success_rate=$((success_count * 100 / ping_count))
  fi
  log "Success rate: ${success_rate}%"
  
  # Wait before the next ping
  log "Waiting $CHECK_INTERVAL seconds before next ping..."
  sleep $CHECK_INTERVAL
done