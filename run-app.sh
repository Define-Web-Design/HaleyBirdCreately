
#!/bin/bash

# Make sure the script is executable
chmod +x ./node_bin/node ./node_bin/npm 2>/dev/null

echo "Starting application..."

# Check if we should run in production mode
if [ "$NODE_ENV" = "production" ]; then
  echo "Running in production mode"
  
  # Build first
  ./node_bin/npm run build
  
  # Run in production mode
  NODE_ENV=production ./node_bin/node dist/index.js
else
  echo "Running in development mode"
  
  # Run in development mode using node directly if TSX fails
  ./node_bin/npm run dev || ./node_bin/node server/index.ts
fi
