#!/bin/bash
# Check deployment status of all split Modal apps

echo "🔍 Checking Modal App Deployment Status"
echo "========================================"
echo ""

# Check each app
for app in flux wan2 seedvr2 instantid z-image; do
    echo "📦 Checking: ryla-$app"
    
    # Get app status
    status=$(modal app list 2>&1 | grep "ryla-$app" | grep -v "stopped" | head -1 | awk '{print $4}')
    
    if [ -z "$status" ]; then
        echo "   ⚠️  Not found or stopped"
    else
        echo "   Status: $status"
        
        # Try health endpoint if deployed
        if [ "$status" = "deployed" ]; then
            url="https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health"
            health=$(curl -s -m 5 "$url" 2>&1)
            if echo "$health" | grep -q "healthy"; then
                echo "   ✅ Health check: OK"
            else
                echo "   ⚠️  Health check: $health"
            fi
        fi
    fi
    echo ""
done

echo "========================================"
echo "✅ Status check complete"
echo ""
echo "To view logs: modal app logs ryla-{app}"
echo "To test: python apps/modal/scripts/test-split-apps.py"
