#!/usr/bin/env python3
"""
Helper script to upload models to Modal volume.

Usage:
    python apps/modal/upload_models.py --model-url <URL> --model-path <path>
    python apps/modal/upload_models.py --from-huggingface <repo> --model-name <name>
"""

import argparse
import subprocess
import sys
from pathlib import Path

def upload_from_url(model_url: str, model_path: str):
    """Upload model from URL to Modal volume."""
    print(f"📥 Uploading {model_url} to {model_path}...")
    
    result = subprocess.run([
        "modal", "run", "apps/modal/comfyui_danrisi.py::upload_model",
        "--model-url", model_url,
        "--model-path", model_path,
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ Upload successful: {model_path}")
        print(result.stdout)
    else:
        print(f"❌ Upload failed:")
        print(result.stderr)
        sys.exit(1)

def upload_from_huggingface(repo: str, model_name: str, model_type: str = "checkpoints"):
    """Upload model from HuggingFace to Modal volume."""
    # HuggingFace direct download URL format
    base_url = f"https://huggingface.co/{repo}/resolve/main/{model_name}"
    model_path = f"{model_type}/{model_name}"
    
    print(f"📥 Downloading {model_name} from HuggingFace ({repo})...")
    upload_from_url(base_url, model_path)

def main():
    parser = argparse.ArgumentParser(description="Upload models to Modal volume")
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--model-url", help="Direct URL to model file")
    group.add_argument("--from-huggingface", help="HuggingFace repo (e.g., 'Tongyi-MAI/Z-Image-Turbo')")
    
    parser.add_argument("--model-path", help="Path in volume (e.g., 'checkpoints/model.safetensors')")
    parser.add_argument("--model-name", help="Model filename (for HuggingFace)")
    parser.add_argument("--model-type", default="checkpoints", help="Model type: checkpoints, vae, clip, loras")
    
    args = parser.parse_args()
    
    if args.from_huggingface:
        if not args.model_name:
            print("❌ --model-name required when using --from-huggingface")
            sys.exit(1)
        upload_from_huggingface(args.from_huggingface, args.model_name, args.model_type)
    else:
        if not args.model_path:
            print("❌ --model-path required when using --model-url")
            sys.exit(1)
        upload_from_url(args.model_url, args.model_path)

if __name__ == "__main__":
    main()
