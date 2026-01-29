#!/bin/bash
set -e

# Restore funnel app after Cloudflare Pages build
# Restores dynamic exports and API routes

APP_NAME="funnel"
APP_DIR="apps/${APP_NAME}"

echo "🔄 Restoring ${APP_NAME} after Cloudflare Pages build..."

# Restore dynamic exports
echo "📝 Restoring dynamic exports..."

# Main page
if [ -f "${APP_DIR}/app/page.tsx" ]; then
  if ! grep -q "export const dynamic" "${APP_DIR}/app/page.tsx"; then
    sed -i.bak '3a\
export const dynamic = '\''force-dynamic'\'';\
export const revalidate = 0;
' "${APP_DIR}/app/page.tsx"
    rm -f "${APP_DIR}/app/page.tsx.bak"
    echo "  ✅ Restored dynamic exports to page.tsx"
  fi
fi

# Payment callback page
if [ -f "${APP_DIR}/app/payment-callback/page.tsx" ]; then
  if ! grep -q "export const dynamic" "${APP_DIR}/app/payment-callback/page.tsx"; then
    sed -i.bak '4a\
export const dynamic = '\''force-dynamic'\'';\
export const revalidate = 0;
' "${APP_DIR}/app/payment-callback/page.tsx"
    rm -f "${APP_DIR}/app/payment-callback/page.tsx.bak"
    echo "  ✅ Restored dynamic exports to payment-callback/page.tsx"
  fi
fi

# Not found page
if [ -f "${APP_DIR}/app/not-found.tsx" ]; then
  if ! grep -q "export const dynamic" "${APP_DIR}/app/not-found.tsx"; then
    sed -i.bak '3a\
export const dynamic = '\''force-dynamic'\'';\
export const revalidate = 0;
' "${APP_DIR}/app/not-found.tsx"
    rm -f "${APP_DIR}/app/not-found.tsx.bak"
    echo "  ✅ Restored dynamic exports to not-found.tsx"
  fi
fi

# Restore API routes from git (they were removed, not moved)
echo "📦 Restoring API routes from git..."
if [ ! -d "${APP_DIR}/app/api" ]; then
  git checkout HEAD -- "${APP_DIR}/app/api" 2>/dev/null || {
    echo "  ⚠️  Could not restore API routes from git (they may have been deleted)"
    echo "  ℹ️  API routes are not needed for Cloudflare Pages (using backend API)"
  }
  if [ -d "${APP_DIR}/app/api" ]; then
    echo "  ✅ Restored API routes from git"
  fi
fi

echo "✅ ${APP_NAME} restored"
