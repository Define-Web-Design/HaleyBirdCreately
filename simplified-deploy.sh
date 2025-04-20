
#!/bin/bash

echo "Starting minimal deployment process..."

# Ensure we're using the local Node.js binaries
export PATH="./node_bin:$PATH"

# Essential steps only
echo "1. Installing production dependencies..."
npm install --production --no-optional

echo "2. Building the application..."
npm run build

echo "3. Starting in production mode..."
NODE_ENV=production node dist/index.js
