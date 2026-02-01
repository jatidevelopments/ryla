"""
InstantID-specific image build.

Extends base image with InstantID, SDXL, Flux Dev, and Flux IP-Adapter model downloads.
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


def hf_download_flux_dev():
    """Download Flux Dev models (needed for flux-instantid and flux-ipadapter-faceid)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("⚠️  WARNING: HF_TOKEN not found. Skipping Flux Dev download.")
        return
    
    try:
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
        
        # Download VAE
        vae_model = hf_hub_download(
            repo_id="black-forest-labs/FLUX.1-dev",
            filename="ae.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        # Symlink models
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


def hf_download_sdxl():
    """Download SDXL base model (compatible with InstantID)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("⚠️  WARNING: HF_TOKEN not found. Skipping SDXL download.")
        return
    
    try:
        print("📥 Downloading SDXL base model...")
        sdxl_model = hf_hub_download(
            repo_id="stabilityai/stable-diffusion-xl-base-1.0",
            filename="sd_xl_base_1.0.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/checkpoints && "
            f"ln -s {sdxl_model} {comfy_dir}/models/checkpoints/sd_xl_base_1.0.safetensors",
            shell=True,
            check=True,
        )
        print("✅ SDXL base model downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download SDXL model: {e}")


def hf_download_flux_ipadapter():
    """Download Shakker-Labs IP-Adapter Flux model (alternative to XLabs)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    try:
        print("📥 Downloading Shakker-Labs IP-Adapter Flux...")
        ipadapter_model = hf_hub_download(
            repo_id="Shakker-Labs/FLUX.1-dev-IP-Adapter",
            filename="ip-adapter.bin",
            cache_dir="/cache",
            token=token,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/ipadapter-flux && "
            f"ln -s {ipadapter_model} {comfy_dir}/models/ipadapter-flux/ip-adapter.bin",
            shell=True,
            check=True,
        )
        print("✅ Shakker-Labs IP-Adapter Flux downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download Shakker-Labs IP-Adapter: {e}")


def hf_download_pulid_flux():
    """Download PuLID Flux model for face consistency (v0.9.1 - latest)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    try:
        print("📥 Downloading PuLID Flux model v0.9.1...")
        pulid_model = hf_hub_download(
            repo_id="guozinan/PuLID",
            filename="pulid_flux_v0.9.1.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        print("📥 Downloading EVA-CLIP model...")
        eva_clip_model = hf_hub_download(
            repo_id="QuanSun/EVA-CLIP",
            filename="EVA02_CLIP_L_336_psz14_s6B.pt",
            cache_dir="/cache",
            token=token,
        )
        
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/pulid && "
            f"ln -s {pulid_model} {comfy_dir}/models/pulid/pulid_flux_v0.9.1.safetensors",
            shell=True,
            check=True,
        )
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/clip && "
            f"ln -s {eva_clip_model} {comfy_dir}/models/clip/EVA02_CLIP_L_336_psz14_s6B.pt",
            shell=True,
            check=True,
        )
        print("✅ PuLID Flux models downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download PuLID Flux models: {e}")


def hf_download_instantid():
    """Download InstantID models (MVP face consistency)."""
    from huggingface_hub import hf_hub_download, list_repo_files
    import os
    import zipfile
    import urllib.request
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    print("📥 Downloading InstantID IP-Adapter...")
    ipadapter_model = hf_hub_download(
        repo_id="InstantX/InstantID",
        filename="ip-adapter.bin",
        cache_dir="/cache",
        token=token,
    )
    
    print("📥 Downloading InstantID ControlNet...")
    controlnet_model = None
    try:
        controlnet_paths = [
            "ControlNetModel/diffusion_pytorch_model.safetensors",
            "diffusion_pytorch_model.safetensors",
        ]
        for controlnet_path in controlnet_paths:
            try:
                controlnet_model = hf_hub_download(
                    repo_id="InstantX/InstantID",
                    filename=controlnet_path,
                    cache_dir="/cache",
                    token=token,
                )
                break
            except Exception:
                continue
    except Exception as e:
        print(f"   ⚠️  Error downloading ControlNet: {e}")
    
    # Download InsightFace models
    # NOTE: ComfyUI_InstantID looks for models at: folder_paths.models_dir/insightface/antelopev2
    print("📥 Downloading InsightFace models (antelopev2)...")
    insightface_dir = comfy_dir / "models" / "insightface"
    insightface_dir.mkdir(parents=True, exist_ok=True)
    antelopev2_dir = insightface_dir / "antelopev2"
    
    if not antelopev2_dir.exists():
        zip_url = "https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip"
        zip_path = insightface_dir / "antelopev2.zip"
        urllib.request.urlretrieve(zip_url, zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(insightface_dir)
        zip_path.unlink()
    
    # Create symlink for InsightFace
    home_insightface_dir = Path("/root/.insightface/models")
    home_insightface_dir.mkdir(parents=True, exist_ok=True)
    home_antelopev2_link = home_insightface_dir / "antelopev2"
    if not home_antelopev2_link.exists():
        subprocess.run(
            f"ln -s {antelopev2_dir} {home_antelopev2_link}",
            shell=True,
            check=True,
        )
    
    # Symlink InstantID models
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/instantid && "
        f"ln -s {ipadapter_model} {comfy_dir}/models/instantid/ip-adapter.bin",
        shell=True,
        check=True,
    )
    
    if controlnet_model:
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/controlnet && "
            f"ln -s {controlnet_model} {comfy_dir}/models/controlnet/diffusion_pytorch_model.safetensors",
            shell=True,
            check=True,
        )
    print("✅ InstantID models downloaded successfully")


# InstantID image extends base image with all face consistency models
instantid_image = (
    base_image
    # Copy ORIGINAL handler files (not split copies) - same as original working app
    .add_local_file("apps/modal/handlers/instantid.py", "/root/handlers/instantid.py", copy=True)
    .add_local_file("apps/modal/handlers/pulid_flux.py", "/root/handlers/pulid_flux.py", copy=True)
    .run_function(
        hf_download_flux_dev,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(
        hf_download_sdxl,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(
        hf_download_flux_ipadapter,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(
        hf_download_pulid_flux,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(
        hf_download_instantid,
        volumes={"/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True)},
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
