#!/bin/bash
# Continuous monitoring of Modal app deployments
# Runs in background, checks every 30 seconds until all deployed

INTERVAL=30
MAX_WAIT=1200  # 20 minutes max

APPS=("ryla-flux" "ryla-wan2" "ryla-seedvr2" "ryla-instantid" "ryla-z-image")

echo "🔍 Monitoring Modal App Deployments"
echo "===================================="
echo "Apps: ${APPS[*]}"
echo "Interval: ${INTERVAL}s"
echo "Max wait: $((MAX_WAIT / 60)) minutes"
echo ""

start_time=$(date +%s)
elapsed=0

while [ $elapsed -lt $MAX_WAIT ]; do
    clear
    echo "🔍 Modal App Deployment Monitor"
    echo "==============================="
    echo "Elapsed: $((elapsed / 60))m $((elapsed % 60))s"
    echo ""
    
    all_deployed=true
    any_initializing=false
    
    for app in "${APPS[@]}"; do
        # Get latest app (including stopped, but prefer non-stopped)
        app_info=$(modal app list 2>&1 | grep "$app" | head -1)
        
        if [ -z "$app_info" ]; then
            echo "   ⏳ $app: Not found"
            all_deployed=false
        else
            status=$(echo "$app_info" | awk '{print $4}')
            app_id=$(echo "$app_info" | awk '{print $2}')
            created=$(echo "$app_info" | awk '{print $6, $7}')
            
            # Check if there's a newer non-stopped version
            newer_info=$(modal app list 2>&1 | grep "$app" | grep -v "stopped" | head -1)
            if [ -n "$newer_info" ]; then
                status=$(echo "$newer_info" | awk '{print $4}')
                app_id=$(echo "$newer_info" | awk '{print $2}')
                created=$(echo "$newer_info" | awk '{print $6, $7}')
            fi
            
            case "$status" in
                "deployed")
                    # Test health
                    url="https://ryla--${app}-comfyui-fastapi-app.modal.run/health"
                    health=$(curl -s -m 5 "$url" 2>&1)
                    if echo "$health" | grep -q "healthy"; then
                        echo "   ✅ $app: DEPLOYED (health OK)"
                    else
                        echo "   ⚠️  $app: DEPLOYED (cold start: ${health:0:40})"
                        all_deployed=false
                    fi
                    ;;
                "initializing"|"initializ…")
                    echo "   🔄 $app: INITIALIZING..."
                    all_deployed=false
                    any_initializing=true
                    ;;
                "stopped")
                    echo "   ⏸️  $app: STOPPED (idle, will cold-start on request)"
                    all_deployed=false
                    ;;
                *)
                    echo "   ⏳ $app: $status"
                    all_deployed=false
                    ;;
            esac
        fi
    done
    
    echo ""
    
    if [ "$all_deployed" = true ]; then
        echo "✅ All apps deployed and healthy!"
        echo ""
        echo "🧪 Running comprehensive test..."
        python apps/modal/scripts/test-split-apps.py
        exit 0
    fi
    
    if [ "$any_initializing" = true ]; then
        echo "⏳ Apps still initializing... waiting ${INTERVAL}s"
    else
        echo "⏳ Waiting for deployments to start... checking in ${INTERVAL}s"
    fi
    
    sleep $INTERVAL
    elapsed=$(($(date +%s) - start_time))
done

echo ""
echo "⏰ Timeout reached after $((MAX_WAIT / 60)) minutes"
echo "Some apps may still be deploying. Check manually:"
echo "  ./apps/modal/scripts/check-deployment-status.sh"
exit 1
