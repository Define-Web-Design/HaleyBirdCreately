
#!/bin/bash
set -e

# Environment detection
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV="production"
fi

echo "Starting Creately in $NODE_ENV mode..."

# Ensure PORT is set
if [ -z "$PORT" ]; then
  export PORT=3000
fi

# Verify node is available
if ! command -v node &> /dev/null; then
  echo "Node.js not found in PATH, checking alternatives..."
  if [ -f "/usr/bin/nodejs" ]; then
    NODE_CMD="/usr/bin/nodejs"
  elif [ -f "/nix/store/*/bin/node" ]; then
    NODE_CMD=$(find /nix/store -path "*/bin/node" -type f -executable | head -n 1)
  else
    echo "ERROR: Cannot find Node.js. Please check installation."
    exit 1
  fi
else
  NODE_CMD="node"
fi

# Build if necessary
if [ "$NODE_ENV" = "production" ]; then
  if [ ! -d "./dist" ] || [ ! -f "./dist/index.js" ]; then
    echo "Building application..."
    npm run build
  fi
  
  # Start production server
  echo "Starting production server on port $PORT..."
  $NODE_CMD dist/index.js
else
  # Start development server
  echo "Starting development server on port $PORT..."
  npm run dev
fi
