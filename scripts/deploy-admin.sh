#!/bin/bash

# Deploy Admin App to Fly.io
#
# This script automates the deployment of the admin app to Fly.io.
# It exports secrets from Infisical and deploys with the correct build args.
#
# Usage:
#   ./scripts/deploy-admin.sh [environment]
#
# Environment options:
#   - prod (default)
#   - staging
#   - dev
#
# Prerequisites:
#   - Infisical CLI installed and logged in
#   - Fly.io CLI installed and authenticated
#   - Admin secrets added to Infisical
#   - Fly.io app created (ryla-admin-prod)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment from argument or default to prod
ENV=${1:-prod}
FLY_SUFFIX=$ENV
INFISICAL_ENV=$ENV

# Map environment names
if [ "$ENV" == "production" ]; then
    FLY_SUFFIX="prod"
    INFISICAL_ENV="prod"
elif [ "$ENV" == "staging" ]; then
    FLY_SUFFIX="staging"
    INFISICAL_ENV="staging"
else
    FLY_SUFFIX="dev"
    INFISICAL_ENV="dev"
fi

APP_NAME="ryla-admin-${FLY_SUFFIX}"

echo "========================================="
echo "Admin App Deployment to Fly.io"
echo "========================================="
echo ""
echo -e "${BLUE}Environment:${NC} $ENV"
echo -e "${BLUE}Fly.io App:${NC} $APP_NAME"
echo -e "${BLUE}Infisical Env:${NC} $INFISICAL_ENV"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Infisical
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}❌ Infisical CLI is not installed${NC}"
    exit 1
fi

if ! infisical whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Infisical${NC}"
    echo "Run: infisical login"
    exit 1
fi

echo -e "${GREEN}✅ Infisical CLI found and logged in${NC}"

# Check Fly.io
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ Fly.io CLI is not installed${NC}"
    echo "Install from: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

if ! flyctl auth whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Fly.io${NC}"
    echo "Run: flyctl auth login"
    exit 1
fi

echo -e "${GREEN}✅ Fly.io CLI found and authenticated${NC}"

# Check if app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}⚠️  App $APP_NAME does not exist${NC}"
    read -p "Create it now? (y/n): " create_app
    if [ "$create_app" = "y" ]; then
        flyctl apps create "$APP_NAME"
        echo -e "${GREEN}✅ App created${NC}"
    else
        echo -e "${RED}❌ Cannot deploy without app${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ App $APP_NAME exists${NC}"
echo ""

# Export secrets from Infisical
echo "========================================="
echo "Exporting Secrets from Infisical"
echo "========================================="
echo ""

TEMP_ENV_FILE=$(mktemp)
infisical export \
    --path=/apps/admin \
    --path=/shared \
    --env="$INFISICAL_ENV" \
    --format=dotenv > "$TEMP_ENV_FILE"

if [ ! -s "$TEMP_ENV_FILE" ]; then
    echo -e "${RED}❌ Failed to export secrets from Infisical${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Secrets exported${NC}"
echo ""

# Source the environment file
set -a
source "$TEMP_ENV_FILE"
set +a

# Verify required build args exist
REQUIRED_ARGS=(
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_API_URL"
    "NEXT_PUBLIC_API_BASE_URL"
    "NEXT_PUBLIC_POSTHOG_HOST"
    "NEXT_PUBLIC_POSTHOG_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

MISSING_ARGS=()
for arg in "${REQUIRED_ARGS[@]}"; do
    if [ -z "${!arg}" ]; then
        MISSING_ARGS+=("$arg")
    fi
done

if [ ${#MISSING_ARGS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required build args:${NC}"
    for arg in "${MISSING_ARGS[@]}"; do
        echo "  - $arg"
    done
    echo ""
    echo "Add these secrets to Infisical:"
    echo "  infisical secrets set $arg=<value> --path=/apps/admin --env=$INFISICAL_ENV"
    exit 1
fi

echo -e "${GREEN}✅ All required build args present${NC}"
echo ""

# Sync runtime secrets to Fly.io
echo "========================================="
echo "Syncing Runtime Secrets to Fly.io"
echo "========================================="
echo ""

# Export and sync non-NEXT_PUBLIC_* secrets
infisical export \
    --path=/apps/admin \
    --path=/shared \
    --env="$INFISICAL_ENV" \
    --format=dotenv | while IFS='=' read -r key value; do
    # Skip NEXT_PUBLIC_* variables (they're build args, not runtime secrets)
    if [[ ! "$key" =~ ^NEXT_PUBLIC_ ]] && [ -n "$key" ] && [ -n "$value" ]; then
        echo "Setting secret: $key"
        flyctl secrets set "$key=$value" --app "$APP_NAME" || true
    fi
done

echo -e "${GREEN}✅ Runtime secrets synced${NC}"
echo ""

# Deploy
echo "========================================="
echo "Deploying to Fly.io"
echo "========================================="
echo ""

flyctl deploy \
    --config apps/admin/fly.toml \
    --dockerfile apps/admin/Dockerfile \
    --app "$APP_NAME" \
    --strategy immediate \
    --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
    --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
    --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
    --build-arg NEXT_PUBLIC_POSTHOG_HOST="$NEXT_PUBLIC_POSTHOG_HOST" \
    --build-arg NEXT_PUBLIC_POSTHOG_KEY="$NEXT_PUBLIC_POSTHOG_KEY" \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo -e "${GREEN}✅ Deployment initiated${NC}"
echo ""

# Wait a bit for deployment to start
echo "Waiting for deployment to start..."
sleep 5

# Check status
echo "========================================="
echo "Deployment Status"
echo "========================================="
echo ""

flyctl status --app "$APP_NAME"

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Check health endpoint:"
echo "   curl https://admin.ryla.ai/api/health"
echo ""
echo "2. View logs:"
echo "   flyctl logs --app $APP_NAME"
echo ""
echo "3. SSH into machine (if needed):"
echo "   flyctl ssh console --app $APP_NAME"
echo ""

# Cleanup
rm -f "$TEMP_ENV_FILE"

echo -e "${GREEN}✅ Deployment script complete${NC}"
