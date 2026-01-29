"""
Qwen-Edit-specific image build.

Extends base image with Qwen-Image Edit 2511 model downloads.

Cache buster: v2 - force model download
"""

import modal
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


def hf_download_qwen_edit():
    """
    Download Qwen-Image Edit 2511 models from HuggingFace during build.
    
    Downloads:
    - Diffusion model: qwen_image_edit_2511_fp8_e4m3fn.safetensors
    - Text encoder: qwen_2.5_vl_7b_fp8_scaled.safetensors (shared with 2512)
    - VAE: qwen_image_vae.safetensors (shared with 2512)
    
    Cache buster: v10 - switch to bf16 model (fp8mixed has type promotion issues)
    """
    from pathlib import Path
    _cache_buster = "v10"  # bf16 model for img2img compatibility
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI/models")
    
    print("📥 Downloading Qwen-Image Edit 2511 models from HuggingFace...")
    
    # Model downloads configuration
    # Use bf16 version - fp8mixed has type promotion issues with img2img/inpainting
    # Diffusion model from Qwen-Image-Edit repo, shared components from Qwen-Image repo
    models = [
        {
            "repo": "Comfy-Org/Qwen-Image-Edit_ComfyUI",  # Edit-specific diffusion model
            "file": "split_files/diffusion_models/qwen_image_edit_2511_bf16.safetensors",
            "dest_dir": comfy_dir / "diffusion_models",
            "dest_name": "qwen_image_edit_2511_bf16.safetensors",
        },
        {
            "repo": "Comfy-Org/Qwen-Image_ComfyUI",  # Shared with Qwen-Image 2512
            "file": "split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors",
            "dest_dir": comfy_dir / "text_encoders",
            "dest_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors",
        },
        {
            "repo": "Comfy-Org/Qwen-Image_ComfyUI",  # Shared with Qwen-Image 2512
            "file": "split_files/vae/qwen_image_vae.safetensors",
            "dest_dir": comfy_dir / "vae",
            "dest_name": "qwen_image_vae.safetensors",
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
    
    print("✅ Qwen-Image Edit 2511 models ready")


# Qwen-Edit image extends base image with Qwen-Edit-specific models
qwen_edit_image = (
    base_image
    # Copy handler file
    .add_local_file("apps/modal/handlers/qwen_edit.py", "/root/handlers/qwen_edit.py", copy=True)
    # Download models
    .run_function(
        hf_download_qwen_edit,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
