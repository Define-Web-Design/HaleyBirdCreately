#!/bin/bash

# Start Keep-Alive Flask Service
echo "Starting Keep-Alive Service..."

# Check if Python is available
if command -v python &>/dev/null; then
  # Create a virtual environment if it doesn't exist
  if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
  fi
  
  # Activate the virtual environment
  source venv/bin/activate
  
  # Install requirements
  echo "Installing requirements..."
  pip install flask requests
  
  # Start the keep-alive service
  echo "Starting Keep-Alive Service..."
  python keep_alive_flask.py
else
  # Fallback to the bash version if Python is not available
  echo "Python not found, using bash fallback instead..."
  bash keep-url-alive.sh
fi