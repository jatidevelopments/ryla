#!/usr/bin/env python3
"""
Test generating an image of a beautiful woman
"""
import requests
import time
import json
import base64
from pathlib import Path

ENDPOINT = "https://ryla--ryla-z-image-simple-z-image-simple-fastapi-app.modal.run"

# Load simple workflow
with open("scripts/workflow-deployer/test-simple-z-image.json", "r") as f:
    workflow = json.load(f)

# Update prompt
workflow["4"]["inputs"]["text"] = "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality, professional photography, studio lighting, elegant, graceful"
workflow["5"]["inputs"]["text"] = "deformed, blurry, low quality, distorted, ugly, bad anatomy, bad proportions"

print("⏳ Waiting for endpoint to be ready...")
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
print("\n🎨 Generating image of a beautiful woman...")
print(f"   Prompt: {workflow['4']['inputs']['text']}")
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
        
        # Save image
        if result.get('images'):
            output_dir = Path("scripts/workflow-deployer/test-outputs")
            output_dir.mkdir(exist_ok=True)
            
            for i, img_data in enumerate(result['images']):
                # Handle base64 data
                if isinstance(img_data, str):
                    if img_data.startswith('data:image'):
                        # Extract base64 part
                        img_data = img_data.split(',')[1]
                    
                    image_bytes = base64.b64decode(img_data)
                    output_path = output_dir / f"beautiful-woman-{int(time.time())}.png"
                    
                    with open(output_path, 'wb') as f:
                        f.write(image_bytes)
                    
                    print(f"   💾 Saved image to: {output_path}")
                    print(f"   📏 Size: {len(image_bytes) / 1024:.1f} KB")
    else:
        print(f"❌ Error: {response.text[:500]}")
except Exception as e:
    print(f"❌ Request failed: {e}")
    import traceback
    traceback.print_exc()
