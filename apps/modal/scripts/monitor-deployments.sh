#!/bin/bash
# Monitor Modal app deployments with interval checking

INTERVAL=30  # Check every 30 seconds
MAX_ATTEMPTS=40  # Max 20 minutes (40 * 30s)
ATTEMPT=0

echo "🔍 Starting Deployment Monitoring"
echo "=================================="
echo "Interval: ${INTERVAL}s"
echo "Max wait: $((MAX_ATTEMPTS * INTERVAL / 60)) minutes"
echo ""

# Apps to monitor
APPS=("ryla-flux" "ryla-wan2" "ryla-seedvr2" "ryla-instantid" "ryla-z-image")

check_all_deployed() {
    local all_deployed=true
    
    for app in "${APPS[@]}"; do
        # Get latest app status (not stopped)
        status=$(modal app list 2>&1 | grep "$app" | grep -v "stopped" | head -1 | awk '{print $4}')
        
        if [ -z "$status" ] || [ "$status" != "deployed" ]; then
            all_deployed=false
            break
        fi
    done
    
    echo "$all_deployed"
}

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "[$(date +%H:%M:%S)] Check #${ATTEMPT}/${MAX_ATTEMPTS}"
    
    # Check each app
    for app in "${APPS[@]}"; do
        # Get latest app (not stopped)
        app_info=$(modal app list 2>&1 | grep "$app" | grep -v "stopped" | head -1)
        
        if [ -z "$app_info" ]; then
            echo "   ⏳ $app: Not found or stopped"
        else
            status=$(echo "$app_info" | awk '{print $4}')
            app_id=$(echo "$app_info" | awk '{print $2}')
            
            echo -n "   📦 $app: $status"
            
            # If deployed, test health
            if [ "$status" = "deployed" ]; then
                url="https://ryla--${app}-comfyui-fastapi-app.modal.run/health"
                health=$(curl -s -m 5 "$url" 2>&1)
                
                if echo "$health" | grep -q "healthy"; then
                    echo " ✅ (health check OK)"
                elif echo "$health" | grep -q "modal-http"; then
                    echo " ⚠️  (cold start in progress)"
                else
                    echo " ⚠️  (health: ${health:0:50})"
                fi
            else
                echo ""
            fi
        fi
    done
    
    echo ""
    
    # Check if all deployed
    if [ "$(check_all_deployed)" = "true" ]; then
        echo "✅ All apps deployed!"
        echo ""
        echo "🧪 Testing endpoints..."
        
        # Test health endpoints
        for app in "${APPS[@]}"; do
            url="https://ryla--${app}-comfyui-fastapi-app.modal.run/health"
            echo -n "   Testing $app: "
            health=$(curl -s -m 10 "$url" 2>&1)
            
            if echo "$health" | grep -q "healthy"; then
                echo "✅ OK"
            else
                echo "⚠️  $health"
            fi
        done
        
        echo ""
        echo "✅ Monitoring complete - All apps ready for testing"
        exit 0
    fi
    
    # Wait before next check
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep $INTERVAL
    fi
done

echo ""
echo "⏰ Timeout reached - Some apps may still be deploying"
echo "Check manually: ./apps/modal/scripts/check-deployment-status.sh"
exit 1
