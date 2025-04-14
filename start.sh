
#!/bin/bash

echo "Starting Creately application..."

# Setup environment
mkdir -p logs
export PATH="./node_bin:$PATH:$HOME/n/bin:$HOME/.n/bin"

# Check for dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install || npm install --legacy-peer-deps
fi

# Determine run mode
if [ "$NODE_ENV" == "production" ]; then
  echo "Running in production mode..."
  npm run build && NODE_ENV=production node dist/index.js
else
  echo "Running in development mode..."
  npm run dev
fi
