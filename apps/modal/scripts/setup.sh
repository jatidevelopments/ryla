#!/bin/bash
# RYLA Modal Setup Script
# Automates Modal setup for Denrisi ComfyUI workflow

set -e

echo "🚀 RYLA Modal Setup"
echo "==================="
echo ""

# Check if Modal is installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI not found. Installing..."
    pip install modal
    echo "✅ Modal installed"
else
    echo "✅ Modal CLI found"
fi

# Check if authenticated
echo ""
echo "📋 Checking Modal authentication..."
if modal app list &> /dev/null; then
    echo "✅ Modal authenticated"
else
    echo "⚠️  Modal not authenticated. Please run:"
    echo "   modal token new"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Create volume if it doesn't exist
echo ""
echo "📦 Creating Modal volume (if needed)..."
modal volume create ryla-models || echo "Volume already exists or creation failed"

# Deploy the app
echo ""
echo "🚀 Deploying ComfyUI Denrisi app..."
modal deploy apps/modal/comfyui_danrisi.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload models to volume (see apps/modal/README.md)"
echo "2. Test the deployment: modal run apps/modal/comfyui_danrisi.py::list_models"
echo "3. Generate an image: modal run apps/modal/comfyui_danrisi.py::test_workflow"
