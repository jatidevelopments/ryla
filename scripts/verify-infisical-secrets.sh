#!/bin/bash

# Verify Infisical Secrets for All Apps
#
# This script verifies that all required secrets exist in Infisical prod environment
# for all RYLA applications.
#
# Usage:
#   ./scripts/verify-infisical-secrets.sh
#
# Prerequisites:
#   - Infisical CLI installed and logged in
#   - Access to Infisical project

set -e

echo "========================================="
echo "Infisical Secrets Verification"
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
    exit 1
fi

# Check if logged in
if ! infisical whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Infisical${NC}"
    exit 1
fi

# Function to check secrets for an app
check_app_secrets() {
    local app_name=$1
    local path=$2
    local required_secrets=("${@:3}")
    
    echo -e "${YELLOW}Checking: $app_name${NC}"
    echo "  Path: $path"
    
    # Get all secrets for this path
    local secrets_output
    secrets_output=$(infisical secrets --path="$path" --env=prod 2>/dev/null || echo "")
    
    if [ -z "$secrets_output" ]; then
        echo -e "${RED}  ❌ No secrets found or path doesn't exist${NC}"
        return 1
    fi
    
    # Check each required secret
    local missing=0
    for secret in "${required_secrets[@]}"; do
        if echo "$secrets_output" | grep -q "^$secret"; then
            echo -e "${GREEN}  ✅ $secret${NC}"
        else
            echo -e "${RED}  ❌ $secret (missing)${NC}"
            missing=$((missing + 1))
        fi
    done
    
    echo ""
    return $missing
}

# Required secrets per app (based on config/infisical-secrets-template.md)
# Landing
echo "========================================="
echo "Landing App"
echo "========================================="
check_app_secrets "Landing" "/apps/landing" \
    "NEXT_PUBLIC_SITE_URL" \
    "NEXT_PUBLIC_CDN_URL" \
    "NEXT_PUBLIC_DEBUG_CDN"

# Funnel
echo "========================================="
echo "Funnel App"
echo "========================================="
check_app_secrets "Funnel" "/apps/funnel" \
    "NEXT_PUBLIC_CDN_URL" \
    "NEXT_PUBLIC_DEBUG_CDN" \
    "NEXT_PUBLIC_SITE_URL" \
    "NEXT_PUBLIC_API_BASE_URL" \
    "NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT" \
    "NEXT_PUBLIC_POSTHOG_HOST" \
    "NEXT_PUBLIC_POSTHOG_KEY" \
    "NEXT_PUBLIC_SUPABASE_URL" \
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Web
echo "========================================="
echo "Web App"
echo "========================================="
check_app_secrets "Web" "/apps/web" \
    "NEXT_PUBLIC_API_URL" \
    "NEXT_PUBLIC_SITE_URL" \
    "NEXT_PUBLIC_POSTHOG_KEY" \
    "NEXT_PUBLIC_POSTHOG_HOST" \
    "NEXT_PUBLIC_SUPABASE_URL" \
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# API
echo "========================================="
echo "API App"
echo "========================================="
echo -e "${YELLOW}Checking: API${NC}"
echo "  Path: /apps/api"
echo "  Note: API uses runtime secrets (no NEXT_PUBLIC_* required)"
infisical secrets --path=/apps/api --env=prod 2>/dev/null | head -5 || echo -e "${RED}  ❌ No secrets found${NC}"
echo ""

# Admin
echo "========================================="
echo "Admin App"
echo "========================================="
check_app_secrets "Admin" "/apps/admin" \
    "NEXT_PUBLIC_SITE_URL" \
    "NEXT_PUBLIC_API_URL" \
    "NEXT_PUBLIC_API_BASE_URL" \
    "NEXT_PUBLIC_POSTHOG_HOST" \
    "NEXT_PUBLIC_POSTHOG_KEY" \
    "NEXT_PUBLIC_SUPABASE_URL" \
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Shared
echo "========================================="
echo "Shared Secrets"
echo "========================================="
echo -e "${YELLOW}Checking: Shared${NC}"
echo "  Path: /shared"
infisical secrets --path=/shared --env=prod 2>/dev/null | head -10 || echo -e "${RED}  ❌ No secrets found${NC}"
echo ""

echo "========================================="
echo "Verification Complete"
echo "========================================="
echo ""
echo "For detailed secret requirements, see:"
echo "  config/infisical-secrets-template.md"
echo ""
