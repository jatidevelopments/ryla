"""
RYLA Unified ComfyUI Workflows - Modal Serverless Implementation

This implements multiple RYLA workflows on Modal:
- Flux Dev (text-to-image, MVP primary model)
- Flux Schnell (text-to-image, test)
- InstantID (face consistency, MVP)
- LoRA loading (character consistency, MVP)
- Wan2.1 (text-to-video, Phase 2+)
- Z-Image-Turbo Danrisi (text-to-image with custom nodes)

Deploy: modal deploy apps/modal/comfyui_ryla.py
"""

import modal
import json
import subprocess
import base64
import uuid
import time
from pathlib import Path
from typing import Optional, Dict, Any, Literal

# Import cost tracking
import sys
sys.path.insert(0, "/root")
sys.path.insert(0, "/root/utils")
from utils.cost_tracker import CostTracker, get_cost_summary

# Define persistent volume for models
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Build Modal Image with ComfyUI
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(["git", "wget", "curl"])
    .uv_pip_install("fastapi[standard]==0.115.4")
    .uv_pip_install("comfy-cli==1.5.3")
    .add_local_file("apps/modal/utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)
    .add_local_file("apps/modal/utils/comfyui.py", "/root/utils/comfyui.py", copy=True)
    .add_local_file("apps/modal/utils/image_utils.py", "/root/utils/image_utils.py", copy=True)
    .add_local_file("workflows/seedvr2.json", "/root/workflows/seedvr2.json", copy=True)
    .run_commands(
        "comfy --skip-prompt install --fast-deps --nvidia --version 0.3.71"
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
    # Install SeedVR2 custom node (for realistic upscaling)
    # Use the official repository by numz (original author)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler.git ComfyUI-SeedVR2_VideoUpscaler || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-SeedVR2_VideoUpscaler && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Also try installing via ComfyUI Manager as fallback
    .run_commands(
        "cd /root/comfy/ComfyUI && "
        "(python custom_nodes/ComfyUI-Manager/cm-cli.py install ComfyUI-SeedVR2_VideoUpscaler || true) || echo 'Manager install skipped'"
    )
    # Install ComfyUI-Easy-Use (required for SeedVR2 workflow - GPU cleanup nodes)
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/yolain/ComfyUI-Easy-Use.git ComfyUI-Easy-Use || true"
    )
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Easy-Use && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
    # Install workflow converter plugin (for UI to API format conversion)
    # This is the official converter: comfyui-workflow-to-api-converter-endpoint
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes && "
        "git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git comfyui-workflow-to-api-converter-endpoint || true"
    )
    # Install requirements if any
    .run_commands(
        "cd /root/comfy/ComfyUI/custom_nodes/comfyui-workflow-to-api-converter-endpoint && "
        "(pip install -r requirements.txt || true) || echo 'No requirements.txt'"
    )
)

# Download Flux Schnell model
def hf_download_flux():
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

# Download Flux Dev models (MVP primary model)
def hf_download_flux_dev():
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
            token=token,  # Pass token for gated repo access
        )
        
        # Download CLIP and T5 encoders
        # Note: Flux Dev text encoders are in separate repos or different structure
        # Based on ComfyUI workflows, they expect files in text_encoders/ directory
        # Try downloading from the main repo or use snapshot_download for entire repo
        
        print("📥 Downloading text encoders (CLIP + T5)...")
        # Flux Dev text encoders are in a separate repo: comfyanonymous/flux_text_encoders
        # Based on workflow JSON: libs/comfyui-workflows/flux/text_to_image/flux_dev_t5fp16.json
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
        # UNET model (for UNETLoader) - can be in checkpoints or diffusion_models
        # Symlink to both for compatibility
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/checkpoints {comfy_dir}/models/diffusion_models && "
            f"ln -s {flux_dev_model} {comfy_dir}/models/checkpoints/flux1-dev.safetensors && "
            f"ln -s {flux_dev_model} {comfy_dir}/models/diffusion_models/flux1-dev.safetensors",
            shell=True,
            check=True,
        )
        
        # CLIP
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/clip && "
            f"ln -s {clip_model} {comfy_dir}/models/clip/clip_l.safetensors",
            shell=True,
            check=True,
        )
        
        # T5 (text encoder)
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/text_encoders && "
            f"ln -s {t5_model} {comfy_dir}/models/text_encoders/t5xxl_fp16.safetensors",
            shell=True,
            check=True,
        )
        
        # VAE
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

# Download InstantID models (MVP face consistency)
def hf_download_instantid():
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Get HF token from environment (set via Modal Secret)
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    # Download InstantID IP-Adapter
    # Path: ip-adapter.bin is in the root of InstantX/InstantID repo
    print("📥 Downloading InstantID IP-Adapter...")
    ipadapter_model = hf_hub_download(
        repo_id="InstantX/InstantID",
        filename="ip-adapter.bin",
        cache_dir="/cache",
        token=token,
    )
    
    # Download InstantID ControlNet
    # Note: ControlNet model may not be in InstantID repo - it might need to be downloaded separately
    # For now, skip ControlNet download and let ComfyUI_InstantID handle it on first use
    # Or download from a known working source
    print("📥 Downloading InstantID ControlNet...")
    print("   ⚠️  Note: ControlNet model may need manual download or be auto-downloaded by ComfyUI_InstantID")
    
    # Try to list files in repo to find ControlNet
    try:
        from huggingface_hub import list_repo_files
        files = list_repo_files(repo_id="InstantX/InstantID", repo_type="model", token=token)
        controlnet_files = [f for f in files if 'controlnet' in f.lower() or f.endswith('.safetensors')]
        print(f"   Found {len(controlnet_files)} potential ControlNet files in repo")
        
        # Try to download the actual safetensors model file (not config)
        controlnet_model = None
        for file_path in controlnet_files:
            # Only download .safetensors files, not config files
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
            print("   ⚠️  ControlNet not found in InstantID repo - will be downloaded by ComfyUI_InstantID on first use")
            # Create placeholder - ComfyUI_InstantID will download it
            controlnet_model = None
    except Exception as e:
        print(f"   ⚠️  Could not list repo files: {e}")
        print("   ⚠️  ControlNet will be downloaded by ComfyUI_InstantID on first use")
        controlnet_model = None
    
    # InsightFace models will be downloaded automatically by ComfyUI_InstantID on first use
    # We just need to ensure the directory exists
    insightface_dir = comfy_dir / "models" / "insightface" / "models"
    insightface_dir.mkdir(parents=True, exist_ok=True)
    print("Note: InsightFace models will be downloaded automatically by InstantID node on first use")
    
    # Symlink InstantID models
    # IP-Adapter
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/instantid && "
        f"ln -s {ipadapter_model} {comfy_dir}/models/instantid/ip-adapter.bin",
        shell=True,
        check=True,
    )
    
    # ControlNet (only if downloaded)
    if controlnet_model:
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/controlnet && "
            f"ln -s {controlnet_model} {comfy_dir}/models/controlnet/diffusion_pytorch_model.safetensors",
            shell=True,
            check=True,
        )
        print("   ✅ ControlNet model symlinked")
    else:
        print("   ⚠️  ControlNet model not downloaded - ComfyUI_InstantID will download it on first use")
        # Ensure directory exists
        subprocess.run(
            f"mkdir -p {comfy_dir}/models/controlnet",
            shell=True,
            check=True,
        )

# Download Wan2.1 models
def hf_download_wan2():
    from huggingface_hub import hf_hub_download

    # Download Wan2.1 T2V model (1.3B - smaller, faster for testing)
    wan_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        cache_dir="/cache",
    )

    # Download CLIP model (text encoder)
    clip_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        cache_dir="/cache",
    )

    # Download VAE model
    vae_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/vae/wan_2.1_vae.safetensors",
        cache_dir="/cache",
    )

    # Symlink models to the right ComfyUI directories
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Diffusion model
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/diffusion_models && ln -s {wan_model} {comfy_dir}/models/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        shell=True,
        check=True,
    )
    
    # CLIP model (text encoder)
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/text_encoders && ln -s {clip_model} {comfy_dir}/models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        shell=True,
        check=True,
    )
    
    # VAE model
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/vae && ln -s {vae_model} {comfy_dir}/models/vae/wan_2.1_vae.safetensors",
        shell=True,
        check=True,
    )

# Download SeedVR2 models (for realistic upscaling)
def hf_download_seedvr2():
    from huggingface_hub import hf_hub_download
    import os
    
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Get HF token from environment (set via Modal Secret)
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    
    try:
        # Try official repository first: numz/SeedVR2_comfyUI
        # Fallback: AInVFX/SeedVR2_comfyUI (additional models)
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
            # Try alternative repository
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
        
        # Create SeedVR2 models directory (custom location for SeedVR2)
        seedvr2_dir = comfy_dir / "models" / "seedvr2"
        seedvr2_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy models instead of symlinking (more reliable at runtime)
        # Symlinks can break if cache paths change
        import shutil
        shutil.copy2(dit_model, seedvr2_dir / "seedvr2_ema_7b_fp16.safetensors")
        shutil.copy2(vae_model, seedvr2_dir / "ema_vae_fp16.safetensors")
        
        print(f"   ✅ Models copied to {seedvr2_dir}")
        
        print("✅ SeedVR2 models downloaded successfully")
    except Exception as e:
        print(f"⚠️  Failed to download SeedVR2 models: {e}")
        print("   SeedVR2 upscaling endpoint will not be available")
        # Don't raise - make it optional

# Create Modal Secret for HuggingFace token (if available)
# Users should create this secret: modal secret create huggingface HF_TOKEN=<token>
# Note: Secret is optional - if not found, Flux Dev download will be skipped
# We'll handle this in the function itself, not at module level

# Build image with model downloads
image = (
    image.uv_pip_install("huggingface-hub==0.36.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
    .run_function(
        hf_download_flux,
        volumes={"/cache": hf_cache_vol},
    )
    # Flux Dev download (requires HF token - paths fixed!)
    # Text encoders are in comfyanonymous/flux_text_encoders repo
    .run_function(
        hf_download_flux_dev,
        volumes={"/cache": hf_cache_vol},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    # InstantID download (MVP face consistency - paths fixed with fallbacks)
    .run_function(
        hf_download_instantid,
        volumes={"/cache": hf_cache_vol},
        secrets=[modal.Secret.from_name("huggingface")],
    )
    .run_function(
        hf_download_wan2,
        volumes={"/cache": hf_cache_vol},
    )
    # SeedVR2 download (realistic upscaling - requires HF token)
    .run_function(
        hf_download_seedvr2,
        volumes={"/cache": hf_cache_vol},
        secrets=[modal.Secret.from_name("huggingface")],
    )
)

app = modal.App(name="ryla-comfyui", image=image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu="L40S",
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[modal.Secret.from_name("huggingface")],  # HF token for runtime access
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        # Check server health
        self.poll_server_health()

        # Execute workflow using utility
        from utils.comfyui import execute_workflow
        return execute_workflow(workflow_path)

    def _flux_impl(self, item: Dict):
        """Internal implementation for Flux Schnell text-to-image generation."""
        from fastapi import Response
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        # Load Flux workflow template
        workflow_data = {
            "6": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item["prompt"],
                    "clip": ["4", 1],
                },
            },
            "4": {
                "class_type": "CheckpointLoaderSimple",
                "inputs": {
                    "ckpt_name": "flux1-schnell-fp8.safetensors",
                },
            },
            "9": {
                "class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": uuid.uuid4().hex,
                    "images": ["10", 0],
                },
            },
            "10": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["5", 0],
                    "vae": ["4", 2],
                },
            },
            "5": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": item.get("seed", 42),
                    "steps": item.get("steps", 4),
                    "cfg": item.get("cfg", 1.0),
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1.0,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["3", 0],
                },
            },
            "7": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item.get("negative_prompt", ""),
                    "clip": ["4", 1],
                },
            },
            "3": {
                "class_type": "EmptySD3LatentImage",
                "inputs": {
                    "width": item.get("width", 1024),
                    "height": item.get("height", 1024),
                    "batch_size": 1,
                },
            },
        }

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        img_bytes = self.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def _flux_dev_impl(self, item: Dict):
        """API endpoint for Flux Dev text-to-image generation (MVP primary model)."""
        from fastapi import Response
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        # Build Flux Dev workflow using separate loaders (UNETLoader, DualCLIPLoader, VAELoader)
        # This matches the structure from libs/comfyui-workflows/flux/text_to_image/flux_dev_t5fp16.json
        workflow_data = {
            # Model loaders
            "1": {
                "class_type": "UNETLoader",
                "inputs": {
                    "unet_name": "flux1-dev.safetensors",
                    "weight_dtype": "default",
                },
            },
            "2": {
                "class_type": "DualCLIPLoader",
                "inputs": {
                    "clip_name1": "t5xxl_fp16.safetensors",  # T5 encoder
                    "clip_name2": "clip_l.safetensors",      # CLIP encoder
                    "type": "flux",
                    "device": "default",
                },
            },
            "3": {
                "class_type": "VAELoader",
                "inputs": {
                    "vae_name": "ae.safetensors",
                },
            },
            # Prompt encoding
            "4": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item["prompt"],
                    "clip": ["2", 0],  # DualCLIPLoader output
                },
            },
            "5": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item.get("negative_prompt", ""),
                    "clip": ["2", 0],
                },
            },
            # Latent image
            "6": {
                "class_type": "EmptySD3LatentImage",
                "inputs": {
                    "width": item.get("width", 1024),
                    "height": item.get("height", 1024),
                    "batch_size": 1,
                },
            },
            # Sampling
            "7": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": item.get("seed", 42),
                    "steps": item.get("steps", 20),
                    "cfg": item.get("cfg", 1.0),
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1.0,
                    "model": ["1", 0],  # UNETLoader output
                    "positive": ["4", 0],
                    "negative": ["5", 0],
                    "latent_image": ["6", 0],
                },
            },
            # Decode and save
            "8": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["7", 0],
                    "vae": ["3", 0],  # VAELoader output
                },
            },
            "9": {
                "class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": uuid.uuid4().hex,
                    "images": ["8", 0],
                },
            },
        }

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        img_bytes = self.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-dev", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def _flux_instantid_impl(self, item: Dict):
        """API endpoint for Flux Dev + InstantID face consistency generation (MVP)."""
        from fastapi import Response
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        if "reference_image" not in item:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="reference_image is required")

        # Build Flux Dev + InstantID workflow
        # Based on z-image-instantid.ts but adapted for Flux Dev
        workflow_data = {
            # Model loaders (Flux Dev - separate loaders)
            "1": {
                "class_type": "UNETLoader",
                "inputs": {
                    "unet_name": "flux1-dev.safetensors",
                    "weight_dtype": "default",
                },
            },
            "2": {
                "class_type": "DualCLIPLoader",
                "inputs": {
                    "clip_name1": "t5xxl_fp16.safetensors",
                    "clip_name2": "clip_l.safetensors",
                    "type": "flux",
                    "device": "default",
                },
            },
            "3": {
                "class_type": "VAELoader",
                "inputs": {
                    "vae_name": "ae.safetensors",
                },
            },
            # InstantID setup
            "20": {
                "class_type": "InsightFaceLoader",
                "inputs": {
                    "provider": item.get("face_provider", "CPU"),
                },
            },
            "21": {
                "class_type": "InstantIDModelLoader",
                "inputs": {
                    "instantid_file": "ip-adapter.bin",
                },
            },
            "22": {
                "class_type": "InstantIDControlNetLoader",
                "inputs": {
                    "controlnet_name": "diffusion_pytorch_model.safetensors",
                },
            },
            # Reference image
            "23": {
                "class_type": "LoadImage",
                "inputs": {
                    "image": item["reference_image"],  # Can be base64 data URL or file path
                },
            },
            # Apply InstantID
            "24": {
                "class_type": "ApplyInstantID",
                "inputs": {
                    "insightface": ["20", 0],
                    "instantid": ["21", 0],
                    "controlnet": ["22", 0],
                    "image": ["23", 0],
                    "weight": item.get("instantid_strength", 0.8),
                    "controlnet_conditioning_scale": item.get("controlnet_strength", 0.8),
                },
            },
            # Prompt encoding
            "4": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item["prompt"],
                    "clip": ["2", 0],  # DualCLIPLoader output
                },
            },
            "5": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item.get("negative_prompt", ""),
                    "clip": ["2", 0],
                },
            },
            # Combine prompt + InstantID
            "25": {
                "class_type": "ConditioningCombine",
                "inputs": {
                    "conditioning_1": ["4", 0],
                    "conditioning_2": ["24", 0],
                },
            },
            # Apply ControlNet
            "26": {
                "class_type": "ControlNetApplyAdvanced",
                "inputs": {
                    "positive": ["25", 0],
                    "negative": ["5", 0],
                    "control_net": ["22", 0],
                    "image": ["24", 1],
                    "strength": item.get("controlnet_strength", 0.8),
                    "start_percent": 0.0,
                    "end_percent": 1.0,
                },
            },
            # Latent image
            "6": {
                "class_type": "EmptySD3LatentImage",
                "inputs": {
                    "width": item.get("width", 1024),
                    "height": item.get("height", 1024),
                    "batch_size": 1,
                },
            },
            # Sampling
            "8": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": item.get("seed", 42),
                    "steps": item.get("steps", 20),
                    "cfg": item.get("cfg", 1.0),
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1.0,
                    "model": ["1", 0],  # UNETLoader output
                    "positive": ["26", 0],
                    "negative": ["26", 1],
                    "latent_image": ["6", 0],
                },
            },
            # Decode and save
            "9": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["8", 0],
                    "vae": ["3", 0],  # VAELoader output
                },
            },
            "10": {
                "class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": uuid.uuid4().hex,
                    "images": ["9", 0],
                },
            },
        }

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        img_bytes = self.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-instantid", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def _flux_lora_impl(self, item: Dict):
        """API endpoint for Flux Dev + LoRA character-specific generation (MVP)."""
        from fastapi import Response, HTTPException
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        if "lora_id" not in item:
            raise HTTPException(status_code=400, detail="lora_id is required")

        lora_id = item["lora_id"]
        lora_filename = f"character-{lora_id}.safetensors"
        
        # Check LoRA in ComfyUI loras directory (models should be symlinked there from volume)
        comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{lora_filename}")
        volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
        
        # If LoRA exists in volume but not in ComfyUI directory, symlink it
        if volume_lora_path.exists() and not comfy_lora_path.exists():
            comfy_lora_path.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(
                f"ln -s {volume_lora_path} {comfy_lora_path}",
                shell=True,
                check=False,
            )
        
        # Check if LoRA exists (in ComfyUI directory or volume)
        if not comfy_lora_path.exists() and not volume_lora_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"LoRA {lora_id} not found. Expected: {lora_filename} in /root/models/loras/ or /root/comfy/ComfyUI/models/loras/"
            )

        # Build Flux Dev + LoRA workflow
        workflow_data = {
            # Model loaders (Flux Dev - separate loaders)
            "1": {
                "class_type": "UNETLoader",
                "inputs": {
                    "unet_name": "flux1-dev.safetensors",
                    "weight_dtype": "default",
                },
            },
            "2": {
                "class_type": "DualCLIPLoader",
                "inputs": {
                    "clip_name1": "t5xxl_fp16.safetensors",
                    "clip_name2": "clip_l.safetensors",
                    "type": "flux",
                    "device": "default",
                },
            },
            "3": {
                "class_type": "VAELoader",
                "inputs": {
                    "vae_name": "ae.safetensors",
                },
            },
            # LoRA loader
            "30": {
                "class_type": "LoraLoader",
                "inputs": {
                    "model": ["1", 0],  # UNETLoader output
                    "clip": ["2", 0],   # DualCLIPLoader output
                    "lora_name": lora_filename,
                    "strength_model": item.get("lora_strength", 1.0),
                    "strength_clip": item.get("lora_strength", 1.0),
                },
            },
            # Prompt encoding (with trigger word if provided)
            "4": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": f"{item.get('trigger_word', '')} {item['prompt']}".strip(),
                    "clip": ["30", 1],  # Use LoRA-modified CLIP
                },
            },
            "5": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item.get("negative_prompt", ""),
                    "clip": ["30", 1],
                },
            },
            # Latent image
            "6": {
                "class_type": "EmptySD3LatentImage",
                "inputs": {
                    "width": item.get("width", 1024),
                    "height": item.get("height", 1024),
                    "batch_size": 1,
                },
            },
            # Sampling
            "8": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": item.get("seed", 42),
                    "steps": item.get("steps", 20),
                    "cfg": item.get("cfg", 1.0),
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1.0,
                    "model": ["30", 0],  # Use LoRA-modified model
                    "positive": ["4", 0],
                    "negative": ["5", 0],
                    "latent_image": ["6", 0],
                },
            },
            # Decode and save
            "9": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["8", 0],
                    "vae": ["3", 0],  # VAELoader output
                },
            },
            "10": {
                "class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": uuid.uuid4().hex,
                    "images": ["9", 0],
                },
            },
        }

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        img_bytes = self.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-lora", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def _workflow_impl(self, item: Dict):
        """API endpoint for custom workflow JSON (supports any workflow type)."""
        from fastapi import Response
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        workflow_data = item["workflow"]
        
        # Update prompt if provided
        if "prompt" in item:
            # Find CLIPTextEncode nodes and update
            for node in workflow_data.values():
                if node.get("class_type") == "CLIPTextEncode":
                    if "text" in node.get("inputs", {}):
                        node["inputs"]["text"] = item["prompt"]

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        output_bytes = self.infer.local(workflow_file)

        # Determine content type based on file extension or workflow
        content_type = "application/octet-stream"
        if any(node.get("class_type") == "SaveAnimatedWEBP" for node in workflow_data.values()):
            content_type = "image/webp"
        elif any(node.get("class_type") == "SaveImage" for node in workflow_data.values()):
            content_type = "image/jpeg"
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("workflow", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(output_bytes, media_type=content_type)
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    @modal.asgi_app()
    def fastapi_app(self):
        """Single FastAPI app with all routes to avoid endpoint limit."""
        from fastapi import FastAPI, Request
        from fastapi.responses import Response as FastAPIResponse
        
        fastapi = FastAPI(title="RYLA ComfyUI API")
        
        # Store instance reference for route handlers
        comfyui_instance = self
        
        @fastapi.post("/flux")
        async def flux_route(request: Request):
            item = await request.json()
            result = comfyui_instance._flux_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/flux-dev")
        async def flux_dev_route(request: Request):
            item = await request.json()
            result = comfyui_instance._flux_dev_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/flux-instantid")
        async def flux_instantid_route(request: Request):
            item = await request.json()
            result = comfyui_instance._flux_instantid_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/flux-lora")
        async def flux_lora_route(request: Request):
            item = await request.json()
            result = comfyui_instance._flux_lora_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/wan2")
        async def wan2_route(request: Request):
            item = await request.json()
            result = comfyui_instance._wan2_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/workflow")
        async def workflow_route(request: Request):
            item = await request.json()
            result = comfyui_instance._workflow_impl(item)
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
            # Preserve cost tracking headers
            for key, value in result.headers.items():
                if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                    response.headers[key] = value
            return response
        
        @fastapi.post("/seedvr2")
        async def seedvr2_route(request: Request):
            try:
                item = await request.json()
                result = comfyui_instance._seedvr2_impl(item)
                response = FastAPIResponse(
                    content=result.body,
                    media_type=result.media_type,
                )
                # Preserve cost tracking headers
                for key, value in result.headers.items():
                    if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                        response.headers[key] = value
                return response
            except Exception as e:
                import traceback
                error_msg = str(e)
                error_trace = traceback.format_exc()
                print(f"❌ SeedVR2 error: {error_msg}")
                print(f"   Traceback: {error_trace}")
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": error_msg,
                        "details": error_trace if "ValueError" in str(type(e)) else None
                    }
                )
        
        return fastapi

    def _wan2_impl(self, item: Dict):
        """Internal implementation for Wan2.1 text-to-video generation."""
        from fastapi import Response
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()

        # Load Wan2.1 workflow template (matching libs/comfyui-workflows-api/video/wan2.1/native/wan2.1_t2v.api.json)
        workflow_data = {
            "3": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": item.get("seed", 839327983272663),
                    "steps": item.get("steps", 30),
                    "cfg": item.get("cfg", 6),
                    "sampler_name": "uni_pc",
                    "scheduler": "simple",
                    "denoise": 1,
                    "model": ["48", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["40", 0],
                },
            },
            "6": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item["prompt"],
                    "clip": ["38", 0],
                },
            },
            "7": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": item.get("negative_prompt", ""),
                    "clip": ["38", 0],
                },
            },
            "8": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["39", 0],
                },
            },
            "28": {
                "class_type": "SaveAnimatedWEBP",
                "inputs": {
                    "filename_prefix": uuid.uuid4().hex,
                    "fps": item.get("fps", 16),
                    "lossless": False,
                    "quality": item.get("quality", 90),
                    "method": "default",
                    "images": ["8", 0],
                },
            },
            "37": {
                "class_type": "UNETLoader",
                "inputs": {
                    "unet_name": "wan2.1_t2v_1.3B_fp16.safetensors",
                    "weight_dtype": "default",
                },
            },
            "38": {
                "class_type": "CLIPLoader",
                "inputs": {
                    "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                    "type": "wan",
                    "device": "default",
                },
            },
            "39": {
                "class_type": "VAELoader",
                "inputs": {
                    "vae_name": "wan_2.1_vae.safetensors",
                },
            },
            "40": {
                "class_type": "EmptyHunyuanLatentVideo",
                "inputs": {
                    "width": item.get("width", 832),
                    "height": item.get("height", 480),
                    "length": item.get("length", 33),
                    "batch_size": 1,
                },
            },
            "48": {
                "class_type": "ModelSamplingSD3",
                "inputs": {
                    "shift": 8,
                    "model": ["37", 0],
                },
            },
        }

        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))

        # Run inference
        video_bytes = self.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan2", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost in headers
        response = Response(video_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def _seedvr2_impl(self, item: Dict):
        """Internal implementation for SeedVR2 realistic upscaling."""
        from fastapi import Response
        from PIL import Image
        import io
        import urllib.request
        import urllib.error
        
        # Start cost tracking
        from utils.cost_tracker import CostTracker, get_cost_summary
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Check if SeedVR2 models are available
        comfy_dir = Path("/root/comfy/ComfyUI")
        seedvr2_dir = comfy_dir / "models" / "seedvr2"
        dit_model = seedvr2_dir / "seedvr2_ema_7b_fp16.safetensors"
        vae_model = seedvr2_dir / "ema_vae_fp16.safetensors"
        
        # Also check cache location (models might be there from build)
        cache_dir = Path("/cache")
        cache_dit = None
        cache_vae = None
        if cache_dir.exists():
            # Check common cache locations
            for possible_path in [
                cache_dir / "models--numz--SeedVR2_comfyUI" / "snapshots",
                cache_dir / "models--AInVFX--SeedVR2_comfyUI" / "snapshots",
            ]:
                if possible_path.exists():
                    for snapshot_dir in possible_path.iterdir():
                        if (snapshot_dir / "seedvr2_ema_7b_fp16.safetensors").exists():
                            cache_dit = snapshot_dir / "seedvr2_ema_7b_fp16.safetensors"
                        if (snapshot_dir / "ema_vae_fp16.safetensors").exists():
                            cache_vae = snapshot_dir / "ema_vae_fp16.safetensors"
        
        # If models not in seedvr2_dir, try to copy from cache
        if (not dit_model.exists() or not vae_model.exists()) and cache_dit and cache_vae:
            print(f"📦 Copying models from cache to {seedvr2_dir}")
            import shutil
            seedvr2_dir.mkdir(parents=True, exist_ok=True)
            if not dit_model.exists():
                shutil.copy2(cache_dit, dit_model)
            if not vae_model.exists():
                shutil.copy2(cache_vae, vae_model)
            print(f"   ✅ Models copied")
        
        if not dit_model.exists() or not vae_model.exists():
            execution_time = tracker.stop()
            error_msg = "SeedVR2 models not found. Please upload models to /root/comfy/ComfyUI/models/seedvr2/"
            if not dit_model.exists():
                error_msg += f"\nMissing: {dit_model.name}"
            if not vae_model.exists():
                error_msg += f"\nMissing: {vae_model.name}"
            error_msg += "\n\nModels can be uploaded manually or downloaded from the correct HuggingFace repository."
            raise ValueError(error_msg)
        
        # Check server health
        self.poll_server_health()
        
        # Verify SeedVR2 nodes are loaded
        try:
            object_info_request = urllib.request.Request(f"{comfy_url}/object_info")
            object_info_response = urllib.request.urlopen(object_info_request, timeout=10)
            object_info = json.loads(object_info_response.read().decode("utf-8"))
            available_node_types = set(object_info.keys())
            
            seedvr2_nodes = [n for n in available_node_types if "seedvr2" in n.lower() or "SeedVR2" in n]
            if seedvr2_nodes:
                print(f"✅ Found SeedVR2 nodes: {seedvr2_nodes}")
            else:
                print(f"⚠️  SeedVR2 nodes not found. Available nodes: {len(available_node_types)} total")
                # Check if custom node directory exists
                seedvr2_dir = Path("/root/comfy/ComfyUI/custom_nodes/ComfyUI-SeedVR2_VideoUpscaler")
                if seedvr2_dir.exists():
                    print(f"   Custom node directory exists: {seedvr2_dir}")
                    py_files = list(seedvr2_dir.glob("*.py"))
                    print(f"   Python files found: {len(py_files)}")
                else:
                    print(f"   ⚠️  Custom node directory not found: {seedvr2_dir}")
        except Exception as e:
            print(f"⚠️  Could not check object_info: {e}")
        
        # Get image input (base64)
        image_data = item.get("image")
        if not image_data:
            raise ValueError("Missing 'image' field in request. Provide base64-encoded image.")
        
        # Handle base64 image
        if isinstance(image_data, str):
            if image_data.startswith("data:image"):
                # Remove data URL prefix
                image_data = image_data.split(",", 1)[1]
            
            # Decode base64
            try:
                image_bytes = base64.b64decode(image_data)
            except Exception as e:
                raise ValueError(f"Invalid base64 image data: {e}")
        else:
            raise ValueError("Image must be base64-encoded string")
        
        # Upload image to ComfyUI via HTTP API
        comfy_url = f"http://127.0.0.1:{self.port}"
        image_filename = f"seedvr2_input_{uuid.uuid4().hex[:8]}.png"
        
        # Upload image
        upload_data = {
            "image": image_filename,
            "overwrite": True
        }
        
        # ComfyUI upload endpoint expects multipart/form-data
        # We'll use a simpler approach: save to input directory directly
        comfy_dir = Path("/root/comfy/ComfyUI")
        input_dir = comfy_dir / "input"
        input_dir.mkdir(parents=True, exist_ok=True)
        image_path = input_dir / image_filename
        
        # Validate and save image
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(image_path, "PNG")
            print(f"✅ Saved input image: {image_filename}")
        except Exception as e:
            raise ValueError(f"Invalid image format: {e}")
        
        # Load SeedVR2 workflow and convert UI format to API format
        # Try using ComfyUI's converter endpoint if available, otherwise use workflow_impl
        workflow_path = Path(__file__).parent.parent.parent / "workflows" / "seedvr2.json"
        if not workflow_path.exists():
            workflow_path = Path("/root/workflows/seedvr2.json")
            if not workflow_path.exists():
                raise FileNotFoundError(f"SeedVR2 workflow not found at {workflow_path}")
        
        with open(workflow_path, "r") as f:
            workflow_ui = json.load(f)
        
        # Try to convert using ComfyUI's converter endpoint
        comfy_url = f"http://127.0.0.1:{self.port}"
        workflow_api = None
        
        try:
            # Try converter endpoint
            convert_data = json.dumps(workflow_ui).encode("utf-8")
            convert_request = urllib.request.Request(
                f"{comfy_url}/workflow/convert",
                data=convert_data,
                headers={"Content-Type": "application/json"},
            )
            convert_response = urllib.request.urlopen(convert_request, timeout=10)
            convert_result = json.loads(convert_response.read().decode("utf-8"))
            workflow_api = convert_result.get("prompt") or convert_result
            print("✅ Converted workflow using ComfyUI converter endpoint")
        except (urllib.error.HTTPError, urllib.error.URLError) as e:
            # Converter not available, use workflow_impl which handles UI format
            print(f"⚠️  Converter endpoint not available: {e}. Using workflow_impl method.")
            # Use the workflow_impl method which can handle UI format
            workflow_item = {
                "workflow": workflow_ui,
                "image_filename": image_filename  # Pass for reference
            }
            # Update LoadImage node in UI format
            for node in workflow_ui.get("nodes", []):
                if node.get("id") == 26 and "widgets_values" in node:  # LoadImage
                    node["widgets_values"][0] = image_filename
                    break
            
            # Use workflow_impl
            result = self._workflow_impl(workflow_item)
            # Clean up input image
            if image_path.exists():
                image_path.unlink()
            # Calculate cost
            execution_time = tracker.stop()
            cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
            print(f"💰 {get_cost_summary(cost_metrics)}")
            # Return with cost headers
            response = Response(result.body, media_type=result.media_type)
            response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
            response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
            response.headers["X-GPU-Type"] = cost_metrics.gpu_type
            return response
        
        # If we have API format workflow, update LoadImage node and execute
        if workflow_api:
            # Remove optional cleanup nodes if they don't exist (ComfyUI-Easy-Use nodes)
            # These are optional and can cause errors if the plugin isn't loaded
            optional_cleanup_nodes = [
                "easy clearCacheAll",
                "easy cleanGpuUsed",
            ]
            
            # Check which nodes are available via object_info
            try:
                object_info_request = urllib.request.Request(f"{comfy_url}/object_info")
                object_info_response = urllib.request.urlopen(object_info_request, timeout=10)
                object_info = json.loads(object_info_response.read().decode("utf-8"))
                available_node_types = set(object_info.keys())
                
                # Remove nodes that don't exist
                nodes_to_remove = []
                for node_id, node in workflow_api.items():
                    class_type = node.get("class_type", "")
                    if class_type in optional_cleanup_nodes and class_type not in available_node_types:
                        nodes_to_remove.append(node_id)
                        print(f"⚠️  Removing optional node {class_type} (not available)")
                
                # Remove nodes and update links
                for node_id in nodes_to_remove:
                    del workflow_api[node_id]
                    # Remove any links that reference this node
                    # (Links are in inputs, so we need to clean those up)
                    for other_node_id, other_node in workflow_api.items():
                        if "inputs" in other_node:
                            for input_key, input_value in list(other_node["inputs"].items()):
                                if isinstance(input_value, list) and len(input_value) > 0:
                                    if input_value[0] == node_id:
                                        # Remove this input (optional cleanup node output)
                                        del other_node["inputs"][input_key]
                                        print(f"   Removed link from {other_node_id}.{input_key} to {node_id}")
            except Exception as e:
                print(f"⚠️  Could not check object_info: {e}. Proceeding with workflow as-is.")
            
            # Find and update LoadImage node (node 26)
            for node_id, node in workflow_api.items():
                if node.get("class_type") == "LoadImage":
                    node["inputs"]["image"] = image_filename
                    break
            
            # Update SaveImage node filename
            for node_id, node in workflow_api.items():
                if node.get("class_type") == "SaveImage":
                    if "inputs" not in node:
                        node["inputs"] = {}
                    node["inputs"]["filename_prefix"] = f"seedvr2_upscaled_{uuid.uuid4().hex[:8]}"
                    break
            
            # Use HTTP API directly (more reliable than CLI)
            # Queue workflow via ComfyUI HTTP API
            prompt_data = json.dumps({"prompt": workflow_api}).encode("utf-8")
            request = urllib.request.Request(
                f"{comfy_url}/prompt",
                data=prompt_data,
                headers={"Content-Type": "application/json"},
            )
            
            try:
                response = urllib.request.urlopen(request, timeout=30)
                response_data = json.loads(response.read().decode("utf-8"))
                
                if "node_errors" in response_data and response_data["node_errors"]:
                    if image_path.exists():
                        image_path.unlink()
                    raise Exception(f"ComfyUI node errors: {json.dumps(response_data['node_errors'], indent=2)}")
                
                prompt_id = response_data.get("prompt_id")
                if not prompt_id:
                    if image_path.exists():
                        image_path.unlink()
                    raise Exception(f"ComfyUI did not return prompt_id. Response: {json.dumps(response_data, indent=2)}")
                
                # Poll for completion
                max_poll_time = 600  # 10 minutes for upscaling
                poll_interval = 2
                polled = 0
                
                while polled < max_poll_time:
                    # Check history
                    history_request = urllib.request.Request(f"{comfy_url}/history/{prompt_id}")
                    history_response = urllib.request.urlopen(history_request, timeout=10)
                    history_data = json.loads(history_response.read().decode("utf-8"))
                    
                    if prompt_id in history_data:
                        # Workflow completed - get output images
                        output_data = history_data[prompt_id]
                        
                        if "outputs" in output_data:
                            # Find SaveImage node output
                            for node_id, node_output in output_data["outputs"].items():
                                if "images" in node_output:
                                    for image_info in node_output["images"]:
                                        # Download image
                                        subfolder = image_info.get('subfolder', '')
                                        image_type = image_info.get('type', 'output')
                                        image_url = f"{comfy_url}/view?filename={image_info['filename']}&subfolder={subfolder}&type={image_type}"
                                        image_response = urllib.request.urlopen(image_url, timeout=30)
                                        output_bytes = image_response.read()
                                        
                                        # Clean up input image
                                        if image_path.exists():
                                            image_path.unlink()
                                        
                                        # Calculate cost
                                        execution_time = tracker.stop()
                                        cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
                                        print(f"💰 {get_cost_summary(cost_metrics)}")
                                        
                                        # Return response
                                        response = Response(output_bytes, media_type="image/png")
                                        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
                                        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
                                        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
                                        return response
                            
                            # No images found
                            if image_path.exists():
                                image_path.unlink()
                            raise Exception("Workflow completed but no images found in output")
                    
                    # Check if still running
                    queue_request = urllib.request.Request(f"{comfy_url}/queue")
                    queue_response = urllib.request.urlopen(queue_request, timeout=10)
                    queue_data = json.loads(queue_response.read().decode("utf-8"))
                    
                    # Check if prompt_id is still in queue
                    still_queued = False
                    for queue_item in queue_data.get("queue_running", []) + queue_data.get("queue_pending", []):
                        if isinstance(queue_item, list) and len(queue_item) > 1:
                            if queue_item[1] == prompt_id:
                                still_queued = True
                                break
                    
                    if not still_queued and prompt_id not in history_data:
                        if image_path.exists():
                            image_path.unlink()
                        raise Exception("Workflow not found in queue or history")
                    
                    time.sleep(poll_interval)
                    polled += poll_interval
                
                # Timeout
                if image_path.exists():
                    image_path.unlink()
                raise Exception(f"Workflow execution timed out after {max_poll_time} seconds")
                
            except urllib.error.HTTPError as e:
                if image_path.exists():
                    image_path.unlink()
                error_body = e.read().decode("utf-8") if hasattr(e, 'read') else str(e)
                try:
                    error_json = json.loads(error_body)
                    raise Exception(f"ComfyUI HTTP {e.code}: {error_json.get('error', {}).get('message', error_body)}")
                except:
                    raise Exception(f"Failed to queue workflow: HTTP {e.code} - {error_body[:500]}")
            except Exception as e:
                if image_path.exists():
                    image_path.unlink()
                raise
        
        # Clean up input image
        if image_path.exists():
            image_path.unlink()
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response
        response = Response(output_bytes, media_type="image/png")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response

    def poll_server_health(self) -> Dict:
        """Check if ComfyUI server is healthy."""
        import socket
        import urllib.request

        try:
            req = urllib.request.Request(f"http://127.0.0.1:{self.port}/system_stats")
            urllib.request.urlopen(req, timeout=5)
            print("✅ ComfyUI server is healthy")
        except (socket.timeout, urllib.error.URLError) as e:
            print(f"❌ Server health check failed: {str(e)}")
            modal.experimental.stop_fetching_inputs()
            raise Exception("ComfyUI server is not healthy, stopping container")


# Interactive UI (optional - for development)
@app.function(
    max_containers=1,
    gpu="L40S",
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
)
@modal.concurrent(max_inputs=10)
@modal.web_server(8000, startup_timeout=60)
def ui():
    """Launch ComfyUI UI for interactive use."""
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)
    print("✅ ComfyUI UI available at http://localhost:8000")
