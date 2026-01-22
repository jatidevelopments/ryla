"""
InstantID workflow handler.

Handles Flux Dev + InstantID face consistency generation.
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
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image (base64 or file path)
    reference_image = item["reference_image"]
    if reference_image.startswith("data:"):
        # Base64 data URL - save to temp file
        temp_image_path = f"/tmp/{uuid.uuid4().hex}.jpg"
        save_base64_to_file(reference_image, temp_image_path)
        reference_image = temp_image_path
    
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
        "20": {
            "class_type": "InsightFaceLoader",
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
            "class_type": "InstantIDControlNetLoader",
            "inputs": {
                "controlnet_name": "diffusion_pytorch_model.safetensors",
            },
        },
        # Reference image
        "23": {
            "class_type": "LoadImage",
            "inputs": {
                "image": reference_image,
            },
        },
        # Apply InstantID
        "24": {
            "class_type": "ApplyInstantID",
            "inputs": {
                "insightface": ["20", 0],
                "instantid": ["21", 0],
                "controlnet": ["22", 0],
                "image": ["23", 0],
                "weight": item.get("instantid_strength", 0.8),
                "controlnet_conditioning_scale": item.get("controlnet_strength", 0.8),
            },
        },
        # Prompt encoding
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
        # Combine prompt + InstantID
        "25": {
            "class_type": "ConditioningCombine",
            "inputs": {
                "conditioning_1": ["4", 0],
                "conditioning_2": ["24", 0],
            },
        },
        # Apply ControlNet
        "26": {
            "class_type": "ControlNetApplyAdvanced",
            "inputs": {
                "positive": ["25", 0],
                "negative": ["5", 0],
                "control_net": ["22", 0],
                "image": ["24", 1],
                "strength": item.get("controlnet_strength", 0.8),
                "start_percent": 0.0,
                "end_percent": 1.0,
            },
        },
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
        "8": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["1", 0],
                "positive": ["26", 0],
                "negative": ["26", 1],
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
        
        # Build workflow
        workflow = build_flux_instantid_workflow(item)
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        # Execute
        img_bytes = self.comfyui.infer.local(workflow_file)
        
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
