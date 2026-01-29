"""
RYLA SeedVR2 Modal App - Isolated App for SeedVR2 Workflows

Deploy: modal deploy apps/modal/apps/seedvr2/app.py

This app handles:
- /seedvr2 - SeedVR2 realistic upscaling

Agent Assignment: SeedVR2 Agent (isolated files)
"""

import modal
import sys
from pathlib import Path

# Calculate absolute paths for build-time imports
_app_dir = Path(__file__).parent  # apps/modal/apps/seedvr2/
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

# Import SeedVR2-specific image (extends base)
from image import seedvr2_image

# Import handlers
from handlers.seedvr2 import setup_seedvr2_endpoints

# Create Modal app
app = modal.App(name="ryla-seedvr2", image=seedvr2_image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,  # 30 minutes for long-running workflows
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class for SeedVR2 workflows."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server, verify_nodes_available
        launch_comfy_server(self.port)
        
        import time
        time.sleep(5)
        
        # Verify SeedVR2 nodes are loaded
        seedvr2_nodes = ["SeedVR2VideoUpscaler", "SeedVR2LoadDiTModel", "SeedVR2LoadVAEModel"]
        node_status = verify_nodes_available(seedvr2_nodes, port=self.port)
        missing_seedvr2 = [node for node, available in node_status.items() if not available]
        if missing_seedvr2:
            print(f"⚠️  Warning: SeedVR2 nodes not loaded at startup: {', '.join(missing_seedvr2)}")
        else:
            print(f"✅ All SeedVR2 nodes loaded successfully")
        print("✅ ComfyUI server started for SeedVR2 app")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        return execute_workflow(workflow_path)

    @modal.asgi_app()
    def fastapi_app(self):
        """FastAPI endpoint for SeedVR2 workflows."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        import traceback
        
        fastapi = FastAPI(
            title="RYLA SeedVR2 API",
            description="SeedVR2 realistic upscaling",
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
            return {"status": "healthy", "app": "ryla-seedvr2"}
        
        setup_seedvr2_endpoints(fastapi, self)
        
        return fastapi
