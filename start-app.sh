
#!/bin/bash

echo "====================================="
echo "Starting Creately application..."
echo "====================================="

# Make sure we're in the project root
cd "$(dirname "$0")"

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed or not in PATH"
  exit 1
fi

# Run the application with error handling
echo "Running npm run dev..."
npm run dev || {
  echo "Error: Development server failed to start"
  echo "Trying fallback method..."
  node simple-server.cjs
}
