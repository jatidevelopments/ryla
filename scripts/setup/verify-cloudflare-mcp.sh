#!/bin/bash
# Verify Cloudflare MCP setup and API token permissions
# Usage: bash scripts/setup/verify-cloudflare-mcp.sh

set -e

echo "🔍 Verifying Cloudflare MCP Setup..."
echo ""

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable is not set"
  echo ""
  echo "To set up Cloudflare MCP:"
  echo "1. Get API token: https://dash.cloudflare.com/profile/api-tokens"
  echo "2. Create token with permissions:"
  echo "   - Account: Read"
  echo "   - Zone: Read"
  echo "   - Workers: Edit"
  echo "   - R2: Edit"
  echo "   - Pages: Edit"
  echo "3. Set environment variable:"
  echo "   export CLOUDFLARE_API_TOKEN=your_token_here"
  echo ""
  exit 1
fi

echo "✅ CLOUDFLARE_API_TOKEN is set"
echo ""

# Check if MCP config exists
MCP_CONFIG="$HOME/.cursor/mcp.json"
if [ ! -f "$MCP_CONFIG" ]; then
  echo "⚠️  Warning: MCP config not found at $MCP_CONFIG"
  echo "   Copy from .cursor/mcp.json.example if needed"
  echo ""
else
  echo "✅ MCP config found at $MCP_CONFIG"
  
  # Check if cloudflare-bindings is configured
  if grep -q "cloudflare-bindings" "$MCP_CONFIG"; then
    echo "✅ cloudflare-bindings MCP server configured"
  else
    echo "⚠️  Warning: cloudflare-bindings not found in MCP config"
  fi
  echo ""
fi

# Test API token by making a simple API call
echo "🧪 Testing Cloudflare API token..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify" || echo "ERROR")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API token is valid"
  
  # Extract account ID if available
  ACCOUNT_ID=$(echo "$BODY" | jq -r '.result.id // empty' 2>/dev/null || echo "")
  if [ -n "$ACCOUNT_ID" ]; then
    echo "   Account ID: $ACCOUNT_ID"
  fi
else
  echo "❌ API token verification failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
  exit 1
fi

echo ""
echo "✅ Cloudflare MCP setup verified!"
echo ""
echo "Next steps:"
echo "1. Use Cloudflare MCP tools in Cursor to create R2 bucket"
echo "2. Create CDN Worker for R2"
echo "3. Set up Cloudflare Pages projects"
