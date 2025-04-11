#!/bin/bash

# Control script for the Never-Sleep system
# Usage: ./control-app.sh [start|stop|status|restart|logs]

# Function to log messages
log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1"
}

# Function to check if Never-Sleep is running
check_status() {
  if [ -f .never-sleep.pid ]; then
    PID=$(cat .never-sleep.pid)
    if ps -p $PID > /dev/null; then
      log "Never-Sleep system is RUNNING (PID: $PID)"
      return 0
    else
      log "Never-Sleep system is NOT RUNNING (stale PID file exists)"
      return 1
    fi
  else
    log "Never-Sleep system is NOT RUNNING (no PID file)"
    return 1
  fi
}

# Function to start the Never-Sleep system
start_system() {
  log "Starting Never-Sleep system..."
  ./startup.sh > /dev/null 2>&1 &
  sleep 3
  check_status
}

# Function to stop the Never-Sleep system
stop_system() {
  if [ -f .never-sleep.pid ]; then
    PID=$(cat .never-sleep.pid)
    if ps -p $PID > /dev/null; then
      log "Stopping Never-Sleep system (PID: $PID)..."
      kill $PID
      sleep 2
      
      # Check if it's still running
      if ps -p $PID > /dev/null; then
        log "Forcing termination..."
        kill -9 $PID
      fi
      
      rm .never-sleep.pid
      log "Never-Sleep system stopped"
    else
      log "Never-Sleep is not running (stale PID file removed)"
      rm .never-sleep.pid
    fi
  else
    log "Never-Sleep is not running (no PID file found)"
  fi
  
  # Kill any other node processes that might be related
  pkill -f "never-sleep.js" || true
}

# Function to show log files
show_logs() {
  if [ -f "logs/never-sleep.log" ]; then
    echo "=== Last 50 lines of Never-Sleep log ==="
    tail -n 50 logs/never-sleep.log
  else
    log "No log file found at logs/never-sleep.log"
  fi
}

# Handle the command
case "$1" in
  start)
    if check_status; then
      log "Never-Sleep is already running"
    else
      start_system
    fi
    ;;
  stop)
    stop_system
    ;;
  restart)
    log "Restarting Never-Sleep system..."
    stop_system
    sleep 2
    start_system
    ;;
  status)
    check_status
    ;;
  logs)
    show_logs
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart|logs}"
    exit 1
    ;;
esac

exit 0