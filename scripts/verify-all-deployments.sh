#!/bin/bash

# Verify All RYLA App Deployments
#
# This script verifies that all RYLA applications are deployed and accessible.
# It checks health endpoints, Fly.io status, and domain resolution.
#
# Usage:
#   ./scripts/verify-all-deployments.sh

set -e

echo "========================================="
echo "RYLA Deployment Verification"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Apps to check
declare -A APPS=(
    ["landing"]="www.ryla.ai:/api/health:ryla-landing-prod"
    ["funnel"]="goviral.ryla.ai:/api/health:ryla-funnel-prod"
    ["web"]="app.ryla.ai:/api/health:ryla-web-prod"
    ["api"]="end.ryla.ai:/health:ryla-api-prod"
    ["admin"]="admin.ryla.ai:/api/health:ryla-admin-prod"
)

# Check Fly.io CLI
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ Fly.io CLI is not installed${NC}"
    exit 1
fi

if ! flyctl auth whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Fly.io${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Fly.io CLI ready${NC}"
echo ""

# Check each app
TOTAL=0
PASSED=0
FAILED=0

for app_name in "${!APPS[@]}"; do
    IFS=':' read -r domain health_path fly_app <<< "${APPS[$app_name]}"
    TOTAL=$((TOTAL + 1))
    
    echo "========================================="
    echo -e "${BLUE}Checking: $app_name${NC}"
    echo "========================================="
    echo "  Domain: $domain"
    echo "  Health: $health_path"
    echo "  Fly App: $fly_app"
    echo ""
    
    # Check Fly.io app exists
    echo -n "  Fly.io app exists... "
    if flyctl apps list | grep -q "$fly_app"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        FAILED=$((FAILED + 1))
        echo ""
        continue
    fi
    
    # Check Fly.io status
    echo -n "  Fly.io status... "
    if flyctl status --app "$fly_app" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️${NC}"
    fi
    
    # Check DNS resolution
    echo -n "  DNS resolution... "
    if dig +short "$domain" | grep -q .; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        FAILED=$((FAILED + 1))
        echo ""
        continue
    fi
    
    # Check health endpoint
    echo -n "  Health endpoint... "
    url="https://${domain}${health_path}"
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        PASSED=$((PASSED + 1))
        
        # Try to get response body
        response=$(curl -sf "$url" 2>/dev/null || echo "")
        if [ -n "$response" ]; then
            echo "    Response: $response"
        fi
    else
        echo -e "${RED}❌${NC}"
        echo "    URL: $url"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Summary
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo ""
echo "Total apps: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All deployments verified!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some deployments failed verification${NC}"
    exit 1
fi
