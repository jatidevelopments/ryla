#!/usr/bin/env python3
"""
Simple client for Wan2.1 video test on Modal

Usage:
    python apps/modal/comfyclient_wan2.py --prompt "A beautiful landscape"
    python apps/modal/comfyclient_wan2.py --modal-workspace <workspace> --prompt "Surreal dreamscape"
"""

import argparse
import requests
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Test Wan2.1 Video on Modal")
    parser.add_argument(
        "--prompt",
        type=str,
        required=True,
        help="Text prompt for video generation",
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
        default="output.webp",
        help="Output video filename (default: output.webp)",
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
    endpoint = f"https://{workspace}--ryla-comfyui-wan2-test-comfyui-api.modal.run"

    print(f"🚀 Generating video with Wan2.1")
    print(f"   Prompt: {args.prompt}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Output: {args.output}")
    print()

    # Make request
    try:
        print("⏳ Sending request (first call may take ~2-3m for cold start + video generation)...")
        response = requests.post(
            endpoint,
            json={"prompt": args.prompt},
            timeout=300,  # 5 minutes timeout (video generation takes longer)
        )
        response.raise_for_status()

        # Save video
        output_path = Path(args.output)
        output_path.write_bytes(response.content)

        print(f"✅ Video saved to {output_path}")
        print(f"   Size: {len(response.content) / 1024:.1f} KB")
        print(f"   Format: Animated WEBP (can be opened in browser)")

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
