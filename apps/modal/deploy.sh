#!/bin/bash
# Deploy all Modal apps
# Usage: ./deploy.sh [app-name] (if app-name provided, deploy only that app)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS_DIR="$SCRIPT_DIR/apps"

echo "🚀 RYLA Modal Apps Deployment"
echo "=============================="
echo ""

# If app name provided, deploy only that app
if [ -n "$1" ]; then
    APP_NAME="$1"
    APP_DIR="$APPS_DIR/$APP_NAME"
    
    if [ ! -d "$APP_DIR" ]; then
        echo "❌ App directory not found: $APP_DIR"
        echo "Available apps:"
        ls -1 "$APPS_DIR" 2>/dev/null | sed 's/^/  - /' || echo "  (no apps found)"
        exit 1
    fi
    
    if [ ! -f "$APP_DIR/app.py" ]; then
        echo "❌ app.py not found in: $APP_DIR"
        exit 1
    fi
    
    echo "📦 Deploying: $APP_NAME"
    echo "   Path: $APP_DIR/app.py"
    echo ""
    
    modal deploy "$APP_DIR/app.py"
    
    echo ""
    echo "✅ $APP_NAME deployed successfully!"
    exit 0
fi

# Deploy all apps
echo "📦 Deploying all apps..."
echo ""

FAILED=0
SUCCESS=0

for app_dir in "$APPS_DIR"/*/; do
    if [ ! -d "$app_dir" ]; then
        continue
    fi
    
    app_name=$(basename "$app_dir")
    
    if [ ! -f "$app_dir/app.py" ]; then
        echo "⚠️  Skipping $app_name: app.py not found"
        continue
    fi
    
    echo "📦 Deploying: $app_name"
    echo "   Path: $app_dir/app.py"
    
    if modal deploy "$app_dir/app.py" 2>&1; then
        echo "   ✅ $app_name deployed successfully"
        ((SUCCESS++))
    else
        echo "   ❌ $app_name deployment failed"
        ((FAILED++))
    fi
    
    echo ""
done

echo "=============================="
echo "Deployment Summary:"
echo "  ✅ Success: $SUCCESS"
echo "  ❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All apps deployed successfully!"
    exit 0
else
    echo "⚠️  Some apps failed to deploy. Check output above."
    exit 1
fi
