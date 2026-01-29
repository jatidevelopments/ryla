#!/usr/bin/env python3
"""
Test Modal endpoint with wait for cold start
"""
import requests
import time
import json

ENDPOINT = "https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run"

# Load test workflow
with open("scripts/workflow-deployer/test-denrisi-workflow.json", "r") as f:
    workflow = json.load(f)

# Update prompt
for node_id, node in workflow.items():
    if node.get("class_type") == "CLIPTextEncode":
        if "text" in node.get("inputs", {}):
            if "beautiful landscape" in node["inputs"]["text"]:
                node["inputs"]["text"] = "A futuristic cityscape at sunset"

print("⏳ Waiting for endpoint to be ready (max 5 minutes)...")
max_wait = 300  # 5 minutes
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
        if elapsed % 30 == 0:  # Print every 30 seconds
            print(f"   Still waiting... ({elapsed}s elapsed)")
        time.sleep(5)
else:
    print("❌ Health check failed after 5 minutes")
    exit(1)

# Now test generate endpoint
print("\n🧪 Testing /generate endpoint...")
try:
    response = requests.post(
        f"{ENDPOINT}/generate",
        json={"workflow": workflow},
        timeout=600  # 10 minutes for generation
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Success! Generated {result.get('count', 0)} image(s)")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Request failed: {e}")
