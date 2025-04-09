#!/bin/bash

echo "Killing any existing Node.js processes..."
pkill -f node || true

echo "Starting static server..."
node static-server.js