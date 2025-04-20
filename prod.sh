#!/bin/bash
# Production Workflow Shortcut
# This script builds and runs the application in production mode

# Make run-app.sh executable if it's not
if [[ -f "run-app.sh" && ! -x "run-app.sh" ]]; then
  chmod +x run-app.sh
fi

# Run the production workflow
./run-app.sh production