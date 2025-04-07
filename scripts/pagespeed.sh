
#!/bin/bash

# Script to run PageSpeed Insights for the application
# Usage: ./scripts/pagespeed.sh [URL]

# Set default URL if not provided
URL=${1:-"https://replit.app"}

# Check if API key is set
if [ -z "$PAGESPEED_INSIGHTS_API_KEY" ]; then
  echo "Error: PAGESPEED_INSIGHTS_API_KEY environment variable is not set"
  echo "Please set it in your .env file or export it in your shell"
  exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs/pagespeed

# Run the pagespeed script
echo "Running PageSpeed Insights for $URL"
node scripts/pagespeed-insights.js "$URL"
