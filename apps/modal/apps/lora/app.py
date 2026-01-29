"""
RYLA LoRA Modal App - Isolated App for LoRA Workflows

Deploy: modal deploy apps/modal/apps/lora/app.py

This app handles:
- /flux-lora - Flux Dev + LoRA character generation

Agent Assignment: LoRA Agent (isolated files)
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/lora/
_modal_dir = _app_dir.parent.parent  # apps/modal/
_shared_dir = _modal_dir / "shared"

# Add paths for imports
sys.path.insert(0, "/root/utils")
sys.path.insert(0, "/root")
sys.path.insert(0, str(_modal_dir))
sys.path.insert(0, str(_shared_dir / "utils"))
sys.path.insert(0, str(_shared_dir))
sys.path.insert(0, str(_app_dir))

# Import shared configuration
from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE, COMFYUI_PORT

# Import LoRA-specific image
from image import lora_image

# Import handlers
from handlers.lora import setup_lora_endpoints

# Create Modal app
app = modal.App(name="ryla-lora", image=lora_image)


@app.cls(
    scaledown_window=300,
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for LoRA workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        
        # Symlink LoRA files from volume to ComfyUI
        self._setup_lora_symlinks()
        
        print("✅ ComfyUI server started for LoRA app")
    
    def _setup_lora_symlinks(self):
        """Symlink LoRA files from volume to ComfyUI."""
        import os
        from pathlib import Path
        
        volume_loras = Path("/root/models/loras")
        comfy_loras = Path("/root/comfy/ComfyUI/models/loras")
        
        if volume_loras.exists():
            comfy_loras.mkdir(parents=True, exist_ok=True)
            for lora_file in volume_loras.glob("*.safetensors"):
                target = comfy_loras / lora_file.name
                if not target.exists():
                    os.symlink(str(lora_file), str(target))
                    print(f"✅ Symlinked LoRA: {lora_file.name}")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for LoRA workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA LoRA API",
            description="Flux Dev + LoRA character generation",
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
            return {"status": "healthy", "app": "ryla-lora"}
        
        @fastapi.get("/loras")
        async def list_loras():
            """List available LoRA files."""
            from pathlib import Path
            loras = []
            for lora_dir in [Path("/root/models/loras"), Path("/root/comfy/ComfyUI/models/loras")]:
                if lora_dir.exists():
                    for f in lora_dir.glob("*.safetensors"):
                        if f.name not in [l["name"] for l in loras]:
                            loras.append({"name": f.name, "path": str(f)})
            return {"loras": loras}
        
        setup_lora_endpoints(fastapi, self)
        
        return fastapi
