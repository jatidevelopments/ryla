#!/bin/bash
# Restore files after Cloudflare Pages build
# This script restores API routes that were moved during Cloudflare build

set -e

APP_NAME="${1:-landing}"

echo "🔄 Restoring $APP_NAME after Cloudflare Pages build..."

case "$APP_NAME" in
  landing)
    # Restore health API route
    HEALTH_ROUTE="apps/landing/app/api/health/route.ts"
    HEALTH_BACKUP="apps/landing/app/api/health/route.ts.backup"
    
    if [ -f "$HEALTH_BACKUP" ]; then
      echo "   Restoring health API route..."
      mv "$HEALTH_BACKUP" "$HEALTH_ROUTE"
      echo "   ✅ Health route restored"
    fi
    
    # Restore waitlist API route
    WAITLIST_ROUTE="apps/landing/app/api/waitlist"
    WAITLIST_BACKUP="apps/landing/.waitlist-api-backup"
    
    if [ -d "$WAITLIST_BACKUP" ]; then
      echo "   Restoring waitlist API route..."
      mv "$WAITLIST_BACKUP" "$WAITLIST_ROUTE"
      echo "   ✅ Waitlist route restored"
    fi
    
    # Restore not-found.tsx
    NOT_FOUND_FILE="apps/landing/app/not-found.tsx"
    NOT_FOUND_BACKUP="apps/landing/app/not-found.tsx.backup"
    if [ -f "$NOT_FOUND_BACKUP" ]; then
      echo "   Restoring not-found.tsx..."
      mv "$NOT_FOUND_BACKUP" "$NOT_FOUND_FILE"
      echo "   ✅ not-found.tsx restored"
    fi
    ;;
    
  *)
    echo "   ℹ️  No restoration needed for $APP_NAME"
    ;;
esac

echo "✅ Restoration complete"
