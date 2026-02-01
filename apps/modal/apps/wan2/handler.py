"""
Wan2.1 workflow handler.

Handles Wan2.1 text-to-video generation:
- /wan2 - Standard text-to-video
- /wan2-lora - Text-to-video with custom character LoRA

Isolated handler for Wan2 app - no dependencies on other handlers.
"""

import json
import uuid
import subprocess
from pathlib import Path
from typing import Dict, Optional
from fastapi import Response, HTTPException

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


def build_wan2_lora_workflow(
    prompt: str,
    lora_filename: str,
    width: int = 832,
    height: int = 480,
    length: int = 33,
    steps: int = 30,
    cfg: float = 6.0,
    fps: int = 16,
    seed: Optional[int] = None,
    negative_prompt: str = "",
    lora_strength: float = 1.0,
    trigger_word: Optional[str] = None,
) -> dict:
    """
    Build Wan2.1 workflow with custom LoRA.
    
    Args:
        prompt: Text prompt for video generation
        lora_filename: LoRA filename in ComfyUI loras folder
        width: Video width (default: 832)
        height: Video height (default: 480)
        length: Number of frames (default: 33)
        steps: Sampling steps (default: 30)
        cfg: Classifier-free guidance scale (default: 6.0)
        fps: Frames per second for output (default: 16)
        seed: Random seed (default: None for random)
        negative_prompt: Negative prompt (default: "")
        lora_strength: LoRA strength (default: 1.0)
        trigger_word: Optional trigger word to prepend to prompt
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Prepend trigger word if provided
    if trigger_word and trigger_word not in prompt:
        prompt = f"{trigger_word} {prompt}"
    
    return {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed if seed is not None else 839327983272663,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "uni_pc",
                "scheduler": "simple",
                "denoise": 1,
                "model": ["48", 0],  # From ModelSamplingSD3 (after LoRA)
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["40", 0],
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["49", 1],  # From LoraLoaderModelOnly (clip passthrough)
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
                "clip": ["49", 1],  # From LoraLoaderModelOnly (clip passthrough)
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
                "fps": fps,
                "lossless": False,
                "quality": 90,
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
                "width": width,
                "height": height,
                "length": length,
                "batch_size": 1,
            },
        },
        # LoRA loader - applies LoRA to model
        "49": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["37", 0],  # UNETLoader output
                "lora_name": lora_filename,
                "strength_model": lora_strength,
            },
        },
        "48": {
            "class_type": "ModelSamplingSD3",
            "inputs": {
                "shift": 8,
                "model": ["49", 0],  # LoRA-modified model
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
    
    def _wan2_lora_impl(self, item: dict) -> Response:
        """Wan2.1 with custom LoRA implementation."""
        # Validate LoRA parameter
        if "lora_id" not in item and "lora_name" not in item:
            raise HTTPException(status_code=400, detail="lora_id or lora_name is required")
        
        # Support both lora_id (auto-prefixed) and lora_name (direct filename)
        if "lora_name" in item:
            lora_filename = item["lora_name"]
            if not lora_filename.endswith(".safetensors"):
                lora_filename += ".safetensors"
        else:
            lora_id = item["lora_id"]
            lora_filename = f"wan-character-{lora_id}.safetensors"
        
        # Check LoRA in multiple locations
        comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{lora_filename}")
        
        # Wan-specific LoRA volume path (preferred)
        wan_volume_lora_path = Path(f"/root/models/wan-loras/{lora_filename}")
        # Legacy FLUX LoRA volume path (fallback)
        flux_volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
        # Also check without 'wan-' prefix for compatibility
        legacy_filename = f"character-{item.get('lora_id', '')}.safetensors"
        legacy_wan_path = Path(f"/root/models/wan-loras/{legacy_filename}")
        legacy_flux_path = Path(f"/root/models/loras/{legacy_filename}")
        
        # Determine which volume path has the LoRA
        volume_lora_path = None
        actual_lora_filename = lora_filename
        
        if wan_volume_lora_path.exists():
            volume_lora_path = wan_volume_lora_path
        elif flux_volume_lora_path.exists():
            volume_lora_path = flux_volume_lora_path
        elif legacy_wan_path.exists():
            volume_lora_path = legacy_wan_path
            actual_lora_filename = legacy_filename
        elif legacy_flux_path.exists():
            volume_lora_path = legacy_flux_path
            actual_lora_filename = legacy_filename
        
        # Update comfy path with actual filename
        comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{actual_lora_filename}")
        lora_filename = actual_lora_filename
        
        # If LoRA exists in volume but not in ComfyUI directory, symlink it
        if volume_lora_path and volume_lora_path.exists() and not comfy_lora_path.exists():
            comfy_lora_path.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(
                f"ln -s {volume_lora_path} {comfy_lora_path}",
                shell=True,
                check=False,
            )
        
        # Check if LoRA exists
        if not comfy_lora_path.exists() and (not volume_lora_path or not volume_lora_path.exists()):
            raise HTTPException(
                status_code=404,
                detail=f"LoRA not found: {lora_filename}. Train a Wan LoRA using ryla-wan-lora-training or upload to /root/models/wan-loras/"
            )
        
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        prompt = item.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="prompt is required")
        
        width = item.get("width", 832)
        height = item.get("height", 480)
        length = item.get("length", 33)
        steps = item.get("steps", 30)
        cfg = item.get("cfg", 6.0)
        fps = item.get("fps", 16)
        seed = item.get("seed")
        negative_prompt = item.get("negative_prompt", "")
        lora_strength = item.get("lora_strength", 1.0)
        trigger_word = item.get("trigger_word")
        
        # Build workflow with custom LoRA
        workflow = build_wan2_lora_workflow(
            prompt=prompt,
            lora_filename=lora_filename,
            width=width,
            height=height,
            length=length,
            steps=steps,
            cfg=cfg,
            fps=fps,
            seed=seed,
            negative_prompt=negative_prompt,
            lora_strength=lora_strength,
            trigger_word=trigger_word,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow
        video_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan2-lora", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(video_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "wan2-lora"
        response.headers["X-LoRA"] = lora_filename
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
        """
        Generate video using Wan2.1 text-to-video.
        
        Request body:
        - prompt: str - Text prompt (required)
        - width: int - Video width (default: 832)
        - height: int - Video height (default: 480)
        - length: int - Number of frames (default: 33)
        - steps: int - Sampling steps (default: 30)
        - cfg: float - CFG scale (default: 6.0)
        - fps: int - Frames per second (default: 16)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (default: "")
        """
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
    
    @fastapi.post("/wan2-lora")
    async def wan2_lora_route(request: Request):
        """
        Generate video using Wan2.1 with custom character LoRA.
        
        Request body:
        - prompt: str - Text prompt (required)
        - lora_id: str - Character LoRA ID (e.g., "abc123") - auto-prefixed to "wan-character-abc123.safetensors"
        - lora_name: str - Direct LoRA filename (alternative to lora_id)
        - lora_strength: float - LoRA strength (default: 1.0)
        - trigger_word: str - Trigger word to prepend to prompt (optional)
        - width: int - Video width (default: 832)
        - height: int - Video height (default: 480)
        - length: int - Number of frames (default: 33)
        - steps: int - Sampling steps (default: 30)
        - cfg: float - CFG scale (default: 6.0)
        - fps: int - Frames per second (default: 16)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (default: "")
        
        Note: LoRA must be trained using ryla-wan-lora-training or uploaded to /root/models/wan-loras/
        """
        item = await request.json()
        result = handler._wan2_lora_impl(item)
        # Preserve cost and LoRA headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
