
#!/bin/bash

# Display banner
echo "====================================="
echo "   Simplified Deployment Script"
echo "====================================="

# Ensure script exits if any command fails
set -e

echo "1. Installing dependencies (including dev dependencies)..."
npm install --include=dev

echo "2. Building for production..."
NODE_ENV=production npm run build

echo "3. Starting production server..."
NODE_ENV=production node dist/index.js
