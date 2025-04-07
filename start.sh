#!/bin/bash

# Display diagnostic info
echo "======================================"
echo "Creately - Color Palette Generator"
echo "======================================"
echo "Server boot attempt initiated at $(date)"
echo "Environment: $(uname -a)"
echo ""

# Load environment variables from .env if present
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
  echo "Environment variables loaded."
fi

# Check if we have an OpenAI API key 
if [ -n "$OPENAI_API_KEY" ]; then
  echo "OpenAI API key found in environment variables."
else 
  echo "WARNING: OpenAI API key not found. Only static features will be available."
fi

# Check for Node.js
if command -v node &> /dev/null; then
  echo "Node.js found: $(node --version)"
  echo "Starting Node.js server..."
  
  # In case package.json exists, we'll try to run the dev script
  if [ -f "package.json" ]; then
    NODE_ENV=production node server.js
  else
    echo "No package.json found. Falling back to direct server.js execution."
    node server.js
  fi
  exit $?
fi

# Check for Python
if command -v python3 &> /dev/null; then
  echo "Python found: $(python3 --version)"
  echo "Starting Python server..."
  python3 simple_server.py
  exit $?
fi

if command -v python &> /dev/null; then
  echo "Python found: $(python --version)"
  echo "Starting Python server..."
  python simple_server.py
  exit $?
fi

# If we get here, we couldn't find a suitable runtime
echo "ERROR: No suitable runtime found. Serving static file instead."
echo "Available in static_version.html"
echo ""
echo "You can access the static version by:"
echo "1. Downloading the static_version.html file"
echo "2. Opening it in any web browser"
echo ""
echo "To fix this issue:"
echo "1. Fix the .replit file (line 1026 has an extra quote)"
echo "2. Install Node.js or Python"
echo "3. Add your OpenAI API key"
echo "4. Restart the application"

exit 1