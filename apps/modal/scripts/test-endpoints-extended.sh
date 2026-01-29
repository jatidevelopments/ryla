#!/bin/bash

# Extended endpoint testing script with longer timeouts and better error handling

echo "🧪 Testing RYLA ComfyUI Modal App Endpoints (Extended Timeout)"
echo "=============================================================="
echo ""

# Navigate to the apps/modal directory
SCRIPT_DIR=$(dirname "$(realpath "$0")")
MODAL_APP_DIR="$SCRIPT_DIR/.."
cd "$MODAL_APP_DIR" || { echo "❌ Failed to navigate to $MODAL_APP_DIR"; exit 1; }

echo "Current directory: $(pwd)"
echo ""

# Get Modal workspace
WORKSPACE=$(modal profile current 2>/dev/null | head -1 | tr -d '[:space:]')
if [ -z "$WORKSPACE" ]; then
    echo "❌ Could not determine Modal workspace"
    exit 1
fi

echo "Modal Workspace: $WORKSPACE"
echo "Base URL: https://${WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run"
echo ""

# Test configuration
MAX_RETRIES=2
TIMEOUT=300  # 5 minutes per request
COLD_START_WAIT=180  # Wait 3 minutes for cold start

# Test results
PASSED=0
FAILED=0
SKIPPED=0

# Helper function to test an endpoint
test_endpoint() {
    local endpoint_name=$1
    local endpoint_path=$2
    local payload=$3
    local output_file=$4
    local description=$5
    local retry_count=0
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Testing: $description"
    echo "Endpoint: $endpoint_path"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    while [ $retry_count -le $MAX_RETRIES ]; do
        if [ $retry_count -gt 0 ]; then
            echo "⏳ Retry attempt $retry_count/$MAX_RETRIES (waiting ${COLD_START_WAIT}s for warm-up)..."
            sleep $COLD_START_WAIT
        fi
        
        echo "📤 Sending request..."
        START_TIME=$(date +%s)
        
        # Create temp file for response
        TEMP_RESPONSE="/tmp/ryla_test_response_$$.tmp"
        TEMP_HEADERS="/tmp/ryla_test_headers_$$.tmp"
        
        # Make request with extended timeout
        HTTP_CODE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$payload" \
            --max-time $TIMEOUT \
            --connect-timeout 30 \
            -D "$TEMP_HEADERS" \
            -o "$TEMP_RESPONSE" \
            "https://${WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run${endpoint_path}" 2>&1 | tail -1)
        
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        
        # Check HTTP status
        if [ "$HTTP_CODE" = "200" ]; then
            # Check if response is an image (starts with binary data)
            if [ -s "$TEMP_RESPONSE" ]; then
                # Check file type
                FILE_TYPE=$(file -b --mime-type "$TEMP_RESPONSE" 2>/dev/null || echo "unknown")
                
                if [[ "$FILE_TYPE" == image/* ]] || [[ "$FILE_TYPE" == video/* ]]; then
                    # Save output file
                    cp "$TEMP_RESPONSE" "$output_file"
                    FILE_SIZE=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "0")
                    
                    echo "✅ Request succeeded!"
                    echo "   HTTP Status: $HTTP_CODE"
                    echo "   Duration: ${DURATION}s"
                    echo "   Output: $output_file ($FILE_SIZE bytes, $FILE_TYPE)"
                    
                    # Extract cost headers
                    if [ -f "$TEMP_HEADERS" ]; then
                        COST=$(grep -i "x-cost-usd" "$TEMP_HEADERS" | cut -d' ' -f2 | tr -d '\r\n' || echo "N/A")
                        EXEC_TIME=$(grep -i "x-execution-time-sec" "$TEMP_HEADERS" | cut -d' ' -f2 | tr -d '\r\n' || echo "N/A")
                        GPU_TYPE=$(grep -i "x-gpu-type" "$TEMP_HEADERS" | cut -d' ' -f2 | tr -d '\r\n' || echo "N/A")
                        
                        if [ "$COST" != "N/A" ]; then
                            echo "   Cost: \$$COST"
                            echo "   Execution Time: ${EXEC_TIME}s"
                            echo "   GPU Type: $GPU_TYPE"
                        fi
                    fi
                    
                    rm -f "$TEMP_RESPONSE" "$TEMP_HEADERS"
                    ((PASSED++))
                    echo ""
                    return 0
                else
                    # Check if it's an error message
                    ERROR_MSG=$(head -c 200 "$TEMP_RESPONSE" 2>/dev/null || echo "")
                    echo "⚠️  Response is not an image/video (type: $FILE_TYPE)"
                    echo "   Response preview: $ERROR_MSG"
                fi
            else
                echo "⚠️  Empty response received"
            fi
        else
            ERROR_MSG=$(head -c 200 "$TEMP_RESPONSE" 2>/dev/null || echo "")
            echo "❌ Request failed"
            echo "   HTTP Status: $HTTP_CODE"
            echo "   Duration: ${DURATION}s"
            if [ -n "$ERROR_MSG" ]; then
                echo "   Error: $ERROR_MSG"
            fi
        fi
        
        rm -f "$TEMP_RESPONSE" "$TEMP_HEADERS"
        
        # Retry logic
        if [ $retry_count -lt $MAX_RETRIES ]; then
            ((retry_count++))
            echo "   Will retry..."
            echo ""
        else
            break
        fi
    done
    
    echo "❌ Test failed after $MAX_RETRIES retries"
    ((FAILED++))
    echo ""
    return 1
}

# Test 1: Flux Schnell
test_endpoint \
    "flux" \
    "/flux" \
    '{"prompt": "A beautiful landscape with mountains and a lake, sunset, photorealistic", "width": 1024, "height": 1024, "steps": 4, "cfg": 1.0}' \
    "test_flux.jpg" \
    "Flux Schnell Text-to-Image"

# Test 2: Flux Dev
test_endpoint \
    "flux-dev" \
    "/flux-dev" \
    '{"prompt": "A detailed portrait of a futuristic city at night, neon lights, cyberpunk style", "width": 1024, "height": 1024, "steps": 20, "cfg": 1.0}' \
    "test_flux_dev.jpg" \
    "Flux Dev Text-to-Image (MVP Primary Model)"

# Test 3: Wan2.1 Video
test_endpoint \
    "wan2" \
    "/wan2" \
    '{"prompt": "A serene river flowing through a forest, cinematic, nature documentary style", "width": 512, "height": 512, "frames": 16, "fps": 8}' \
    "test_wan2.webp" \
    "Wan2.1 Text-to-Video"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "⏭️  Skipped: $SKIPPED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed. Check output above for details."
    exit 1
fi
