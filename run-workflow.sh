#!/bin/bash

# Simple script to run a specific workflow using run-app.sh
# Usage: ./run-workflow.sh <workflow-name>

if [ -z "$1" ]; then
  echo "Usage: ./run-workflow.sh <workflow-name>"
  echo "Available workflows: Development Mode, Production Build, Deploy Application, Database Management"
  echo "Or use numbers 1-4 respectively"
  exit 1
fi

# Make the main script executable
chmod +x run-app.sh

# Run the specified workflow
./run-app.sh "$1"