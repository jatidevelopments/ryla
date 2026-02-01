"""
RYLA Qwen-Image Modal App - Hyper-Realistic Text-to-Image Generation

Deploy: modal deploy apps/modal/apps/qwen-image/app.py

This app handles:
- /qwen-image-2512 - Qwen Image 2512 text-to-image (50 steps, high quality)
- /qwen-image-2512-fast - Qwen Image 2512 with Lightning LoRA (4 steps, fast)

Model: Qwen-Image 2512 (Apache 2.0 - Free for commercial use)
Features:
- Hyper-realistic AI influencer generation
- >95% LoRA consistency
- Support for multiple aspect ratios

Agent Assignment: Qwen-Image Agent (isolated files)
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/qwen-image/
_modal_dir = _app_dir.parent.parent  # apps/modal/
_shared_dir = _modal_dir / "shared"

# Add paths for imports - ORDER MATTERS (last inserted = first searched)
sys.path.insert(0, "/root/utils")
sys.path.insert(0, "/root")
sys.path.insert(0, str(_modal_dir))
sys.path.insert(0, str(_shared_dir / "utils"))
sys.path.insert(0, str(_shared_dir))
sys.path.insert(0, str(_app_dir))

# Import shared configuration
from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE, COMFYUI_PORT

# Import Qwen-Image-specific image (extends base)
from image import qwen_image_image

# Import handlers
from handlers.qwen_image import setup_qwen_image_endpoints

# Create Modal app
app = modal.App(name="ryla-qwen-image", image=qwen_image_image)


@app.cls(
    scaledown_window=300,
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for Qwen-Image workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        
        # Setup Qwen LoRA symlinks from volume to ComfyUI
        self._setup_qwen_lora_symlinks()
        
        print("✅ ComfyUI server started for Qwen-Image app")
    
    def _setup_qwen_lora_symlinks(self):
        """Symlink Qwen LoRAs from volume to ComfyUI loras directory."""
        import os
        from pathlib import Path
        
        qwen_loras_dir = Path("/root/models/qwen-loras")
        flux_loras_dir = Path("/root/models/loras")
        comfy_loras_dir = Path("/root/comfy/ComfyUI/models/loras")
        
        comfy_loras_dir.mkdir(parents=True, exist_ok=True)
        
        symlinked = 0
        
        # Symlink Qwen-specific LoRAs
        if qwen_loras_dir.exists():
            for lora_file in qwen_loras_dir.glob("*.safetensors"):
                target = comfy_loras_dir / lora_file.name
                if not target.exists():
                    os.symlink(lora_file, target)
                    symlinked += 1
                    print(f"  Symlinked Qwen LoRA: {lora_file.name}")
        
        # Also symlink FLUX LoRAs that might be compatible
        if flux_loras_dir.exists():
            for lora_file in flux_loras_dir.glob("*.safetensors"):
                target = comfy_loras_dir / lora_file.name
                if not target.exists():
                    os.symlink(lora_file, target)
                    symlinked += 1
                    print(f"  Symlinked LoRA: {lora_file.name}")
        
        if symlinked > 0:
            print(f"✅ Symlinked {symlinked} LoRAs to ComfyUI")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for Qwen-Image workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA Qwen-Image API",
            description="Qwen Image 2512 hyper-realistic text-to-image generation",
        )
        
        @fastapi.exception_handler(Exception)
        async def global_exception_handler(request, exc):
            error_msg = str(exc)
            error_trace = traceback.format_exc()
            print(f"❌ Exception: {error_msg}\n{error_trace}")
            return JSONResponse(
                status_code=500,
                content={"error": error_msg, "details": error_trace, "type": type(exc).__name__}
            )
        
        fastapi.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        @fastapi.get("/health")
        async def health():
            return {"status": "healthy", "app": "ryla-qwen-image"}
        
        setup_qwen_image_endpoints(fastapi, self)
        
        return fastapi
