
#!/bin/bash

# Enhanced deployment script with fallback mechanisms
echo "📦 Starting deployment process..."

# Environment setup
export NODE_ENV=production
export PORT=3000

# Clean build artifacts if they exist
if [ -d "dist" ]; then
  echo "🧹 Cleaning previous build..."
  rm -rf dist
fi

# Install dependencies with fallback mechanisms
echo "📚 Installing dependencies..."
npm install --include=dev || npm install || (echo "⚠️ Standard install failed, trying basic install..." && npm i --no-optional)

# Build the application with fallback
echo "🔨 Building application..."
npm run build || (echo "⚠️ Build failed, attempting alternative build..." && npx vite build)

# Verify build succeeded
if [ ! -d "dist" ]; then
  echo "❌ Build failed! Deploying fallback server..."
  # Start fallback server if build fails
  NODE_ENV=production node simple-server.cjs
  exit 1
fi

echo "✅ Build successful!"

# Start the server
echo "🚀 Starting server..."
NODE_ENV=production PORT=3000 node dist/index.js
