#!/bin/bash
# Script to set GitHub secrets for CI/CD pipeline
# Requires: GITHUB_TOKEN with repo scope
# Usage: GITHUB_TOKEN=your_token bash scripts/setup/set-github-secrets.sh

set -e

REPO_OWNER="jatidevelopments"
REPO_NAME="ryla"
REPO="$REPO_OWNER/$REPO_NAME"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN environment variable is not set"
  echo ""
  echo "To set secrets, you need a GitHub Personal Access Token (PAT) with 'repo' scope."
  echo ""
  echo "1. Create a PAT: https://github.com/settings/tokens"
  echo "2. Grant 'repo' scope"
  echo "3. Run: GITHUB_TOKEN=your_token bash scripts/setup/set-github-secrets.sh"
  exit 1
fi

echo "🔐 Setting GitHub secrets for $REPO..."
echo ""

# Function to encrypt and set secret
set_secret() {
  local secret_name=$1
  local secret_value=$2
  
  echo "Setting $secret_name..."
  
  # Get repository public key
  RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/actions/secrets/public-key")
  
  KEY_ID=$(echo $RESPONSE | jq -r '.key_id')
  KEY=$(echo $RESPONSE | jq -r '.key')
  
  if [ "$KEY_ID" == "null" ] || [ -z "$KEY" ]; then
    echo "❌ Failed to get public key. Check token permissions."
    exit 1
  fi
  
  # Encrypt secret using libsodium (requires sodium library)
  # For simplicity, we'll use gh CLI which handles encryption automatically
  if command -v gh &> /dev/null; then
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    echo "✅ $secret_name set"
  else
    echo "⚠️  gh CLI not found. Install it: brew install gh"
    echo "   Or set manually in GitHub: Settings > Secrets and variables > Actions"
    exit 1
  fi
}

# Authenticate gh CLI
export GITHUB_TOKEN
gh auth login --with-token < <(echo "$GITHUB_TOKEN") 2>/dev/null || true

# Web App Secrets
echo "📦 Setting Web App secrets..."
gh secret set NEXT_PUBLIC_API_URL --repo $REPO --body "https://end.ryla.ai"
gh secret set NEXT_PUBLIC_SITE_URL --repo $REPO --body "https://app.ryla.ai"
gh secret set NEXT_PUBLIC_POSTHOG_KEY --repo $REPO --body "phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU"
gh secret set NEXT_PUBLIC_POSTHOG_HOST --repo $REPO --body "https://us.i.posthog.com"
gh secret set NEXT_PUBLIC_SUPABASE_URL --repo $REPO --body "https://wkmhcjjphidaaxsulhrw.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo $REPO --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA"

# Funnel App Secrets
echo ""
echo "📦 Setting Funnel App secrets..."
gh secret set NEXT_PUBLIC_CDN_URL --repo $REPO --body "https://rylaai.b-cdn.net"
gh secret set NEXT_PUBLIC_DEBUG_CDN --repo $REPO --body "true"
gh secret set NEXT_PUBLIC_SITE_URL_FUNNEL --repo $REPO --body "https://goviral.ryla.ai"
gh secret set NEXT_PUBLIC_API_BASE_URL --repo $REPO --body "https://end.ryla.ai"
gh secret set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT --repo $REPO --body "/"

# Landing App Secrets
echo ""
echo "📦 Setting Landing App secrets..."
gh secret set NEXT_PUBLIC_SITE_URL_LANDING --repo $REPO --body "https://www.ryla.ai"

echo ""
echo "✅ All secrets set!"
echo ""
echo "⚠️  Don't forget to set FLY_API_TOKEN:"
echo ""
echo "   Option 1: Create org deploy token (recommended for CI/CD):"
echo "   fly tokens create org deploy --org YOUR_ORG_NAME | gh secret set FLY_API_TOKEN --repo $REPO --body-file -"
echo ""
echo "   Option 2: Create app-specific token:"
echo "   fly tokens create deploy --app ryla-web-prod | gh secret set FLY_API_TOKEN --repo $REPO --body-file -"
echo ""
echo "   Option 3: Manual setup in GitHub UI:"
echo "   https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "   Note: 'fly auth token' is deprecated. Use 'fly tokens create' instead."
