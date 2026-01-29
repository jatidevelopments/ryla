#!/usr/bin/env python3
"""
Test simple z-image workflow
"""
import requests
import time
import json

ENDPOINT = "https://ryla--ryla-z-image-simple-z-image-simple-fastapi-app.modal.run"

# Load simple workflow
with open("scripts/workflow-deployer/test-simple-z-image.json", "r") as f:
    workflow = json.load(f)

print("⏳ Waiting for endpoint to be ready (max 5 minutes)...")
max_wait = 300
start_time = time.time()

# Test health endpoint first
while time.time() - start_time < max_wait:
    try:
        response = requests.get(f"{ENDPOINT}/health", timeout=10)
        if response.status_code == 200:
            print(f"✅ Health check passed after {int(time.time() - start_time)}s")
            break
    except Exception as e:
        elapsed = int(time.time() - start_time)
        if elapsed % 30 == 0:
            print(f"   Still waiting... ({elapsed}s elapsed)")
        time.sleep(5)
else:
    print("❌ Health check failed after 5 minutes")
    exit(1)

# Now test generate endpoint
print("\n🧪 Testing /generate endpoint with simple workflow...")
try:
    response = requests.post(
        f"{ENDPOINT}/generate",
        json={"workflow": workflow},
        timeout=600
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success! Generated {result.get('count', 0)} image(s)")
        print(f"   Format: {result.get('format', 'unknown')}")
    else:
        print(f"❌ Error: {response.text[:500]}")
except Exception as e:
    print(f"❌ Request failed: {e}")
