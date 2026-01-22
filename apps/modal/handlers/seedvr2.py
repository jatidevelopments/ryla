"""
SeedVR2 workflow handler.

Handles SeedVR2 realistic upscaling.
"""

import json
import uuid
import base64
import shutil
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict
from PIL import Image
import io
from fastapi import Response

from utils.cost_tracker import CostTracker, get_cost_summary
from utils.image_utils import decode_base64


class SeedVR2Handler:
    """Handler for SeedVR2 workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _seedvr2_impl(self, item: dict) -> Response:
        """SeedVR2 implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Check if SeedVR2 models are available
        comfy_dir = Path("/root/comfy/ComfyUI")
        seedvr2_dir = comfy_dir / "models" / "seedvr2"
        dit_model = seedvr2_dir / "seedvr2_ema_7b_fp16.safetensors"
        vae_model = seedvr2_dir / "ema_vae_fp16.safetensors"
        
        # Check cache location
        cache_dir = Path("/cache")
        cache_dit = None
        cache_vae = None
        if cache_dir.exists():
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
        
        # Copy from cache if needed
        if (not dit_model.exists() or not vae_model.exists()) and cache_dit and cache_vae:
            print(f"📦 Copying models from cache to {seedvr2_dir}")
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
            raise ValueError(error_msg)
        
        # Get image input (base64)
        image_data = item.get("image")
        if not image_data:
            raise ValueError("Missing 'image' field in request. Provide base64-encoded image.")
        
        # Decode base64 image
        image_bytes = decode_base64(image_data)
        
        # Save image to ComfyUI input directory
        comfy_dir = Path("/root/comfy/ComfyUI")
        input_dir = comfy_dir / "input"
        input_dir.mkdir(parents=True, exist_ok=True)
        image_filename = f"seedvr2_input_{uuid.uuid4().hex[:8]}.png"
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
        
        # Load SeedVR2 workflow
        workflow_path = Path("/root/workflows/seedvr2.json")
        if not workflow_path.exists():
            raise FileNotFoundError(f"SeedVR2 workflow not found at {workflow_path}")
        
        with open(workflow_path, "r") as f:
            workflow_ui = json.load(f)
        
        # Try to convert using ComfyUI's converter endpoint
        # Get port from comfyui instance
        port = getattr(self.comfyui, 'port', 8000)
        comfy_url = f"http://127.0.0.1:{port}"
        workflow_api = None
        
        try:
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
            print(f"⚠️  Converter endpoint not available: {e}. Using workflow_impl method.")
            # Use workflow_impl as fallback
            from handlers.workflow import WorkflowHandler
            workflow_handler = WorkflowHandler(self.comfyui)
            workflow_item = {
                "workflow": workflow_ui,
                "image_filename": image_filename
            }
            # Update LoadImage node in UI format
            for node in workflow_ui.get("nodes", []):
                if node.get("id") == 26 and "widgets_values" in node:
                    node["widgets_values"][0] = image_filename
                    break
            
            result = workflow_handler._workflow_impl(workflow_item)
            # Clean up
            if image_path.exists():
                image_path.unlink()
            execution_time = tracker.stop()
            cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
            print(f"💰 {get_cost_summary(cost_metrics)}")
            response = Response(result.body, media_type=result.media_type)
            response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
            response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
            response.headers["X-GPU-Type"] = cost_metrics.gpu_type
            return response
        
        # Update LoadImage node in API format
        if workflow_api:
            for node_id, node in workflow_api.items():
                if node.get("class_type") == "LoadImage":
                    node["inputs"]["image"] = image_filename
                    break
            
            # Save and execute
            client_id = uuid.uuid4().hex
            workflow_file = f"/tmp/{client_id}.json"
            json.dump(workflow_api, Path(workflow_file).open("w"))
            
            output_bytes = self.comfyui.infer.local(workflow_file)
            
            # Clean up
            if image_path.exists():
                image_path.unlink()
            
            execution_time = tracker.stop()
            cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
            print(f"💰 {get_cost_summary(cost_metrics)}")
            
            response = Response(output_bytes, media_type="image/jpeg")
            response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
            response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
            response.headers["X-GPU-Type"] = cost_metrics.gpu_type
            return response
        
        raise ValueError("Failed to convert workflow")


def setup_seedvr2_endpoints(fastapi, comfyui_instance):
    """
    Register SeedVR2 endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse, JSONResponse
    
    handler = SeedVR2Handler(comfyui_instance)
    
    @fastapi.post("/seedvr2")
    async def seedvr2_route(request: Request):
        try:
            item = await request.json()
            result = handler._seedvr2_impl(item)
            # Preserve cost headers
            response = FastAPIResponse(
                content=result.body,
                media_type=result.media_type,
            )
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
            return JSONResponse(
                status_code=400,
                content={
                    "error": error_msg,
                    "details": error_trace if "ValueError" in str(type(e)) else None
                }
            )
