"""
RYLA WAN 2.2 I2V Modal App - Image-to-Video with Face Swap

Deploy: modal deploy apps/modal/apps/wan22-i2v/app.py

This app handles:
- /wan22-i2v - WAN 2.2 image-to-video generation using GGUF models
- /wan22-i2v-faceswap - Generate video + swap face in all frames

Model: WAN 2.2 I2V GGUF (Apache 2.0 - Free for commercial use)
Features:
- Image-to-Video generation
- GGUF quantization for efficient inference
- ReActor frame-by-frame face swap

GPU: A100 80GB (required for 14B parameter model)

App v2: 2026-02-04T21:30
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/wan22-i2v/
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
from config import volume, hf_cache_vol, huggingface_secret, COMFYUI_PORT

# Import WAN 2.2 I2V-specific image (extends base)
from image import wan22_i2v_image

# Import handlers
from handlers.wan22_i2v import setup_wan22_i2v_endpoints

# Create Modal app
app = modal.App(name="ryla-wan22-i2v", image=wan22_i2v_image)

# GPU configuration - A100 80GB for 14B model
GPU_TYPE = "A100-80GB"


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,  # 30 minutes for long-running video + face swap
)
@modal.concurrent(max_inputs=3)  # Limit concurrent due to memory requirements
class ComfyUI:
    """ComfyUI server class for WAN 2.2 I2V workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        import time
        time.sleep(10)  # Extra time for GGUF model loading
        
        print("✅ ComfyUI server started for WAN 2.2 I2V app")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for WAN 2.2 I2V workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA WAN 2.2 I2V API",
            description="WAN 2.2 image-to-video generation with GGUF models and face swap",
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
            return {"status": "healthy", "app": "ryla-wan22-i2v", "version": "v2"}
        
        setup_wan22_i2v_endpoints(fastapi, self)
        
        return fastapi
