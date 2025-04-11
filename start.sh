#!/bin/bash

echo "🚀 Clean App Startup Script for Replit"
echo "======================================="

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Ensure database connection is available
if [ -n "$DATABASE_URL" ]; then
  echo "✅ Database URL found in environment"
else
  echo "⚠️ No DATABASE_URL found, using in-memory storage"
  export USE_IN_MEMORY_DB=true
fi

# Create any missing directories
mkdir -p node_modules
mkdir -p client/dist
mkdir -p server/logs

# Check if we need to install dependencies using a flag file
if [ ! -f "node_modules/.install_complete" ]; then
  echo "📦 Installing dependencies (this may take a while)..."
  
  # Try to use npm if available
  if command -v npm &> /dev/null; then
    npm install || echo "⚠️ npm install failed, will use existing modules if available"
  else
    echo "⚠️ npm not found, will try to use existing modules"
  fi
  
  # Create a flag file to avoid reinstallation
  touch node_modules/.install_complete
fi

# Clean any stale process locks
rm -f ./.config/workflows/*.lock 2>/dev/null || true

# Start the server
echo "🌐 Starting server on port ${PORT}..."

# Try to use npm script if package.json contains dev script
if grep -q '"dev"' package.json; then
  echo "📡 Using npm run dev to start the application"
  npm run dev || FALLBACK=true
else
  # Fallback to direct command if npm script is not available
  echo "📡 Using direct command to start the application"
  if [ -f "server/index.ts" ]; then
    echo "🔍 Found server/index.ts, attempting to start..."
    npx ts-node --esm server/index.ts || FALLBACK=true
  elif [ -f "server/index.js" ]; then
    echo "🔍 Found server/index.js, attempting to start..."
    node server/index.js || FALLBACK=true
  else
    echo "⚠️ Could not find main server entry point, using fallback"
    FALLBACK=true
  fi
fi

# If all previous attempts failed, use fallback server
if [ "$FALLBACK" = "true" ]; then
  echo "🚨 Main server failed to start, using fallback server"
  if [ -f "server/simple-server.ts" ]; then
    echo "🔄 Starting fallback server..."
    npx ts-node server/simple-server.ts
  else
    echo "❌ Error: Could not find fallback server. Please check your installation."
    exit 1
  fi
fi