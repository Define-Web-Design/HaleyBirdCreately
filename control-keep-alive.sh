#!/bin/bash

# Control script for managing the keep-alive system
# This script allows you to start, stop, and check the status of the keep-alive service

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to log messages
log() {
  local message="$1"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S UTC")
  echo "[$timestamp] $message"
}

# Function to find any keep-alive processes running
find_keep_alive_processes() {
  # Check all pid files we might be using
  local pid_files=(".keep-alive.pid" ".bash-keep-alive.pid" ".never-sleep.pid")
  local pids=()
  
  # First check existing PID files
  for pid_file in "${pid_files[@]}"; do
    if [ -f "$pid_file" ]; then
      local pid=$(cat "$pid_file")
      if ps -p $pid > /dev/null; then
        pids+=($pid)
      else
        # Remove stale pid file
        rm "$pid_file"
      fi
    fi
  done
  
  # If no pid files found, try to find by process name
  if [ ${#pids[@]} -eq 0 ]; then
    local process_pids=$(pgrep -f "keep-url-alive.sh" 2>/dev/null)
    if [ -n "$process_pids" ]; then
      pids+=($process_pids)
    fi
  fi
  
  echo "${pids[@]}"
}

# Function to start the keep-alive service
start_service() {
  # Check if already running
  local running_pids=$(find_keep_alive_processes)
  if [ -n "$running_pids" ]; then
    log "Keep-alive service is already running (PIDs: $running_pids)"
    return 0
  fi
  
  log "Starting keep-alive service..."
  nohup ./keep-url-alive.sh > logs/keep-alive-output.log 2>&1 &
  echo $! > .keep-alive.pid
  log "Started keep-alive service (PID: $!)"
}

# Function to stop the keep-alive service
stop_service() {
  local running_pids=$(find_keep_alive_processes)
  
  if [ -z "$running_pids" ]; then
    log "No keep-alive processes found. Service may not be running."
    return 1
  fi
  
  log "Stopping keep-alive service (PIDs: $running_pids)..."
  
  for pid in $running_pids; do
    kill $pid 2>/dev/null
    log "Stopped process with PID $pid"
  done
  
  # Clean up any pid files
  rm -f .keep-alive.pid .bash-keep-alive.pid .never-sleep.pid
  
  log "Keep-alive service stopped"
}

# Function to check if the keep-alive service is running
is_running() {
  local running_pids=$(find_keep_alive_processes)
  if [ -n "$running_pids" ]; then
    return 0
  else
    return 1
  fi
}

# Function to check the status of the keep-alive service
check_status() {
  local running_pids=$(find_keep_alive_processes)
  
  if [ -n "$running_pids" ]; then
    log "Keep-alive service is running (PIDs: $running_pids)"
    
    for pid in $running_pids; do
      local uptime=$(ps -o etime= -p $pid 2>/dev/null)
      log "- Process $pid uptime: $uptime"
    done
    
    # Show recent logs
    if [ -f logs/bash-keep-alive.log ]; then
      echo "--- Last 5 lines from bash-keep-alive.log ---"
      tail -n 5 logs/bash-keep-alive.log
    elif [ -f logs/keep-alive.log ]; then
      echo "--- Last 5 lines from keep-alive.log ---"
      tail -n 5 logs/keep-alive.log
    elif [ -f logs/never-sleep.log ]; then
      echo "--- Last 5 lines from never-sleep.log ---"
      tail -n 5 logs/never-sleep.log
    fi
  else
    log "Keep-alive service is not running"
  fi
}

# Process command line arguments
case "$1" in
  start)
    start_service
    ;;
  stop)
    stop_service
    ;;
  restart)
    stop_service
    sleep 2
    start_service
    ;;
  status)
    check_status
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0