#!/bin/bash
# Development Workflow Shortcut
# This script runs the application in development mode

# Make run-app.sh executable if it's not
if [[ -f "run-app.sh" && ! -x "run-app.sh" ]]; then
  chmod +x run-app.sh
fi

# Run the development workflow
./run-app.sh development