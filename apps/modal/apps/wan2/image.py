"""
Wan2-specific image build.

Extends base image with Wan2.1 model downloads.
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


def hf_download_wan2():
    """Download Wan2.1 models."""
    from huggingface_hub import hf_hub_download

    wan_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        cache_dir="/cache",
    )

    clip_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        cache_dir="/cache",
    )

    vae_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/vae/wan_2.1_vae.safetensors",
        cache_dir="/cache",
    )

    comfy_dir = Path("/root/comfy/ComfyUI")
    
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/diffusion_models && ln -s {wan_model} {comfy_dir}/models/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/text_encoders && ln -s {clip_model} {comfy_dir}/models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/vae && ln -s {vae_model} {comfy_dir}/models/vae/wan_2.1_vae.safetensors",
        shell=True,
        check=True,
    )


# Wan2 image extends base image with Wan2-specific models
wan2_image = (
    base_image
    # Copy ORIGINAL handler file (not split copy) - same as original working app
    .add_local_file("apps/modal/handlers/wan2.py", "/root/handlers/wan2.py", copy=True)
    .run_function(
        hf_download_wan2,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
    )
)
