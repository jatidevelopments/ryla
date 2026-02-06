#!/usr/bin/env python3
"""
Test SeedVR2 realistic upscaling endpoint

Usage:
    python apps/modal/test_seedvr2.py [workspace] [input_image]
    
Example:
    python apps/modal/test_seedvr2.py ryla test_image.jpg
"""

import requests
import sys
import base64
from pathlib import Path

# Allow running as script from repo root or apps/modal
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tests.endpoint_urls import get_endpoint_url


def test_seedvr2_upscaling(workspace: str, input_image: str):
    endpoint = get_endpoint_url(workspace, "/seedvr2")

    # Load and encode input image
    image_path = Path(input_image)
    if not image_path.exists():
        print(f"❌ Input image not found: {input_image}")
        sys.exit(1)

    with open(image_path, "rb") as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    print(f"🧪 Testing SeedVR2 Upscaling")
    print(f"   Workspace: {workspace}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Input Image: {image_path}")
    print(f"   Input Size: {len(image_bytes) / 1024:.1f} KB")
    print()

    try:
        print("⏳ Sending request (first call may take ~1-3m for cold start)...")
        response = requests.post(
            endpoint,
            json={"image": image_b64},
            timeout=300,  # Upscaling can take longer
        )
        response.raise_for_status()

        # Save output
        output_path = Path(f"seedvr2_upscaled_{image_path.stem}.png")
        output_path.write_bytes(response.content)

        print(f"✅ Upscaling successful!")
        print(f"   Output saved to: {output_path}")
        print(f"   Output Size: {len(response.content) / 1024:.1f} KB")

        # Display cost information if available
        if "X-Cost-USD" in response.headers:
            cost = response.headers["X-Cost-USD"]
            exec_time = response.headers.get("X-Execution-Time-Sec", "N/A")
            gpu_type = response.headers.get("X-GPU-Type", "L40S")
            print(f"💰 Cost: ${cost} | Time: {exec_time}s | GPU: {gpu_type}")

    except requests.exceptions.Timeout:
        print("❌ Request timed out (upscaling may still be processing)")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        if e.response:
            print(f"   Response: {e.response.text[:500]}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python apps/modal/test_seedvr2.py [workspace] [input_image]")
        print("\nExample:")
        print("  python apps/modal/test_seedvr2.py ryla test_image.jpg")
        sys.exit(1)

    workspace = sys.argv[1]
    input_image = sys.argv[2]

    test_seedvr2_upscaling(workspace, input_image)
