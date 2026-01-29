"""
Qwen-Image-specific image build.

Extends base image with Qwen-Image 2512 model downloads.
"""

import modal
import sys
from pathlib import Path

# Import base image from shared
# At build time: import from project shared/ directory
# At runtime: import from /root/shared/ (where Modal copies it)
try:
    sys.path.insert(0, "/root/shared")
    from image_base import base_image
except ImportError:
    # Fallback to build-time path (relative to project)
    _shared_path = Path(__file__).parent.parent.parent / "shared"
    if str(_shared_path) not in sys.path:
        sys.path.insert(0, str(_shared_path))
    from image_base import base_image


def hf_download_qwen_image():
    """
    Download Qwen-Image 2512 models from HuggingFace during build.
    
    Downloads:
    - Diffusion model: qwen_image_2512_fp8_e4m3fn.safetensors (~8GB)
    - Text encoder: qwen_2.5_vl_7b_fp8_scaled.safetensors (~7GB)
    - VAE: qwen_image_vae.safetensors (~300MB)
    - Lightning LoRA: Qwen-Image-Lightning-4steps-V1.0.safetensors (~400MB)
    """
    from pathlib import Path
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI/models")
    
    print("📥 Downloading Qwen-Image 2512 models from HuggingFace...")
    
    # Model downloads configuration
    models = [
        {
            "repo": "Comfy-Org/Qwen-Image_ComfyUI",
            "file": "split_files/diffusion_models/qwen_image_2512_fp8_e4m3fn.safetensors",
            "dest_dir": comfy_dir / "diffusion_models",
            "dest_name": "qwen_image_2512_fp8_e4m3fn.safetensors",
        },
        {
            "repo": "Comfy-Org/Qwen-Image_ComfyUI",
            "file": "split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors",
            "dest_dir": comfy_dir / "text_encoders",
            "dest_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors",
        },
        {
            "repo": "Comfy-Org/Qwen-Image_ComfyUI",
            "file": "split_files/vae/qwen_image_vae.safetensors",
            "dest_dir": comfy_dir / "vae",
            "dest_name": "qwen_image_vae.safetensors",
        },
        {
            "repo": "lightx2v/Qwen-Image-Lightning",
            "file": "Qwen-Image-Lightning-4steps-V1.0.safetensors",
            "dest_dir": comfy_dir / "loras",
            "dest_name": "Qwen-Image-Lightning-4steps-V1.0.safetensors",
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
            
            # Download to cache
            cached_path = hf_hub_download(
                repo_id=model["repo"],
                filename=model["file"],
                cache_dir="/cache",
            )
            
            # Symlink to ComfyUI models directory
            os.symlink(cached_path, str(dest_path))
            
            print(f"   ✓ {model['dest_name']} downloaded and linked")
            
        except Exception as e:
            print(f"   ❌ Failed to download {model['dest_name']}: {e}")
            import traceback
            traceback.print_exc()
    
    print("✅ Qwen-Image 2512 models ready")


# Qwen-Image image extends base image with Qwen-Image-specific models
qwen_image_image = (
    base_image
    # Copy handler file
    .add_local_file("apps/modal/handlers/qwen_image.py", "/root/handlers/qwen_image.py", copy=True)
    # Download models
    .run_function(
        hf_download_qwen_image,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
