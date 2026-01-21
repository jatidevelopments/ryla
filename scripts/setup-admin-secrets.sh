#!/bin/bash

# Setup Admin App Secrets in Infisical
# 
# This script helps set up all required secrets for the admin app in Infisical.
# Run this script to add/update secrets in the prod environment.
#
# Usage:
#   ./scripts/setup-admin-secrets.sh
#
# Prerequisites:
#   - Infisical CLI installed and logged in
#   - Access to Infisical project
#   - Required secret values available

set -e

echo "========================================="
echo "Admin App Secrets Setup for Infisical"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Infisical is installed
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}❌ Infisical CLI is not installed${NC}"
    echo "Install it from: https://infisical.com/docs/cli/overview"
    exit 1
fi

# Check if logged in
if ! infisical whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Infisical${NC}"
    echo "Run: infisical login"
    exit 1
fi

echo -e "${GREEN}✅ Infisical CLI found and logged in${NC}"
echo ""

# Function to set secret with confirmation
set_secret() {
    local key=$1
    local description=$2
    local path=$3
    local env=$4
    
    echo -e "${YELLOW}Setting: $key${NC}"
    echo "  Description: $description"
    echo "  Path: $path"
    echo "  Environment: $env"
    read -p "  Enter value (or press Enter to skip): " value
    
    if [ -n "$value" ]; then
        infisical secrets set "$key=$value" --path="$path" --env="$env"
        echo -e "${GREEN}  ✅ Set successfully${NC}"
    else
        echo -e "${YELLOW}  ⏭️  Skipped${NC}"
    fi
    echo ""
}

# Base Configuration
echo "========================================="
echo "Base Configuration"
echo "========================================="
set_secret "NEXT_PUBLIC_SITE_URL" "Admin dashboard URL" "/apps/admin" "prod"
set_secret "NEXT_PUBLIC_API_URL" "Backend API URL" "/apps/admin" "prod"
set_secret "NEXT_PUBLIC_API_BASE_URL" "Alias for API URL" "/apps/admin" "prod"

# PostHog Analytics
echo "========================================="
echo "PostHog Analytics"
echo "========================================="
set_secret "NEXT_PUBLIC_POSTHOG_KEY" "PostHog project key" "/apps/admin" "prod"
set_secret "NEXT_PUBLIC_POSTHOG_HOST" "PostHog host URL" "/apps/admin" "prod"

# Supabase
echo "========================================="
echo "Supabase Configuration"
echo "========================================="
set_secret "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL" "/apps/admin" "prod"
set_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anon key" "/apps/admin" "prod"

# Verify secrets
echo "========================================="
echo "Verification"
echo "========================================="
echo "Listing all admin secrets in prod environment:"
echo ""
infisical secrets --path=/apps/admin --env=prod
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify all secrets are set correctly"
echo "2. Deploy admin app to Fly.io"
echo "3. Configure domain (admin.ryla.ai)"
echo ""
echo "See: docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md"
