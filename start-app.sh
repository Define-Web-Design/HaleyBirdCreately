#!/bin/bash
# Creately Application Runner
# This script provides a user-friendly way to start the Creately application

# Set terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃                                                     ┃"
echo -e "┃   ${CYAN}Creately Application${BLUE}                            ┃"
echo -e "┃   ${YELLOW}Advanced Intelligent Collaborative Platform${BLUE}       ┃"
echo "┃                                                     ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo -e "${NC}"

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  No DATABASE_URL found. Will use in-memory database.${NC}"
else
  echo -e "${GREEN}✅ Database URL found.${NC}"
fi

# Check for required API keys
if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  No OPENAI_API_KEY found. Some AI features may be limited.${NC}"
else
  echo -e "${GREEN}✅ OpenAI API key found.${NC}"
fi

if [ -z "$MISTRAL_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  No MISTRAL_API_KEY found. Some AI features may be limited.${NC}"
else
  echo -e "${GREEN}✅ Mistral API key found.${NC}"
fi

# Ensure the script is executable
if [ ! -x "./start.sh" ]; then
  echo -e "${YELLOW}📝 Making start.sh executable...${NC}"
  chmod +x ./start.sh
fi

echo ""
echo -e "${CYAN}Starting Creately application...${NC}"
echo ""

# Start the application
./start.sh

exit $?