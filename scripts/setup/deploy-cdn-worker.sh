#!/bin/bash
# Deploy R2 CDN Worker to Cloudflare
# Usage: bash scripts/setup/deploy-cdn-worker.sh

set -e

echo "🚀 Deploying R2 CDN Worker..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ Error: wrangler CLI is not installed"
  echo ""
  echo "Install with:"
  echo "  npm install -g wrangler"
  exit 1
fi

# Check if we're in the right directory
if [ ! -f "workers/ryla-r2-cdn-proxy/wrangler.toml" ]; then
  echo "❌ Error: Worker directory not found"
  echo "   Expected: workers/ryla-r2-cdn-proxy/wrangler.toml"
  exit 1
fi

cd workers/ryla-r2-cdn-proxy

# Check if logged in
echo "📋 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
  echo "⚠️  Not logged in to Cloudflare"
  echo "   Running: wrangler login"
  wrangler login
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Deploy worker
echo "🚀 Deploying worker..."
wrangler deploy

echo ""
echo "✅ Worker deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Test worker: curl https://ryla-r2-cdn-proxy.<account>.workers.dev/test"
echo "2. Add custom domain in Cloudflare Dashboard (optional)"
echo "3. Update DNS if using custom domain"
echo ""
echo "See docs/ops/CLOUDFLARE-CDN-WORKER.md for more details"
