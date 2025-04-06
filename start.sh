#!/bin/bash

echo "Starting Creately application..."

# Use the PATH provided by Replit
export PATH="/nix/store/sxw7i3pyw8v1ycw2sph0zq2byh1prrwm-nodejs-20.18.1/bin:$PATH"

# Check Node.js and npm versions
echo "Node.js version:"
node --version
echo "npm version:"
npm --version

# Run the application
npm run dev

# Exit with the same code as the application
exit $?