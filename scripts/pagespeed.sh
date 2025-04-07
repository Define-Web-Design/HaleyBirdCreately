#!/bin/bash

# PageSpeed Insights Analysis Helper Script
# This script makes it easier to run PageSpeed Insights analysis on your app

# Color codes for output formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display usage information
function show_usage {
  echo -e "${YELLOW}PageSpeed Insights Analysis Helper${NC}"
  echo -e "${BLUE}====================================${NC}"
  echo -e "Usage: ./scripts/pagespeed.sh [options] <url>"
  echo ""
  echo -e "${GREEN}Options:${NC}"
  echo "  -m, --mobile    Run analysis for mobile devices (default)"
  echo "  -d, --desktop   Run analysis for desktop devices"
  echo "  -h, --help      Show this help message"
  echo ""
  echo -e "${GREEN}Examples:${NC}"
  echo "  ./scripts/pagespeed.sh https://your-app.replit.app"
  echo "  ./scripts/pagespeed.sh -d https://your-app.replit.app"
  echo ""
}

# Set default values
DEVICE="mobile"
URL=""

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--mobile)
      DEVICE="mobile"
      shift
      ;;
    -d|--desktop)
      DEVICE="desktop"
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      URL="$1"
      shift
      ;;
  esac
done

# Check if URL is provided
if [ -z "$URL" ]; then
  echo -e "${RED}Error: URL is required${NC}"
  show_usage
  exit 1
fi

# Inform the user about what's happening
echo -e "${BLUE}Running PageSpeed Insights analysis for ${YELLOW}$URL${BLUE} on ${YELLOW}$DEVICE${BLUE} device...${NC}"
echo ""

# Run the analysis
node scripts/pagespeed-insights.js "$URL" "$DEVICE"

# Exit with the same status code as the Node.js script
exit $?