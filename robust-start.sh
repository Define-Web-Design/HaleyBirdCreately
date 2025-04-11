#!/bin/bash

# This script ensures the application keeps running consistently

echo "Starting Creately application with auto-restart capability..."

# Kill any existing processes that might conflict
pkill -f "npm run dev" || true
pkill -f "node server/index.js" || true
pkill -f "tsx server/index.ts" || true
pkill -f "node keep-alive.js" || true

# Start the application in the background
npm run dev &
APP_PID=$!

echo "Application started with PID: $APP_PID"

# Start the keep-alive monitor in the background
node keep-alive.js &
MONITOR_PID=$!

echo "Keep-alive monitor started with PID: $MONITOR_PID"

# Set up a watchdog process to monitor both processes
while true; do
  echo "[$(date)] Watchdog check..."
  
  # Check if app is still running
  if ! ps -p $APP_PID > /dev/null; then
    echo "[$(date)] Main application process died, restarting..."
    npm run dev &
    APP_PID=$!
    echo "[$(date)] Application restarted with PID: $APP_PID"
  fi
  
  # Check if monitor is still running
  if ! ps -p $MONITOR_PID > /dev/null; then
    echo "[$(date)] Keep-alive monitor died, restarting..."
    node keep-alive.js &
    MONITOR_PID=$!
    echo "[$(date)] Keep-alive monitor restarted with PID: $MONITOR_PID"
  fi
  
  # Ping the application to check if it's responsive
  if ! curl -s http://localhost:5000 > /dev/null; then
    echo "[$(date)] Application is not responding, restarting..."
    kill -9 $APP_PID 2>/dev/null || true
    npm run dev &
    APP_PID=$!
    echo "[$(date)] Application restarted with PID: $APP_PID"
  fi
  
  # Sleep for 30 seconds before next check
  sleep 30
done