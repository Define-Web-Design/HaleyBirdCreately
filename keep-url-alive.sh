#!/bin/bash

# Ultra-Simple Bash Keep-Alive Script with Process Guarantees
# Designed to work with minimal dependencies and stay running even in unstable environments
# Includes self-healing mechanisms and multiple fallback strategies

# Configuration
APP_PORT="5173"  # Default Vite server port for our application
CHECK_INTERVAL=55  # Seconds between checks (just under 1 minute)
LOG_FILE="./logs/bash-keep-alive.log"
PID_FILE=".bash-keep-alive.pid"

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Write PID file
echo $$ > "$PID_FILE"

# Function to log messages
log() {
  local message="$1"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Function to clean up on exit
cleanup() {
  log "Shutting down keep-alive system..."
  rm -f "$PID_FILE"
  exit 0
}

# Register trap for graceful shutdown
trap cleanup SIGINT SIGTERM

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
    if nc -z -w5 $replit_url 2>/dev/null; then
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

# Main loop in a function to allow for self-healing
run_keep_alive() {
  local ping_count=0
  local success_count=0
  local fail_count=0
  local consecutive_fails=0
  
  log "=== Bash Keep-Alive System Starting ==="
  log "Check interval: $CHECK_INTERVAL seconds"
  log "Log file: $LOG_FILE"
  log "PID: $$ (saved to $PID_FILE)"
  
  while true; do
    ping_count=$((ping_count + 1))
    
    if ping_app; then
      success_count=$((success_count + 1))
      consecutive_fails=0
    else
      fail_count=$((fail_count + 1))
      consecutive_fails=$((consecutive_fails + 1))
      
      # Self-healing: adjust check interval if too many consecutive failures
      if [ $consecutive_fails -gt 5 ]; then
        local temp_interval=$((CHECK_INTERVAL / 2))
        log "⚠️ Multiple consecutive failures. Temporarily reducing check interval to $temp_interval seconds..."
        sleep $temp_interval
        continue
      fi
    fi
    
    # Simple statistics
    log "Stats: $ping_count pings, $success_count successful, $fail_count failed"
    local success_rate=0
    if [ "$ping_count" -gt 0 ]; then
      success_rate=$((success_count * 100 / ping_count))
    fi
    log "Success rate: ${success_rate}%"
    
    # Wait before the next ping
    log "Waiting $CHECK_INTERVAL seconds before next ping..."
    sleep $CHECK_INTERVAL
  done
}

# Watchdog function to ensure the keep-alive process stays running
watchdog() {
  log "Starting keep-alive watchdog process..."
  
  while true; do
    # Start the keep-alive process in the background
    run_keep_alive &
    KEEP_ALIVE_PID=$!
    log "Keep-alive process started with PID: $KEEP_ALIVE_PID"
    
    # Wait for the process to exit
    wait $KEEP_ALIVE_PID
    
    # If we get here, the process has terminated unexpectedly
    log "⚠️ Keep-alive process terminated unexpectedly! Restarting in 5 seconds..."
    sleep 5
  done
}

# Start the watchdog (which manages the keep-alive process)
watchdog