#!/bin/bash
# Verify Deployment Readiness
# Checks if all required files and configurations are in place for Fly.io deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Verifying Deployment Readiness${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ ${name}${NC}"
    else
        echo -e "${RED}❌ ${name} - MISSING${NC}"
        ((ERRORS++))
    fi
}

# Check Dockerfiles
echo "Checking Dockerfiles..."
check_file "apps/landing/Dockerfile" "Landing Dockerfile"
check_file "apps/funnel/Dockerfile" "Funnel Dockerfile"
check_file "apps/web/Dockerfile" "Web Dockerfile"
check_file "apps/api/Dockerfile" "API Dockerfile"
echo ""

# Check fly.toml files
echo "Checking fly.toml configurations..."
check_file "apps/landing/fly.toml" "Landing fly.toml"
check_file "apps/funnel/fly.toml" "Funnel fly.toml"
check_file "apps/web/fly.toml" "Web fly.toml"
check_file "apps/api/fly.toml" "API fly.toml"
echo ""

# Check GitHub Actions workflows
echo "Checking GitHub Actions workflows..."
check_file ".github/workflows/deploy-staging.yml" "Staging deployment workflow"
check_file ".github/workflows/deploy-production.yml" "Production deployment workflow"
echo ""

# Check health endpoints
echo "Checking health endpoints..."
if grep -q "health" apps/api/src/modules/health/health.controller.ts 2>/dev/null; then
    echo -e "${GREEN}✅ API health endpoint${NC}"
else
    echo -e "${RED}❌ API health endpoint - MISSING${NC}"
    ((ERRORS++))
fi

# Check if Next.js apps have health routes (they might be in different locations)
if [ -f "apps/web/app/api/health/route.ts" ] || [ -f "apps/web/app/health/route.ts" ]; then
    echo -e "${GREEN}✅ Web health endpoint${NC}"
else
    echo -e "${YELLOW}⚠️  Web health endpoint - Not found (may need to be created)${NC}"
    ((WARNINGS++))
fi

if [ -f "apps/landing/app/api/health/route.ts" ] || [ -f "apps/landing/app/health/route.ts" ]; then
    echo -e "${GREEN}✅ Landing health endpoint${NC}"
else
    echo -e "${YELLOW}⚠️  Landing health endpoint - Not found (may need to be created)${NC}"
    ((WARNINGS++))
fi

if [ -f "apps/funnel/app/api/health/route.ts" ] || [ -f "apps/funnel/app/health/route.ts" ]; then
    echo -e "${GREEN}✅ Funnel health endpoint${NC}"
else
    echo -e "${YELLOW}⚠️  Funnel health endpoint - Not found (may need to be created)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check documentation
echo "Checking documentation..."
check_file "docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md" "Deployment guide"
check_file "docs/ops/DEPLOYMENT-QUICK-START.md" "Quick start guide"
check_file "docs/ops/CD-SETUP-CHECKLIST.md" "Setup checklist"
echo ""

# Check environment variable examples
echo "Checking environment variable examples..."
check_file "apps/api/env.example" "API env.example"
check_file "apps/web/env.example" "Web env.example"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found. Review and fix before deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) and ${WARNINGS} warning(s) found.${NC}"
    echo "Please fix errors before deploying."
    exit 1
fi

