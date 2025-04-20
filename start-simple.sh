
#!/bin/bash
echo "Starting Creately App with simplified script..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Set environment variables
export PORT=3000
export NODE_ENV=development

# Start the server
echo "Starting server..."
npm run dev
