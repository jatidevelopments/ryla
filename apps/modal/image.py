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


def hf_download_sdxl():
    """Download SDXL base model (compatible with InstantID)."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("⚠️  WARNING: HF_TOKEN not found. Skipping SDXL download.")
        print("   To enable SDXL, create Modal secret: modal secret create huggingface HF_TOKEN=<token>")
        return
    
    try:
        # Download SDXL base model (commonly used checkpoint)
        print("📥 Downloading SDXL base model...")
        sdxl_model = hf_hub_download(
            repo_id="stabilityai/stable-diffusion-xl-base-1.0",
            filename="sd_xl_base_1.0.safetensors",
            cache_dir="/cache",
            token=token,
        )
        
        # Symlink to ComfyUI checkpoints directory
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/checkpoints && "
            f"ln -s {sdxl_model} {comfy_dir}/models/checkpoints/sd_xl_base_1.0.safetensors",
            shell=True,
            check=True,
        )
        print("✅ SDXL base model downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download SDXL model: {e}")
        print("   SDXL InstantID endpoint will not be available")
        # Don't raise - SDXL is optional, Flux Dev is primary


def hf_download_flux_ipadapter():
    """Download XLabs-AI Flux IP-Adapter v2 and CLIP Vision model."""
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    if not token:
        print("⚠️  WARNING: HF_TOKEN not found. Skipping Flux IP-Adapter download.")
        print("   To enable Flux IP-Adapter, create Modal secret: modal secret create huggingface HF_TOKEN=<token>")
        return
    
    try:
        # Download Flux IP-Adapter v2
        print("📥 Downloading XLabs-AI Flux IP-Adapter v2...")
        ipadapter_model = hf_hub_download(
            repo_id="XLabs-AI/flux-ip-adapter-v2",
            filename="ip_adapter.safetensors",  # Actual filename in repository
            cache_dir="/cache",
            token=token,
        )
        
        # Download CLIP Vision model (OpenAI VIT CLIP large)
        print("📥 Downloading CLIP Vision model (OpenAI VIT CLIP large)...")
        try:
            clip_vision_model = hf_hub_download(
                repo_id="openai/clip-vit-large-patch14",
                filename="model.safetensors",
                cache_dir="/cache",
                token=token,
            )
        except Exception as e:
            # Try alternative filename
            print(f"   ⚠️  model.safetensors not found, trying alternative...")
            try:
                clip_vision_model = hf_hub_download(
                    repo_id="openai/clip-vit-large-patch14",
                    filename="pytorch_model.bin",
                    cache_dir="/cache",
                    token=token,
                )
            except Exception as e2:
                print(f"   ⚠️  Could not download CLIP Vision model: {e2}")
                print("   ⚠️  You may need to download it manually")
                clip_vision_model = None
        
        # Symlink IP-Adapter to ComfyUI directory
        # Use the actual filename for the symlink (ip_adapter.safetensors)
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/xlabs/ipadapters && "
            f"ln -s {ipadapter_model} {comfy_dir}/models/xlabs/ipadapters/ip_adapter.safetensors",
            shell=True,
            check=True,
        )
        print("✅ Flux IP-Adapter v2 downloaded successfully")
        
        # Symlink CLIP Vision if downloaded
        if clip_vision_model:
            subprocess.run(
                f"mkdir -p {comfy_dir}/models/clip_vision && "
                f"ln -s {clip_vision_model} {comfy_dir}/models/clip_vision/model.safetensors",
                shell=True,
                check=True,
            )
            print("✅ CLIP Vision model downloaded successfully")
        else:
            print("⚠️  CLIP Vision model not downloaded - endpoint may not work without it")
            
    except Exception as e:
        print(f"❌ Failed to download Flux IP-Adapter models: {e}")
        print("   Flux IP-Adapter FaceID endpoint will not be available")
        # Don't raise - IP-Adapter is optional


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
        # Try known ControlNet paths from InstantID repository
        controlnet_paths = [
            "ControlNetModel/diffusion_pytorch_model.safetensors",
            "diffusion_pytorch_model.safetensors",
            "controlnet/diffusion_pytorch_model.safetensors",
        ]
        
        for controlnet_path in controlnet_paths:
            try:
                controlnet_model = hf_hub_download(
                    repo_id="InstantX/InstantID",
                    filename=controlnet_path,
                    cache_dir="/cache",
                    token=token,
                )
                print(f"   ✅ Downloaded ControlNet: {controlnet_path}")
                break
            except Exception as e:
                print(f"   ⚠️  Failed to download {controlnet_path}: {e}")
                continue
        
        # If direct paths fail, try listing files
        if not controlnet_model:
            try:
                files = list_repo_files(repo_id="InstantX/InstantID", repo_type="model", token=token)
                controlnet_files = [f for f in files if 'controlnet' in f.lower() or ('diffusion' in f.lower() and f.endswith('.safetensors'))]
                
                for file_path in controlnet_files:
                    if file_path.endswith('.safetensors'):
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
            except Exception as e:
                print(f"   ⚠️  Could not list repo files: {e}")
        
        if not controlnet_model:
            print("   ⚠️  ControlNet not found - InstantID endpoint may not work without it")
            print("   ⚠️  You may need to manually download the ControlNet model")
    except Exception as e:
        print(f"   ⚠️  Error downloading ControlNet: {e}")
        print("   ⚠️  ControlNet will need to be downloaded manually")
    
    # Download InsightFace models (antelopev2) - required for InstantIDFaceAnalysis
    # NOTE: InsightFace FaceAnalysis looks for models at: {root}/models/{name}/
    # ComfyUI_InstantID sets root = folder_paths.models_dir/insightface
    # So FaceAnalysis(name="antelopev2", root=...) looks for: models_dir/insightface/models/antelopev2/
    # v2: Fixed path structure to include /models/ subdirectory
    print("📥 Downloading InsightFace models (antelopev2) to correct path...")
    insightface_dir = comfy_dir / "models" / "insightface" / "models"
    insightface_dir.mkdir(parents=True, exist_ok=True)
    antelopev2_dir = insightface_dir / "antelopev2"
    
    if not antelopev2_dir.exists():
        import zipfile
        import urllib.request
        
        # Download antelopev2.zip from HuggingFace
        zip_url = "https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip"
        zip_path = insightface_dir / "antelopev2.zip"
        
        print(f"   Downloading from {zip_url}...")
        urllib.request.urlretrieve(zip_url, zip_path)
        
        # Extract
        print("   Extracting antelopev2.zip...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(insightface_dir)
        
        # Clean up zip file
        zip_path.unlink()
        print(f"   ✅ InsightFace models extracted to {antelopev2_dir}")
    else:
        print(f"   ✅ InsightFace models already exist at {antelopev2_dir}")
    
    # Create symlink in ~/.insightface/models/ for InsightFace library to find models
    # InsightFace looks for models in ~/.insightface/models/ by default
    home_insightface_dir = Path("/root/.insightface/models")
    home_insightface_dir.mkdir(parents=True, exist_ok=True)
    home_antelopev2_link = home_insightface_dir / "antelopev2"
    
    if not home_antelopev2_link.exists():
        # Create symlink to ComfyUI models directory
        subprocess.run(
            f"ln -s {antelopev2_dir} {home_antelopev2_link}",
            shell=True,
            check=True,
        )
        print(f"   ✅ Created symlink: {home_antelopev2_link} -> {antelopev2_dir}")
    else:
        print(f"   ✅ Symlink already exists: {home_antelopev2_link}")
    
    # Verify required InsightFace model files exist
    required_files = ["1k3d68.onnx", "2d106det.onnx", "genderage.onnx", "glintr100.onnx", "scrfd_10g_bnkps.onnx"]
    missing_files = []
    for file in required_files:
        file_path = antelopev2_dir / file
        if not file_path.exists():
            missing_files.append(file)
        else:
            print(f"   ✅ Found model file: {file}")
    
    if missing_files:
        print(f"   ⚠️  Missing InsightFace model files: {', '.join(missing_files)}")
    else:
        print(f"   ✅ All required InsightFace model files present")
    
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


def hf_download_z_image():
    """Download Z-Image-Turbo models."""
    from huggingface_hub import hf_hub_download
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Download Z-Image-Turbo diffusion model
    print("📥 Downloading Z-Image-Turbo diffusion model...")
    z_image_model = hf_hub_download(
        repo_id="Comfy-Org/z_image_turbo",
        filename="split_files/diffusion_models/z_image_turbo_bf16.safetensors",
        cache_dir="/cache",
    )
    
    # Download CLIP text encoder
    print("📥 Downloading Z-Image-Turbo CLIP text encoder...")
    clip_model = hf_hub_download(
        repo_id="Comfy-Org/z_image_turbo",
        filename="split_files/text_encoders/qwen_3_4b.safetensors",
        cache_dir="/cache",
    )
    
    # Download VAE (actual filename is ae.safetensors, not z-image-turbo-vae.safetensors)
    print("📥 Downloading Z-Image-Turbo VAE...")
    vae_model = hf_hub_download(
        repo_id="Comfy-Org/z_image_turbo",
        filename="split_files/vae/ae.safetensors",
        cache_dir="/cache",
    )
    
    # Symlink diffusion model to ComfyUI
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/unet && "
        f"ln -s {z_image_model} {comfy_dir}/models/unet/z_image_turbo_bf16.safetensors",
        shell=True,
        check=True,
    )
    print("✅ Z-Image-Turbo diffusion model symlinked")
    
    # Symlink CLIP to text_encoders directory (CLIPLoader looks here)
    # Also symlink to clip directory for compatibility
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/text_encoders && "
        f"ln -s {clip_model} {comfy_dir}/models/text_encoders/qwen_3_4b.safetensors",
        shell=True,
        check=True,
    )
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/clip && "
        f"ln -s {clip_model} {comfy_dir}/models/clip/qwen_3_4b.safetensors",
        shell=True,
        check=True,
    )
    print("✅ Z-Image-Turbo CLIP text encoder symlinked")
    
    # Symlink VAE (symlink as both ae.safetensors and z-image-turbo-vae.safetensors for compatibility)
    # Note: ae.safetensors may already exist from Flux Dev, so we use -f to overwrite if needed
    # Both Flux and Z-Image use the same VAE (Flux VAE), so this is safe
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/vae && "
        f"ln -sf {vae_model} {comfy_dir}/models/vae/ae.safetensors && "
        f"ln -sf {vae_model} {comfy_dir}/models/vae/z-image-turbo-vae.safetensors",
        shell=True,
        check=True,
    )
    print("✅ Z-Image-Turbo VAE symlinked (as both ae.safetensors and z-image-turbo-vae.safetensors)")
    print("✅ Z-Image-Turbo models downloaded successfully")


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
    .apt_install(["git", "wget", "curl", "libgl1", "libglib2.0-0"])  # libGL for OpenCV/cv2
    .uv_pip_install(f"fastapi[standard]=={FASTAPI_VERSION}")
    .uv_pip_install(f"comfy-cli=={COMFY_CLI_VERSION}")
    .add_local_file("utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)
    .add_local_file("utils/comfyui.py", "/root/utils/comfyui.py", copy=True)
    .add_local_file("utils/image_utils.py", "/root/utils/image_utils.py", copy=True)
    # Add workflow files (from modal app root)
    .add_local_file("../../workflows/seedvr2.json", "/root/workflows/seedvr2.json", copy=True)
    .add_local_file("../../workflows/seedvr2_api.json", "/root/workflows/seedvr2_api.json", copy=True)
    # Add handlers directory
    .add_local_dir("handlers", "/root/handlers", copy=True)
    .run_commands(
        f"comfy --skip-prompt install --fast-deps --nvidia --version {COMFYUI_VERSION}"
    )
    # Install InstantID custom node (direct git clone with uv pip for consistency)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d ComfyUI_InstantID ]; then cd ComfyUI_InstantID && git pull; else git clone https://github.com/cubiq/ComfyUI_InstantID.git ComfyUI_InstantID; fi"
    )
    # Install dependencies using uv pip (consistent with Modal image Python environment)
    # Use opencv-python-headless (no GUI dependencies) instead of opencv-python
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "uv pip install --system opencv-python-headless insightface onnxruntime onnxruntime-gpu && "
        "(if [ -f requirements.txt ]; then uv pip install --system -r requirements.txt; fi) && "
        "echo '✅ InstantID dependencies installed'"
    )
    # Verify node structure
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "if [ -f nodes.py ] || [ -f __init__.py ]; then "
        "    echo '✅ InstantID custom node files found'; "
        "    ls -la *.py | head -5; "
        "else "
        "    echo '❌ InstantID custom node files not found'; "
        "    exit 1; "
        "fi"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID && "
        "if [ -f nodes.py ] || [ -f __init__.py ]; then "
        "    echo '✅ InstantID custom node files found'; "
        "    python3 -c 'import sys; sys.path.insert(0, \"/root/comfy/ComfyUI\"); from custom_nodes.ComfyUI_InstantID import nodes; print(\"✅ InstantID node importable\")' || echo '⚠️  InstantID node import failed (may still work at runtime)'; "
        "else "
        "    echo '❌ InstantID custom node files not found'; "
        "    exit 1; "
        "fi"
    )
    # Install XLabs-AI x-flux-comfyui custom node (for Flux IP-Adapter)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "if [ -d x-flux-comfyui ]; then cd x-flux-comfyui && git pull; else git clone https://github.com/XLabs-AI/x-flux-comfyui.git x-flux-comfyui; fi"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/x-flux-comfyui && "
        "python3 setup.py && "
        "echo '✅ XLabs-AI x-flux-comfyui installed'"
    )
    # Install SeedVR2 custom node
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git ComfyUI-SeedVR2_VideoUpscaler || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-SeedVR2_VideoUpscaler && "
        "(if [ -f requirements.txt ]; then uv pip install --system -r requirements.txt; else echo 'No requirements.txt'; fi) || echo 'SeedVR2 requirements install failed (may still work)'"
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
    .uv_pip_install("huggingface-hub>=0.20.0")  # Updated to support is_offline_mode
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
        hf_download_sdxl,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
        secrets=[huggingface_secret] if huggingface_secret else [],
    )
    .run_function(
        hf_download_flux_ipadapter,
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
    .run_function(
        hf_download_z_image,
        volumes={"/cache": hf_cache_vol} if hf_cache_vol else {},
        secrets=[huggingface_secret] if huggingface_secret else [],
    )
)
