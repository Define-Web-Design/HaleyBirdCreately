#!/bin/bash

# Start the Creately code snippet server
echo "🚀 Starting Creately Code Snippet Server..."
echo "  📋 Using Node.js version: $(./node_bin/node -v)"

# Kill any existing processes on port 3000
if lsof -i:3000 -t &> /dev/null; then
  echo "  🔄 Stopping existing server on port 3000..."
  kill -9 $(lsof -i:3000 -t) 2>/dev/null || true
fi

# Start the server
echo "  🔌 Starting server on port 3000..."
export PORT=3000
./node_bin/node server.js