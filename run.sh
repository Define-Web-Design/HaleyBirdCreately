#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p ./logs

echo "Starting Creately application with keep-alive functionality..."

# First, start the keep-alive monitoring service in the background
node scripts/replit-keep-alive.js > ./logs/keep-alive.log 2>&1 &
KEEP_ALIVE_PID=$!

echo "Keep-alive service started with PID: $KEEP_ALIVE_PID"

# Start the main application with auto-restart capability
node scripts/keep-app-running.js

# If the application exits, make sure to clean up the keep-alive process
kill $KEEP_ALIVE_PID 2>/dev/null || true
