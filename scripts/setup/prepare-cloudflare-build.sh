#!/bin/bash
# Prepare Next.js apps for Cloudflare Pages build
# This script handles API routes that are incompatible with static export

set -e

APP_NAME="${1:-landing}"

echo "🔧 Preparing $APP_NAME for Cloudflare Pages build..."

case "$APP_NAME" in
  landing)
    # For landing, the health API route is only needed for Fly.io
    # Clean build cache first, then move the route
    echo "   Cleaning build cache..."
    rm -rf apps/landing/.next
    rm -rf dist/apps/landing
    echo "   ✅ Build cache cleaned"
    
    # Move health API route temporarily during Cloudflare build
    HEALTH_ROUTE="apps/landing/app/api/health/route.ts"
    HEALTH_BACKUP="apps/landing/app/api/health/route.ts.backup"
    
    if [ -f "$HEALTH_ROUTE" ]; then
      echo "   Moving health API route (not needed for Cloudflare Pages)..."
      mv "$HEALTH_ROUTE" "$HEALTH_BACKUP"
      echo "   ✅ Health route moved"
    fi
    
    # Move waitlist API route temporarily during Cloudflare build
    WAITLIST_ROUTE="apps/landing/app/api/waitlist"
    WAITLIST_BACKUP="apps/landing/.waitlist-api-backup"
    
    if [ -d "$WAITLIST_ROUTE" ]; then
      echo "   Moving waitlist API route (not needed for Cloudflare Pages)..."
      mv "$WAITLIST_ROUTE" "$WAITLIST_BACKUP"
      echo "   ✅ Waitlist route moved"
    fi
    
    # Remove force-dynamic from not-found.tsx for Cloudflare build
    NOT_FOUND_FILE="apps/landing/app/not-found.tsx"
    NOT_FOUND_BACKUP="apps/landing/app/not-found.tsx.backup"
    if [ -f "$NOT_FOUND_FILE" ]; then
      echo "   Updating not-found.tsx for static export..."
      cp "$NOT_FOUND_FILE" "$NOT_FOUND_BACKUP"
      # Remove the dynamic export line
      sed -i '' '/export const dynamic/d' "$NOT_FOUND_FILE"
      echo "   ✅ not-found.tsx updated"
    fi
    ;;
    
  funnel|web)
    echo "   ⚠️  $APP_NAME has API routes - will use Cloudflare adapter"
    echo "   No preparation needed (adapter handles API routes)"
    ;;
    
  *)
    echo "   ℹ️  No special preparation needed for $APP_NAME"
    ;;
esac

echo "✅ Preparation complete"
