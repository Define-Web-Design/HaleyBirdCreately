
#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=== Creately Environment Diagnostics ===${NC}"
echo ""

# Check Node.js
echo -e "${BOLD}Node.js:${NC}"
if command -v node &> /dev/null; then
  version=$(node -v)
  echo -e "  ${GREEN}✓ Node.js installed: $version${NC}"
else
  if [ -f "./node_bin/node" ]; then
    version=$(./node_bin/node -v)
    echo -e "  ${YELLOW}⚠ System Node.js not found, but local version exists: $version${NC}"
  else
    echo -e "  ${RED}✗ No Node.js installation found!${NC}"
  fi
fi

# Check npm
echo -e "${BOLD}npm:${NC}"
if command -v npm &> /dev/null; then
  version=$(npm -v)
  echo -e "  ${GREEN}✓ npm installed: $version${NC}"
else
  if [ -f "./node_bin/npm" ]; then
    version=$(./node_bin/npm -v)
    echo -e "  ${YELLOW}⚠ System npm not found, but local version exists: $version${NC}"
  else
    echo -e "  ${RED}✗ No npm installation found!${NC}"
  fi
fi

# Check for critical files
echo -e "${BOLD}Critical Files:${NC}"

files=(
  "package.json"
  "server/index.ts"
  "vite.config.ts"
  ".replit"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓ $file exists${NC}"
  else
    echo -e "  ${RED}✗ $file missing!${NC}"
  fi
done

# Check for dependencies
echo -e "${BOLD}Dependencies:${NC}"
if [ -d "node_modules" ]; then
  modules_count=$(find node_modules -type d -maxdepth 1 | wc -l)
  echo -e "  ${GREEN}✓ node_modules exists with $(($modules_count-1)) top-level packages${NC}"
else
  echo -e "  ${RED}✗ node_modules directory not found or empty!${NC}"
fi

# Check port usage
echo -e "${BOLD}Port Usage:${NC}"
if command -v lsof &> /dev/null; then
  port_usage=$(lsof -i :3000 2>/dev/null)
  if [ -n "$port_usage" ]; then
    echo -e "  ${YELLOW}⚠ Port 3000 is currently in use:${NC}"
    echo "$port_usage"
  else
    echo -e "  ${GREEN}✓ Port 3000 is available${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠ Cannot check port usage (lsof not available)${NC}"
fi

# Check for .env file
echo -e "${BOLD}Environment Configuration:${NC}"
if [ -f ".env" ]; then
  env_vars=$(grep -v '^#' .env | grep '=' | wc -l)
  echo -e "  ${GREEN}✓ .env file exists with $env_vars variables defined${NC}"
else
  echo -e "  ${YELLOW}⚠ No .env file found${NC}"
fi

# Check disk space
echo -e "${BOLD}Disk Space:${NC}"
disk_info=$(df -h . | tail -n 1)
echo "  $disk_info"

# Recommendations
echo -e "\n${BOLD}Recommendations:${NC}"
echo -e "1. Run './master-workflow.sh' to use the unified workflow manager"
echo -e "2. Use 'npm run dev' for development mode with live reloading"
echo -e "3. For deployment, configure settings in the Replit Deployments tab"
echo -e "4. If you encounter issues, check 'logs/workflow-manager.log'"

echo -e "\n${BLUE}${BOLD}=== Diagnostics Complete ===${NC}"
