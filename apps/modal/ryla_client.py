#!/usr/bin/env python3
"""
RYLA Unified Client for Modal ComfyUI

Supports:
- Flux Dev (text-to-image, MVP primary model)
- Flux Schnell (text-to-image, test)
- InstantID (face consistency, MVP)
- LoRA (character consistency, MVP)
- Wan2.1 (text-to-video, Phase 2+)
- SeedVR2 (realistic upscaling)
- Custom workflows

Usage:
    python apps/modal/ryla_client.py flux-dev --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py flux-instantid --prompt "A portrait" --reference-image ref.jpg
    python apps/modal/ryla_client.py flux-lora --prompt "A character" --lora-id 123
    python apps/modal/ryla_client.py flux --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py wan2 --prompt "A cinematic scene"
    python apps/modal/ryla_client.py seedvr2 --image input.jpg
    python apps/modal/ryla_client.py workflow --workflow-file workflow.json
"""

import argparse
import requests
import sys
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="RYLA Modal ComfyUI Client")
    subparsers = parser.add_subparsers(dest="workflow_type", help="Workflow type")
    
    # Flux Dev workflow (MVP primary model)
    flux_dev_parser = subparsers.add_parser("flux-dev", help="Flux Dev text-to-image (MVP primary)")
    flux_dev_parser.add_argument("--prompt", required=True, help="Text prompt")
    flux_dev_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    flux_dev_parser.add_argument("--width", type=int, default=1024, help="Image width")
    flux_dev_parser.add_argument("--height", type=int, default=1024, help="Image height")
    flux_dev_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    flux_dev_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    flux_dev_parser.add_argument("--seed", type=int, help="Random seed")
    flux_dev_parser.add_argument("--output", default="flux_dev_output.jpg", help="Output file")
    flux_dev_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Flux InstantID workflow (MVP face consistency)
    flux_instantid_parser = subparsers.add_parser("flux-instantid", help="Flux Dev + InstantID face consistency (MVP)")
    flux_instantid_parser.add_argument("--prompt", required=True, help="Text prompt")
    flux_instantid_parser.add_argument("--reference-image", required=True, help="Reference image file (for face consistency)")
    flux_instantid_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    flux_instantid_parser.add_argument("--width", type=int, default=1024, help="Image width")
    flux_instantid_parser.add_argument("--height", type=int, default=1024, help="Image height")
    flux_instantid_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    flux_instantid_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    flux_instantid_parser.add_argument("--seed", type=int, help="Random seed")
    flux_instantid_parser.add_argument("--instantid-strength", type=float, default=0.8, help="InstantID strength (0.0-1.0)")
    flux_instantid_parser.add_argument("--controlnet-strength", type=float, default=0.8, help="ControlNet strength (0.0-1.0)")
    flux_instantid_parser.add_argument("--face-provider", choices=["CPU", "GPU"], default="CPU", help="Face detection provider")
    flux_instantid_parser.add_argument("--output", default="flux_instantid_output.jpg", help="Output file")
    flux_instantid_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Flux LoRA workflow (MVP character consistency)
    flux_lora_parser = subparsers.add_parser("flux-lora", help="Flux Dev + LoRA character generation (MVP)")
    flux_lora_parser.add_argument("--prompt", required=True, help="Text prompt")
    flux_lora_parser.add_argument("--lora-id", required=True, help="LoRA ID (e.g., '123' for character-123.safetensors)")
    flux_lora_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    flux_lora_parser.add_argument("--width", type=int, default=1024, help="Image width")
    flux_lora_parser.add_argument("--height", type=int, default=1024, help="Image height")
    flux_lora_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    flux_lora_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    flux_lora_parser.add_argument("--seed", type=int, help="Random seed")
    flux_lora_parser.add_argument("--lora-strength", type=float, default=1.0, help="LoRA strength (0.0-1.0)")
    flux_lora_parser.add_argument("--trigger-word", help="LoRA trigger word (optional)")
    flux_lora_parser.add_argument("--output", default="flux_lora_output.jpg", help="Output file")
    flux_lora_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Flux Schnell workflow (test)
    flux_parser = subparsers.add_parser("flux", help="Flux Schnell text-to-image (test)")
    flux_parser.add_argument("--prompt", required=True, help="Text prompt")
    flux_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    flux_parser.add_argument("--width", type=int, default=1024, help="Image width")
    flux_parser.add_argument("--height", type=int, default=1024, help="Image height")
    flux_parser.add_argument("--steps", type=int, default=4, help="Inference steps")
    flux_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    flux_parser.add_argument("--seed", type=int, help="Random seed")
    flux_parser.add_argument("--output", default="flux_output.jpg", help="Output file")
    flux_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Wan2 workflow
    wan2_parser = subparsers.add_parser("wan2", help="Wan2.1 text-to-video")
    wan2_parser.add_argument("--prompt", required=True, help="Text prompt")
    wan2_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    wan2_parser.add_argument("--width", type=int, default=832, help="Video width")
    wan2_parser.add_argument("--height", type=int, default=480, help="Video height")
    wan2_parser.add_argument("--length", type=int, default=33, help="Number of frames")
    wan2_parser.add_argument("--fps", type=int, default=16, help="Frames per second")
    wan2_parser.add_argument("--steps", type=int, default=30, help="Inference steps")
    wan2_parser.add_argument("--cfg", type=float, default=6, help="CFG scale")
    wan2_parser.add_argument("--seed", type=int, help="Random seed")
    wan2_parser.add_argument("--output", default="wan2_output.webp", help="Output file")
    wan2_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # SeedVR2 upscaling workflow
    seedvr2_parser = subparsers.add_parser("seedvr2", help="SeedVR2 realistic upscaling")
    seedvr2_parser.add_argument("--image", required=True, help="Input image file to upscale")
    seedvr2_parser.add_argument("--output", default="seedvr2_upscaled.png", help="Output file")
    seedvr2_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Custom workflow
    workflow_parser = subparsers.add_parser("workflow", help="Custom workflow JSON")
    workflow_parser.add_argument("--workflow-file", required=True, help="Workflow JSON file")
    workflow_parser.add_argument("--prompt", help="Prompt to inject into workflow")
    workflow_parser.add_argument("--output", default="workflow_output", help="Output file")
    workflow_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")

    args = parser.parse_args()
    
    if not args.workflow_type:
        parser.print_help()
        sys.exit(1)

    # Get workspace name
    workspace = args.modal_workspace
    if not workspace:
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

    # Build endpoint URL - all routes are under single FastAPI app
    # Base URL is the FastAPI app, then add route path
    base_url = f"https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run"
    endpoint_path = f"/{args.workflow_type.replace('_', '-')}"
    full_url = f"{base_url}{endpoint_path}"
    
    print(f"🚀 RYLA Modal ComfyUI - {args.workflow_type.upper()}")
    print(f"   Workspace: {workspace}")
    print(f"   Endpoint: {full_url}")
    print()

    # Prepare request
    if args.workflow_type == "flux-dev":
        payload = {
            "prompt": args.prompt,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "cfg": args.cfg,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        
    elif args.workflow_type == "flux-instantid":
        # Load and encode reference image
        import base64
        ref_image_path = Path(args.reference_image)
        if not ref_image_path.exists():
            print(f"❌ Reference image not found: {ref_image_path}")
            sys.exit(1)
        
        with open(ref_image_path, "rb") as f:
            image_bytes = f.read()
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            # Determine MIME type from file extension
            ext = ref_image_path.suffix.lower()
            mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "image/webp"
            reference_image_data = f"data:{mime_type};base64,{image_b64}"
        
        payload = {
            "prompt": args.prompt,
            "reference_image": reference_image_data,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "cfg": args.cfg,
            "instantid_strength": args.instantid_strength,
            "controlnet_strength": args.controlnet_strength,
            "face_provider": args.face_provider,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   Reference Image: {ref_image_path}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   InstantID Strength: {args.instantid_strength}, ControlNet: {args.controlnet_strength}")
        print(f"   Face Provider: {args.face_provider}")
        
    elif args.workflow_type == "flux-lora":
        payload = {
            "prompt": args.prompt,
            "lora_id": args.lora_id,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "cfg": args.cfg,
            "lora_strength": args.lora_strength,
        }
        if args.trigger_word:
            payload["trigger_word"] = args.trigger_word
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   LoRA ID: {args.lora_id}")
        print(f"   LoRA Strength: {args.lora_strength}")
        if args.trigger_word:
            print(f"   Trigger Word: {args.trigger_word}")
        print(f"   Size: {args.width}x{args.height}")
        
    elif args.workflow_type == "flux":
        payload = {
            "prompt": args.prompt,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "cfg": args.cfg,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        
    elif args.workflow_type == "wan2":
        payload = {
            "prompt": args.prompt,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "length": args.length,
            "fps": args.fps,
            "steps": args.steps,
            "cfg": args.cfg,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 300
        print(f"   Prompt: {args.prompt}")
        print(f"   Size: {args.width}x{args.height}, {args.length} frames @ {args.fps}fps")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        
    elif args.workflow_type == "seedvr2":
        # Load and encode input image
        import base64
        image_path = Path(args.image)
        if not image_path.exists():
            print(f"❌ Input image not found: {image_path}")
            sys.exit(1)
        
        with open(image_path, "rb") as f:
            image_bytes = f.read()
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            # Remove data URL prefix if present, just use base64
            payload = {
                "image": image_b64,
            }
        
        timeout = 300  # Upscaling can take longer
        print(f"   Input Image: {image_path}")
        print(f"   Size: {len(image_bytes) / 1024:.1f} KB")
        
    else:  # workflow
        workflow_path = Path(args.workflow_file)
        if not workflow_path.exists():
            print(f"❌ Workflow file not found: {workflow_path}")
            sys.exit(1)
        
        with open(workflow_path) as f:
            workflow_data = json.load(f)
        
        payload = {"workflow": workflow_data}
        if args.prompt:
            payload["prompt"] = args.prompt
        
        timeout = 300
        print(f"   Workflow: {workflow_path}")
        if args.prompt:
            print(f"   Prompt: {args.prompt}")

    print(f"   Output: {args.output}")
    print()

    # Make request
    try:
        print(f"⏳ Sending request (first call may take ~1-3m for cold start)...")
        response = requests.post(
            full_url,
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()

        # Save output
        output_path = Path(args.output)
        output_path.write_bytes(response.content)

        print(f"✅ Output saved to {output_path}")
        print(f"   Size: {len(response.content) / 1024:.1f} KB")
        if args.workflow_type == "wan2":
            print(f"   Format: Animated WEBP (can be opened in browser)")
        
        # Display cost information if available
        if "X-Cost-USD" in response.headers:
            cost = response.headers["X-Cost-USD"]
            exec_time = response.headers.get("X-Execution-Time-Sec", "N/A")
            gpu_type = response.headers.get("X-GPU-Type", "L40S")
            print(f"💰 Cost: ${cost} | Time: {exec_time}s | GPU: {gpu_type}")

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
