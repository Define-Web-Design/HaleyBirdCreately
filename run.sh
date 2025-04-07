#!/bin/bash

# Read from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded environment variables from .env file"
else
  echo "No .env file found, using default environment variables"
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OpenAI API key not found in environment variables."
  echo "The color palette generation will use default colors instead of AI-generated ones."
  
  # Ask if the user wants to provide an API key
  read -p "Would you like to provide an OpenAI API key now? (y/n): " answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    read -p "Enter your OpenAI API key: " api_key
    export OPENAI_API_KEY="$api_key"
    echo "OpenAI API key set for this session"
  fi
else
  echo "OpenAI API key found in environment variables"
fi

# Start the Node.js server
echo "Starting Creately API server..."
node server.js