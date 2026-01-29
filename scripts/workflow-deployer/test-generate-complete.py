#!/usr/bin/env python3
"""Test the /generate endpoint with proper ComfyUI readiness check"""
import requests
import json
import sys
import time

endpoint = sys.argv[1] if len(sys.argv) > 1 else "https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run"

print(f"🧪 Testing /generate endpoint: {endpoint}\n")

def check_comfyui_ready(base_url, max_wait=300):
    """Check if ComfyUI is ready by checking the health endpoint."""
    print("⏳ Waiting for ComfyUI to be ready...")
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            # First check if FastAPI is responding
            health_response = requests.get(f"{base_url}/health", timeout=10)
            if health_response.ok:
                print(f"✅ FastAPI is responding (waited {int(time.time() - start_time)}s)")
                # Now we need to wait for ComfyUI - typically 2-5 minutes
                # Since we can't directly check ComfyUI, we'll wait a bit more
                remaining_wait = max(0, 180 - (time.time() - start_time))  # Wait at least 3 minutes total
                if remaining_wait > 0:
                    print(f"⏳ Waiting {int(remaining_wait)}s more for ComfyUI cold start...")
                    time.sleep(remaining_wait)
                return True
        except Exception as e:
            print(f"   Still waiting... ({int(time.time() - start_time)}s)")
            time.sleep(10)
    
    print(f"⚠️  Max wait time ({max_wait}s) exceeded")
    return False

# Check if ComfyUI is ready
if not check_comfyui_ready(endpoint):
    print("❌ ComfyUI may not be ready. Proceeding anyway...")

# Test workflow - simple EmptySD3LatentImage (from Denrisi workflow)
test_workflow = {
    "1": {
        "class_type": "EmptySD3LatentImage",
        "inputs": {
            "width": 1024,
            "height": 1024
        }
    }
}

print(f"\n📤 Sending test workflow to /generate...")
print(f"   Workflow: {json.dumps(test_workflow, indent=2)}")

try:
    response = requests.post(
        f"{endpoint}/generate",
        json={"workflow": test_workflow},
        timeout=300  # 5 minute timeout for workflow execution
    )
    
    print(f"\n✅ Status: {response.status_code}")
    
    if response.ok:
        try:
            data = response.json()
            print(f"✅ Response received:")
            print(json.dumps(data, indent=2)[:1000])  # First 1000 chars
            if "images" in data:
                print(f"\n✅ Success! Generated {data.get('count', 0)} image(s)")
        except json.JSONDecodeError:
            print(f"⚠️  Response is not JSON: {response.text[:500]}")
    else:
        print(f"❌ Error Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text[:500]}")
        
except requests.exceptions.Timeout:
    print("⏳ Timeout - Workflow execution is taking longer than expected")
    print("   This may be normal for complex workflows or if ComfyUI is still starting")
except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection Error: {str(e)[:200]}")
    print("   The container may have scaled down. Try again in a moment.")
except Exception as e:
    print(f"❌ Error: {str(e)[:200]}")
