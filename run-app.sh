
#!/bin/bash
set -e

# Environment setup
export NODE_ENV=production

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting in production mode..."
  # Run the production build if it exists
  if [ -d "./dist" ]; then
    echo "Using existing build"
  else
    echo "Building application..."
    npm run build
  fi
  # Start the production server
  echo "Starting production server..."
  node dist/index.js
else
  # Start development server
  echo "Starting in development mode..."
  npm run dev
fi
