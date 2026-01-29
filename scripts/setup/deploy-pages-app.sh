#!/bin/bash
# Deploy a Next.js app to Cloudflare Pages
# Usage: bash scripts/setup/deploy-pages-app.sh [app-name]
# Example: bash scripts/setup/deploy-pages-app.sh landing

set -e

APP_NAME="${1:-landing}"
PROJECT_NAME="ryla-${APP_NAME}"
# Next.js builds in-place (apps/*/.next), not in dist/
OUTPUT_DIR="apps/${APP_NAME}/.next"
DIST_DIR="dist/apps/${APP_NAME}/.next"

# Check both possible locations (in-place build or dist)
if [ ! -d "$OUTPUT_DIR" ] && [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: Build output not found at $OUTPUT_DIR or $DIST_DIR"
  echo "   Build the app first: pnpm nx build $APP_NAME --configuration=production"
  exit 1
fi

# Use in-place build if available, otherwise use dist
if [ -d "$OUTPUT_DIR" ]; then
  OUTPUT_DIR="$OUTPUT_DIR"
elif [ -d "$DIST_DIR" ]; then
  OUTPUT_DIR="$DIST_DIR"
fi

echo "🚀 Deploying $APP_NAME to Cloudflare Pages..."
echo "   Project: $PROJECT_NAME"
echo "   Output: $OUTPUT_DIR"
echo ""

# Build with Cloudflare Pages output mode (static export)
# Note: Only landing app fully supports static export
# Funnel and web have API routes and may need Cloudflare Next.js adapter
echo "🔨 Building for Cloudflare Pages (static export)..."
export CLOUDFLARE_PAGES=true

# Build the app
if ! pnpm nx build "$APP_NAME" --configuration=production --skip-nx-cache; then
  echo "⚠️  Build with static export failed. This app may have API routes or dynamic features."
  echo "   Consider using Cloudflare Next.js adapter (@cloudflare/next-on-pages) for full SSR support."
  echo "   Falling back to standalone build..."
  unset CLOUDFLARE_PAGES
  pnpm nx build "$APP_NAME" --configuration=production --skip-nx-cache
fi

# Update OUTPUT_DIR after build
# Static export creates 'out' directory, standalone creates '.next' directory
if [ -d "apps/${APP_NAME}/out" ]; then
  OUTPUT_DIR="apps/${APP_NAME}/out"
  echo "✅ Found static export output at: $OUTPUT_DIR"
elif [ -d "$OUTPUT_DIR" ]; then
  echo "✅ Using existing build output at: $OUTPUT_DIR"
  if [ "$CLOUDFLARE_PAGES" = "true" ]; then
    echo "⚠️  Warning: Using standalone output for Cloudflare Pages."
    echo "   This may not work correctly. Consider using @cloudflare/next-on-pages adapter."
  fi
else
  echo "❌ Error: Build output not found"
  exit 1
fi

# Remove cache directories (Pages has 25MB file size limit)
echo "📋 Removing cache directories..."
find "$OUTPUT_DIR" -type d -name "cache" -exec rm -rf {} + 2>/dev/null || true
echo "✅ Cache removed"
echo ""

# Deploy
echo "📤 Deploying to Cloudflare Pages..."
wrangler pages deploy "$OUTPUT_DIR" --project-name="$PROJECT_NAME" --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
echo "   View at: https://${PROJECT_NAME}.pages.dev"
echo "   Dashboard: https://dash.cloudflare.com → Workers & Pages → $PROJECT_NAME"
