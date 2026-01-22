"""
RYLA ComfyUI Modal App - Main Entry Point

Deploy: modal deploy apps/modal/app.py
"""

import modal
import sys
from pathlib import Path

# Add utils to path for imports
sys.path.insert(0, "/root")
sys.path.insert(0, "/root/utils")

# Import configuration
from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE, COMFYUI_PORT

# Import image build
from image import image

# Import handlers
from handlers.flux import setup_flux_endpoints
from handlers.instantid import setup_instantid_endpoints
from handlers.lora import setup_lora_endpoints
from handlers.wan2 import setup_wan2_endpoints
from handlers.seedvr2 import setup_seedvr2_endpoints
from handlers.workflow import setup_workflow_endpoints

# Import utilities (imported inside methods to avoid circular imports)

# Create Modal app
app = modal.App(name="ryla-comfyui", image=image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class with all workflow endpoints."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        # Check server health
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        
        # Execute workflow using utility
        return execute_workflow(workflow_path)
    
    def poll_server_health(self):
        """Poll server health (for use in handlers)."""
        from utils.comfyui import poll_server_health as check_health
        check_health(self.port)
    
    def _workflow_impl(self, item: dict):
        """Workflow implementation (for use by SeedVR2 handler)."""
        from handlers.workflow import WorkflowHandler
        handler = WorkflowHandler(self)
        return handler._workflow_impl(item)

    @modal.asgi_app()
    def fastapi_app(self):
        """Single FastAPI app with all routes."""
        from fastapi import FastAPI
        
        fastapi = FastAPI(title="RYLA ComfyUI API")
        
        # Store instance reference for handlers
        comfyui_instance = self
        
        # Register all endpoints from handlers
        setup_flux_endpoints(fastapi, comfyui_instance)
        setup_instantid_endpoints(fastapi, comfyui_instance)
        setup_lora_endpoints(fastapi, comfyui_instance)
        setup_wan2_endpoints(fastapi, comfyui_instance)
        setup_seedvr2_endpoints(fastapi, comfyui_instance)
        setup_workflow_endpoints(fastapi, comfyui_instance)
        
        return fastapi


# Interactive UI (optional - for development)
@app.function(
    max_containers=1,
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
)
@modal.concurrent(max_inputs=10)
@modal.web_server(8000, startup_timeout=60)
def ui():
    """Launch ComfyUI UI for interactive use."""
    import subprocess
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)
    print("✅ ComfyUI UI available at http://localhost:8000")
