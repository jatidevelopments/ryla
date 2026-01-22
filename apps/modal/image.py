"""
Modal image build configuration.

Handles model downloads and custom node installation.
"""

import modal
import subprocess
from pathlib import Path

# Constants (defined here to avoid import issues during image build)
PYTHON_VERSION = "3.11"
COMFYUI_VERSION = "0.3.71"
FASTAPI_VERSION = "0.115.4"
COMFY_CLI_VERSION = "1.5.3"

# Import config (for volumes/secrets - will be available at runtime)
# These are only used in .run_function() calls, not during image definition
try:
    from config import hf_cache_vol, huggingface_secret
except ImportError:
    # Will be imported properly when app.py runs
    hf_cache_vol = None
    huggingface_secret = None


# ============ MODEL DOWNLOAD FUNCTIONS ============

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


def hf_download_instantid():
    """Download InstantID models (MVP face consistency)."""
    from huggingface_hub import hf_hub_download, list_repo_files
    import os
    
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
        files = list_repo_files(repo_id="InstantX/InstantID", repo_type="model", token=token)
        controlnet_files = [f for f in files if 'controlnet' in f.lower() or f.endswith('.safetensors')]
        
        for file_path in controlnet_files:
            if file_path.endswith('.safetensors') and ('controlnet' in file_path.lower() or 'diffusion' in file_path.lower()):
                try:
                    controlnet_model = hf_hub_download(
                        repo_id="InstantX/InstantID",
                        filename=file_path,
                        cache_dir="/cache",
                        token=token,
                    )
                    print(f"   ✅ Downloaded ControlNet: {file_path}")
                    break
                except Exception as e:
                    print(f"   ⚠️  Failed to download {file_path}: {e}")
                    continue
        
        if not controlnet_model:
            print("   ⚠️  ControlNet not found - will be downloaded by ComfyUI_InstantID on first use")
    except Exception as e:
        print(f"   ⚠️  Could not list repo files: {e}")
        print("   ⚠️  ControlNet will be downloaded by ComfyUI_InstantID on first use")
    
    # InsightFace models directory
    insightface_dir = comfy_dir / "models" / "insightface" / "models"
    insightface_dir.mkdir(parents=True, exist_ok=True)
    print("Note: InsightFace models will be downloaded automatically by InstantID node on first use")
    
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
        print("   ✅ ControlNet model symlinked")
    else:
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/controlnet",
            shell=True,
            check=True,
        )


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


# ============ IMAGE BUILD ============

image = (
    modal.Image.debian_slim(python_version=PYTHON_VERSION)
    .apt_install(["git", "wget", "curl"])
    .uv_pip_install(f"fastapi[standard]=={FASTAPI_VERSION}")
    .uv_pip_install(f"comfy-cli=={COMFY_CLI_VERSION}")
    .add_local_file("utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)
    .add_local_file("utils/comfyui.py", "/root/utils/comfyui.py", copy=True)
    .add_local_file("utils/image_utils.py", "/root/utils/image_utils.py", copy=True)
    .add_local_file("../../workflows/seedvr2.json", "/root/workflows/seedvr2.json", copy=True)
    .run_commands(
        f"comfy --skip-prompt install --fast-deps --nvidia --version {COMFYUI_VERSION}"
    )
    # Install InstantID custom node
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "pip install -r requirements.txt || true"
    )
    # Install SeedVR2 custom node
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git ComfyUI-SeedVR2_VideoUpscaler || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-SeedVR2_VideoUpscaler && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Install ComfyUI-Easy-Use
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/yolain/ComfyUI-Easy-Use.git ComfyUI-Easy-Use || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Easy-Use && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Install workflow converter plugin
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git comfyui-workflow-to-api-converter-endpoint || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/comfyui-workflow-to-api-converter-endpoint && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    .uv_pip_install("huggingface-hub==0.36.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
    .add_local_file("config.py", "/root/config.py", copy=True)  # Add config for run_function imports
    .run_function(
        hf_download_flux,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
    )
    .run_function(
        hf_download_flux_dev,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
        secrets=[huggingface_secret] if huggingface_secret else [],
    )
    .run_function(
        hf_download_instantid,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
        secrets=[huggingface_secret] if huggingface_secret else [],
    )
    .run_function(
        hf_download_wan2,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
    )
    .run_function(
        hf_download_seedvr2,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
        secrets=[huggingface_secret] if huggingface_secret else [],
    )
)
