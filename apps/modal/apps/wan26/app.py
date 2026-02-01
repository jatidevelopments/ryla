"""
RYLA Wan2.6 Modal App - R2V Video Generation with Character Consistency

Deploy: modal deploy apps/modal/apps/wan26/app.py

This app handles:
- /wan2.6 - Wan 2.6 text-to-video generation (upgraded from 2.1)
- /wan2.6-r2v - Wan 2.6 R2V (reference-to-video) for character consistency

Model: Wan 2.6 (Apache 2.0 - Free for commercial use)
Features:
- R2V support (1-3 reference videos for character consistency)
- Better quality than 2.1
- No LoRA training required for consistency

Agent Assignment: Wan2.6 Agent (isolated files)
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/wan26/
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

# Import Wan2.6-specific image (extends base)
from image import wan26_image

# Import handlers
from handlers.wan26 import setup_wan26_endpoints
from handlers.wan2 import setup_wan2_endpoints

# Create Modal app
app = modal.App(name="ryla-wan26", image=wan26_image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,  # 30 minutes for long-running video workflows
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for Wan2.6 workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        
        # Setup Wan LoRA symlinks from volume to ComfyUI
        self._setup_wan_lora_symlinks()
        
        print("✅ ComfyUI server started for Wan2.6 app")
    
    def _setup_wan_lora_symlinks(self):
        """Symlink Wan LoRAs from volume to ComfyUI loras directory."""
        import os
        from pathlib import Path
        
        wan_loras_dir = Path("/root/models/wan-loras")
        flux_loras_dir = Path("/root/models/loras")
        comfy_loras_dir = Path("/root/comfy/ComfyUI/models/loras")
        
        comfy_loras_dir.mkdir(parents=True, exist_ok=True)
        
        symlinked = 0
        
        # Symlink Wan-specific LoRAs (preferred for video)
        if wan_loras_dir.exists():
            for lora_file in wan_loras_dir.glob("*.safetensors"):
                target = comfy_loras_dir / lora_file.name
                if not target.exists():
                    os.symlink(lora_file, target)
                    symlinked += 1
                    print(f"  Symlinked Wan LoRA: {lora_file.name}")
        
        # Also symlink FLUX LoRAs (may work for some video models)
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
        """FastAPI endpoint for Wan2.6 workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA Wan2.6 API",
            description="Wan 2.6 text-to-video generation with R2V character consistency",
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
            return {"status": "healthy", "app": "ryla-wan26"}
        
        setup_wan26_endpoints(fastapi, self)
        setup_wan2_endpoints(fastapi, self)  # Include Wan2.1 endpoint for backwards compatibility
        
        return fastapi
