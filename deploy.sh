#!/bin/bash
# Deployment Workflow Shortcut
# This script builds and deploys the application for production use

# Make run-app.sh executable if it's not
if [[ -f "run-app.sh" && ! -x "run-app.sh" ]]; then
  chmod +x run-app.sh
fi

# Run the deployment workflow
./run-app.sh deploy