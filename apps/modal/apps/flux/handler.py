"""
Flux workflow handler.

Handles Flux Schnell and Flux Dev text-to-image generation.
Isolated handler for Flux app - no dependencies on other handlers.
"""

import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import Response

# Import from shared utils
# At build time: import from shared/utils (relative to project root)
# At runtime: import from /root/utils (where Modal copies them)
import sys
import os
from pathlib import Path

# Calculate absolute path to shared/utils from project root
# handler.py is at: apps/modal/apps/flux/handler.py
# shared/utils is at: apps/modal/shared/utils/
_current_file = Path(__file__).resolve()
_project_root = _current_file.parent.parent.parent.parent.parent  # Go up to project root
_shared_utils_path = _project_root / "apps" / "modal" / "shared" / "utils"

# Try build-time path first (relative to project)
if _shared_utils_path.exists() and str(_shared_utils_path) not in sys.path:
    sys.path.insert(0, str(_shared_utils_path))

# Also add runtime path (where Modal copies files)
if "/root/utils" not in sys.path:
    sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


def build_flux_workflow(item: dict) -> dict:
    """
    Build Flux Schnell workflow JSON.
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["4", 1],
            },
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": "flux1-schnell-fp8.safetensors",
            },
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["10", 0],
            },
        },
        "10": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["5", 0],
                "vae": ["4", 2],
            },
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 4),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["3", 0],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["4", 1],
            },
        },
        "3": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
    }


def build_flux_dev_workflow(item: dict) -> dict:
    """
    Build Flux Dev workflow JSON.
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        # Model loaders
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
                "clip_name1": "t5xxl_fp16.safetensors",  # T5 encoder
                "clip_name2": "clip_l.safetensors",      # CLIP encoder
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
        # Prompt encoding
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item["prompt"],
                "clip": ["2", 0],  # DualCLIPLoader output
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["2", 0],
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
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["1", 0],  # UNETLoader output
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
            },
        },
        # Decode and save
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["7", 0],
                "vae": ["3", 0],  # VAELoader output
            },
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["8", 0],
            },
        },
    }


def build_flux_dev_lora_workflow(item: dict, lora_filename: str) -> dict:
    """
    Build Flux Dev + LoRA workflow JSON.
    
    Args:
        item: Request payload with prompt, lora_id, trigger_word, etc.
        lora_filename: LoRA filename (e.g., "character-123.safetensors")
    
    Returns:
        ComfyUI workflow dictionary with LoRA loader
    """
    # Build prompt with trigger word if provided
    prompt = item["prompt"]
    trigger_word = item.get("trigger_word", "")
    if trigger_word:
        prompt = f"{trigger_word} {prompt}"
    
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
        # LoRA loader - applies LoRA to model and CLIP
        "10": {
            "class_type": "LoraLoader",
            "inputs": {
                "model": ["1", 0],  # UNETLoader output
                "clip": ["2", 0],   # DualCLIPLoader output
                "lora_name": lora_filename,
                "strength_model": item.get("lora_strength", 1.0),
                "strength_clip": item.get("lora_strength", 1.0),
            },
        },
        # Prompt encoding (using LoRA-modified CLIP)
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["10", 1],  # LoRA-modified CLIP
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": item.get("negative_prompt", ""),
                "clip": ["10", 1],
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
        # Sampling (using LoRA-modified model)
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 20),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["10", 0],  # LoRA-modified model
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
            },
        },
        # Decode and save
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["7", 0],
                "vae": ["3", 0],
            },
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["8", 0],
            },
        },
    }


import subprocess


def ensure_lora_symlink(lora_filename: str) -> bool:
    """
    Ensure LoRA file is symlinked from volume to ComfyUI directory.
    
    Args:
        lora_filename: LoRA filename (e.g., "character-123.safetensors")
    
    Returns:
        True if LoRA is available, False otherwise
    """
    comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{lora_filename}")
    volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
    
    # Already exists in ComfyUI directory
    if comfy_lora_path.exists():
        return True
    
    # Exists in volume - create symlink
    if volume_lora_path.exists():
        comfy_lora_path.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(f"ln -s {volume_lora_path} {comfy_lora_path}", shell=True, check=True)
        print(f"✅ Symlinked LoRA: {lora_filename}")
        return True
    
    return False


class FluxHandler:
    """Handler for Flux workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _flux_impl(self, item: dict) -> Response:
        """Flux Schnell implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_flux_workflow(item)
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        # Execute
        img_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _flux_dev_impl(self, item: dict) -> Response:
        """Flux Dev implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow
        workflow = build_flux_dev_workflow(item)
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        # Execute
        img_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-dev", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _flux_dev_lora_impl(self, item: dict) -> Response:
        """Flux Dev + LoRA implementation."""
        from fastapi import HTTPException
        
        # Validate LoRA parameter
        if "lora_id" not in item and "lora_name" not in item:
            raise HTTPException(status_code=400, detail="lora_id or lora_name is required")
        
        # Resolve LoRA filename
        if "lora_name" in item:
            lora_filename = item["lora_name"]
            if not lora_filename.endswith(".safetensors"):
                lora_filename += ".safetensors"
        else:
            lora_id = item["lora_id"]
            lora_filename = f"character-{lora_id}.safetensors"
        
        # Ensure LoRA is available
        if not ensure_lora_symlink(lora_filename):
            raise HTTPException(
                status_code=404,
                detail=f"LoRA not found: {lora_filename}. Train it first using /train-lora endpoint."
            )
        
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow with LoRA
        workflow = build_flux_dev_lora_workflow(item, lora_filename)
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        # Execute
        img_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("flux-dev-lora", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-LoRA-Used"] = lora_filename
        return response


def setup_flux_endpoints(fastapi, comfyui_instance):
    """
    Register Flux endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = FluxHandler(comfyui_instance)
    
    @fastapi.post("/flux")
    async def flux_route(request: Request):
        item = await request.json()
        result = handler._flux_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/flux-dev")
    async def flux_dev_route(request: Request):
        item = await request.json()
        result = handler._flux_dev_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/flux-dev-lora")
    async def flux_dev_lora_route(request: Request):
        """
        Flux Dev + LoRA character-specific generation.
        
        Request body:
        - prompt: Text prompt
        - lora_id: Character ID (will be prefixed with "character-")
        - lora_name: Alternative - direct LoRA filename
        - trigger_word: Optional trigger word for the LoRA
        - lora_strength: Optional LoRA strength (default 1.0)
        - width, height, steps, cfg, seed: Standard generation params
        """
        item = await request.json()
        result = handler._flux_dev_lora_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-") and not key.startswith("X-Powered"):
                response.headers[key] = value
        return response
