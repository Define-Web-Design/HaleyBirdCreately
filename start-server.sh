
#!/bin/bash
set -e

echo "Starting Creately application server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed or not in PATH. Using Replit Node.js..."
  
  # Try to use node from nix store
  if [ -d "/nix/store" ]; then
    NODEJS_PATH=$(find /nix/store -path "*/bin/node" -type f -executable | head -n 1)
    if [ -n "$NODEJS_PATH" ]; then
      echo "Using Node.js at $NODEJS_PATH"
      NODE_CMD="$NODEJS_PATH"
    fi
  fi
  
  # Fallback to local node if available
  if [ -z "$NODE_CMD" ] && [ -f "./node_bin/node" ]; then
    echo "Using local Node.js"
    NODE_CMD="./node_bin/node"
  fi
else
  NODE_CMD="node"
fi

# Check if we have a custom node command now
if [ -z "$NODE_CMD" ]; then
  echo "ERROR: Cannot find Node.js. Please install Node.js or check your PATH."
  exit 1
fi

# Set the NODE_ENV if not already set
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV="production"
fi

# If database URL not set, warn about it
if [ -z "$DATABASE_URL" ] && [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set. Application may not function correctly."
fi

# In production mode, check for built files
if [ "$NODE_ENV" = "production" ]; then
  if [ ! -d "./dist" ]; then
    echo "Building application..."
    npm run build
  fi
  
  echo "Starting production server..."
  $NODE_CMD dist/index.js
else
  echo "Starting development server..."
  $NODE_CMD -r ts-node/register server/index.ts
fi
