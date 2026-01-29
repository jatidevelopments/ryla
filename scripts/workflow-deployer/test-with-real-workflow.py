#!/usr/bin/env python3
"""Test the /generate endpoint with the actual Denrisi workflow"""
import requests
import json
import sys
from pathlib import Path

endpoint = sys.argv[1] if len(sys.argv) > 1 else "https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run"
workflow_file = sys.argv[2] if len(sys.argv) > 2 else "scripts/workflow-deployer/test-denrisi-workflow.json"

print(f"🧪 Testing /generate endpoint with real workflow")
print(f"   Endpoint: {endpoint}")
print(f"   Workflow: {workflow_file}\n")

# Load the actual workflow
workflow_path = Path(workflow_file)
if not workflow_path.exists():
    print(f"❌ Workflow file not found: {workflow_file}")
    sys.exit(1)

with open(workflow_path, 'r') as f:
    workflow = json.load(f)

print(f"✅ Loaded workflow with {len(workflow)} nodes")
print(f"   Nodes: {', '.join([node.get('class_type', 'unknown') for node in workflow.values()][:5])}...\n")

# Update prompt in workflow if it has CLIPTextEncode nodes
for node_id, node in workflow.items():
    if node.get("class_type") == "CLIPTextEncode":
        inputs = node.get("inputs", {})
        if "text" in inputs:
            # Update with a test prompt
            if "negative" not in str(node_id).lower() and "negative" not in str(inputs.get("text", "")).lower():
                inputs["text"] = "A beautiful sunset over mountains, highly detailed, 4k"
                print(f"   Updated prompt in node {node_id}: {inputs['text'][:50]}...")

print(f"\n📤 Sending workflow to /generate endpoint...")
print(f"   This may take 1-3 minutes for image generation...\n")

try:
    response = requests.post(
        f"{endpoint}/generate",
        json={"workflow": workflow},
        timeout=300  # 5 minute timeout
    )
    
    print(f"✅ Status: {response.status_code}\n")
    
    if response.ok:
        try:
            data = response.json()
            print(f"✅ SUCCESS! Workflow executed successfully!")
            print(f"\nResponse:")
            print(json.dumps(data, indent=2)[:1000])  # First 1000 chars
            
            if "images" in data:
                image_count = data.get("count", len(data.get("images", [])))
                print(f"\n🎉 Generated {image_count} image(s)!")
                if image_count > 0:
                    print(f"   Image format: {data.get('format', 'unknown')}")
                    if data.get("images"):
                        img_data = data["images"][0]
                        if isinstance(img_data, str):
                            print(f"   Image size: {len(img_data)} characters (base64)")
                        else:
                            print(f"   Image data: {type(img_data)}")
        except json.JSONDecodeError:
            print(f"⚠️  Response is not JSON:")
            print(response.text[:500])
    else:
        print(f"❌ Error Response:")
        print(f"   Status: {response.status_code}")
        try:
            error_data = response.json()
            print(f"   Error: {json.dumps(error_data, indent=2)[:500]}")
        except:
            print(f"   Body: {response.text[:500]}")
            
except requests.exceptions.Timeout:
    print("⏳ Timeout - Workflow execution is taking longer than expected")
    print("   This may be normal for complex workflows (can take 2-5 minutes)")
except requests.exceptions.ConnectionError as e:
    print(f"❌ Connection Error: {str(e)[:200]}")
    print("   The container may have scaled down. Try again in a moment.")
except Exception as e:
    print(f"❌ Error: {str(e)[:200]}")
