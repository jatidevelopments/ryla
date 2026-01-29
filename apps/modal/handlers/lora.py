"""
LoRA workflow handler.

Handles Flux Dev + LoRA character-specific generation.
"""

import json
import uuid
import subprocess
from pathlib import Path
from typing import Dict
from fastapi import Response, HTTPException

from utils.cost_tracker import CostTracker, get_cost_summary


def build_flux_lora_workflow(item: dict, lora_filename: str) -> dict:
    """
    Build Flux Dev + LoRA workflow JSON.
    
    Args:
        item: Request payload with prompt, lora_id, etc.
        lora_filename: LoRA filename (e.g., "character-123.safetensors")
    
    Returns:
        ComfyUI workflow dictionary
    """
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
        # LoRA loader
        "30": {
            "class_type": "LoraLoader",
            "inputs": {
                "model": ["1", 0],  # UNETLoader output
                "clip": ["2", 0],   # DualCLIPLoader output
                "lora_name": lora_filename,
                "strength_model": item.get("lora_strength", 1.0),
                "strength_clip": item.get("lora_strength", 1.0),
            },
        },
        # Prompt encoding (with trigger word if provided)
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": f"{item.get('trigger_word', '')} {item['prompt']}".strip(),
                "clip": ["30", 1],  # Use LoRA-modified CLIP
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["30", 1],
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
                "model": ["30", 0],  # Use LoRA-modified model
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
            },
        },
        # Decode and save
        "9": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["8", 0],
                "vae": ["3", 0],  # VAELoader output
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


class LoRAHandler:
    """Handler for LoRA workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _flux_lora_impl(self, item: dict) -> Response:
        """Flux Dev + LoRA implementation."""
        if "lora_id" not in item and "lora_name" not in item:
            raise HTTPException(status_code=400, detail="lora_id or lora_name is required")
        
        # Support both lora_id (auto-prefixed) and lora_name (direct filename)
        if "lora_name" in item:
            lora_filename = item["lora_name"]
            if not lora_filename.endswith(".safetensors"):
                lora_filename += ".safetensors"
        else:
            lora_id = item["lora_id"]
            lora_filename = f"character-{lora_id}.safetensors"
        
        # Check LoRA in ComfyUI loras directory (models should be symlinked there from volume)
        comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{lora_filename}")
        volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
        
        # If LoRA exists in volume but not in ComfyUI directory, symlink it
        if volume_lora_path.exists() and not comfy_lora_path.exists():
            comfy_lora_path.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(
                f"ln -s {volume_lora_path} {comfy_lora_path}",
                shell=True,
                check=False,
            )
        
        # Check if LoRA exists (in ComfyUI directory or volume)
        if not comfy_lora_path.exists() and not volume_lora_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"LoRA not found. Expected: {lora_filename} in /root/models/loras/ or /root/comfy/ComfyUI/models/loras/"
            )
        
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_flux_lora_workflow(item, lora_filename)
        
        # Get port
        port = getattr(self.comfyui, 'port', 8000)
        
        # Execute via API
        from comfyui import execute_workflow_via_api
        img_bytes = execute_workflow_via_api(workflow, port=port, timeout=600)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-lora", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_lora_endpoints(fastapi, comfyui_instance):
    """
    Register LoRA endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = LoRAHandler(comfyui_instance)
    
    @fastapi.post("/flux-lora")
    async def flux_lora_route(request: Request):
        item = await request.json()
        result = handler._flux_lora_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
