#!/bin/bash
set -e

# Prepare funnel app for Cloudflare Pages build
# Removes dynamic exports and API routes that prevent static generation

APP_NAME="funnel"
APP_DIR="apps/${APP_NAME}"

echo "🔧 Preparing ${APP_NAME} for Cloudflare Pages build..."

# Remove dynamic exports from pages that prevent static generation
echo "📝 Removing dynamic exports from pages..."

# Main page - remove dynamic export for static generation
if [ -f "${APP_DIR}/app/page.tsx" ]; then
  sed -i.bak '/^export const dynamic = .force-dynamic./d' "${APP_DIR}/app/page.tsx"
  sed -i.bak '/^export const revalidate = 0/d' "${APP_DIR}/app/page.tsx"
  rm -f "${APP_DIR}/app/page.tsx.bak"
  echo "  ✅ Removed dynamic exports from page.tsx"
fi

# Payment callback page
if [ -f "${APP_DIR}/app/payment-callback/page.tsx" ]; then
  sed -i.bak '/^export const dynamic = .force-dynamic./d' "${APP_DIR}/app/payment-callback/page.tsx"
  sed -i.bak '/^export const revalidate = 0/d' "${APP_DIR}/app/payment-callback/page.tsx"
  rm -f "${APP_DIR}/app/payment-callback/page.tsx.bak"
  echo "  ✅ Removed dynamic exports from payment-callback/page.tsx"
fi

# Not found page
if [ -f "${APP_DIR}/app/not-found.tsx" ]; then
  sed -i.bak '/^export const dynamic = .force-dynamic./d' "${APP_DIR}/app/not-found.tsx"
  sed -i.bak '/^export const revalidate = 0/d' "${APP_DIR}/app/not-found.tsx"
  rm -f "${APP_DIR}/app/not-found.tsx.bak"
  echo "  ✅ Removed dynamic exports from not-found.tsx"
fi

# Remove API routes completely (they won't work on Cloudflare Pages anyway)
# We'll restore them from git after deployment
echo "📦 Removing API routes (not needed for Cloudflare Pages)..."
if [ -d "${APP_DIR}/app/api" ]; then
  rm -rf "${APP_DIR}/app/api"
  echo "  ✅ Removed API routes"
fi

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf "${APP_DIR}/.next"
echo "  ✅ Cleaned build cache"

echo "✅ ${APP_NAME} prepared for Cloudflare Pages build"
