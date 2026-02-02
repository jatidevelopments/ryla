"""
Wan2.6-specific image build.

Extends base image with Wan 2.6 model downloads.
"""

import modal
import subprocess
import sys
from pathlib import Path

# Import base image from shared
try:
    sys.path.insert(0, "/root/shared")
    from image_base import base_image
except ImportError:
    _shared_path = Path(__file__).parent.parent.parent / "shared"
    if str(_shared_path) not in sys.path:
        sys.path.insert(0, str(_shared_path))
    from image_base import base_image


def hf_download_wan26():
    """
    Download Wan 2.6 models from HuggingFace during build.
    
    Downloads:
    - Diffusion model: wan2.6_t2v_1.3B_fp16.safetensors
    - Text encoder: umt5_xxl_fp8_e4m3fn_scaled.safetensors (shared)
    - VAE: wan_2.6_vae.safetensors
    """
    from huggingface_hub import hf_hub_download
    from pathlib import Path
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI/models")
    
    print("📥 Downloading Wan 2.6 models from HuggingFace...")
    
    # Model downloads configuration
    # Note: These paths assume Wan 2.6 will be released in similar format to 2.1
    # Update repo_id and filenames when official Wan 2.6 is available
    models = [
        {
            "repo": "Comfy-Org/Wan_2.6_ComfyUI_repackaged",
            "file": "split_files/diffusion_models/wan2.6_t2v_1.3B_fp16.safetensors",
            "dest_dir": comfy_dir / "diffusion_models",
            "dest_name": "wan2.6_t2v_1.3B_fp16.safetensors",
            "fallback_repo": "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
            "fallback_file": "split_files/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        },
        {
            "repo": "Comfy-Org/Wan_2.6_ComfyUI_repackaged",
            "file": "split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
            "dest_dir": comfy_dir / "text_encoders",
            "dest_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
            "fallback_repo": "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
            "fallback_file": "split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        },
        {
            "repo": "Comfy-Org/Wan_2.6_ComfyUI_repackaged",
            "file": "split_files/vae/wan_2.6_vae.safetensors",
            "dest_dir": comfy_dir / "vae",
            "dest_name": "wan_2.6_vae.safetensors",
            "fallback_repo": "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
            "fallback_file": "split_files/vae/wan_2.1_vae.safetensors",
        },
    ]
    
    for model in models:
        try:
            dest_dir = model["dest_dir"]
            dest_path = dest_dir / model["dest_name"]
            
            # Create destination directory
            dest_dir.mkdir(parents=True, exist_ok=True)
            
            # Skip if already exists
            if dest_path.exists():
                print(f"   ✓ {model['dest_name']} already exists")
                continue
            
            print(f"   Downloading {model['dest_name']}...")
            
            # Try primary repo first, fallback to Wan 2.1 if 2.6 not yet available
            try:
                cached_path = hf_hub_download(
                    repo_id=model["repo"],
                    filename=model["file"],
                    cache_dir="/cache",
                )
            except Exception as e:
                print(f"   ⚠️ Wan 2.6 model not found, using Wan 2.1 fallback: {e}")
                cached_path = hf_hub_download(
                    repo_id=model["fallback_repo"],
                    filename=model["fallback_file"],
                    cache_dir="/cache",
                )
            
            # Symlink to ComfyUI models directory
            os.symlink(cached_path, str(dest_path))
            
            print(f"   ✓ {model['dest_name']} downloaded and linked")
            
        except Exception as e:
            print(f"   ❌ Failed to download {model['dest_name']}: {e}")
            import traceback
            traceback.print_exc()
    
    print("✅ Wan 2.6 models ready")


# Wan2.6 image extends base image with Wan2.6-specific models
wan26_image = (
    base_image
    # Copy handler files (wan2.py removed - Wan 2.1 no longer supported)
    .add_local_file("apps/modal/handlers/wan26.py", "/root/handlers/wan26.py", copy=True)
    # Download models
    .run_function(
        hf_download_wan26,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
