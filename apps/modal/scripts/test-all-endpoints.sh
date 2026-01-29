#!/bin/bash
# Test all split app endpoints with cold start handling

echo "🧪 Testing All Split App Endpoints"
echo "==================================="
echo ""

APPS=("flux" "wan2" "seedvr2" "instantid" "z-image")
RESULTS=()

for app in "${APPS[@]}"; do
    echo "📦 Testing: ryla-$app"
    
    url="https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health"
    echo "   URL: $url"
    
    # Test with longer timeout for cold start
    response=$(curl -s -m 90 "$url" 2>&1)
    
    if echo "$response" | grep -q "healthy"; then
        echo "   ✅ Health check: OK"
        RESULTS+=("✅ $app: OK")
    elif echo "$response" | grep -q "modal-http: invalid function call"; then
        echo "   ⚠️  Cold start in progress (waiting 30s...)"
        sleep 30
        response=$(curl -s -m 60 "$url" 2>&1)
        if echo "$response" | grep -q "healthy"; then
            echo "   ✅ Health check: OK (after cold start)"
            RESULTS+=("✅ $app: OK")
        else
            echo "   ❌ Health check failed: $response"
            RESULTS+=("❌ $app: FAILED")
        fi
    else
        echo "   ❌ Health check failed: $response"
        RESULTS+=("❌ $app: FAILED")
    fi
    echo ""
done

echo "==================================="
echo "📊 Test Results:"
echo ""
for result in "${RESULTS[@]}"; do
    echo "   $result"
done

# Count successes
success_count=$(echo "${RESULTS[@]}" | grep -o "✅" | wc -l | tr -d ' ')
total_count=${#RESULTS[@]}

echo ""
echo "✅ Success: $success_count/$total_count"

if [ "$success_count" -eq "$total_count" ]; then
    echo ""
    echo "🎉 All apps are working!"
    exit 0
else
    echo ""
    echo "⚠️  Some apps need attention"
    exit 1
fi
