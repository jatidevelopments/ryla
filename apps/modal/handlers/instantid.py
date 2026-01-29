"""
InstantID workflow handler.

Handles Flux Dev + InstantID and SDXL + InstantID face consistency generation.

Note: Flux Dev has compatibility issues with InstantID's ControlNet due to dual CLIP architecture.
SDXL (single CLIP) is fully compatible and recommended for InstantID workflows.
"""

import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import Response, HTTPException

from utils.cost_tracker import CostTracker, get_cost_summary
from utils.image_utils import save_base64_to_file


def build_flux_instantid_workflow(item: dict) -> dict:
    """
    Build Flux Dev + InstantID workflow JSON.
    
    ⚠️ WARNING: Flux Dev has a fundamental incompatibility with InstantID's ControlNet
    due to dual CLIP architecture (T5XXL + CLIP-L vs SDXL's CLIP-L only).
    Use `/sdxl-instantid` endpoint instead for InstantID workflows.
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    
    return {
        # Model loaders (Flux Dev - separate loaders)
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
        # InstantID setup
        # Note: InstantIDFaceAnalysis loads InsightFace models and performs face analysis
        # It should automatically find models in ~/.insightface/models/antelopev2/ (via symlink)
        "20": {
            "class_type": "InstantIDFaceAnalysis",
            "inputs": {
                "provider": item.get("face_provider", "CPU"),
                # Optional: root path for InsightFace models (defaults to ~/.insightface/models/)
                # We've created a symlink, so this should work automatically
            },
        },
        "21": {
            "class_type": "InstantIDModelLoader",
            "inputs": {
                "instantid_file": "ip-adapter.bin",
            },
        },
        "22": {
            "class_type": "ControlNetLoader",
            "inputs": {
                "control_net_name": "diffusion_pytorch_model.safetensors",
            },
        },
        # Reference image
        "23": {
            "class_type": "LoadImage",
            "inputs": {
                "image": reference_image,
            },
        },
        # Prompt encoding (before ApplyInstantID - needed for some ApplyInstantID versions)
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["2", 0],
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["2", 0],
            },
        },
        # Apply InstantID - requires model, positive, negative, start_at, end_at inputs
        # Outputs: [0] = MODEL, [1] = positive CONDITIONING, [2] = negative CONDITIONING
        # 
        # CRITICAL COMPATIBILITY ISSUE:
        # InstantID's ControlNet expects T5XXL embeddings (2816 dimensions) but receives CLIP-L (768 dimensions)
        # Error: "mat1 and mat2 shapes cannot be multiplied (1x768 and 2816x1280)"
        # 
        # Root cause: ApplyInstantID processes conditioning in a way that strips T5XXL embeddings,
        # leaving only CLIP-L embeddings. The ControlNet's label embedding layer expects T5XXL dimension (2816)
        # but receives CLIP-L dimension (768), causing the shape mismatch.
        #
        # This is a fundamental incompatibility between InstantID's ControlNet implementation and Flux Dev's
        # dual CLIP architecture (T5XXL + CLIP-L vs SDXL's CLIP-L only).
        #
        # Potential solutions:
        # 1. Use IP-Adapter FaceID instead (designed for Flux)
        # 2. Wait for Flux-compatible InstantID version
        # 3. Use SDXL model instead of Flux Dev for InstantID workflows
        "24": {
            "class_type": "ApplyInstantID",
            "inputs": {
                "insightface": ["20", 0],
                "instantid": ["21", 0],
                "control_net": ["22", 0],  # Note: control_net not controlnet
                "image": ["23", 0],
                "model": ["1", 0],  # Flux Dev UNET model
                "positive": ["4", 0],  # Positive prompt (includes T5XXL + CLIP-L from DualCLIPLoader)
                "negative": ["5", 0],  # Negative prompt (includes T5XXL + CLIP-L from DualCLIPLoader)
                "weight": item.get("instantid_strength", 0.8),
                "start_at": 0.0,
                "end_at": 1.0,
            },
        },
        # ApplyInstantID outputs: [0] = MODEL, [1] = positive CONDITIONING, [2] = negative CONDITIONING
        # ApplyInstantID already applies both IP-Adapter and ControlNet internally
        # For Flux Dev compatibility, we use the output conditioning directly
        # Note: The ControlNet shape mismatch error suggests InstantID's ControlNet may not be fully compatible
        # with Flux Dev's CLIP architecture (T5XXL + CLIP-L vs SDXL's CLIP-L only)
        # Latent image
        "6": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling
        # ApplyInstantID outputs: [0] = MODEL, [1] = positive CONDITIONING, [2] = negative CONDITIONING
        # Use outputs directly - ApplyInstantID handles IP-Adapter and ControlNet internally
        "8": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["24", 0],  # Use modified model from ApplyInstantID (output 0 = MODEL)
                "positive": ["24", 1],  # Use positive conditioning from ApplyInstantID (output 1)
                "negative": ["24", 2],  # Use negative conditioning from ApplyInstantID (output 2)
                "latent_image": ["6", 0],
            },
        },
        # Decode and save
        "9": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["8", 0],
                "vae": ["3", 0],
            },
        },
        "10": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["9", 0],
            },
        },
    }


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
    image_filename = f"instantid_ref_{uuid.uuid4().hex[:8]}.jpg"
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


def build_sdxl_instantid_workflow(item: dict) -> dict:
    """
    Build SDXL + InstantID workflow JSON.
    
    SDXL uses CheckpointLoaderSimple which outputs [MODEL, CLIP, VAE].
    SDXL uses a single CLIP encoder (not DualCLIP like Flux Dev), making it
    fully compatible with InstantID's ControlNet.
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    
    # SDXL checkpoint (default to common SDXL base model)
    sdxl_checkpoint = item.get("sdxl_checkpoint", "sd_xl_base_1.0.safetensors")
    
    return {
        # Model loader (SDXL - CheckpointLoaderSimple outputs [MODEL, CLIP, VAE])
        "1": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": sdxl_checkpoint,
            },
        },
        # InstantID setup
        "20": {
            "class_type": "InstantIDFaceAnalysis",
            "inputs": {
                "provider": item.get("face_provider", "CPU"),
            },
        },
        "21": {
            "class_type": "InstantIDModelLoader",
            "inputs": {
                "instantid_file": "ip-adapter.bin",
            },
        },
        "22": {
            "class_type": "ControlNetLoader",
            "inputs": {
                "control_net_name": "diffusion_pytorch_model.safetensors",
            },
        },
        # Reference image
        "23": {
            "class_type": "LoadImage",
            "inputs": {
                "image": reference_image,
            },
        },
        # Prompt encoding (SDXL uses single CLIP from checkpoint)
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["1", 1],  # CheckpointLoaderSimple output 1 = CLIP
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["1", 1],  # CheckpointLoaderSimple output 1 = CLIP
            },
        },
        # Apply InstantID - SDXL is fully compatible (single CLIP, 768 dimensions)
        # Outputs: [0] = MODEL, [1] = positive CONDITIONING, [2] = negative CONDITIONING
        "24": {
            "class_type": "ApplyInstantID",
            "inputs": {
                "insightface": ["20", 0],
                "instantid": ["21", 0],
                "control_net": ["22", 0],
                "image": ["23", 0],
                "model": ["1", 0],  # SDXL model from checkpoint (output 0 = MODEL)
                "positive": ["4", 0],  # Positive prompt (CLIP-L, 768 dimensions - compatible!)
                "negative": ["5", 0],  # Negative prompt (CLIP-L, 768 dimensions - compatible!)
                "weight": item.get("instantid_strength", 0.8),
                "start_at": 0.0,
                "end_at": 1.0,
            },
        },
        # Latent image (SDXL uses EmptyLatentImage, not EmptySD3LatentImage)
        "6": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling
        # ApplyInstantID outputs: [0] = MODEL, [1] = positive CONDITIONING, [2] = negative CONDITIONING
        "8": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "cfg": item.get("cfg", 7.0),  # SDXL typically uses higher CFG (7.0 default)
                "sampler_name": item.get("sampler_name", "euler"),
                "scheduler": item.get("scheduler", "normal"),  # SDXL uses "normal" scheduler
                "denoise": 1.0,
                "model": ["24", 0],  # Use modified model from ApplyInstantID
                "positive": ["24", 1],  # Use positive conditioning from ApplyInstantID
                "negative": ["24", 2],  # Use negative conditioning from ApplyInstantID
                "latent_image": ["6", 0],
            },
        },
        # Decode and save
        "9": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["8", 0],
                "vae": ["1", 2],  # CheckpointLoaderSimple output 2 = VAE
            },
        },
        "10": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["9", 0],
            },
        },
    }


class InstantIDHandler:
    """Handler for InstantID workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _flux_instantid_impl(self, item: dict) -> Response:
        """Flux Dev + InstantID implementation."""
        if "reference_image" not in item:
            raise HTTPException(status_code=400, detail="reference_image is required")
        
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Get port
        port = getattr(self.comfyui, 'port', 8000)
        
        # Verify required nodes are available (only check essential nodes)
        from utils.comfyui import verify_nodes_available
        # Essential nodes: InstantIDModelLoader and ApplyInstantID are required
        # InsightFaceLoader and InstantIDControlNetLoader may be optional depending on workflow
        required_nodes = ["InstantIDModelLoader", "ApplyInstantID"]
        node_status = verify_nodes_available(required_nodes, port=port)
        missing_nodes = [node for node, available in node_status.items() if not available]
        
        if missing_nodes:
            error_msg = (
                f"InstantID essential nodes not loaded: {', '.join(missing_nodes)}. "
                "Please check custom node installation. The ComfyUI_InstantID custom node may not be properly installed "
                "or may have import errors. Check ComfyUI server logs for details."
            )
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=503, detail=error_msg)
        
        # Check optional nodes and warn if missing
        optional_nodes = ["InsightFaceLoader", "InstantIDControlNetLoader"]
        optional_status = verify_nodes_available(optional_nodes, port=port)
        missing_optional = [node for node, available in optional_status.items() if not available]
        if missing_optional:
            print(f"⚠️  Warning: Optional InstantID nodes not available: {', '.join(missing_optional)}. Workflow may still work.")
        
        # Build workflow
        workflow = build_flux_instantid_workflow(item)
        
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
        # Get the reference image filename from the workflow
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
        cost_metrics = tracker.calculate_cost("flux-instantid", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _sdxl_instantid_impl(self, item: dict) -> Response:
        """
        SDXL + InstantID implementation.
        
        SDXL is fully compatible with InstantID's ControlNet because it uses
        a single CLIP encoder (CLIP-L, 768 dimensions), matching what InstantID expects.
        This is the recommended endpoint for InstantID workflows.
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
        required_nodes = ["InstantIDModelLoader", "ApplyInstantID", "CheckpointLoaderSimple"]
        node_status = verify_nodes_available(required_nodes, port=port)
        missing_nodes = [node for node, available in node_status.items() if not available]
        
        if missing_nodes:
            error_msg = (
                f"SDXL InstantID essential nodes not loaded: {', '.join(missing_nodes)}. "
                "Please check custom node installation and model availability."
            )
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=503, detail=error_msg)
        
        # Check optional nodes and warn if missing
        optional_nodes = ["InsightFaceLoader", "InstantIDControlNetLoader"]
        optional_status = verify_nodes_available(optional_nodes, port=port)
        missing_optional = [node for node, available in optional_status.items() if not available]
        if missing_optional:
            print(f"⚠️  Warning: Optional InstantID nodes not available: {', '.join(missing_optional)}. Workflow may still work.")
        
        # Build workflow
        workflow = build_sdxl_instantid_workflow(item)
        
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
        cost_metrics = tracker.calculate_cost("sdxl-instantid", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_instantid_endpoints(fastapi, comfyui_instance):
    """
    Register InstantID endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = InstantIDHandler(comfyui_instance)
    
    @fastapi.post("/flux-instantid")
    async def flux_instantid_route(request: Request):
        try:
            item = await request.json()
            result = handler._flux_instantid_impl(item)
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
            print(f"❌ InstantID error: {error_msg}")
            print(f"   Traceback: {traceback_str}")
            
            # Return appropriate status code based on error type
            status_code = 500
            if isinstance(e, HTTPException):
                status_code = e.status_code
            elif "not loaded" in error_msg.lower() or "503" in str(e):
                status_code = 503
            elif "400" in str(e) or "bad request" in error_msg.lower():
                status_code = 400
            
            # Check for the specific ControlNet shape mismatch error
            if "mat1 and mat2 shapes cannot be multiplied" in error_msg and "2816" in error_msg:
                error_msg = (
                    "InstantID ControlNet incompatibility with Flux Dev detected. "
                    "InstantID's ControlNet was designed for SDXL/1.5 models (CLIP-L only, 768 dim) "
                    "but Flux Dev uses T5XXL (2816 dim) + CLIP-L (768 dim). "
                    "The ControlNet expects T5XXL embeddings but receives CLIP-L only, causing shape mismatch. "
                    "Consider using IP-Adapter FaceID instead, which is designed for Flux models, "
                    "or use SDXL model for InstantID workflows."
                )
                status_code = 501  # Not Implemented - fundamental incompatibility
            
            return JSONResponse(
                status_code=status_code,
                content={
                    "error": error_msg,
                    "details": traceback_str,
                    "type": type(e).__name__
                }
            )
    
    @fastapi.post("/sdxl-instantid")
    async def sdxl_instantid_route(request: Request):
        """
        SDXL + InstantID endpoint.
        
        This is the recommended endpoint for InstantID workflows because SDXL
        is fully compatible with InstantID's ControlNet (single CLIP encoder).
        """
        try:
            item = await request.json()
            result = handler._sdxl_instantid_impl(item)
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
            print(f"❌ SDXL InstantID error: {error_msg}")
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
