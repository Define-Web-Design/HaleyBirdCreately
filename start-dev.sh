#!/bin/bash
# Development startup script for Creately

# Set development configuration
export NODE_ENV=development
export BYPASS_AUTH=true
export VITE_AUTO_LOGIN=true

# Start the development server
echo "Starting Creately in development mode with auth bypass enabled..."
npm run dev