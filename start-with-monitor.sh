#!/bin/bash

# This script starts the application with our reliability monitor

echo "Starting Creately application with monitor..."

# Kill any existing processes
pkill -f "npm run dev" || true
pkill -f "node ensure-running.js" || true

# Start the monitor
node ensure-running.js &
MONITOR_PID=$!

echo "Application monitor started with PID: $MONITOR_PID"
echo ""
echo "===================== IMPORTANT ====================="
echo "To view your application, open one of these URLs:"
echo "1. https://dd22ee87-95ee-4ecd-8592-0e9c8d023bbb.id.replit.dev/"
echo "2. https://5000-dd22ee87-95ee-4ecd-8592-0e9c8d023bbb.id.replit.dev/"
echo ""
echo "If the application stops, it will automatically restart"
echo "===================================================="

# Keep this script running to keep monitor alive
while true; do
  sleep 60
  
  # Check if monitor is still running
  if ! ps -p $MONITOR_PID > /dev/null; then
    echo "[$(date)] Monitor died, restarting..."
    node ensure-running.js &
    MONITOR_PID=$!
    echo "[$(date)] Monitor restarted with PID: $MONITOR_PID"
  fi
done