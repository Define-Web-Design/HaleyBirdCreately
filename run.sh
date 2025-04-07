#!/bin/bash
# =============================================================================
# CREATELY - COLOR PALETTE GENERATOR
# LAUNCH SCRIPT
# =============================================================================
# This script attempts to start the server using the best available runtime
# =============================================================================

# Default environment variables
export PORT=${PORT:-3000}

# Load environment variables from .env if present
if [ -f ".env" ]; then
  echo "Loaded environment variables from .env file"
  export $(grep -v '^#' .env | xargs)
fi

# Check if we have an OpenAI API key
if [ -n "$OPENAI_API_KEY" ]; then
  echo "OpenAI API key found in environment variables"
else 
  echo "WARNING: OpenAI API key not found. Default color palettes will be used."
fi

# The .replit file has a syntax error in line 1026: mode = ""sequential"
# which prevents using package installer and other Replit tools.
# Let's try to use whatever runtime is available.

echo "Checking available runtimes..."

if command -v node &> /dev/null; then
  echo "Found Node.js: $(node --version)"
  echo "Starting application with Node.js..."
  node server.js
  exit $?
elif command -v python3 &> /dev/null; then
  echo "Found Python 3: $(python3 --version)"
  echo "Starting application with Python 3..."
  python3 simple_server.py
  exit $?
elif command -v python &> /dev/null; then
  echo "Found Python: $(python --version)"
  echo "Starting application with Python..."
  python simple_server.py
  exit $?
else
  echo "ERROR: No compatible runtime (Node.js or Python) is available."
  echo "You need to fix the .replit file syntax error in line 1026."
  echo "The current line has: mode = ""sequential" with an extra quote."
  echo "It should be: mode = "sequential""
  echo ""
  echo "After fixing the .replit file, you can install Node.js using the Replit tools"
  echo ""
  echo "For now, you can download the static_version.html file for a basic demonstration."
  
  # Make the static HTML file available for download
  echo "Ensuring static_version.html is accessible..."
  cp static_version.html /tmp/static_version.html 2>/dev/null || true
  cp /tmp/static_version.html ./static_version.html 2>/dev/null || true
  chmod 644 static_version.html 2>/dev/null || true
  
  exit 1
fi