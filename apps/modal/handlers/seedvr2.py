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
from fastapi import Response, HTTPException

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
        
        # Verify SeedVR2 nodes are available
        port = getattr(self.comfyui, 'port', 8000)
        from utils.comfyui import verify_nodes_available
        required_nodes = ["SeedVR2VideoUpscaler", "SeedVR2LoadDiTModel", "SeedVR2LoadVAEModel"]
        node_status = verify_nodes_available(required_nodes, port=port)
        missing_nodes = [node for node, available in node_status.items() if not available]
        
        if missing_nodes:
            error_msg = f"SeedVR2 nodes not loaded: {', '.join(missing_nodes)}"
            print(f"❌ {error_msg}")
            raise ValueError(error_msg)
        
        # Check if SeedVR2 models are available
        comfy_dir = Path("/root/comfy/ComfyUI")
        seedvr2_dir = comfy_dir / "models" / "seedvr2"
        dit_model = seedvr2_dir / "seedvr2_ema_7b_fp16.safetensors"
        vae_model = seedvr2_dir / "ema_vae_fp16.safetensors"
        
        print(f"📦 Checking SeedVR2 models:")
        print(f"   DiT model: {dit_model} (exists: {dit_model.exists()})")
        print(f"   VAE model: {vae_model} (exists: {vae_model.exists()})")
        
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
        
        # Load SeedVR2 workflow (prefer API format, fallback to UI format)
        port = getattr(self.comfyui, 'port', 8000)
        workflow_api = None
        
        # Try API format first
        workflow_api_path = Path("/root/workflows/seedvr2_api.json")
        if workflow_api_path.exists():
            print("✅ Using API format workflow")
            with open(workflow_api_path, "r") as f:
                workflow_api = json.load(f)
        else:
            # Fallback to UI format with conversion
            workflow_ui_path = Path("/root/workflows/seedvr2.json")
            if not workflow_ui_path.exists():
                raise FileNotFoundError(f"SeedVR2 workflow not found at {workflow_ui_path} or {workflow_api_path}")
            
            print("⚠️  API format workflow not found, trying UI format conversion...")
            with open(workflow_ui_path, "r") as f:
                workflow_ui = json.load(f)
            
            # Update LoadImage node in UI format first
            for node in workflow_ui.get("nodes", []):
                if node.get("type") == "LoadImage" and "widgets_values" in node:
                    if len(node["widgets_values"]) > 0:
                        node["widgets_values"][0] = image_filename
                    break
            
            # Try to convert using ComfyUI's converter endpoint
            comfy_url = f"http://127.0.0.1:{port}"
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
                print(f"⚠️  Converter endpoint not available: {e}. Using workflow handler fallback.")
                # Use workflow handler which can handle UI format via ComfyUI API
                from handlers.workflow import WorkflowHandler
                workflow_handler = WorkflowHandler(self.comfyui)
                
                workflow_item = {
                    "workflow": workflow_ui,
                }
                
                try:
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
                except Exception as e:
                    # Clean up on error
                    if image_path.exists():
                        image_path.unlink()
                    raise
        
        # Update LoadImage node in API format and verify model paths
        if workflow_api:
            # Get parameters from request (with defaults)
            resolution = item.get("resolution", 1080)
            seed = item.get("seed", 4105349922)
            max_resolution = item.get("max_resolution", 4000)
            max_resolution_2 = item.get("max_resolution_2", 4000)
            
            # Ensure resolution is an integer (handle string values like "fixed")
            if isinstance(resolution, str):
                if resolution.lower() == "fixed":
                    # Use default if "fixed" is provided
                    resolution = 1080
                else:
                    try:
                        resolution = int(resolution)
                    except ValueError:
                        print(f"⚠️  Invalid resolution value '{resolution}', using default 1080")
                        resolution = 1080
            
            # Ensure seed is an integer
            if isinstance(seed, str):
                try:
                    seed = int(seed)
                except ValueError:
                    print(f"⚠️  Invalid seed value '{seed}', using default")
                    seed = 4105349922
            
            # Ensure max_resolution values are integers
            if isinstance(max_resolution, str):
                try:
                    max_resolution = int(max_resolution)
                except ValueError:
                    max_resolution = 4000
            if isinstance(max_resolution_2, str):
                try:
                    max_resolution_2 = int(max_resolution_2)
                except ValueError:
                    max_resolution_2 = 4000
            
            for node_id, node in workflow_api.items():
                if node.get("class_type") == "LoadImage":
                    node["inputs"]["image"] = image_filename
                elif node.get("class_type") == "SeedVR2LoadDiTModel":
                    # Ensure model path is just filename (ComfyUI will search in seedvr2 directory)
                    model_name = node["inputs"].get("model", "seedvr2_ema_7b_fp16.safetensors")
                    if "/" in model_name:
                        model_name = Path(model_name).name
                    node["inputs"]["model"] = model_name
                    print(f"   ✅ DiT model path: {model_name}")
                elif node.get("class_type") == "SeedVR2LoadVAEModel":
                    # Ensure model path is just filename (ComfyUI will search in seedvr2 directory)
                    model_name = node["inputs"].get("model", "ema_vae_fp16.safetensors")
                    if "/" in model_name:
                        model_name = Path(model_name).name
                    node["inputs"]["model"] = model_name
                    print(f"   ✅ VAE model path: {model_name}")
                elif node.get("class_type") == "SeedVR2VideoUpscaler":
                    # Update parameters from request
                    node["inputs"]["seed"] = seed
                    node["inputs"]["resolution"] = resolution
                    node["inputs"]["max_resolution"] = max_resolution
                    node["inputs"]["max_resolution_2"] = max_resolution_2
                    print(f"   ✅ SeedVR2VideoUpscaler parameters: resolution={resolution}, seed={seed}, max_res={max_resolution}")
            
            # Execute via API (more reliable)
            try:
                from utils.comfyui import execute_workflow_via_api
                print(f"🚀 Executing SeedVR2 workflow via API...")
                print(f"   Workflow nodes: {list(workflow_api.keys())}")
                output_bytes = execute_workflow_via_api(workflow_api, port=port, timeout=600)
                print(f"✅ SeedVR2 workflow completed successfully")
            except Exception as e:
                # Capture full error details
                error_msg = str(e)
                error_type = type(e).__name__
                import traceback
                error_trace = traceback.format_exc()
                print(f"❌ SeedVR2 API execution failed:")
                print(f"   Error: {error_msg}")
                print(f"   Type: {error_type}")
                print(f"   Traceback: {error_trace}")
                
                # Try to get more details from ComfyUI if it's a node error
                if "node" in error_msg.lower() or "workflow" in error_msg.lower():
                    try:
                        import requests
                        response = requests.get(f"http://127.0.0.1:{port}/object_info", timeout=5)
                        if response.status_code == 200:
                            object_info = response.json()
                            seedvr2_nodes = [k for k in object_info.keys() if "seedvr2" in k.lower()]
                            print(f"   Available SeedVR2 nodes: {seedvr2_nodes}")
                    except:
                        pass
                
                # Fallback to infer method
                print(f"   Attempting infer method fallback...")
                client_id = uuid.uuid4().hex
                workflow_file = f"/tmp/{client_id}.json"
                json.dump(workflow_api, Path(workflow_file).open("w"))
                try:
                    output_bytes = self.comfyui.infer.local(workflow_file)
                    print(f"✅ SeedVR2 workflow completed via infer method")
                except Exception as e2:
                    error_trace2 = traceback.format_exc()
                    print(f"❌ Infer method also failed: {e2}")
                    print(f"   Traceback: {error_trace2}")
                    # Re-raise with combined error info
                    raise Exception(f"SeedVR2 execution failed (API: {error_msg}, Infer: {str(e2)})")
                finally:
                    if Path(workflow_file).exists():
                        Path(workflow_file).unlink()
            
            # Clean up
            if image_path.exists():
                image_path.unlink()
            
            execution_time = tracker.stop()
            cost_metrics = tracker.calculate_cost("seedvr2", execution_time)
            print(f"💰 {get_cost_summary(cost_metrics)}")
            
            response = Response(output_bytes, media_type="image/png")
            response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
            response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
            response.headers["X-GPU-Type"] = cost_metrics.gpu_type
            return response
        
        # If we get here, workflow loading failed
        execution_time = tracker.stop()
        error_msg = "Failed to load or convert SeedVR2 workflow. Check workflow file paths."
        print(f"❌ {error_msg}")
        raise ValueError(error_msg)


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
            from fastapi.responses import JSONResponse
            error_msg = str(e)
            error_trace = traceback.format_exc()
            print(f"❌ SeedVR2 error: {error_msg}")
            print(f"   Traceback: {error_trace}")
            
            # Log full error details for debugging
            if hasattr(e, '__dict__'):
                print(f"   Error attributes: {e.__dict__}")
            
            # Return appropriate status code based on error type
            status_code = 500
            if isinstance(e, HTTPException):
                status_code = e.status_code
            elif "not found" in error_msg.lower() or "FileNotFoundError" in str(type(e)):
                status_code = 404
            elif "400" in str(e) or "bad request" in error_msg.lower():
                status_code = 400
            
            return JSONResponse(
                status_code=status_code,
                content={
                    "error": error_msg,
                    "details": error_trace,
                    "type": type(e).__name__
                }
            )
