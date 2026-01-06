#!/bin/bash
# Manual test script for RunPod endpoints
# Usage: ./scripts/tests/test-runpod-endpoints-manual.sh YOUR_API_KEY

set -e

API_KEY="${1:-$RUNPOD_API_KEY}"
FLUX_ENDPOINT="jpcxjab2zpro19"
Z_IMAGE_ENDPOINT="xqs8k7yhabwh0k"

if [ -z "$API_KEY" ]; then
  echo "❌ Error: API key required"
  echo "Usage: $0 YOUR_API_KEY"
  echo "   OR: export RUNPOD_API_KEY=your_key && $0"
  exit 1
fi

echo "🚀 Testing RunPod Endpoints"
echo "============================"
echo ""

# Test Flux endpoint
echo "🧪 Testing Flux Endpoint ($FLUX_ENDPOINT)..."
FLUX_JOB=$(curl -s -X POST "https://api.runpod.io/v2/$FLUX_ENDPOINT/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "input": {
      "task_type": "base_image",
      "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality",
      "nsfw": false,
      "num_images": 1,
      "seed": 42
    }
  }')

FLUX_JOB_ID=$(echo $FLUX_JOB | jq -r '.id')
echo "   ✅ Job submitted: $FLUX_JOB_ID"

# Test Z-Image-Turbo endpoint
echo ""
echo "🧪 Testing Z-Image-Turbo Endpoint ($Z_IMAGE_ENDPOINT)..."
Z_IMAGE_JOB=$(curl -s -X POST "https://api.runpod.io/v2/$Z_IMAGE_ENDPOINT/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "input": {
      "task_type": "base_image",
      "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality",
      "nsfw": false,
      "num_images": 1,
      "seed": 42
    }
  }')

Z_IMAGE_JOB_ID=$(echo $Z_IMAGE_JOB | jq -r '.id')
echo "   ✅ Job submitted: $Z_IMAGE_JOB_ID"

echo ""
echo "📊 Job Status"
echo "============================"
echo "Flux Job ID: $FLUX_JOB_ID"
echo "Z-Image-Turbo Job ID: $Z_IMAGE_JOB_ID"
echo ""
echo "Check status:"
echo "  curl -H \"Authorization: Bearer $API_KEY\" https://api.runpod.io/v2/$FLUX_ENDPOINT/status/$FLUX_JOB_ID"
echo "  curl -H \"Authorization: Bearer $API_KEY\" https://api.runpod.io/v2/$Z_IMAGE_ENDPOINT/status/$Z_IMAGE_JOB_ID"

