#!/usr/bin/env python3
"""Test the /generate endpoint after ComfyUI cold start"""
import requests
import json
import sys
import time

endpoint = sys.argv[1] if len(sys.argv) > 1 else "https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run"

print(f"🧪 Testing /generate endpoint: {endpoint}\n")

# Simple test workflow (just create empty latent)
test_workflow = {
    "1": {
        "class_type": "EmptySD3LatentImage",
        "inputs": {
            "width": 1024,
            "height": 1024
        }
    }
}

print("Waiting 120 seconds for ComfyUI to fully start...")
time.sleep(120)

print("\n📤 Sending test workflow...")
try:
    response = requests.post(
        f"{endpoint}/generate",
        json={"workflow": test_workflow},
        timeout=180
    )
    
    print(f"✅ Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"✅ Response: {json.dumps(data, indent=2)[:500]}")
    else:
        print(f"❌ Error: {response.text[:300]}")
        
except requests.exceptions.Timeout:
    print("⏳ Timeout - ComfyUI may still be starting or workflow is taking longer")
except Exception as e:
    print(f"❌ Error: {str(e)[:200]}")
