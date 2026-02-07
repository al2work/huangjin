#!/bin/bash

# Configuration
PORT=3000
BASE_URL="http://localhost:$PORT"
MAX_RETRIES=30
SLEEP_INTERVAL=1

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting End-to-End Test for Huangjin.xin...${NC}"

# Cleanup function to be called on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    make stop > /dev/null 2>&1
    echo -e "${GREEN}Cleanup complete.${NC}"
}

# Register cleanup to run on script exit (success or failure)
trap cleanup EXIT

# 1. Build the project
echo -e "\n${YELLOW}[Step 1/4] Building Docker image...${NC}"
if make build; then
    echo -e "${GREEN}Build successful.${NC}"
else
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# 2. Run the container
echo -e "\n${YELLOW}[Step 2/4] Starting container...${NC}"
if make run; then
    echo -e "${GREEN}Container started.${NC}"
else
    echo -e "${RED}Failed to start container!${NC}"
    exit 1
fi

# 3. Wait for service to be ready
echo -e "\n${YELLOW}[Step 3/4] Waiting for service to be ready...${NC}"
ready=false
for ((i=1; i<=MAX_RETRIES; i++)); do
    if curl -s -f "$BASE_URL" > /dev/null; then
        echo -e "${GREEN}Service is up and responding!${NC}"
        ready=true
        break
    fi
    echo -n "."
    sleep $SLEEP_INTERVAL
done

if [ "$ready" = false ]; then
    echo -e "\n${RED}Timeout waiting for service to start.${NC}"
    echo -e "${YELLOW}Container Logs:${NC}"
    make logs | tail -n 20
    exit 1
fi

# 4. Run API Tests
echo -e "\n${YELLOW}[Step 4/4] Running API tests...${NC}"

# Test Function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing $name ($url)... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    content=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}PASS (Status: $http_code)${NC}"
        # Optional: check if content is valid JSON for API routes
        if [[ "$url" == *"/api/"* ]]; then
             if echo "$content" | jq . >/dev/null 2>&1; then
                 echo -e "  -> ${GREEN}Valid JSON received${NC}"
             else
                 echo -e "  -> ${RED}Invalid JSON received${NC}"
                 # We treat invalid JSON as a failure for API routes
                 exit 1
             fi
        fi
    else
        echo -e "${RED}FAIL (Status: $http_code, Expected: $expected_code)${NC}"
        echo "Response: $content"
        exit 1
    fi
}

# Execute Tests
test_endpoint "Home Page" "$BASE_URL/" 200
test_endpoint "Prices API" "$BASE_URL/api/prices" 200
test_endpoint "History API (Gold)" "$BASE_URL/api/history?symbol=Au99.99" 200

echo -e "\n${GREEN}All tests passed successfully!${NC}"
# Cleanup happens automatically via trap
