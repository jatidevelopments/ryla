"""
PuLID Flux workflow handler for face consistency.

Uses balazik/ComfyUI-PuLID-Flux for face identity preservation with Flux Dev.
This provides better face consistency than IP-Adapter without the attn_mask issues.
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
    image_filename = f"pulid_ref_{uuid.uuid4().hex[:8]}.jpg"
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


def build_pulid_flux_workflow(item: dict) -> dict:
    """
    Build Flux Dev + PuLID workflow JSON for face consistency.
    
    Uses ComfyUI-PuLID-Flux nodes:
    - PulidFluxModelLoader: Loads PuLID model
    - PulidFluxInsightFaceLoader: Loads InsightFace for face detection
    - PulidFluxEvaClipLoader: Loads EVA-CLIP for encoding
    - ApplyPulidFlux: Applies face identity to Flux model
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    import random
    
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    seed = item.get("seed", random.randint(0, 2**31 - 1))
    
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
        # PuLID model loaders (v0.9.1 - latest)
        "5": {
            "class_type": "PulidFluxModelLoader",
            "inputs": {
                "pulid_file": "pulid_flux_v0.9.1.safetensors",
            },
        },
        "6": {
            "class_type": "PulidFluxInsightFaceLoader",
            "inputs": {
                "provider": "CUDA",
            },
        },
        "7": {
            "class_type": "PulidFluxEvaClipLoader",
            "inputs": {},
        },
        # Apply PuLID to model
        "8": {
            "class_type": "ApplyPulidFlux",
            "inputs": {
                "model": ["1", 0],
                "pulid_flux": ["5", 0],
                "eva_clip": ["7", 0],
                "face_analysis": ["6", 0],
                "image": ["4", 0],
                "weight": item.get("pulid_weight", 0.9),  # 0.9 for better face consistency (fidelity mode)
                "start_at": item.get("start_at", 0.0),
                "end_at": item.get("end_at", 1.0),
            },
        },
        # Text encoding with FluxGuidance
        "9": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["2", 0],
            },
        },
        "10": {
            "class_type": "FluxGuidance",
            "inputs": {
                "conditioning": ["9", 0],
                "guidance": item.get("guidance", 3.5),
            },
        },
        # Empty latent
        "11": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling
        "12": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": item.get("steps", 20),
                "cfg": 1.0,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["8", 0],  # PuLID-applied model
                "positive": ["10", 0],
                "negative": ["10", 0],  # Flux doesn't use negative
                "latent_image": ["11", 0],
            },
        },
        # Decode and save
        "13": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["12", 0],
                "vae": ["3", 0],
            },
        },
        "14": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["13", 0],
            },
        },
    }


class PulidFluxHandler:
    """Handler for PuLID Flux workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _pulid_flux_impl(self, item: dict) -> Response:
        """PuLID Flux implementation for face consistency."""
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Validate reference image
        if "reference_image" not in item:
            raise HTTPException(
                status_code=400,
                detail="reference_image is required for PuLID Flux"
            )
        
        # Build workflow
        workflow = build_pulid_flux_workflow(item)
        
        # Get port
        port = getattr(self.comfyui, 'port', 8000)
        
        # Execute via API
        from comfyui import execute_workflow_via_api
        img_bytes = execute_workflow_via_api(workflow, port=port, timeout=600)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("pulid-flux", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_pulid_flux_endpoints(fastapi, comfyui_instance):
    """
    Set up PuLID Flux endpoints on the FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI server instance
    """
    from fastapi import Request
    
    handler = PulidFluxHandler(comfyui_instance)
    
    @fastapi.post("/flux-pulid")
    async def flux_pulid_route(request: Request):
        """
        Generate image with face consistency using PuLID Flux.
        
        Request body:
        {
            "prompt": "A woman in a red dress at sunset",
            "reference_image": "data:image/jpeg;base64,...",
            "width": 1024,
            "height": 1024,
            "steps": 20,
            "guidance": 3.5,
            "pulid_weight": 0.8,
            "seed": 42
        }
        """
        item = await request.json()
        return handler._pulid_flux_impl(item)
    
    print("✅ PuLID Flux endpoints registered: /flux-pulid")
