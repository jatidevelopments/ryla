"""
SeedVR2-specific image build.

Extends base image with SeedVR2 model downloads and workflow files.
"""

import modal
import subprocess
import sys
from pathlib import Path

# Import base image from shared
# At build time: import from project shared/ directory
# At runtime: import from /root/shared/ (where Modal copies it)
import sys
from pathlib import Path

# Try runtime path first (where Modal copies files)
try:
    sys.path.insert(0, "/root/shared")
    from image_base import base_image
except ImportError:
    # Fallback to build-time path (relative to project)
    _shared_path = Path(__file__).parent.parent.parent / "shared"
    if str(_shared_path) not in sys.path:
        sys.path.insert(0, str(_shared_path))
    from image_base import base_image


def hf_download_seedvr2():
    """Download SeedVR2 models (for realistic upscaling)."""
    from huggingface_hub import hf_hub_download
    import os
    import shutil
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    try:
        print("📥 Downloading SeedVR2 models...")
        print("   Trying: numz/SeedVR2_comfyUI (official)")
        
        try:
            dit_model = hf_hub_download(
                repo_id="numz/SeedVR2_comfyUI",
                filename="seedvr2_ema_7b_fp16.safetensors",
                cache_dir="/cache",
                token=token,
            )
            vae_model = hf_hub_download(
                repo_id="numz/SeedVR2_comfyUI",
                filename="ema_vae_fp16.safetensors",
                cache_dir="/cache",
                token=token,
            )
            print("   ✅ Downloaded from numz/SeedVR2_comfyUI")
        except Exception as e1:
            print(f"   ⚠️  numz repo failed: {e1}")
            print("   Trying: AInVFX/SeedVR2_comfyUI (alternative)")
            dit_model = hf_hub_download(
                repo_id="AInVFX/SeedVR2_comfyUI",
                filename="seedvr2_ema_7b_fp16.safetensors",
                cache_dir="/cache",
                token=token,
            )
            vae_model = hf_hub_download(
                repo_id="AInVFX/SeedVR2_comfyUI",
                filename="ema_vae_fp16.safetensors",
                cache_dir="/cache",
                token=token,
            )
            print("   ✅ Downloaded from AInVFX/SeedVR2_comfyUI")
        
        seedvr2_dir = comfy_dir / "models" / "seedvr2"
        seedvr2_dir.mkdir(parents=True, exist_ok=True)
        
        shutil.copy2(dit_model, seedvr2_dir / "seedvr2_ema_7b_fp16.safetensors")
        shutil.copy2(vae_model, seedvr2_dir / "ema_vae_fp16.safetensors")
        
        print(f"   ✅ Models copied to {seedvr2_dir}")
        print("✅ SeedVR2 models downloaded successfully")
    except Exception as e:
        print(f"⚠️  Failed to download SeedVR2 models: {e}")
        print("   SeedVR2 upscaling endpoint will not be available")
        raise


# SeedVR2 image extends base image with SeedVR2-specific models and workflow files
seedvr2_image = (
    base_image
    # Copy ORIGINAL handler file (not split copy) - same as original working app
    .add_local_file("apps/modal/handlers/seedvr2.py", "/root/handlers/seedvr2.py", copy=True)
    # Add workflow files (from project root workflows directory)
    .add_local_file("workflows/seedvr2.json", "/root/workflows/seedvr2.json", copy=True)
    .add_local_file("workflows/seedvr2_api.json", "/root/workflows/seedvr2_api.json", copy=True)
    .run_function(
        hf_download_seedvr2,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
