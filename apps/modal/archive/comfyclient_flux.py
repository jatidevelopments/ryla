#!/usr/bin/env python3
"""
Simple client for Flux Schnell test on Modal

Usage:
    python apps/modal/comfyclient_flux.py --prompt "A beautiful landscape"
    python apps/modal/comfyclient_flux.py --modal-workspace <workspace> --prompt "Surreal dreamscape"
"""

import argparse
import requests
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Test Flux Schnell on Modal")
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="Text prompt for image generation",
    )
    parser.add_argument(
        "--modal-workspace",
        type=str,
        default=None,
        help="Modal workspace name (default: current profile)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output.jpg",
        help="Output image filename (default: output.jpg)",
    )

    args = parser.parse_args()

    # Get workspace name
    if args.modal_workspace:
        workspace = args.modal_workspace
    else:
        # Try to get from modal profile
        import subprocess
        try:
            result = subprocess.run(
                ["modal", "profile", "current"],
                capture_output=True,
                text=True,
                check=True,
            )
            workspace = result.stdout.strip()
        except:
            print("❌ Could not determine Modal workspace. Please provide --modal-workspace")
            sys.exit(1)

    # Build endpoint URL
    # Modal converts class name "ComfyUI" to "comfyui" in URL
    endpoint = f"https://{workspace}--ryla-comfyui-flux-test-comfyui-api.modal.run"

    print(f"🚀 Generating image with Flux Schnell")
    print(f"   Prompt: {args.prompt}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Output: {args.output}")
    print()

    # Make request
    try:
        print("⏳ Sending request (first call may take ~1m for cold start)...")
        response = requests.post(
            endpoint,
            json={"prompt": args.prompt},
            timeout=180,  # 3 minutes timeout
        )
        response.raise_for_status()

        # Save image
        output_path = Path(args.output)
        output_path.write_bytes(response.content)

        print(f"✅ Image saved to {output_path}")
        print(f"   Size: {len(response.content) / 1024:.1f} KB")

    except requests.exceptions.Timeout:
        print("❌ Request timed out (workflow may still be processing)")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        if e.response:
            print(f"   Response: {e.response.text[:500]}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
