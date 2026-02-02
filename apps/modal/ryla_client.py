#!/usr/bin/env python3
"""
RYLA Unified Client for Modal ComfyUI

Supports:
- Flux Dev (text-to-image, MVP primary model)
- Flux Schnell (text-to-image, test)
- Face Consistency (MVP):
  - Flux Dev + IP-Adapter FaceID (⭐ Recommended for Flux Dev - fully compatible)
  - SDXL + InstantID (⭐ Recommended for InstantID - fully compatible)
  - Flux Dev + InstantID (⚠️ Incompatible - ControlNet shape mismatch)
- LoRA (character consistency, MVP)
- Wan2.1 (text-to-video, Phase 2+)
- SeedVR2 (realistic upscaling)
- Z-Image-Turbo:
  - z-image-simple: Basic workflow (no custom nodes)
  - z-image-danrisi: Optimized workflow (requires RES4LYF nodes)
  - z-image-instantid: Face consistency with InstantID
  - z-image-pulid: Face consistency with PuLID
- Custom workflows

Usage:
    python apps/modal/ryla_client.py flux-dev --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py flux-ipadapter-faceid --prompt "A portrait" --reference-image ref.jpg  # ⭐ Recommended for Flux
    python apps/modal/ryla_client.py sdxl-instantid --prompt "A portrait" --reference-image ref.jpg  # ⭐ Recommended for InstantID
    python apps/modal/ryla_client.py flux-instantid --prompt "A portrait" --reference-image ref.jpg  # ⚠️ Incompatible
    python apps/modal/ryla_client.py flux-lora --prompt "A character" --lora-id 123
    python apps/modal/ryla_client.py flux --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py wan2 --prompt "A cinematic scene"
    python apps/modal/ryla_client.py seedvr2 --image input.jpg
    python apps/modal/ryla_client.py z-image-simple --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py z-image-danrisi --prompt "A beautiful landscape"
    python apps/modal/ryla_client.py z-image-instantid --prompt "A portrait" --reference-image ref.jpg
    python apps/modal/ryla_client.py z-image-pulid --prompt "A portrait" --reference-image ref.jpg
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
    # ⚠️ WARNING: Flux Dev has compatibility issues with InstantID's ControlNet
    flux_instantid_parser = subparsers.add_parser("flux-instantid", help="Flux Dev + InstantID (⚠️ Incompatible - use sdxl-instantid instead)")
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
    
    # SDXL InstantID workflow (Recommended for InstantID - fully compatible)
    sdxl_instantid_parser = subparsers.add_parser("sdxl-instantid", help="SDXL + InstantID face consistency (⭐ Recommended for InstantID)")
    sdxl_instantid_parser.add_argument("--prompt", required=True, help="Text prompt")
    sdxl_instantid_parser.add_argument("--reference-image", required=True, help="Reference image file (for face consistency)")
    sdxl_instantid_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    sdxl_instantid_parser.add_argument("--width", type=int, default=1024, help="Image width")
    sdxl_instantid_parser.add_argument("--height", type=int, default=1024, help="Image height")
    sdxl_instantid_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    sdxl_instantid_parser.add_argument("--cfg", type=float, default=7.0, help="CFG scale (SDXL default: 7.0)")
    sdxl_instantid_parser.add_argument("--seed", type=int, help="Random seed")
    sdxl_instantid_parser.add_argument("--sampler-name", default="euler", help="Sampler name (default: euler)")
    sdxl_instantid_parser.add_argument("--scheduler", default="normal", help="Scheduler (default: normal)")
    sdxl_instantid_parser.add_argument("--instantid-strength", type=float, default=0.8, help="InstantID strength (0.0-1.0)")
    sdxl_instantid_parser.add_argument("--sdxl-checkpoint", default="sd_xl_base_1.0.safetensors", help="SDXL checkpoint filename")
    sdxl_instantid_parser.add_argument("--face-provider", choices=["CPU", "GPU"], default="CPU", help="Face detection provider")
    sdxl_instantid_parser.add_argument("--output", default="sdxl_instantid_output.jpg", help="Output file")
    sdxl_instantid_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # SDXL Turbo (1-4 step txt2img, no face)
    sdxl_turbo_parser = subparsers.add_parser("sdxl-turbo", help="SDXL Turbo txt2img (1-4 steps, fast)")
    sdxl_turbo_parser.add_argument("--prompt", required=True, help="Text prompt")
    sdxl_turbo_parser.add_argument("--width", type=int, default=1024, help="Image width")
    sdxl_turbo_parser.add_argument("--height", type=int, default=1024, help="Image height")
    sdxl_turbo_parser.add_argument("--steps", type=int, default=4, help="Steps (1-4)")
    sdxl_turbo_parser.add_argument("--seed", type=int, help="Random seed")
    sdxl_turbo_parser.add_argument("--output", default="sdxl_turbo_output.jpg", help="Output file")
    sdxl_turbo_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # SDXL Lightning (4-step txt2img, ByteDance)
    sdxl_lightning_parser = subparsers.add_parser("sdxl-lightning", help="SDXL Lightning 4-step txt2img")
    sdxl_lightning_parser.add_argument("--prompt", required=True, help="Text prompt")
    sdxl_lightning_parser.add_argument("--width", type=int, default=1024, help="Image width")
    sdxl_lightning_parser.add_argument("--height", type=int, default=1024, help="Image height")
    sdxl_lightning_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    sdxl_lightning_parser.add_argument("--seed", type=int, help="Random seed")
    sdxl_lightning_parser.add_argument("--output", default="sdxl_lightning_output.jpg", help="Output file")
    sdxl_lightning_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Flux IP-Adapter FaceID workflow (Recommended for Flux Dev - fully compatible)
    flux_ipadapter_parser = subparsers.add_parser("flux-ipadapter-faceid", help="Flux Dev + IP-Adapter FaceID (⭐ Recommended for Flux Dev)")
    flux_ipadapter_parser.add_argument("--prompt", required=True, help="Text prompt")
    flux_ipadapter_parser.add_argument("--reference-image", required=True, help="Reference image file (for face consistency)")
    flux_ipadapter_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    flux_ipadapter_parser.add_argument("--width", type=int, default=1024, help="Image width")
    flux_ipadapter_parser.add_argument("--height", type=int, default=1024, help="Image height")
    flux_ipadapter_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    flux_ipadapter_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    flux_ipadapter_parser.add_argument("--seed", type=int, help="Random seed")
    flux_ipadapter_parser.add_argument("--ipadapter-strength", type=float, default=0.8, help="IP-Adapter strength (0.0-1.0, default: 0.8)")
    flux_ipadapter_parser.add_argument("--face-provider", choices=["CPU", "GPU"], default="CPU", help="Face detection provider (default: CPU)")
    flux_ipadapter_parser.add_argument("--output", default="flux_ipadapter_faceid_output.jpg", help="Output file")
    flux_ipadapter_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
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
    seedvr2_parser.add_argument("--resolution", type=int, help="Target resolution (default: 1080)")
    seedvr2_parser.add_argument("--seed", type=int, help="Random seed")
    seedvr2_parser.add_argument("--max-resolution", type=int, help="Max resolution (default: 4000)")
    seedvr2_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Z-Image Simple workflow (no custom nodes)
    z_image_simple_parser = subparsers.add_parser("z-image-simple", help="Z-Image-Turbo Simple (no custom nodes)")
    z_image_simple_parser.add_argument("--prompt", required=True, help="Text prompt")
    z_image_simple_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    z_image_simple_parser.add_argument("--width", type=int, default=1024, help="Image width")
    z_image_simple_parser.add_argument("--height", type=int, default=1024, help="Image height")
    z_image_simple_parser.add_argument("--steps", type=int, default=9, help="Inference steps")
    z_image_simple_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    z_image_simple_parser.add_argument("--seed", type=int, help="Random seed")
    z_image_simple_parser.add_argument("--output", default="z_image_simple_output.jpg", help="Output file")
    z_image_simple_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Z-Image Danrisi workflow (optimized with RES4LYF nodes)
    z_image_danrisi_parser = subparsers.add_parser("z-image-danrisi", help="Z-Image-Turbo Danrisi (optimized, requires RES4LYF nodes)")
    z_image_danrisi_parser.add_argument("--prompt", required=True, help="Text prompt")
    z_image_danrisi_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    z_image_danrisi_parser.add_argument("--width", type=int, default=1024, help="Image width")
    z_image_danrisi_parser.add_argument("--height", type=int, default=1024, help="Image height")
    z_image_danrisi_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    z_image_danrisi_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    z_image_danrisi_parser.add_argument("--seed", type=int, help="Random seed")
    z_image_danrisi_parser.add_argument("--output", default="z_image_danrisi_output.jpg", help="Output file")
    z_image_danrisi_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Z-Image InstantID workflow (face consistency)
    z_image_instantid_parser = subparsers.add_parser("z-image-instantid", help="Z-Image-Turbo + InstantID (face consistency)")
    z_image_instantid_parser.add_argument("--prompt", required=True, help="Text prompt")
    z_image_instantid_parser.add_argument("--reference-image", required=True, help="Reference image file (for face consistency)")
    z_image_instantid_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    z_image_instantid_parser.add_argument("--width", type=int, default=1024, help="Image width")
    z_image_instantid_parser.add_argument("--height", type=int, default=1024, help="Image height")
    z_image_instantid_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    z_image_instantid_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    z_image_instantid_parser.add_argument("--seed", type=int, help="Random seed")
    z_image_instantid_parser.add_argument("--instantid-strength", type=float, default=0.8, help="InstantID strength (0.0-1.0, default: 0.8)")
    z_image_instantid_parser.add_argument("--controlnet-strength", type=float, default=0.8, help="ControlNet strength (0.0-1.0, default: 0.8)")
    z_image_instantid_parser.add_argument("--face-provider", choices=["CPU", "GPU"], default="CPU", help="Face detection provider (default: CPU)")
    z_image_instantid_parser.add_argument("--output", default="z_image_instantid_output.jpg", help="Output file")
    z_image_instantid_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
    # Z-Image PuLID workflow (face consistency)
    z_image_pulid_parser = subparsers.add_parser("z-image-pulid", help="Z-Image-Turbo + PuLID (face consistency)")
    z_image_pulid_parser.add_argument("--prompt", required=True, help="Text prompt")
    z_image_pulid_parser.add_argument("--reference-image", required=True, help="Reference image file (for face consistency)")
    z_image_pulid_parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    z_image_pulid_parser.add_argument("--width", type=int, default=1024, help="Image width")
    z_image_pulid_parser.add_argument("--height", type=int, default=1024, help="Image height")
    z_image_pulid_parser.add_argument("--steps", type=int, default=20, help="Inference steps")
    z_image_pulid_parser.add_argument("--cfg", type=float, default=1.0, help="CFG scale")
    z_image_pulid_parser.add_argument("--seed", type=int, help="Random seed")
    z_image_pulid_parser.add_argument("--pulid-strength", type=float, default=0.8, help="PuLID strength (0.0-1.0, default: 0.8)")
    z_image_pulid_parser.add_argument("--pulid-start", type=float, default=0.0, help="PuLID start step (0.0-1.0, default: 0.0)")
    z_image_pulid_parser.add_argument("--pulid-end", type=float, default=1.0, help="PuLID end step (0.0-1.0, default: 1.0)")
    z_image_pulid_parser.add_argument("--face-provider", choices=["CPU", "GPU"], default="CPU", help="Face detection provider (default: CPU)")
    z_image_pulid_parser.add_argument("--output", default="z_image_pulid_output.jpg", help="Output file")
    z_image_pulid_parser.add_argument("--modal-workspace", help="Modal workspace (default: current)")
    
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

    # Build endpoint URL - map to correct app
    # After app splitting, each workflow has its own app
    endpoint_app_map = {
        "flux": "ryla-flux",
        "flux-dev": "ryla-flux",
        "flux-instantid": "ryla-instantid",
        "sdxl-instantid": "ryla-instantid",
        "sdxl-turbo": "ryla-instantid",
        "sdxl-lightning": "ryla-instantid",
        "flux-ipadapter-faceid": "ryla-instantid",
        "wan2": "ryla-wan2",
        "seedvr2": "ryla-seedvr2",
        "z-image-simple": "ryla-z-image",
        "z-image-danrisi": "ryla-z-image",
        "z-image-instantid": "ryla-z-image",
        "z-image-pulid": "ryla-z-image",
        "flux-lora": "ryla-flux",  # TODO: Create lora app or keep in flux
        "workflow": "ryla-flux",  # TODO: Create workflow app or keep in flux
    }
    
    app_name = endpoint_app_map.get(args.workflow_type, "ryla-comfyui")  # Fallback to old app
    endpoint_path = f"/{args.workflow_type.replace('_', '-')}"
    base_url = f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run"
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
        
    elif args.workflow_type == "sdxl-instantid":
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
            "sampler_name": args.sampler_name,
            "scheduler": args.scheduler,
            "instantid_strength": args.instantid_strength,
            "sdxl_checkpoint": args.sdxl_checkpoint,
            "face_provider": args.face_provider,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   Reference Image: {ref_image_path}")
        print(f"   SDXL Checkpoint: {args.sdxl_checkpoint}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        print(f"   Sampler: {args.sampler_name}, Scheduler: {args.scheduler}")
        print(f"   InstantID Strength: {args.instantid_strength}")
        print(f"   Face Provider: {args.face_provider}")
        
    elif args.workflow_type == "flux-ipadapter-faceid":
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
            "ipadapter_strength": args.ipadapter_strength,
            "face_provider": args.face_provider,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 180
        print(f"   Prompt: {args.prompt}")
        print(f"   Reference Image: {ref_image_path}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        print(f"   IP-Adapter Strength: {args.ipadapter_strength}")
        print(f"   Face Provider: {args.face_provider}")
        timeout = 300  # IP-Adapter workflows can take longer, especially on cold start
    
    elif args.workflow_type == "sdxl-turbo":
        payload = {
            "prompt": args.prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 300
        print(f"   Prompt: {args.prompt}")
        print(f"   Size: {args.width}x{args.height}, Steps: {args.steps}")
    
    elif args.workflow_type == "sdxl-lightning":
        payload = {
            "prompt": args.prompt,
            "width": args.width,
            "height": args.height,
            "cfg": args.cfg,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 300
        print(f"   Prompt: {args.prompt}")
        print(f"   Size: {args.width}x{args.height}, CFG: {args.cfg}")
        
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
            # Determine MIME type from extension
            ext = image_path.suffix.lower()
            mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "image/webp"
            # Include data URI prefix for proper decoding
            image_data = f"data:{mime_type};base64,{image_b64}"
            payload = {
                "image": image_data,
            }
            
            # Add optional parameters
            if args.resolution:
                payload["resolution"] = args.resolution
            if args.seed:
                payload["seed"] = args.seed
            if args.max_resolution:
                payload["max_resolution"] = args.max_resolution
                payload["max_resolution_2"] = args.max_resolution
        
        timeout = 300  # Upscaling can take longer
        print(f"   Input Image: {image_path}")
        print(f"   Size: {len(image_bytes) / 1024:.1f} KB")
        if args.resolution:
            print(f"   Resolution: {args.resolution}")
        if args.seed:
            print(f"   Seed: {args.seed}")
        
    elif args.workflow_type == "z-image-simple":
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
        
    elif args.workflow_type == "z-image-danrisi":
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
        
    elif args.workflow_type == "z-image-instantid":
        # Load and encode reference image
        import base64
        ref_image_path = Path(args.reference_image)
        if not ref_image_path.exists():
            print(f"❌ Reference image not found: {ref_image_path}")
            sys.exit(1)
        
        with open(ref_image_path, "rb") as f:
            image_bytes = f.read()
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            ext = ref_image_path.suffix.lower()
            mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "image/webp"
            image_data = f"data:{mime_type};base64,{image_b64}"
        
        payload = {
            "prompt": args.prompt,
            "reference_image": image_data,
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
        timeout = 300
        print(f"   Prompt: {args.prompt}")
        print(f"   Reference Image: {ref_image_path}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        print(f"   InstantID Strength: {args.instantid_strength}, ControlNet Strength: {args.controlnet_strength}")
        print(f"   Face Provider: {args.face_provider}")
        
    elif args.workflow_type == "z-image-pulid":
        # Load and encode reference image
        import base64
        ref_image_path = Path(args.reference_image)
        if not ref_image_path.exists():
            print(f"❌ Reference image not found: {ref_image_path}")
            sys.exit(1)
        
        with open(ref_image_path, "rb") as f:
            image_bytes = f.read()
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            ext = ref_image_path.suffix.lower()
            mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "image/webp"
            image_data = f"data:{mime_type};base64,{image_b64}"
        
        payload = {
            "prompt": args.prompt,
            "reference_image": image_data,
            "negative_prompt": args.negative_prompt,
            "width": args.width,
            "height": args.height,
            "steps": args.steps,
            "cfg": args.cfg,
            "pulid_strength": args.pulid_strength,
            "pulid_start": args.pulid_start,
            "pulid_end": args.pulid_end,
            "face_provider": args.face_provider,
        }
        if args.seed:
            payload["seed"] = args.seed
        timeout = 300
        print(f"   Prompt: {args.prompt}")
        print(f"   Reference Image: {ref_image_path}")
        print(f"   Size: {args.width}x{args.height}")
        print(f"   Steps: {args.steps}, CFG: {args.cfg}")
        print(f"   PuLID Strength: {args.pulid_strength} ({args.pulid_start}-{args.pulid_end})")
        print(f"   Face Provider: {args.face_provider}")
        
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

    # Make request (Modal may return 303; follow with GET to get result)
    try:
        print(f"⏳ Sending request (first call may take ~1-3m for cold start)...")
        response = requests.post(
            full_url,
            json=payload,
            timeout=timeout,
            allow_redirects=False,
        )
        if response.status_code == 303:
            location = response.headers.get("Location")
            if location:
                print(f"   (following Modal redirect...)")
                response = requests.get(location, timeout=timeout)
        
        # Check for errors and show detailed messages
        if response.status_code >= 400:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', f'HTTP {response.status_code}')
                print(f"❌ Server Error: {error_msg}")
                if 'details' in error_data:
                    details = error_data['details']
                    # Show first few lines of traceback
                    if isinstance(details, str):
                        lines = details.split('\n')[:10]
                        print(f"   Details:")
                        for line in lines:
                            if line.strip():
                                print(f"     {line}")
                if 'type' in error_data:
                    print(f"   Error Type: {error_data['type']}")
            except:
                print(f"❌ HTTP Error: {response.status_code}")
                # Try to show response even if not JSON
                try:
                    response_text = response.text[:1000]
                    print(f"   Response: {response_text}")
                    # Check if it's HTML error page
                    if "<html" in response_text.lower() or "<body" in response_text.lower():
                        print("   (HTML error page - check server logs for details)")
                except:
                    print(f"   Response: (unable to read response body)")
            sys.exit(1)
        
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
            try:
                error_data = e.response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
                if 'details' in error_data:
                    details = error_data['details']
                    # Show first 1000 chars of details
                    if len(details) > 1000:
                        print(f"   Details (first 1000 chars): {details[:1000]}...")
                    else:
                        print(f"   Details: {details}")
                if 'type' in error_data:
                    print(f"   Type: {error_data['type']}")
            except Exception as json_err:
                # Not JSON, show raw response
                response_text = e.response.text[:1000]
                print(f"   Response (not JSON): {response_text}")
                print(f"   JSON parse error: {json_err}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
