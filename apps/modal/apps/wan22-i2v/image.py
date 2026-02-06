"""
WAN 2.2 I2V (Image-to-Video) with Face Swap.

Extends base image with:
- WAN 2.2 I2V GGUF models (high-noise and low-noise variants)
- ComfyUI-GGUF plugin for GGUF model loading
- ReActor for face swap
- Motion LoRAs for long video generation

Model: WAN 2.2 I2V (Apache 2.0 - Free for commercial use)
Features:
- Image-to-Video generation with identity preservation
- Long video generation (multiple segments)
- Face swap with ReActor
- Motion LoRAs for dynamic movement
"""

import modal
import subprocess
import sys
import urllib.request
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


def download_wan22_i2v_models():
    """
    Download WAN 2.2 I2V models and WanVideoWrapper dependencies.
    
    Downloads:
    - GGUF I2V models (high-noise and low-noise variants)
    - WanVideoWrapper required models (VAE, text encoder, CLIP vision)
    """
    from pathlib import Path
    from huggingface_hub import hf_hub_download
    import os
    
    print("📥 Downloading WAN 2.2 I2V GGUF models...")
    
    # GGUF models go in diffusion_models folder (for WanVideoModelLoader)
    unet_dir = Path("/root/comfy/ComfyUI/models/diffusion_models")
    unet_dir.mkdir(parents=True, exist_ok=True)
    
    # WAN 2.2 I2V models from QuantStack
    gguf_models = [
        {
            "repo": "QuantStack/Wan2.2-I2V-A14B-GGUF",
            "subfolder": "HighNoise",
            "filename": "Wan2.2-I2V-A14B-HighNoise-Q5_K_S.gguf",
            "local_name": "wan22_i2v_high_noise.gguf",
        },
        {
            "repo": "QuantStack/Wan2.2-I2V-A14B-GGUF",
            "subfolder": "LowNoise",
            "filename": "Wan2.2-I2V-A14B-LowNoise-Q5_K_S.gguf",
            "local_name": "wan22_i2v_low_noise.gguf",
        },
    ]
    
    for model in gguf_models:
        local_path = unet_dir / model["local_name"]
        if not local_path.exists():
            print(f"   Downloading {model['filename']}...")
            try:
                downloaded = hf_hub_download(
                    repo_id=model["repo"],
                    subfolder=model["subfolder"],
                    filename=model["filename"],
                    cache_dir="/cache",
                )
                local_path.symlink_to(downloaded)
                print(f"   ✓ {model['local_name']} downloaded and linked")
            except Exception as e:
                print(f"   ⚠️ Failed to download {model['filename']}: {e}")
        else:
            print(f"   ✓ {model['local_name']} already exists")
    
    # Download WanVideoWrapper required models
    print("📥 Downloading WanVideoWrapper models...")
    
    # 1. VAE for WanVideoVAELoader
    vae_dir = Path("/root/comfy/ComfyUI/models/vae")
    vae_dir.mkdir(parents=True, exist_ok=True)
    
    vae_path = vae_dir / "Wan2_1_VAE_fp32.safetensors"
    if not vae_path.exists():
        print("   Downloading WAN VAE (fp32)...")
        try:
            # Try Kijai's WanVideo repo first
            downloaded = hf_hub_download(
                repo_id="Kijai/WanVideo_comfy",
                filename="Wan2_1_VAE_fp32.safetensors",
                cache_dir="/cache",
            )
            vae_path.symlink_to(downloaded)
            print("   ✓ WAN VAE downloaded")
        except Exception as e:
            print(f"   ⚠️ VAE download failed, trying alternative: {e}")
            try:
                # Fallback to Comfy-Org repackaged
                downloaded = hf_hub_download(
                    repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
                    subfolder="split_files/vae",
                    filename="wan_2.1_vae.safetensors",
                    cache_dir="/cache",
                )
                vae_path.symlink_to(downloaded)
                print("   ✓ WAN VAE (alternative) downloaded")
            except Exception as e2:
                print(f"   ⚠️ VAE download failed: {e2}")
    
    # 2. Text encoder for WanVideoTextEncodeCached
    text_enc_dir = Path("/root/comfy/ComfyUI/models/text_encoders")
    text_enc_dir.mkdir(parents=True, exist_ok=True)
    
    text_enc_path = text_enc_dir / "umt5-xxl-enc-bf16.safetensors"
    if not text_enc_path.exists():
        print("   Downloading UMT5-XXL text encoder...")
        try:
            downloaded = hf_hub_download(
                repo_id="Kijai/WanVideo_comfy",
                filename="umt5-xxl-enc-bf16.safetensors",
                cache_dir="/cache",
            )
            text_enc_path.symlink_to(downloaded)
            print("   ✓ UMT5-XXL encoder downloaded")
        except Exception as e:
            print(f"   ⚠️ Text encoder download failed: {e}")
    
    # 3. CLIP Vision for WanVideoClipVisionEncode
    clip_vision_dir = Path("/root/comfy/ComfyUI/models/clip_vision")
    clip_vision_dir.mkdir(parents=True, exist_ok=True)
    
    clip_vision_path = clip_vision_dir / "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors"
    if not clip_vision_path.exists():
        print("   Downloading CLIP Vision (ViT-H-14)...")
        try:
            # Use fofr/comfyui repo - ComfyUI-optimized version (2.53 GB)
            downloaded = hf_hub_download(
                repo_id="fofr/comfyui",
                subfolder="clip_vision",
                filename="CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors",
                cache_dir="/cache",
            )
            clip_vision_path.symlink_to(downloaded)
            print("   ✓ CLIP Vision downloaded")
        except Exception as e:
            print(f"   ⚠️ CLIP Vision download failed: {e}")
    
    # Also keep the legacy CLIP model for fallback
    clip_path = text_enc_dir / "umt5_xxl_fp8_e4m3fn_scaled.safetensors"
    if not clip_path.exists():
        print("   Downloading legacy CLIP model...")
        try:
            downloaded = hf_hub_download(
                repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
                subfolder="split_files/text_encoders",
                filename="umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                cache_dir="/cache",
            )
            clip_path.symlink_to(downloaded)
            print("   ✓ Legacy CLIP model downloaded")
        except Exception as e:
            print(f"   ⚠️ Legacy CLIP download failed: {e}")
    
    # Legacy VAE symlink for backward compatibility
    legacy_vae_path = vae_dir / "wan_2.2_vae.safetensors"
    if not legacy_vae_path.exists():
        try:
            downloaded = hf_hub_download(
                repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
                subfolder="split_files/vae",
                filename="wan_2.1_vae.safetensors",
                cache_dir="/cache",
            )
            legacy_vae_path.symlink_to(downloaded)
            print("   ✓ Legacy VAE symlinked")
        except Exception:
            pass
    
    print("✅ WAN 2.2 I2V models ready")


def download_reactor_models():
    """
    Download ReActor face swap models.
    """
    import urllib.request
    from pathlib import Path
    
    print("📥 Downloading ReActor models...")
    
    # Download inswapper model
    inswapper_dir = Path("/root/comfy/ComfyUI/models/insightface")
    inswapper_dir.mkdir(parents=True, exist_ok=True)
    inswapper_path = inswapper_dir / "inswapper_128.onnx"
    
    if not inswapper_path.exists():
        print("   Downloading inswapper_128.onnx...")
        # Using HuggingFace mirror (original GitHub URL deprecated)
        urllib.request.urlretrieve(
            "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx",
            str(inswapper_path)
        )
        print("   ✓ inswapper_128.onnx downloaded")
    
    # Download GFPGAN for face restoration
    facerestore_dir = Path("/root/comfy/ComfyUI/models/facerestore_models")
    facerestore_dir.mkdir(parents=True, exist_ok=True)
    gfpgan_path = facerestore_dir / "GFPGANv1.4.pth"
    
    if not gfpgan_path.exists():
        print("   Downloading GFPGANv1.4.pth...")
        urllib.request.urlretrieve(
            "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth",
            str(gfpgan_path)
        )
        print("   ✓ GFPGANv1.4.pth downloaded")
    
    # Download buffalo_l models for InsightFace
    buffalo_dir = Path("/root/.insightface/models/buffalo_l")
    buffalo_dir.mkdir(parents=True, exist_ok=True)
    buffalo_files = [
        "1k3d68.onnx",
        "2d106det.onnx",
        "det_10g.onnx",
        "genderage.onnx",
        "w600k_r50.onnx",
    ]
    
    base_url = "https://huggingface.co/lithiumice/insightface/resolve/main/models/buffalo_l"
    
    for fname in buffalo_files:
        fpath = buffalo_dir / fname
        if not fpath.exists():
            print(f"   Downloading buffalo_l/{fname}...")
            try:
                urllib.request.urlretrieve(f"{base_url}/{fname}", str(fpath))
                print(f"   ✓ {fname} downloaded")
            except Exception as e:
                print(f"   ⚠️ Failed to download {fname}: {e}")
    
    print("✅ ReActor models ready")


# WAN 2.2 I2V image with GGUF support, WanVideoWrapper, and ReActor
wan22_i2v_image = (
    base_image
    # Force rebuild marker
    .run_commands("echo 'WAN22-I2V v12: 2026-02-05T03:20 - use LowNoise model' > /tmp/build_version")
    # Install system dependencies for ReActor and video processing
    .apt_install(["libgl1-mesa-glx", "libglib2.0-0", "ffmpeg"])
    # Install ComfyUI-GGUF plugin for GGUF model loading
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI-GGUF ]; then rm -rf ComfyUI-GGUF; fi && "
        "git clone https://github.com/city96/ComfyUI-GGUF.git ComfyUI-GGUF && "
        "cd ComfyUI-GGUF && pip install -r requirements.txt"
    )
    # Install ComfyUI-WanVideoWrapper for proper WAN video nodes
    # Provides: WanVideoModelLoader, WanVideoSampler, WanVideoClipVisionEncode, etc.
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI-WanVideoWrapper ]; then rm -rf ComfyUI-WanVideoWrapper; fi && "
        "git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git ComfyUI-WanVideoWrapper"
    )
    # Install KJNodes for GGUFLoaderKJ (needed to load GGUF with WanVideoWrapper)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI-KJNodes ]; then rm -rf ComfyUI-KJNodes; fi && "
        "git clone https://github.com/kijai/ComfyUI-KJNodes.git ComfyUI-KJNodes"
    )
    # Install WanVideoWrapper dependencies
    .pip_install([
        "ftfy",
        "accelerate>=1.2.1",
        "einops",
        "diffusers>=0.33.0",
        "peft>=0.17.0",
        "sentencepiece>=0.2.0",
        "protobuf",
        "pyloudnorm",
        "gguf>=0.17.1",
    ])
    # Install ComfyUI-ReActor for face swap
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI-ReActor ]; then rm -rf ComfyUI-ReActor; fi && "
        "git clone https://github.com/Gourieff/ComfyUI-ReActor.git ComfyUI-ReActor"
    )
    # Install ReActor Python dependencies
    .pip_install([
        "insightface==0.7.3",
        "onnxruntime-gpu",
        "opencv-python-headless",
        "albumentations",
        "scipy",
    ])
    # Install video processing dependencies
    .run_commands(
        "pip install opencv-python-headless imageio imageio-ffmpeg av"
    )
    # Copy handler files (need __init__.py for Python imports to work)
    .run_commands("mkdir -p /root/handlers && touch /root/handlers/__init__.py")
    .add_local_file("apps/modal/handlers/wan22_i2v.py", "/root/handlers/wan22_i2v.py", copy=True)
    # Download models
    .run_function(
        download_wan22_i2v_models,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(download_reactor_models)
)
