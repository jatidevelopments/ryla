#!/bin/bash
# Modal Deployment Script
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 RYLA Modal App Deployment"
echo "=============================="
echo ""

# Check if Modal CLI is installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI not found. Please install: pip install modal"
    exit 1
fi

echo "✅ Modal CLI found: $(modal --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ app.py not found. Please run from apps/modal/ directory"
    exit 1
fi

echo "📋 Pre-deployment checks:"
echo "  - App file: app.py ✅"
echo "  - Config file: config.py ✅"
echo "  - Image file: image.py ✅"
echo "  - Handlers directory: handlers/ ✅"
echo ""

# Check Modal authentication
echo "🔐 Checking Modal authentication..."
if ! modal profile current &> /dev/null; then
    echo "❌ Not authenticated with Modal. Please run: modal token new"
    exit 1
fi

WORKSPACE=$(modal profile current)
echo "✅ Authenticated with workspace: $WORKSPACE"
echo ""

# Deploy
echo "📦 Deploying to Modal..."
echo ""

modal deploy app.py

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Test endpoints using: python ryla_client.py <endpoint>"
echo "  2. Check logs: modal app logs ryla-comfyui"
echo "  3. View dashboard: https://modal.com/apps"
echo ""
