#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Default values
URL=${1:-${APP_URL:-"https://creately.repl.co"}}
STRATEGY=${2:-"mobile"}

# Run the PageSpeed Insights script
node "$SCRIPT_DIR/pagespeed-insights.js" "$URL" "$STRATEGY"