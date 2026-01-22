#!/bin/bash
# Sync secrets from Infisical to GitHub Secrets
# Usage: ./scripts/ops/sync-infisical-to-github.sh [env]
# Example: ./scripts/ops/sync-infisical-to-github.sh prod

set -e

ENV=${1:-prod}
REPO="jatidevelopments/ryla"

echo "🔄 Syncing secrets from Infisical ($ENV) to GitHub"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  echo "   Install: brew install gh"
  exit 1
fi

# Check if infisical CLI is installed
if ! command -v infisical &> /dev/null; then
  echo "❌ Infisical CLI is not installed"
  echo "   Install: brew install infisical/get-cli/infisical"
  exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
  echo "❌ Not logged in to GitHub"
  echo "   Run: gh auth login"
  exit 1
fi

# Check if logged in to Infisical
if ! infisical whoami &> /dev/null; then
  echo "❌ Not logged in to Infisical"
  echo "   Run: infisical login"
  exit 1
fi

echo "📦 Exporting secrets from Infisical..."
echo ""

# Paths to sync
PATHS=(
  "/apps/web"
  "/apps/api"
  "/apps/funnel"
  "/apps/landing"
  "/shared"
  "/mcp"
)

# Temporary file for secrets
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Export all secrets
for path in "${PATHS[@]}"; do
  echo "  Exporting from $path..."
  infisical export --path="$path" --env="$ENV" --format=dotenv >> "$TEMP_FILE" 2>/dev/null || {
    echo "    ⚠️  Path $path not found or no access (skipping)"
  }
done

# Count secrets
SECRET_COUNT=$(grep -v '^#' "$TEMP_FILE" | grep -v '^$' | grep '=' | wc -l | tr -d ' ')
echo ""
echo "📊 Found $SECRET_COUNT secrets"
echo ""

# Ask for confirmation
read -p "Continue syncing to GitHub? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "🔄 Syncing to GitHub..."
echo ""

SYNCED=0
SKIPPED=0
FAILED=0

# Process each secret
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  
  # Remove quotes from value
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  
  # Skip if key or value is empty
  [[ -z "$key" || -z "$value" ]] && continue
  
  echo -n "  Setting $key... "
  
  # Set secret in GitHub
  if echo "$value" | gh secret set "$key" --repo "$REPO" --body - 2>/dev/null; then
    echo "✅"
    SYNCED=$((SYNCED + 1))
  else
    echo "❌"
    FAILED=$((FAILED + 1))
  fi
  
done < "$TEMP_FILE"

echo ""
echo "=================================================="
echo "📊 Summary:"
echo "  ✅ Synced: $SYNCED"
echo "  ❌ Failed: $FAILED"
echo ""
echo "💡 Note: This syncs ALL secrets. You may want to:"
echo "   1. Review synced secrets in GitHub"
echo "   2. Remove any that shouldn't be there"
echo "   3. Consider using Infisical directly in workflows instead"
echo ""
echo "📖 See docs/technical/INFISICAL-GITHUB-INTEGRATION.md for details"
