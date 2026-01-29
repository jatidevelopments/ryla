#!/bin/bash
# Test all endpoints to generate actual images/videos
# Handles cold starts (first request can take 2-5 minutes)

set -e

TIMEOUT=600  # 10 minutes for cold starts
OUTPUT_DIR="/tmp/ryla_test_outputs"
mkdir -p "$OUTPUT_DIR"

echo "🧪 Testing All Endpoints to Generate Images/Videos"
echo "=================================================="
echo ""
echo "Note: First requests may take 2-5 minutes (cold start)"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    local payload=$3
    local output_file=$4
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "  URL: $url"
    echo "  Output: $output_file"
    echo -n "  Status: "
    
    start_time=$(date +%s)
    
    response=$(curl -X POST -s -m $TIMEOUT "$url" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        --output "$output_file" \
        -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}" 2>&1)
    
    end_time=$(date +%s)
    elapsed=$((end_time - start_time))
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    time_total=$(echo "$response" | grep "TIME:" | cut -d: -f2)
    
    if [ -f "$output_file" ] && [ -s "$output_file" ]; then
        file_size=$(ls -lh "$output_file" | awk '{print $5}')
        # Check if it's a valid image (not an error JSON)
        if file "$output_file" | grep -q "image\|WebP"; then
            echo -e "${GREEN}✅ SUCCESS${NC}"
            echo "  File size: $file_size"
            echo "  Time: ${elapsed}s"
            echo "  HTTP: $http_code"
            return 0
        else
            # Might be JSON error
            if head -1 "$output_file" | grep -q "{"; then
                echo -e "${RED}❌ ERROR (JSON response)${NC}"
                echo "  Response: $(head -3 "$output_file")"
            else
                echo -e "${RED}❌ FAILED (empty/invalid)${NC}"
            fi
            return 1
        fi
    else
        echo -e "${YELLOW}⏳ TIMEOUT or EMPTY${NC}"
        echo "  Time: ${elapsed}s"
        echo "  HTTP: $http_code"
        echo "  Note: May need cold start (wait 2-5 minutes)"
        return 2
    fi
}

# Test 1: Flux Schnell
echo ""
test_endpoint \
    "Flux Schnell" \
    "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux" \
    '{"prompt": "A beautiful sunset over mountains", "width": 512, "height": 512, "steps": 4}' \
    "$OUTPUT_DIR/flux.jpg"

# Test 2: Flux Dev
echo ""
test_endpoint \
    "Flux Dev" \
    "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev" \
    '{"prompt": "A serene landscape with a lake", "width": 512, "height": 512, "steps": 20}' \
    "$OUTPUT_DIR/flux_dev.jpg"

# Test 3: Wan2 Video
echo ""
test_endpoint \
    "Wan2 Video" \
    "https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2" \
    '{"prompt": "Waves crashing on a beach", "width": 512, "height": 512, "length": 16, "fps": 16, "steps": 30}' \
    "$OUTPUT_DIR/wan2.webp"

# Test 4: Z-Image Simple
echo ""
test_endpoint \
    "Z-Image Simple" \
    "https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple" \
    '{"prompt": "A futuristic cityscape at night", "width": 512, "height": 512, "steps": 9}' \
    "$OUTPUT_DIR/zimage_simple.jpg"

# Test 5: SeedVR2 (needs input image first)
echo ""
echo -e "${BLUE}Testing: SeedVR2 Upscaling${NC}"
echo "  Generating input image first..."

# Generate input image
input_image="$OUTPUT_DIR/seedvr2_input.jpg"
curl -X POST -s -m 300 "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "A simple test image", "width": 256, "height": 256, "steps": 4}' \
    --output "$input_image" > /dev/null 2>&1

if [ -f "$input_image" ] && [ -s "$input_image" ]; then
    echo "  ✅ Input image generated"
    
    # Encode image (macOS base64)
    image_b64=$(base64 "$input_image" | tr -d '\n')
    image_data="data:image/jpeg;base64,$image_b64"
    
    test_endpoint \
        "SeedVR2 Upscaling" \
        "https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2" \
        "{\"image\": \"$image_data\", \"resolution\": 512}" \
        "$OUTPUT_DIR/seedvr2.png"
else
    echo -e "  ${YELLOW}⏳ Skipped - couldn't generate input image${NC}"
fi

# Summary
echo ""
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "Generated files:"
ls -lh "$OUTPUT_DIR" 2>/dev/null | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "✅ Tests completed!"
echo ""
