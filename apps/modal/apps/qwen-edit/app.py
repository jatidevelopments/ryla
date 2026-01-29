"""
RYLA Qwen-Edit Modal App - Instruction-Based Image Editing

Deploy: modal deploy apps/modal/apps/qwen-edit/app.py

This app handles:
- /qwen-image-edit-2511 - Instruction-driven image editing
- /qwen-image-inpaint-2511 - Mask-based inpainting (uses SetLatentNoiseMask)

Model: Qwen-Image Edit 2511 (Apache 2.0 - Free for commercial use)
Features:
- Instruction-driven editing (background changes, outfit changes, etc.)
- LoRA support for character consistency

Agent Assignment: Qwen-Edit Agent (isolated files)

Cache buster: v10 - switch to bf16 model for img2img compatibility
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/qwen-edit/
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

# Import Qwen-Edit-specific image (extends base)
from image import qwen_edit_image

# Import handlers
from handlers.qwen_edit import setup_qwen_edit_endpoints

# Create Modal app
app = modal.App(name="ryla-qwen-edit", image=qwen_edit_image)


@app.cls(
    scaledown_window=300,
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for Qwen-Edit workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        print("✅ ComfyUI server started for Qwen-Edit app")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for Qwen-Edit workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA Qwen-Edit API",
            description="Qwen Image Edit 2511 instruction-based image editing",
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
            return {"status": "healthy", "app": "ryla-qwen-edit"}
        
        setup_qwen_edit_endpoints(fastapi, self)
        
        return fastapi
