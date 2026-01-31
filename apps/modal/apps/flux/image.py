"""
Flux-specific image build.

Extends base image with Flux model downloads.
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


def hf_download_flux():
    """Download Flux Schnell model."""
    from huggingface_hub import hf_hub_download

    flux_model = hf_hub_download(
        repo_id="Comfy-Org/flux1-schnell",
        filename="flux1-schnell-fp8.safetensors",
        cache_dir="/cache",
    )

    subprocess.run(
        f"ln -s {flux_model} /root/comfy/ComfyUI/models/checkpoints/flux1-schnell-fp8.safetensors",
        shell=True,
        check=True,
    )


def hf_download_flux_dev():
    """Download Flux Dev models (MVP primary model)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Get HF token from environment (set via Modal Secret)
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("⚠️  WARNING: HF_TOKEN not found. Skipping Flux Dev download.")
        print("   To enable Flux Dev, create Modal secret: modal secret create huggingface HF_TOKEN=<token>")
        return
    
    try:
        # Download Flux Dev checkpoint (main model)
        print("📥 Downloading Flux Dev checkpoint...")
        flux_dev_model = hf_hub_download(
            repo_id="black-forest-labs/FLUX.1-dev",
            filename="flux1-dev.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        print("📥 Downloading text encoders (CLIP + T5)...")
        clip_model = hf_hub_download(
            repo_id="comfyanonymous/flux_text_encoders",
            filename="clip_l.safetensors",
            cache_dir="/cache",
            token=token,
        )
        t5_model = hf_hub_download(
            repo_id="comfyanonymous/flux_text_encoders",
            filename="t5xxl_fp16.safetensors",
            cache_dir="/cache",
            token=token,
        )
        print("   ✅ Downloaded from comfyanonymous/flux_text_encoders")
        
        # Download VAE
        print("📥 Downloading VAE...")
        vae_model = hf_hub_download(
            repo_id="black-forest-labs/FLUX.1-dev",
            filename="ae.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        # Symlink models to ComfyUI directories
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/checkpoints {comfy_dir}/models/diffusion_models && "
            f"ln -s {flux_dev_model} {comfy_dir}/models/checkpoints/flux1-dev.safetensors && "
            f"ln -s {flux_dev_model} {comfy_dir}/models/diffusion_models/flux1-dev.safetensors",
            shell=True,
            check=True,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/clip && "
            f"ln -s {clip_model} {comfy_dir}/models/clip/clip_l.safetensors",
            shell=True,
            check=True,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/text_encoders && "
            f"ln -s {t5_model} {comfy_dir}/models/text_encoders/t5xxl_fp16.safetensors",
            shell=True,
            check=True,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/vae && "
            f"ln -s {vae_model} {comfy_dir}/models/vae/ae.safetensors",
            shell=True,
            check=True,
        )
        print("✅ Flux Dev models downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download Flux Dev models: {e}")
        print("   Flux Dev endpoints will not be available")
        raise


# Flux image extends base image with Flux-specific models
# Note: This will be imported in app.py with proper path setup
# v4 - Moved add_local_file to end for runtime mounting (faster iteration)
flux_image = (
    base_image
    .run_function(
        hf_download_flux,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
    )
    .run_function(
        hf_download_flux_dev,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    # Handler file mounted at runtime (MUST be last for copy=False to work)
    .add_local_file("apps/modal/handlers/flux.py", "/root/handlers/flux.py", copy=False)
)
