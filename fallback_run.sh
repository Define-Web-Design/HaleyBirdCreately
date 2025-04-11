#!/bin/bash
# =============================================================================
# CREATELY - COLOR PALETTE GENERATOR
# FALLBACK RUNTIME SCRIPT
# =============================================================================
# This script attempts to start the server using whatever runtime is available.
# It will try Node.js first, then Python, and if neither is available, it will
# provide instructions on how to fix the environment.
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
  echo "WARNING: OpenAI API key not found. Only static features will be available."
  echo "Add your OpenAI API key to enable AI-powered palette generation."
fi

echo "Checking available runtimes..."

# Try to start with Node.js
echo "Attempting to start with Node.js..."
if command -v node &> /dev/null; then
  echo "Node.js is available: $(node --version)"
  echo "Starting server with Node.js..."
  node server.js
  exit $?
else
  echo "Node.js not available, trying Python..."
fi

# Try to start with Python
if command -v python3 &> /dev/null; then
  echo "Python 3 is available: $(python3 --version)"
  echo "Starting server with Python 3..."
  python3 simple_server.py
  exit $?
elif command -v python &> /dev/null; then
  echo "Python is available: $(python --version)"
  echo "Starting server with Python..."
  python simple_server.py
  exit $?
else
  echo "Python not available."
fi

# If we reach here, we couldn't find a suitable runtime
echo ""
echo "============================================================="
echo "ERROR: UNABLE TO START APPLICATION"
echo "============================================================="
echo "No suitable runtime (Node.js or Python) is available."
echo ""
echo "The most likely cause is the syntax error in the .replit file:"
echo "  In line 1026: mode = ""sequential"  (has an extra quote)"
echo ""
echo "NEXT STEPS:"
echo "1. Fix the .replit file syntax error"
echo "2. Install Node.js with the Replit tools:"
echo "   programming_language_install_tool([\"nodejs-20\"])"
echo "3. Add your OpenAI API key to the environment"
echo "4. Restart the application"
echo ""
echo "A static version of the application is available in"
echo "the file 'static_version.html' which you can download"
echo "and open in a web browser."
echo "============================================================="

exit 1