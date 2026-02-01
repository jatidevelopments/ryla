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


def download_reactor_models():
    """Download ReActor models for face swap."""
    import os
    import urllib.request
    from pathlib import Path
    
    print("📥 Downloading ReActor models...")
    
    # ReActor expects models in /root/comfy/ComfyUI/models/reactor/
    reactor_dir = Path("/root/comfy/ComfyUI/models/reactor")
    reactor_dir.mkdir(parents=True, exist_ok=True)
    
    faces_dir = reactor_dir / "faces"
    faces_dir.mkdir(parents=True, exist_ok=True)
    
    facerestore_dir = Path("/root/comfy/ComfyUI/models/facerestore_models")
    facerestore_dir.mkdir(parents=True, exist_ok=True)
    
    # Also create insightface directory as fallback
    insightface_dir = Path("/root/comfy/ComfyUI/models/insightface")
    insightface_dir.mkdir(parents=True, exist_ok=True)
    
    # Download inswapper model to reactor folder
    inswapper_path = insightface_dir / "inswapper_128.onnx"
    if not inswapper_path.exists():
        print("   Downloading inswapper_128.onnx...")
        urllib.request.urlretrieve(
            "https://huggingface.co/datasets/Gourieff/ReActor/resolve/main/models/inswapper_128.onnx",
            str(inswapper_path)
        )
        print("   ✓ inswapper_128.onnx downloaded")
    
    # Download GFPGAN model
    gfpgan_path = facerestore_dir / "GFPGANv1.4.pth"
    if not gfpgan_path.exists():
        print("   Downloading GFPGANv1.4.pth...")
        urllib.request.urlretrieve(
            "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth",
            str(gfpgan_path)
        )
        print("   ✓ GFPGANv1.4.pth downloaded")
    
    # Download buffalo_l model for InsightFace face detection
    buffalo_dir = Path("/root/.insightface/models/buffalo_l")
    buffalo_dir.mkdir(parents=True, exist_ok=True)
    buffalo_files = [
        "1k3d68.onnx",
        "2d106det.onnx", 
        "det_10g.onnx",
        "genderage.onnx",
        "w600k_r50.onnx",
    ]
    
    for fname in buffalo_files:
        fpath = buffalo_dir / fname
        if not fpath.exists():
            print(f"   Downloading buffalo_l/{fname}...")
            try:
                urllib.request.urlretrieve(
                    f"https://huggingface.co/datasets/Gourieff/ReActor/resolve/main/models/buffalo_l/{fname}",
                    str(fpath)
                )
            except Exception as e:
                print(f"   ⚠️ Failed to download {fname}: {e}")
    
    print("✅ ReActor models ready")


# Qwen-Image image extends base image with Qwen-Image-specific models
# Cache buster: v7 - Fix video output handling for VHS_VideoCombine
qwen_image_image = (
    base_image
    # Install system dependencies for ReActor (libGL, etc.)
    .apt_install(["libgl1-mesa-glx", "libglib2.0-0"])
    # Copy handler file - includes video face swap endpoint
    .add_local_file("apps/modal/handlers/qwen_image.py", "/root/handlers/qwen_image.py", copy=True)
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
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-ReActor && "
        "(if [ -f requirements.txt ]; then pip install -r requirements.txt || true; fi) && "
        "echo '✅ ComfyUI-ReActor installed'"
    )
    # Install ComfyUI-VideoHelperSuite for video processing
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI-VideoHelperSuite ]; then cd ComfyUI-VideoHelperSuite && git pull; else git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git ComfyUI-VideoHelperSuite; fi"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite && "
        "pip install opencv-python-headless imageio imageio-ffmpeg av && "
        "(if [ -f requirements.txt ]; then pip install -r requirements.txt; fi) && "
        "echo '✅ VideoHelperSuite installed'"
    )
    # Install ffmpeg for video processing
    .apt_install(["ffmpeg"])
    # Download ReActor models
    .run_function(download_reactor_models)
    # Download Qwen-Image models
    .run_function(
        hf_download_qwen_image,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
