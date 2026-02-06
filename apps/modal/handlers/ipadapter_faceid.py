"""
IP-Adapter FaceID workflow handler for Flux Dev.

Uses XLabs-AI Flux IP-Adapter v2, specifically designed for FLUX.1-dev.
This provides face consistency without the ControlNet shape mismatch issues
that InstantID has with Flux Dev's dual CLIP architecture.
"""

import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import Response, HTTPException

from utils.cost_tracker import CostTracker, get_cost_summary
from utils.image_utils import save_base64_to_file

# Default negative prompt for quality (use if none provided)
DEFAULT_NEGATIVE_PROMPT = "ugly, deformed, disfigured, bad anatomy, poorly drawn hands, poorly drawn face, blurry, low quality, cartoon, anime, 3d render, illustration"


def _save_reference_image(reference_image: str) -> str:
    """
    Save reference image from base64 data URL to ComfyUI input directory.
    
    Args:
        reference_image: Base64 data URL or file path
        
    Returns:
        Image filename for use in LoadImage node
    """
    if not reference_image.startswith("data:"):
        # Already a file path
        return reference_image
    
    # Base64 data URL - save to ComfyUI input directory
    from utils.image_utils import decode_base64
    import io
    from PIL import Image
    
    image_bytes = decode_base64(reference_image)
    comfy_dir = Path("/root/comfy/ComfyUI")
    input_dir = comfy_dir / "input"
    input_dir.mkdir(parents=True, exist_ok=True)
    image_filename = f"ipadapter_ref_{uuid.uuid4().hex[:8]}.jpg"
    image_path = input_dir / image_filename
    
    # Validate and save image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(image_path, "JPEG")
        print(f"✅ Saved reference image: {image_filename}")
        return image_filename
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")


def build_flux_ipadapter_faceid_workflow(item: dict) -> dict:
    """
    Build Flux Dev + IP-Adapter FaceID workflow JSON.
    
    Uses XLabs-AI Flux IP-Adapter v2, specifically designed for FLUX.1-dev.
    This avoids the ControlNet shape mismatch issues that InstantID has.
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    
    return {
        # Flux Dev model loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "flux1-dev.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "DualCLIPLoader",
            "inputs": {
                "clip_name1": "t5xxl_fp16.safetensors",
                "clip_name2": "clip_l.safetensors",
                "type": "flux",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "ae.safetensors",
            },
        },
        # Reference image
        "4": {
            "class_type": "LoadImage",
            "inputs": {
                "image": reference_image,
            },
        },
        # XLabs-AI Flux IP-Adapter v2 nodes
        # LoadFluxIPAdapter requires: ipadatper (typo in node!), clip_vision (filename), provider
        # Models downloaded from: XLabs-AI/flux-ip-adapter-v2 and openai/clip-vit-large-patch14
        "6": {
            "class_type": "LoadFluxIPAdapter",
            "inputs": {
                "ipadatper": "ip_adapter.safetensors",  # Note: param name has typo in ComfyUI node
                "clip_vision": "model.safetensors",  # OpenAI CLIP-ViT-Large
                "provider": item.get("face_provider", "CPU"),  # CPU or GPU
            },
        },
        "7": {
            "class_type": "ApplyFluxIPAdapter",
            "inputs": {
                "model": ["1", 0],  # Flux UNET model
                "ip_adapter_flux": ["6", 0],  # Loaded IP-Adapter (output from LoadFluxIPAdapter)
                "image": ["4", 0],  # Reference image
                "ip_scale": item.get("ipadapter_strength", 0.8),  # Note: parameter is "ip_scale", not "weight"
            },
        },
        # Text encoding (using Flux DualCLIP)
        "8": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["2", 0],  # DualCLIP output
            },
        },
        "9": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt") or DEFAULT_NEGATIVE_PROMPT,
                "clip": ["2", 0],  # DualCLIP output
            },
        },
        # Latent image
        "10": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling using XlabsSampler (required for XLabs IP-Adapter, KSampler has attn_mask issues)
        "11": {
            "class_type": "XlabsSampler",
            "inputs": {
                "model": ["7", 0],  # Use IP-Adapter modified model
                "conditioning": ["8", 0],  # positive prompt
                "neg_conditioning": ["9", 0],  # negative prompt
                "noise_seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "timestep_to_start_cfg": item.get("timestep_to_start_cfg", 1),  # When to start CFG
                "true_gs": item.get("guidance_scale", 3.5),  # Guidance scale
                "image_to_image_strength": 0.0,  # txt2img mode
                "denoise_strength": 1.0,
                "latent_image": ["10", 0],
            },
        },
        # Decode and save
        "12": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["11", 0],
                "vae": ["3", 0],
            },
        },
        "13": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["12", 0],
            },
        },
    }


class IPAdapterFaceIDHandler:
    """Handler for IP-Adapter FaceID workflows with Flux Dev."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _flux_ipadapter_faceid_impl(self, item: dict) -> Response:
        """
        Flux Dev + IP-Adapter FaceID implementation.
        
        Uses XLabs-AI Flux IP-Adapter v2, specifically designed for FLUX.1-dev.
        This provides face consistency without ControlNet shape mismatch issues.
        """
        if "reference_image" not in item:
            raise HTTPException(status_code=400, detail="reference_image is required")
        
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Get port
        port = getattr(self.comfyui, 'port', 8000)
        
        # Verify required nodes are available
        from utils.comfyui import verify_nodes_available
        required_nodes = ["LoadFluxIPAdapter", "ApplyFluxIPAdapter"]  # Correct node names
        node_status = verify_nodes_available(required_nodes, port=port)
        missing_nodes = [node for node, available in node_status.items() if not available]
        
        if missing_nodes:
            error_msg = (
                f"IP-Adapter FaceID essential nodes not loaded: {', '.join(missing_nodes)}. "
                "Please install XLabs-AI x-flux-comfyui custom node: "
                "git clone https://github.com/XLabs-AI/x-flux-comfyui.git into ComfyUI/custom_nodes/"
            )
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=503, detail=error_msg)
        
        # Build workflow
        workflow = build_flux_ipadapter_faceid_workflow(item)
        
        # Execute via API (more reliable and better error messages)
        api_error = None
        try:
            from utils.comfyui import execute_workflow_via_api
            img_bytes = execute_workflow_via_api(workflow, port=port, timeout=600)
        except Exception as e:
            # Store the API error for better error reporting
            api_error = str(e)
            import traceback
            api_traceback = traceback.format_exc()
            print(f"⚠️  API execution failed: {api_error}")
            print(f"   API error traceback:\n{api_traceback}")
            
            # Fallback to infer method (but preserve API error details)
            print(f"⚠️  Attempting fallback to infer method...")
            client_id = uuid.uuid4().hex
            workflow_file = f"/tmp/{client_id}.json"
            json.dump(workflow, Path(workflow_file).open("w"))
            try:
                img_bytes = self.comfyui.infer.local(workflow_file)
            except Exception as infer_error:
                # If infer also fails, raise with both errors for debugging
                infer_error_msg = str(infer_error)
                import traceback
                infer_traceback = traceback.format_exc()
                print(f"❌ Infer method also failed: {infer_error_msg}")
                print(f"   Infer error traceback:\n{infer_traceback}")
                
                # Raise with both error details
                combined_error = (
                    f"Both API and infer methods failed.\n"
                    f"API Error: {api_error}\n"
                    f"Infer Error: {infer_error_msg}\n"
                    f"\nAPI Traceback:\n{api_traceback}\n"
                    f"\nInfer Traceback:\n{infer_traceback}"
                )
                raise Exception(combined_error)
            finally:
                if Path(workflow_file).exists():
                    Path(workflow_file).unlink()
        
        # Clean up reference image if it was saved
        reference_image_filename = None
        for node in workflow.values():
            if node.get("class_type") == "LoadImage":
                ref_img = node.get("inputs", {}).get("image", "")
                if ref_img and not ref_img.startswith("/") and not ref_img.startswith("data:"):
                    reference_image_filename = ref_img
                    break
        
        if reference_image_filename:
            input_dir = Path("/root/comfy/ComfyUI/input")
            image_path = input_dir / reference_image_filename
            if image_path.exists():
                image_path.unlink()
                print(f"✅ Cleaned up reference image: {reference_image_filename}")
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-ipadapter-faceid", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_ipadapter_faceid_endpoints(fastapi, comfyui_instance):
    """
    Register IP-Adapter FaceID endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = IPAdapterFaceIDHandler(comfyui_instance)
    
    @fastapi.post("/flux-ipadapter-faceid")
    async def flux_ipadapter_faceid_route(request: Request):
        """
        Flux Dev + IP-Adapter FaceID endpoint.
        
        Uses XLabs-AI Flux IP-Adapter v2, specifically designed for FLUX.1-dev.
        This provides face consistency without ControlNet shape mismatch issues.
        """
        try:
            item = await request.json()
            result = handler._flux_ipadapter_faceid_impl(item)
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
            traceback_str = traceback.format_exc()
            print(f"❌ IP-Adapter FaceID error: {error_msg}")
            print(f"   Traceback: {traceback_str}")
            
            # Return appropriate status code based on error type
            status_code = 500
            if isinstance(e, HTTPException):
                status_code = e.status_code
            elif "not loaded" in error_msg.lower() or "503" in str(e):
                status_code = 503
            elif "400" in str(e) or "bad request" in error_msg.lower():
                status_code = 400
            
            return JSONResponse(
                status_code=status_code,
                content={
                    "error": error_msg,
                    "details": traceback_str,
                    "type": type(e).__name__
                }
            )
