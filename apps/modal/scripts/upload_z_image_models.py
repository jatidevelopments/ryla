#!/usr/bin/env python3
"""
Upload Z-Image-Turbo models to Modal volume from HuggingFace.

This script uploads the three required models for the Denrisi workflow:
- z_image_turbo_bf16.safetensors (diffusion model)
- qwen_3_4b.safetensors (text encoder)
- z-image-turbo-vae.safetensors (VAE)
"""

import subprocess
import sys

# HuggingFace repository and model paths
HF_REPO = "Comfy-Org/z_image_turbo"
BASE_URL = f"https://huggingface.co/{HF_REPO}/resolve/main"

MODELS = [
    {
        "name": "z_image_turbo_bf16.safetensors",
        "path": "checkpoints/z_image_turbo_bf16.safetensors",
        "url": f"{BASE_URL}/split_files/diffusion_models/z_image_turbo_bf16.safetensors",
        "size_gb": 12.3,
    },
    {
        "name": "qwen_3_4b.safetensors",
        "path": "clip/qwen_3_4b.safetensors",
        "url": f"{BASE_URL}/split_files/text_encoders/qwen_3_4b.safetensors",
        "size_gb": 8.0,
    },
    {
        "name": "z-image-turbo-vae.safetensors",
        "path": "vae/z-image-turbo-vae.safetensors",
        "url": f"{BASE_URL}/split_files/vae/z-image-turbo-vae.safetensors",
        "size_gb": 0.3,
    },
]

def upload_model(model_info):
    """Upload a single model to Modal volume."""
    print(f"\n📥 Uploading {model_info['name']} ({model_info['size_gb']} GB)...")
    print(f"   URL: {model_info['url']}")
    print(f"   Path: {model_info['path']}")
    
    result = subprocess.run([
        "modal", "run", "apps/modal/comfyui_danrisi.py::upload_model",
        "--model-url", model_info["url"],
        "--model-path", model_info["path"],
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✅ {model_info['name']} uploaded successfully")
        print(result.stdout)
        return True
    else:
        print(f"❌ Failed to upload {model_info['name']}")
        print(result.stderr)
        return False

def main():
    print("🚀 Z-Image-Turbo Model Upload to Modal")
    print("=" * 50)
    print(f"Repository: {HF_REPO}")
    print(f"Total size: ~{sum(m['size_gb'] for m in MODELS):.1f} GB")
    print("\nThis will upload 3 models:")
    for i, model in enumerate(MODELS, 1):
        print(f"  {i}. {model['name']} ({model['size_gb']} GB) → {model['path']}")
    
    print("\n⚠️  Note: This may take a while due to model sizes.")
    print("   You can interrupt with Ctrl+C and resume later.\n")
    
    success_count = 0
    for model in MODELS:
        if upload_model(model):
            success_count += 1
        else:
            print(f"\n⚠️  Failed to upload {model['name']}. Continuing with next model...")
    
    print("\n" + "=" * 50)
    print(f"✅ Upload complete: {success_count}/{len(MODELS)} models uploaded")
    
    if success_count == len(MODELS):
        print("\n🎉 All models uploaded successfully!")
        print("You can now test the workflow:")
        print("  modal run apps/modal/comfyui_danrisi.py::list_models")
    else:
        print(f"\n⚠️  {len(MODELS) - success_count} model(s) failed to upload.")
        print("You can retry by running this script again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
