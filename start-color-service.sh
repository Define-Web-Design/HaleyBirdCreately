#!/bin/bash

# Start Color Service Script
# This script starts the color service with proper error handling and logging

echo "=== Creately Color Service Starter ==="
echo "Starting color service..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Kill any existing instances of the service
if pgrep -f "color-service.sh" > /dev/null; then
    echo "Stopping existing color service instances..."
    pkill -f "color-service.sh"
    sleep 1
fi

# Start the service in the background
./color-service.sh > logs/color-service.log 2>&1 &

# Check if service started successfully
sleep 2
if pgrep -f "color-service.sh" > /dev/null; then
    echo "Color service started successfully!"
    echo "The service is running on http://0.0.0.0:8080"
    echo "You can access it in your browser at http://0.0.0.0:8080"
    echo "Log file: logs/color-service.log"
else
    echo "Failed to start color service. Check logs/color-service.log for details."
    cat logs/color-service.log
    exit 1
fi

echo "=== Service startup complete ==="