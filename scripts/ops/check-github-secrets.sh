#!/bin/bash
# Check which GitHub secrets are set vs required
# Usage: ./scripts/ops/check-github-secrets.sh

set -e

REPO="jatidevelopments/ryla"

echo "🔍 Checking GitHub Secrets for $REPO"
echo "=========================================="
echo ""

# Get list of current secrets
CURRENT_SECRETS=$(gh secret list --repo "$REPO" 2>/dev/null | awk '{print $1}' | sort)

# Required secrets from documentation
REQUIRED_BUILD_TIME=(
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_SITE_URL"
  "NEXT_PUBLIC_POSTHOG_KEY"
  "NEXT_PUBLIC_POSTHOG_HOST"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_CDN_URL"
  "NEXT_PUBLIC_DEBUG_CDN"
  "NEXT_PUBLIC_SITE_URL_FUNNEL"
  "NEXT_PUBLIC_API_BASE_URL"
  "NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT"
  "NEXT_PUBLIC_SITE_URL_LANDING"
)

REQUIRED_RUNTIME_API=(
  "APP_PORT"
  "APP_HOST"
  "APP_ENVIRONMENT"
  "JWT_ACCESS_SECRET"
  "JWT_REFRESH_SECRET"
  "JWT_ACCESS_EXPIRES_IN"
  "JWT_REFRESH_EXPIRES_IN"
  "JWT_ACTION_FORGOT_PASSWORD_SECRET"
  "JWT_ACTION_FORGOT_PASSWORD_EXPIRES_IN"
  "AWS_S3_REGION"
  "AWS_S3_ACCESS_KEY"
  "AWS_S3_SECRET_KEY"
  "AWS_S3_BUCKET_NAME"
  "AWS_S3_URL_TTL"
  "BREVO_API_KEY"
  "RUNPOD_API_KEY"
  "RUNPOD_ENDPOINT_FLUX_DEV"
  "RUNPOD_ENDPOINT_Z_IMAGE_TURBO"
  "OPENROUTER_API_KEY"
  "OPENROUTER_DEFAULT_MODEL"
  "CRON_SECRET"
  "SWAGGER_PASSWORD"
)

REQUIRED_RUNTIME_WEB=(
  "FINBY_API_KEY"
  "FINBY_MERCHANT_ID"
  "FINBY_WEBHOOK_SECRET"
  "FINBY_PROJECT_ID"
  "FINBY_SECRET_KEY"
  "FINBY_TEST_MODE"
  "JWT_ACCESS_SECRET"
  "POSTGRES_HOST"
  "POSTGRES_PORT"
  "POSTGRES_USER"
  "POSTGRES_PASSWORD"
  "POSTGRES_DB"
  "POSTGRES_ENVIRONMENT"
)

REQUIRED_ALL=(
  "FLY_API_TOKEN"
)

# Function to check if secret exists
check_secret() {
  local secret=$1
  echo "$CURRENT_SECRETS" | grep -q "^${secret}$"
}

# Check build-time secrets
echo "📦 Build-Time Secrets (NEXT_PUBLIC_*):"
echo "--------------------------------------"
MISSING_BUILD=0
for secret in "${REQUIRED_BUILD_TIME[@]}"; do
  if check_secret "$secret"; then
    echo "  ✅ $secret"
  else
    echo "  ❌ $secret (MISSING)"
    MISSING_BUILD=$((MISSING_BUILD + 1))
  fi
done
echo ""

# Check runtime API secrets
echo "🔧 API Runtime Secrets:"
echo "----------------------"
MISSING_API=0
for secret in "${REQUIRED_RUNTIME_API[@]}"; do
  if check_secret "$secret"; then
    echo "  ✅ $secret"
  else
    echo "  ❌ $secret (MISSING)"
    MISSING_API=$((MISSING_API + 1))
  fi
done
echo ""

# Check runtime Web secrets
echo "🌐 Web App Runtime Secrets:"
echo "--------------------------"
MISSING_WEB=0
for secret in "${REQUIRED_RUNTIME_WEB[@]}"; do
  if check_secret "$secret"; then
    echo "  ✅ $secret"
  else
    echo "  ❌ $secret (MISSING)"
    MISSING_WEB=$((MISSING_WEB + 1))
  fi
done
echo ""

# Check required for all
echo "🔑 Required for All Apps:"
echo "------------------------"
MISSING_ALL=0
for secret in "${REQUIRED_ALL[@]}"; do
  if check_secret "$secret"; then
    echo "  ✅ $secret"
  else
    echo "  ❌ $secret (MISSING)"
    MISSING_ALL=$((MISSING_ALL + 1))
  fi
done
echo ""

# Summary
TOTAL_MISSING=$((MISSING_BUILD + MISSING_API + MISSING_WEB + MISSING_ALL))
echo "=========================================="
echo "📊 Summary:"
echo "  Build-time secrets missing: $MISSING_BUILD"
echo "  API runtime secrets missing: $MISSING_API"
echo "  Web runtime secrets missing: $MISSING_WEB"
echo "  Required for all missing: $MISSING_ALL"
echo "  Total missing: $TOTAL_MISSING"
echo ""

if [ $TOTAL_MISSING -eq 0 ]; then
  echo "✅ All required secrets are set!"
else
  echo "⚠️  Some secrets are missing. Add them at:"
  echo "   https://github.com/$REPO/settings/secrets/actions"
  echo ""
  echo "📖 See docs/ops/GITHUB-SECRETS-TO-SET.md for details"
fi
