#!/bin/bash
# Sync environment variables from local .env files to GitHub Secrets
# Usage: ./scripts/ops/sync-env-to-github-secrets.sh [--dry-run] [--confirm-all]

set -e

REPO="jatidevelopments/ryla"
DRY_RUN=false
CONFIRM_ALL=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --confirm-all)
      CONFIRM_ALL=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run] [--confirm-all]"
      exit 1
      ;;
  esac
done

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔄 Syncing Local Environment Variables to GitHub Secrets"
echo "=========================================================="
echo ""

# Function to read env file and extract variables
read_env_file() {
  local file=$1
  if [ ! -f "$file" ]; then
    return 1
  fi
  
  # Read file, skip comments and empty lines, extract KEY=VALUE pairs
  grep -v '^#' "$file" | grep -v '^$' | grep '=' | while IFS='=' read -r key value; do
    # Remove leading/trailing whitespace from key
    key=$(echo "$key" | xargs)
    # Remove leading/trailing whitespace and quotes from value
    value=$(echo "$value" | sed -e 's/^["'\'']//' -e 's/["'\'']$//' | xargs)
    
    # Skip if key or value is empty
    if [ -n "$key" ] && [ -n "$value" ]; then
      echo "$key=$value"
    fi
  done
}

# Function to check if secret already exists
secret_exists() {
  local secret=$1
  gh secret list --repo "$REPO" 2>/dev/null | awk '{print $1}' | grep -q "^${secret}$"
}

# Function to set GitHub secret
set_github_secret() {
  local secret_name=$1
  local secret_value=$2
  local source_file=$3
  
  if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would set: $secret_name = $secret_value (from $source_file)"
    return 0
  fi
  
  if secret_exists "$secret_name"; then
    if [ "$CONFIRM_ALL" = false ]; then
      echo -n "  ⚠️  Secret $secret_name already exists. Overwrite? (y/N): "
      read -r response
      if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
        echo "  ⏭️  Skipping $secret_name"
        return 0
      fi
    fi
    echo "  🔄 Updating: $secret_name"
  else
    echo "  ➕ Adding: $secret_name"
  fi
  
  echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
}

# Function to get GitHub secret name for local var
get_github_secret_name() {
  local local_key=$1
  case "$local_key" in
    # API App Runtime Secrets
    APP_PORT|APP_HOST|APP_ENVIRONMENT) echo "$local_key" ;;
    JWT_ACCESS_SECRET|JWT_REFRESH_SECRET|JWT_ACCESS_EXPIRES_IN|JWT_REFRESH_EXPIRES_IN) echo "$local_key" ;;
    JWT_ACTION_FORGOT_PASSWORD_SECRET|JWT_ACTION_FORGOT_PASSWORD_EXPIRES_IN) echo "$local_key" ;;
    AWS_S3_REGION|AWS_S3_ACCESS_KEY|AWS_S3_SECRET_KEY|AWS_S3_BUCKET_NAME|AWS_S3_URL_TTL) echo "$local_key" ;;
    AWS_S3_ENDPOINT|AWS_S3_FORCE_PATH_STYLE) echo "$local_key" ;;
    BREVO_API_KEY|BREVO_API_URL) echo "$local_key" ;;
    RUNPOD_API_KEY|RUNPOD_ENDPOINT_FLUX_DEV|RUNPOD_ENDPOINT_Z_IMAGE_TURBO) echo "$local_key" ;;
    OPENROUTER_API_KEY|OPENROUTER_DEFAULT_MODEL) echo "$local_key" ;;
    GEMINI_API_KEY|OPENAI_API_KEY) echo "$local_key" ;;
    CRON_SECRET|SWAGGER_PASSWORD) echo "$local_key" ;;
    
    # Web App Runtime Secrets
    FINBY_API_KEY|FINBY_MERCHANT_ID|FINBY_WEBHOOK_SECRET|FINBY_PROJECT_ID|FINBY_SECRET_KEY|FINBY_TEST_MODE) echo "$local_key" ;;
    POSTGRES_HOST|POSTGRES_PORT|POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB|POSTGRES_ENVIRONMENT) echo "$local_key" ;;
    
    # Build-time secrets
    NEXT_PUBLIC_API_URL|NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_POSTHOG_KEY|NEXT_PUBLIC_POSTHOG_HOST) echo "$local_key" ;;
    NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY) echo "$local_key" ;;
    NEXT_PUBLIC_CDN_URL|NEXT_PUBLIC_DEBUG_CDN|NEXT_PUBLIC_SITE_URL_FUNNEL|NEXT_PUBLIC_API_BASE_URL) echo "$local_key" ;;
    NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT|NEXT_PUBLIC_SITE_URL_LANDING) echo "$local_key" ;;
    
    *) echo "" ;;
  esac
}

# Files to check (in order of priority)
ENV_FILES=(
  "apps/api/.env"
  "apps/api/.env.local"
  "apps/api/.env.production"
  "apps/web/.env"
  "apps/web/.env.local"
  "apps/web/.env.production"
  ".env"
  ".env.local"
  ".env.production"
  "config/.env"
  "config/.env.local"
)

# Collect all env vars from files into temp file
TEMP_ENV=$(mktemp)
trap "rm -f $TEMP_ENV" EXIT

echo "📖 Reading environment files..."
for file in "${ENV_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ Found: $file"
    read_env_file "$file" >> "$TEMP_ENV"
  fi
done

echo ""
echo "🔍 Processing environment variables..."
echo ""

# Filter and set secrets
SECRETS_TO_SET=0
SECRETS_SKIPPED=0

while IFS='=' read -r local_key value; do
  # Skip if already processed (first occurrence wins)
  if grep -q "^PROCESSED_${local_key}=" "$TEMP_ENV" 2>/dev/null; then
    continue
  fi
  
  github_secret=$(get_github_secret_name "$local_key")
  
  if [ -z "$github_secret" ]; then
    # Not in mapping, skip silently
    continue
  fi
  
  # Skip if value looks like a placeholder
  if [[ "$value" =~ ^(your-|change-|placeholder|TODO|FIXME|example|^$) ]] || \
     [[ "$value" =~ ^(https://your-|http://localhost) ]] || \
     [ -z "$value" ]; then
    echo "  ⏭️  Skipping $github_secret (placeholder or empty: ${value:0:20}...)"
    SECRETS_SKIPPED=$((SECRETS_SKIPPED + 1))
    continue
  fi
  
  set_github_secret "$github_secret" "$value" "$local_key"
  SECRETS_TO_SET=$((SECRETS_TO_SET + 1))
  
  # Mark as processed
  echo "PROCESSED_${local_key}=$value" >> "$TEMP_ENV"
done < "$TEMP_ENV"

echo ""
echo "=========================================================="
echo "📊 Summary:"
echo "  Secrets to set: $SECRETS_TO_SET"
echo "  Secrets skipped: $SECRETS_SKIPPED"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN - No secrets were actually set${NC}"
  echo "   Run without --dry-run to set secrets"
else
  echo -e "${GREEN}✅ Done!${NC}"
  echo ""
  echo "🔍 Verify secrets:"
  echo "   ./scripts/ops/check-github-secrets.sh"
fi
