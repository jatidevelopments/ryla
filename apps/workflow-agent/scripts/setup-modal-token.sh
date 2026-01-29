#!/bin/bash
# Script to generate Modal token and store in Infisical
# Run this if Modal tokens don't already exist

set -e

echo "🔑 Setting up Modal.com authentication tokens..."
echo ""

# Check if Modal CLI is installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI not found. Installing..."
    pip3 install modal
fi

# Generate new Modal token
echo "📝 Generating new Modal token..."
echo "   Run: modal token new"
echo "   This will output:"
echo "   - MODAL_TOKEN_ID"
echo "   - MODAL_TOKEN_SECRET"
echo ""
read -p "Press Enter after running 'modal token new' to continue..."

# Get tokens from user
read -p "Enter MODAL_TOKEN_ID: " MODAL_TOKEN_ID
read -p "Enter MODAL_TOKEN_SECRET: " MODAL_TOKEN_SECRET

# Store in Infisical
echo ""
echo "💾 Storing tokens in Infisical..."

# Store in /shared (accessible to all apps) or /apps/workflow-agent
infisical secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID" --path=/shared --env=dev
infisical secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_SECRET" --path=/shared --env=dev

# Also set for production
read -p "Also set for production? (y/n): " set_prod
if [ "$set_prod" = "y" ]; then
    infisical secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID" --path=/shared --env=prod
    infisical secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_SECRET" --path=/shared --env=prod
fi

echo ""
echo "✅ Modal tokens stored in Infisical!"
echo ""
echo "To verify:"
echo "  infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev"
echo "  infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev"
