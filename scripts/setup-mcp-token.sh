#!/bin/bash
# Setup RYLA MCP Token
# Gets a fresh token and updates the MCP configuration

set -e

API_URL="${RYLA_API_URL:-http://localhost:3001}"
EMAIL="${RYLA_TEST_EMAIL:-mcptest99@ryla.dev}"
PASSWORD="${RYLA_TEST_PASSWORD:-TestPass123!}"
MCP_CONFIG="${HOME}/.cursor/mcp.json"
LOCAL_MCP_CONFIG=".cursor/mcp.json"

echo "🔑 Getting RYLA MCP Dev Token (10-year expiration)..."
echo ""

# Get long-lived dev token from API (expires in 10 years)
TOKEN=$(curl -s -X POST "${API_URL}/auth/dev-token" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}" \
  | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Failed to get dev token. Make sure:"
  echo "   1. API is running at ${API_URL}"
  echo "   2. Test user exists (${EMAIL})"
  echo "   3. Password is correct"
  exit 1
fi

echo "✅ Dev token obtained (expires in 10 years): ${TOKEN:0:20}..."
echo ""

# Check which config file exists
if [ -f "$MCP_CONFIG" ]; then
  CONFIG_FILE="$MCP_CONFIG"
  echo "📝 Updating global MCP config: $MCP_CONFIG"
elif [ -f "$LOCAL_MCP_CONFIG" ]; then
  CONFIG_FILE="$LOCAL_MCP_CONFIG"
  echo "📝 Updating local MCP config: $LOCAL_MCP_CONFIG"
else
  echo "❌ No MCP config found. Expected:"
  echo "   - $MCP_CONFIG (global)"
  echo "   - $LOCAL_MCP_CONFIG (local)"
  echo ""
  echo "💡 Create one by copying:"
  echo "   cp .cursor/mcp.json.example .cursor/mcp.json"
  exit 1
fi

# Update the config file
# Use a temporary file to avoid issues with in-place editing
TMP_FILE=$(mktemp)
jq --arg token "$TOKEN" \
  '.mcpServers["ryla-api"].env.RYLA_DEV_TOKEN = $token' \
  "$CONFIG_FILE" > "$TMP_FILE"

mv "$TMP_FILE" "$CONFIG_FILE"

echo "✅ Updated $CONFIG_FILE with new token"
echo ""
echo "🔄 Next steps:"
echo "   1. Restart Cursor for changes to take effect"
echo "   2. Test with: ryla_server_info or ryla_health_check"
echo ""
echo "✨ This is a dev token that expires in 10 years - no need to refresh!"

