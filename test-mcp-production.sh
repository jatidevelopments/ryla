#!/bin/bash
# Test MCP server with production API

echo "🧪 Testing RYLA MCP Server with Production API"
echo ""

# Set production environment
export RYLA_ENV=production
export RYLA_API_URL=https://end.ryla.ai

echo "📡 API URL: $RYLA_API_URL"
echo "🌍 Environment: $RYLA_ENV"
echo ""

# Test health check
echo "1. Testing health endpoint..."
curl -s https://end.ryla.ai/health | jq '.' || curl -s https://end.ryla.ai/health
echo ""
echo ""

# Note: For actual login test, you'll need valid credentials
echo "2. To test login, use MCP tool:"
echo "   ryla_auth_login(email, password)"
echo ""
echo "Or set RYLA_ENV=production and use the MCP tools in Cursor"
