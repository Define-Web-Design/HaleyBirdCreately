
#!/bin/bash
echo "Starting monitor..."

# Make sure the script is executable
chmod +x monitor.js

# Create logs directory if it doesn't exist
mkdir -p logs

# Try to use node_bin/node first, fallback to system node
if [ -f "./node_bin/node" ]; then
  echo "Using node_bin/node"
  ./node_bin/node monitor.js
else
  echo "Using system node"
  node monitor.js
fi
