#!/bin/bash
# Database Workflow Shortcut
# This script runs database schema updates

# Make run-app.sh executable if it's not
if [[ -f "run-app.sh" && ! -x "run-app.sh" ]]; then
  chmod +x run-app.sh
fi

# Run the database workflow
./run-app.sh database