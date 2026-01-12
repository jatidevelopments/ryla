#!/bin/bash
# Setup Cloudflare infrastructure (R2, Pages, CDN Worker)
# Usage: CLOUDFLARE_API_TOKEN=your_token bash scripts/setup/setup-cloudflare-infrastructure.sh

set -e

echo "🚀 Setting up Cloudflare Infrastructure for RYLA"
echo ""

# Check prerequisites
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
  echo ""
  echo "Get your token from: https://dash.cloudflare.com/profile/api-tokens"
  echo "Required permissions: Account:Read, Zone:Read, Workers:Edit, R2:Edit, Pages:Edit"
  exit 1
fi

# Verify MCP setup first
echo "📋 Step 1: Verifying MCP setup..."
bash scripts/setup/verify-cloudflare-mcp.sh || exit 1
echo ""

# Get account ID
echo "📋 Step 2: Getting Cloudflare Account ID..."
ACCOUNT_RESPONSE=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts")

ACCOUNT_ID=$(echo "$ACCOUNT_RESPONSE" | jq -r '.result[0].id // empty')

if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ Failed to get Account ID"
  echo "Response: $ACCOUNT_RESPONSE"
  exit 1
fi

echo "✅ Account ID: $ACCOUNT_ID"
echo ""

# Create R2 bucket
echo "📋 Step 3: Creating R2 bucket..."
BUCKET_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/r2/buckets" \
  -d '{
    "name": "ryla-images",
    "location": "waw"
  }' || echo '{"success":false,"errors":[{"message":"Bucket may already exist"}]}')

BUCKET_SUCCESS=$(echo "$BUCKET_RESPONSE" | jq -r '.success // false')

if [ "$BUCKET_SUCCESS" = "true" ]; then
  echo "✅ R2 bucket 'ryla-images' created successfully"
elif echo "$BUCKET_RESPONSE" | grep -q "already exists\|duplicate"; then
  echo "⚠️  R2 bucket 'ryla-images' already exists (skipping)"
else
  echo "❌ Failed to create R2 bucket"
  echo "Response: $BUCKET_RESPONSE"
  exit 1
fi
echo ""

# Instructions for manual steps
echo "📋 Step 4: Manual steps required..."
echo ""
echo "The following steps need to be done manually or via Cloudflare Dashboard:"
echo ""
echo "1. Generate R2 API Tokens:"
echo "   - Go to: https://dash.cloudflare.com → R2 → Manage R2 API Tokens"
echo "   - Create token with 'Object Read & Write' permissions"
echo "   - Save Access Key ID and Secret Access Key"
echo ""
echo "2. Deploy CDN Worker:"
echo "   cd workers/ryla-r2-cdn-proxy"
echo "   wrangler login"
echo "   wrangler deploy"
echo ""
echo "3. Create Cloudflare Pages projects:"
echo "   - Landing: https://dash.cloudflare.com → Workers & Pages → Create → Pages project"
echo "   - Funnel: Same process"
echo "   - Web: Same process"
echo "   - See docs/ops/CLOUDFLARE-PAGES-SETUP.md for details"
echo ""
echo "4. Configure custom domains:"
echo "   - Add domains in each Pages project settings"
echo "   - Update DNS records if needed"
echo ""
echo "✅ Infrastructure setup script completed!"
echo ""
echo "Next steps:"
echo "1. Generate R2 API tokens (see above)"
echo "2. Deploy CDN Worker (see above)"
echo "3. Set up Cloudflare Pages (see docs/ops/CLOUDFLARE-PAGES-SETUP.md)"
echo "4. Update environment variables (see docs/ops/STORAGE-SETUP.md)"
