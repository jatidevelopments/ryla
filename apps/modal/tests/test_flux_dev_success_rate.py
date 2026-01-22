#!/usr/bin/env python3
"""
Test Flux Dev endpoint success rate (10+ samples)

Usage:
    python apps/modal/test_flux_dev_success_rate.py [workspace]
"""

import requests
import sys
import time
from pathlib import Path

PROMPTS = [
    "A beautiful landscape with mountains",
    "A portrait of a person",
    "A futuristic city at night",
    "A cat sitting on a windowsill",
    "An abstract art piece",
    "A vintage car on a country road",
    "A space station in orbit",
    "A cozy coffee shop interior",
    "A beach at sunset",
    "A forest path in autumn",
]


def test_flux_dev_success_rate(workspace: str):
    endpoint = f"https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-dev"

    results = []
    for i, prompt in enumerate(PROMPTS, 1):
        print(f"\n[{i}/{len(PROMPTS)}] Testing: {prompt}")
        start_time = time.time()

        try:
            response = requests.post(
                endpoint,
                json={"prompt": prompt, "width": 1024, "height": 1024},
                timeout=180,
            )
            response.raise_for_status()

            elapsed = time.time() - start_time
            image_size = len(response.content)

            # Save image
            output_path = Path(f"test_flux_dev_{i:02d}.jpg")
            output_path.write_bytes(response.content)

            results.append(
                {
                    "prompt": prompt,
                    "success": True,
                    "time": elapsed,
                    "size": image_size,
                }
            )

            print(f"  ✅ Success ({elapsed:.1f}s, {image_size/1024:.1f} KB)")

        except Exception as e:
            elapsed = time.time() - start_time
            results.append(
                {"prompt": prompt, "success": False, "time": elapsed, "error": str(e)}
            )
            print(f"  ❌ Failed: {e}")

    # Summary
    successful = sum(1 for r in results if r["success"])
    success_rate = (successful / len(results)) * 100
    avg_time = (
        sum(r["time"] for r in results if r["success"]) / successful
        if successful > 0
        else 0
    )

    print(f"\n{'='*60}")
    print(f"Success Rate: {successful}/{len(results)} ({success_rate:.1f}%)")
    print(f"Average Time: {avg_time:.1f}s")
    print(f"{'='*60}")

    if success_rate == 100:
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1


if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    if not workspace:
        import subprocess

        result = subprocess.run(
            ["modal", "profile", "current"], capture_output=True, text=True
        )
        workspace = result.stdout.strip()

    sys.exit(test_flux_dev_success_rate(workspace))
