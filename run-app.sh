#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Use local Node.js binaries if available
if [ -f "./node_bin/node" ]; then
  export PATH="./node_bin:$PATH"
  chmod +x ./node_bin/node ./node_bin/npm
  echo "Using local Node.js: $(./node_bin/node -v)"
else
  echo "Using system Node.js: $(node -v)"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
echo "Building application..."
npm run build

# Start the application in production mode
echo "Starting application..."
NODE_ENV=production node dist/index.js