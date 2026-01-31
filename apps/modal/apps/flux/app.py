"""
RYLA Flux Modal App - Isolated App for Flux Workflows

Deploy: modal deploy apps/modal/apps/flux/app.py

This app handles:
- /flux - Flux Schnell text-to-image
- /flux-dev - Flux Dev text-to-image
- /flux-dev-lora - Flux Dev + LoRA character-specific generation

Agent Assignment: Flux Agent (isolated files)
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/flux/
_modal_dir = _app_dir.parent.parent  # apps/modal/
_shared_dir = _modal_dir / "shared"

# Add paths for imports - ORDER MATTERS!
# insert(0) puts at front, so insert in REVERSE order (last inserted = first searched)
# Lower priority paths first
sys.path.insert(0, "/root/utils")  # Runtime: container utils
sys.path.insert(0, "/root")  # Runtime: container root
sys.path.insert(0, str(_modal_dir))  # Build: handlers directory
sys.path.insert(0, str(_shared_dir / "utils"))  # Build: shared utils
sys.path.insert(0, str(_shared_dir))  # Build: shared config
# Highest priority - current app directory (for local image.py)
sys.path.insert(0, str(_app_dir))

# Import shared configuration
from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE, COMFYUI_PORT

# Import Flux-specific image (extends base) - from local image.py
from image import flux_image

# Import handlers
from handlers.flux import setup_flux_endpoints

# Create Modal app
app = modal.App(name="ryla-flux", image=flux_image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,  # 30 minutes for long-running workflows
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for Flux workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        
        # Set up LoRA symlinks from volume to ComfyUI
        self._setup_lora_symlinks()
        
        print("✅ ComfyUI server started for Flux app (with LoRA support)")
    
    def _setup_lora_symlinks(self):
        """Symlink LoRA files from volume to ComfyUI models directory."""
        import os
        from pathlib import Path
        
        volume_loras = Path("/root/models/loras")
        comfy_loras = Path("/root/comfy/ComfyUI/models/loras")
        
        if volume_loras.exists():
            comfy_loras.mkdir(parents=True, exist_ok=True)
            lora_count = 0
            for lora_file in volume_loras.glob("*.safetensors"):
                target = comfy_loras / lora_file.name
                if not target.exists():
                    os.symlink(str(lora_file), str(target))
                    print(f"   ✅ Symlinked LoRA: {lora_file.name}")
                    lora_count += 1
            if lora_count > 0:
                print(f"   📦 Loaded {lora_count} LoRA(s) from volume")
            else:
                print("   ℹ️ No new LoRAs to symlink")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for Flux workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA Flux API",
            description="Flux Schnell and Flux Dev text-to-image generation",
        )
        
        # Global exception handler for detailed errors
        @fastapi.exception_handler(Exception)
        async def global_exception_handler(request, exc):
            error_msg = str(exc)
            error_trace = traceback.format_exc()
            print(f"❌ Exception: {error_msg}")
            print(f"   Traceback: {error_trace}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": error_msg,
                    "details": error_trace,
                    "type": type(exc).__name__,
                    "path": str(request.url.path)
                }
            )
        
        # CORS middleware
        fastapi.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Health check
        @fastapi.get("/health")
        async def health():
            return {"status": "healthy", "app": "ryla-flux"}
        
        # List available LoRAs
        @fastapi.get("/loras")
        async def list_loras():
            """List available LoRA files for /flux-dev-lora endpoint."""
            from pathlib import Path
            loras = []
            for lora_dir in [Path("/root/models/loras"), Path("/root/comfy/ComfyUI/models/loras")]:
                if lora_dir.exists():
                    for f in lora_dir.glob("*.safetensors"):
                        if f.name not in [l["name"] for l in loras]:
                            loras.append({"name": f.name, "path": str(f)})
            return {"loras": loras, "count": len(loras)}
        
        # Debug endpoint to test handler import
        @fastapi.get("/debug/test")
        async def debug_test():
            try:
                from handlers.flux import FluxHandler
                return {"status": "ok", "handler_import": "success"}
            except Exception as e:
                import traceback
                return {"status": "error", "error": str(e), "trace": traceback.format_exc()}
        
        # Register Flux endpoints
        setup_flux_endpoints(fastapi, self)
        
        return fastapi
