"""
Wan2.1 workflow handler.

Handles Wan2.1 text-to-video generation.
Isolated handler for Wan2 app - no dependencies on other handlers.
"""

import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import Response

# Import from shared utils
# Note: In Modal image, utils are copied to /root/utils/
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


def build_wan2_workflow(item: dict) -> dict:
    """
    Build Wan2.1 workflow JSON.
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 839327983272663),
                "steps": item.get("steps", 30),
                "cfg": item.get("cfg", 6),
                "sampler_name": "uni_pc",
                "scheduler": "simple",
                "denoise": 1,
                "model": ["48", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["40", 0],
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["38", 0],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["38", 0],
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["39", 0],
            },
        },
        "28": {
            "class_type": "SaveAnimatedWEBP",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "fps": item.get("fps", 16),
                "lossless": False,
                "quality": item.get("quality", 90),
                "method": "default",
                "images": ["8", 0],
            },
        },
        "37": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "wan2.1_t2v_1.3B_fp16.safetensors",
                "weight_dtype": "default",
            },
        },
        "38": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                "type": "wan",
                "device": "default",
            },
        },
        "39": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "wan_2.1_vae.safetensors",
            },
        },
        "40": {
            "class_type": "EmptyHunyuanLatentVideo",
            "inputs": {
                "width": item.get("width", 832),
                "height": item.get("height", 480),
                "length": item.get("length", 33),
                "batch_size": 1,
            },
        },
        "48": {
            "class_type": "ModelSamplingSD3",
            "inputs": {
                "shift": 8,
                "model": ["37", 0],
            },
        },
    }


class Wan2Handler:
    """Handler for Wan2.1 workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _wan2_impl(self, item: dict) -> Response:
        """Wan2.1 implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_wan2_workflow(item)
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        # Execute
        video_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan2", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(video_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_wan2_endpoints(fastapi, comfyui_instance):
    """
    Register Wan2 endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = Wan2Handler(comfyui_instance)
    
    @fastapi.post("/wan2")
    async def wan2_route(request: Request):
        item = await request.json()
        result = handler._wan2_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
