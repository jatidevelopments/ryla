import modal

# Base image with ComfyUI
image_base = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(["git", "wget", "curl", "libgl1", "libglib2.0-0"])  # OpenGL libraries for RES4LYF nodes
    .uv_pip_install("fastapi[standard]==0.115.4")
    .uv_pip_install("comfy-cli==1.5.3")
    .run_commands(
        "comfy --skip-prompt install --fast-deps --nvidia --version latest"
    )
)

# Install custom nodes
install_commands = [
    # Install Manager packages: res4lyf
    # Install ComfyUI Manager first
    "cd /root/comfy/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager || true",
    "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Manager && (pip install -r requirements.txt || true) || true",

    # Install custom nodes via Manager CLI
    # Install RES4LYF via direct GitHub URL (not in Manager registry)
    "cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install https://github.com/ClownsharkBatwing/RES4LYF || true",
]

# Build image with custom nodes
image = image_base.run_commands(install_commands)
# Copy utils module for ComfyUI server management
image = image.add_local_file(
    "apps/modal/utils/comfyui.py",
    "/root/utils/comfyui.py",
    copy=True  # Required when followed by run_function
)

# Add huggingface-hub for model downloads
image = image.uv_pip_install("huggingface-hub>=0.20.0")


# ============ MODEL DOWNLOAD FUNCTION ============

def download_workflow_models():
    """Download models required by this workflow."""
    from huggingface_hub import hf_hub_download
    import subprocess
    import os
    from pathlib import Path

    comfy_dir = Path("/root/comfy/ComfyUI")
    if not comfy_dir.exists():
        comfy_dir = Path("/root/ComfyUI")
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")

    # Download z_image_turbo_bf16.safetensors (checkpoint)
    filename = "z_image_turbo_bf16.safetensors"  # Define filename variable for use in f-strings
    try:
        print(f"📥 Downloading {filename}...")
        model_path = hf_hub_download(
            repo_id="Comfy-Org/z_image_turbo",
            filename="split_files/diffusion_models/z_image_turbo_bf16.safetensors",
            cache_dir="/cache",
            token=token,
        )

        # Copy to checkpoints and diffusion_models
        import shutil
        subprocess.run(
            f"mkdir -p {{comfy_dir}}/models/checkpoints {{comfy_dir}}/models/diffusion_models",
            shell=True, check=False
        )
        shutil.copy2(model_path, comfy_dir / "models" / "checkpoints" / filename)
        shutil.copy2(model_path, comfy_dir / "models" / "diffusion_models" / filename)
        print(f"   ✅ {filename} downloaded and copied to ComfyUI directories")
    except Exception as e:
        print(f"   ⚠️  Failed to download {filename}: {{e}}")
        print(f"   Workflow may fail if this model is required")

    # Download qwen_3_4b.safetensors (text_encoder)
    filename = "qwen_3_4b.safetensors"  # Define filename variable for use in f-strings
    try:
        print(f"📥 Downloading {filename}...")
        model_path = hf_hub_download(
            repo_id="Comfy-Org/z_image_turbo",
            filename="split_files/text_encoders/qwen_3_4b.safetensors",
            cache_dir="/cache",
            token=token,
        )

        # Copy to text_encoders and clip
        import shutil
        subprocess.run(
            f"mkdir -p {{comfy_dir}}/models/text_encoders {{comfy_dir}}/models/clip",
            shell=True, check=False
        )
        shutil.copy2(model_path, comfy_dir / "models" / "text_encoders" / filename)
        shutil.copy2(model_path, comfy_dir / "models" / "clip" / filename)
        print(f"   ✅ {filename} downloaded and copied to ComfyUI directories")
    except Exception as e:
        print(f"   ⚠️  Failed to download {filename}: {{e}}")
        print(f"   Workflow may fail if this model is required")

    # Download z-image-turbo-vae.safetensors (vae)
    filename = "z-image-turbo-vae.safetensors"  # Define filename variable for use in f-strings
    try:
        print(f"📥 Downloading {filename}...")
        model_path = hf_hub_download(
            repo_id="Comfy-Org/z_image_turbo",
            filename="split_files/vae/ae.safetensors",
            cache_dir="/cache",
            token=token,
        )

        # Copy to VAE directory
        import shutil
        subprocess.run(
            f"mkdir -p {{comfy_dir}}/models/vae",
            shell=True, check=False
        )
        shutil.copy2(model_path, comfy_dir / "models" / "vae" / filename)
        print(f"   ✅ {filename} downloaded and copied to ComfyUI directories")
    except Exception as e:
        print(f"   ⚠️  Failed to download {filename}: {{e}}")
        print(f"   Workflow may fail if this model is required")

    print("✅ Model downloads complete")



# Download models during image build (pre-downloaded for faster startup)
import modal
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Try to get HuggingFace secret (required for model downloads)
try:
    huggingface_secret = modal.Secret.from_name("huggingface")
    image = image.run_function(
        download_workflow_models,
        volumes={"/cache": hf_cache_vol},
        secrets=[huggingface_secret],
    )
    print("✅ Model downloads included in image build")
except Exception as e:
    print(f"⚠️  Could not download models during image build: {e}")
    print("   Models will need to be provided via volume or downloaded manually")


app = modal.App(name="ryla-z_image_hybrid", image=image)


volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# HF cache volume for model downloads
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu="A100",
    volumes={"/root/models": volume, "/cache": hf_cache_vol},
    secrets=[modal.Secret.from_name("huggingface")],
    timeout=1800,
)
@modal.concurrent(max_inputs=5)
class Z_image_hybrid:
    """ComfyUI server for z_image_hybrid workflow."""
    
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server in background thread (non-blocking)."""
        import threading
        import subprocess
        import os
        from pathlib import Path
        import time

        # CRITICAL: Download models BEFORE starting ComfyUI
        # ComfyUI scans model directories on startup - models must exist first
        print("📥 Downloading workflow models (required before ComfyUI startup)...")
        try:
            download_workflow_models()
            print("✅ Models downloaded successfully")
        except Exception as e:
            print(f"⚠️  Model download failed: {e}")
            print("   ComfyUI will start but may not find required models")

        # Verify critical models exist before starting ComfyUI
        comfy_dir = Path("/root/comfy/ComfyUI")
        if not comfy_dir.exists():
            comfy_dir = Path("/root/ComfyUI")
        
        models_dir = comfy_dir / "models"
        missing_models = []
        # Check each required model in appropriate directories
        model_filenames = ["z_image_turbo_bf16.safetensors", "qwen_3_4b.safetensors", "z-image-turbo-vae.safetensors"]
        for model_filename in model_filenames:
            found = False
            # Determine directories to check based on filename patterns
            if "qwen" in model_filename.lower() or "clip" in model_filename.lower():
                # Text encoder models
                dirs_to_check = ["text_encoders", "clip"]
            elif "turbo" in model_filename.lower() or "unet" in model_filename.lower() or "diffusion" in model_filename.lower():
                # Diffusion/checkpoint models
                dirs_to_check = ["checkpoints", "diffusion_models"]
            elif "vae" in model_filename.lower():
                # VAE models
                dirs_to_check = ["vae"]
            else:
                # Default: check common directories
                dirs_to_check = ["checkpoints", "text_encoders", "clip", "vae"]
            
            for dir_name in dirs_to_check:
                if (models_dir / dir_name / model_filename).exists():
                    found = True
                    print(f"   ✅ Found {model_filename} in {dir_name}/")
                    break
            
            if not found:
                missing_models.append(f"{model_filename} (checked: {', '.join(dirs_to_check)})")
                print(f"   ⚠️  Missing {model_filename}")
        
        if missing_models:
            print(f"⚠️  WARNING: Missing models: {missing_models}")
            print("   ComfyUI may fail to load workflow")
        else:
            print("✅ All required models verified")
        
        def start_comfyui():
            """Start ComfyUI in background thread."""
            comfyui_path = "/root/comfy/ComfyUI"
            if not os.path.exists(comfyui_path):
                comfyui_path = "/root/ComfyUI"
            
            if os.path.exists(comfyui_path):
                print(f"🚀 Starting ComfyUI from {comfyui_path} on port {self.port}...")
                try:
                    # Try comfy launch first
                    cmd = f"cd {comfyui_path} && comfy launch --background -- --port {self.port} --listen 0.0.0.0"
                    print(f"   Running: {cmd}")
                    process = subprocess.Popen(
                        cmd,
                        shell=True,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    # Wait a moment to see if it fails immediately
                    time.sleep(2)
                    if process.poll() is not None:
                        # Process exited, check for errors
                        stdout, stderr = process.communicate()
                        print(f"⚠️  comfy launch failed (exit code {process.returncode})")
                        print(f"   stdout: {stdout[:500]}")
                        print(f"   stderr: {stderr[:500]}")
                        raise Exception("comfy launch failed")
                    print("✅ ComfyUI launch started in background")
                except Exception as e:
                    print(f"⚠️  comfy launch failed: {e}, trying python main.py fallback...")
                    # Fallback: python main.py
                    try:
                        cmd = f"cd {comfyui_path} && python main.py --port {self.port} --listen 0.0.0.0"
                        print(f"   Running: {cmd}")
                        process = subprocess.Popen(
                            cmd,
                            shell=True,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True
                        )
                        # Wait a moment to see if it fails immediately
                        time.sleep(2)
                        if process.poll() is not None:
                            stdout, stderr = process.communicate()
                            print(f"⚠️  python main.py failed (exit code {process.returncode})")
                            print(f"   stdout: {stdout[:500]}")
                            print(f"   stderr: {stderr[:500]}")
                            raise Exception("python main.py failed")
                        print("✅ ComfyUI started via python main.py")
                    except Exception as e2:
                        print(f"❌ Both startup methods failed. Last error: {e2}")
                        raise
            else:
                print(f"❌ ComfyUI path not found: {comfyui_path}")
                raise Exception(f"ComfyUI not found at {comfyui_path}")
        
        # Start ComfyUI in background thread - don't block
        thread = threading.Thread(target=start_comfyui, daemon=True)
        thread.start()
        print("✅ ComfyUI startup thread launched (non-blocking)")

    @modal.method()
    def generate(self, workflow_json: dict, **params):
        """
        Execute z_image_hybrid workflow.
        
        Args:
            workflow_json: ComfyUI workflow dictionary (API format)
            **params: Additional parameters
        
        Returns:
            Dictionary with images (base64) and metadata
        """
        import sys
        from pathlib import Path
        import json
        import base64

        # Add utils to path
        sys.path.insert(0, str(Path("/root").absolute()))
        from utils.comfyui import poll_server_health, execute_workflow_via_api
        import time

        # Wait for ComfyUI server to be ready (with retry)
        max_wait = 300  # 5 minutes max wait
        start_time = time.time()
        while time.time() - start_time < max_wait:
            try:
                poll_server_health(self.port)
                break  # Server is ready
            except Exception:
                if time.time() - start_time >= max_wait:
                    raise Exception("ComfyUI server not ready after 5 minutes")
                time.sleep(5)  # Wait 5 seconds before retry

        # Execute workflow via API
        try:
            image_bytes = execute_workflow_via_api(workflow_json, port=self.port, timeout=1200)
            
            # Convert to base64
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            
            return {
                "images": [image_base64],
                "count": 1,
                "format": "base64"
            }
        except Exception as e:
            raise Exception(f"Workflow execution failed: {str(e)}")

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for workflow execution."""
        from fastapi import FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel

        fastapi = FastAPI(title="ComfyUI z_image_hybrid API")

        # Add CORS middleware
        fastapi.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        class WorkflowRequest(BaseModel):
            workflow: dict

        @fastapi.get("/")
        async def root():
            return {"status": "ok", "app": "z_image_hybrid"}

        @fastapi.get("/health")
        async def health():
            return {"status": "healthy", "app": "z_image_hybrid"}

        @fastapi.get("/debug/comfyui")
        async def debug_comfyui():
            """Debug endpoint to check ComfyUI status and available models."""
            import requests as req
            try:
                base_url = f"http://localhost:{self.port}"
                # Check if ComfyUI is responding
                system_stats = req.get(f"{base_url}/system_stats", timeout=5).json()
                
                # Get available models
                clip_info = req.get(f"{base_url}/object_info/CLIPLoader", timeout=5).json()
                unet_info = req.get(f"{base_url}/object_info/UNETLoader", timeout=5).json()
                vae_info = req.get(f"{base_url}/object_info/VAELoader", timeout=5).json()
                
                return {
                    "comfyui_running": True,
                    "system_stats": system_stats,
                    "clip_models": clip_info.get("CLIPLoader", {}).get("input", {}).get("required", {}).get("clip_name", []) if isinstance(clip_info.get("CLIPLoader"), dict) else [],
                    "unet_models": unet_info.get("UNETLoader", {}).get("input", {}).get("required", {}).get("unet_name", []) if isinstance(unet_info.get("UNETLoader"), dict) else [],
                    "vae_models": vae_info.get("VAELoader", {}).get("input", {}).get("required", {}).get("vae_name", []) if isinstance(vae_info.get("VAELoader"), dict) else [],
                }
            except Exception as e:
                import traceback
                return {
                    "comfyui_running": False,
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }

        @fastapi.post("/generate")
        async def generate(request: WorkflowRequest):
            try:
                # Call generate method on the same container (use .local() not .remote())
                result = self.generate.local(request.workflow)
                return result
            except Exception as e:
                import traceback
                error_detail = f"{str(e)}\n{traceback.format_exc()}"
                raise HTTPException(status_code=500, detail=error_detail)

        return fastapi
