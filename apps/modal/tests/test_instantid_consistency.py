#!/usr/bin/env python3
"""
Test InstantID face consistency

Usage:
    python apps/modal/test_instantid_consistency.py [workspace] [reference_image]
"""

import requests
import sys
import base64
from pathlib import Path


def test_instantid_consistency(workspace: str, reference_image: str):
    endpoint = (
        f"https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-instantid"
    )

    # Load and encode reference image
    ref_path = Path(reference_image)
    if not ref_path.exists():
        print(f"❌ Reference image not found: {reference_image}")
        sys.exit(1)

    with open(ref_path, "rb") as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = (
            "image/jpeg" if reference_image.endswith((".jpg", ".jpeg")) else "image/png"
        )
        reference_data = f"data:{mime_type};base64,{image_b64}"

    prompts = [
        "A portrait in a studio setting",
        "A person in casual clothing",
        "A professional headshot",
        "A person smiling",
    ]

    print(f"Testing InstantID with reference: {reference_image}")
    print(f"Generating {len(prompts)} variations...\n")

    for i, prompt in enumerate(prompts, 1):
        print(f"[{i}/{len(prompts)}] {prompt}")

        try:
            response = requests.post(
                endpoint,
                json={
                    "prompt": prompt,
                    "reference_image": reference_data,
                    "instantid_strength": 0.8,
                    "controlnet_strength": 0.8,
                },
                timeout=180,
            )
            response.raise_for_status()

            output_path = Path(f"test_instantid_{i:02d}.jpg")
            output_path.write_bytes(response.content)

            print(f"  ✅ Saved to {output_path}")

        except Exception as e:
            print(f"  ❌ Failed: {e}")

    print("\n✅ Face consistency test complete!")
    print("   Please visually compare generated images with reference image")
    print("   Target: 85-90% face consistency")


if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    reference = sys.argv[2] if len(sys.argv) > 2 else "reference.jpg"

    if not workspace:
        import subprocess

        result = subprocess.run(
            ["modal", "profile", "current"], capture_output=True, text=True
        )
        workspace = result.stdout.strip()

    test_instantid_consistency(workspace, reference)
