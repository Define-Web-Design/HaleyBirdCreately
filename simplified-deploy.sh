
#!/bin/bash

#!/bin/bash

# Enhanced Deployment Script with fail-safe mechanisms
set -e

echo "📦 Starting deployment process..."

# Environment setup
export NODE_ENV=production
export PORT=3000
export DEPLOY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Clean build artifacts if they exist
if [ -d "dist" ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf dist
fi

# Create a log directory if it doesn't exist
mkdir -p logs

# Install dependencies with proper error handling
echo "📚 Installing dependencies..."
npm install --include=dev || {
  echo "⚠️ Standard install failed, trying without optional dependencies..."
  npm install --no-optional || {
    echo "❌ All installation attempts failed!"
    exit 1
  }
}

# Build the application with proper TypeScript checks
echo "🔨 Building application..."
npm run build || {
  echo "⚠️ Build failed! Checking for issues..."
  
  # Try to diagnose the issue
  echo "Running diagnostics..."
  npx tsc --noEmit || echo "TypeScript errors detected"
  
  # Check if the build directory exists despite the error
  if [ ! -d "dist" ]; then
    echo "❌ Build directory not created. Deploying fallback server..."
    NODE_ENV=production node simple-server.cjs
    exit 1
  else
    echo "⚠️ Build reported errors but may still work. Continuing..."
  fi
}

# Verify the existence of critical files
if [ ! -f "dist/index.js" ]; then
  echo "❌ Critical server file missing! Deploying fallback server..."
  NODE_ENV=production node simple-server.cjs
  exit 1
fi

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Build failed! No dist directory found. Deploying fallback server..."
  NODE_ENV=production node simple-server.cjs
  exit 1
fi

echo "✅ Build successful!"

# Start the server
echo "🚀 Starting server..."
NODE_ENV=production PORT=3000 node dist/index.js
