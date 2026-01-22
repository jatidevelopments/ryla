#!/bin/bash
# Endpoint Testing Script
# Usage: ./scripts/test-endpoints.sh

set -e

echo "🧪 RYLA Modal Endpoint Testing"
echo "==============================="
echo ""

# Check if ryla_client.py exists
if [ ! -f "ryla_client.py" ]; then
    echo "❌ ryla_client.py not found. Please run from apps/modal/ directory"
    exit 1
fi

# Get workspace
WORKSPACE=$(modal profile current 2>/dev/null || echo "")
if [ -z "$WORKSPACE" ]; then
    echo "⚠️  Could not determine Modal workspace. Tests may fail."
    echo "   Please set --modal-workspace flag in test commands"
    WORKSPACE=""
else
    echo "✅ Workspace: $WORKSPACE"
    echo ""
fi

# Test results
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local endpoint=$2
    local args=$3
    
    echo "Testing: $name"
    echo "  Command: python ryla_client.py $endpoint $args"
    
    if python ryla_client.py $endpoint $args --output "test_${endpoint}.jpg" 2>&1 | tee "test_${endpoint}.log"; then
        echo "  ✅ PASSED"
        ((PASSED++))
    else
        echo "  ❌ FAILED (see test_${endpoint}.log)"
        ((FAILED++))
    fi
    echo ""
}

# Test endpoints
echo "Starting endpoint tests..."
echo ""

# 1. Flux Schnell
test_endpoint "Flux Schnell" "flux" "--prompt 'A beautiful landscape with mountains'"

# 2. Flux Dev
test_endpoint "Flux Dev" "flux-dev" "--prompt 'A detailed portrait of a person'"

# 3. Wan2.1 (video - may take longer)
echo "⚠️  Wan2.1 video generation may take 30-60 seconds..."
test_endpoint "Wan2.1 Video" "wan2" "--prompt 'A beautiful landscape animation'"

# Note: InstantID, LoRA, SeedVR2 require additional files
echo "⚠️  Skipping InstantID, LoRA, SeedVR2 (require additional files)"
echo "   To test manually:"
echo "   - InstantID: python ryla_client.py flux-instantid --prompt '...' --reference-image face.jpg"
echo "   - LoRA: python ryla_client.py flux-lora --prompt '...' --lora-path lora.safetensors"
echo "   - SeedVR2: python ryla_client.py seedvr2 --image input.jpg"
echo ""

# Summary
echo "==============================="
echo "Test Summary:"
echo "  ✅ Passed: $PASSED"
echo "  ❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed. Check logs for details."
    exit 1
fi
