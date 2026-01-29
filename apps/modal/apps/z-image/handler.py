"""
Z-Image workflow handlers.

Handles Z-Image-Turbo text-to-image generation with multiple workflow variants:
- Simple: Basic workflow (no custom nodes)
- Danrisi: Optimized workflow (RES4LYF custom nodes)
- InstantID: Face consistency with InstantID
- PuLID: Face consistency with PuLID
- LoRA: Text-to-image with custom character LoRA
"""

import json
import uuid
import os
import subprocess
from pathlib import Path
from typing import Dict, Optional
from fastapi import Response, HTTPException

# Import from shared utils
# Note: In Modal image, utils are copied to /root/utils/
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


def _save_reference_image(reference_image: str) -> str:
    """
    Save reference image from base64 data URL to ComfyUI input folder.
    
    Args:
        reference_image: Base64 data URL (e.g., "data:image/jpeg;base64,...")
    
    Returns:
        Filename in ComfyUI input folder
    """
    import base64
    import os
    
    # Parse data URL
    if reference_image.startswith("data:"):
        header, encoded = reference_image.split(",", 1)
        # Extract MIME type and extension
        mime_type = header.split(";")[0].split(":")[1]
        ext = "jpg" if "jpeg" in mime_type else "png" if "png" in mime_type else "webp"
    else:
        # Assume it's already base64 encoded
        encoded = reference_image
        ext = "png"
    
    # Decode and save
    image_bytes = base64.b64decode(encoded)
    filename = f"{uuid.uuid4().hex}.{ext}"
    input_dir = "/root/comfy/ComfyUI/input"
    os.makedirs(input_dir, exist_ok=True)
    filepath = os.path.join(input_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    
    return filename


def build_z_image_simple_workflow(item: dict) -> dict:
    """
    Build Z-Image Simple workflow JSON.
    
    Basic workflow using only built-in ComfyUI nodes (no custom nodes required).
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "sd3",  # Simple workflow uses sd3
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        # Prompt Encoding
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
        # Latent Image
        "6": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Standard Sampling
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
                "seed": item.get("seed", 42),
                "steps": item.get("steps", 9),
                "cfg": item.get("cfg", 1.0),
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
        },
        # Decode and Save
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


def build_z_image_danrisi_workflow(item: dict) -> dict:
    """
    Build Z-Image Danrisi workflow JSON.
    
    Optimized workflow using RES4LYF custom nodes:
    - ClownsharKSampler_Beta
    - BetaSamplingScheduler
    - Sigmas Rescale
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "lumina2",  # Danrisi uses lumina2, not sd3
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        # Prompt Encoding
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
        "6": {
            "class_type": "ConditioningZeroOut",
            "inputs": {
                "conditioning": ["5", 0],
            },
        },
        # Latent Image
        "7": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling (Danrisi optimized)
        "8": {
            "class_type": "BetaSamplingScheduler",
            "inputs": {
                "model": ["1", 0],
                "steps": item.get("steps", 20),
                "alpha": 0.4,
                "beta": 0.4,
            },
        },
        "9": {
            "class_type": "Sigmas Rescale",
            "inputs": {
                "sigmas": ["8", 0],
                "start": 0.996,
                "end": 0,
            },
        },
        "10": {
            "class_type": "ClownsharKSampler_Beta",
            "inputs": {
                "eta": 0.5,
                "sampler_name": "linear/ralston_2s",
                "scheduler": "beta",
                "steps": item.get("steps", 20),
                "steps_to_run": -1,
                "denoise": 1.0,
                "cfg": item.get("cfg", 1.0),
                "seed": item.get("seed", 42),
                "sampler_mode": "standard",
                "bongmath": True,
                "model": ["1", 0],
                "positive": ["4", 0],
                "negative": ["6", 0],
                "latent_image": ["7", 0],
                "sigmas": ["9", 0],
            },
        },
        # Decode and Save
        "11": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["10", 0],
                "vae": ["3", 0],
            },
        },
        "12": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["11", 0],
            },
        },
    }


def build_z_image_instantid_workflow(item: dict) -> dict:
    """
    Build Z-Image InstantID workflow JSON.
    
    Face consistency workflow using InstantID.
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    
    return {
        # Model Loaders (Z-Image)
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "lumina2",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        # InstantID Setup
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
        # Reference Image
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
        # Prompt Encoding
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
        "6": {
            "class_type": "ConditioningZeroOut",
            "inputs": {
                "conditioning": ["5", 0],
            },
        },
        # Combine Prompt + InstantID
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
                "negative": ["6", 0],
                "control_net": ["22", 0],
                "image": ["24", 1],
                "strength": item.get("controlnet_strength", 0.8),
                "start_percent": 0.0,
                "end_percent": 1.0,
            },
        },
        # Latent Image
        "7": {
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
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["1", 0],
                "positive": ["26", 0],
                "negative": ["26", 1],
                "latent_image": ["7", 0],
            },
        },
        # Decode and Save
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


def build_z_image_pulid_workflow(item: dict) -> dict:
    """
    Build Z-Image PuLID workflow JSON.
    
    Face consistency workflow using PuLID.
    
    Args:
        item: Request payload with prompt, reference_image, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Handle reference image
    reference_image = _save_reference_image(item["reference_image"])
    
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "lumina2",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        # PuLID Setup
        "20": {
            "class_type": "PulidFluxModelLoader",
            "inputs": {
                "pulid_file": "pulid_flux_v0.9.1.safetensors",
            },
        },
        "21": {
            "class_type": "PulidFluxInsightFaceLoader",
            "inputs": {
                "provider": item.get("face_provider", "CPU"),
            },
        },
        "22": {
            "class_type": "PulidFluxEvaClipLoader",
            "inputs": {},
        },
        # Reference Image
        "23": {
            "class_type": "LoadImage",
            "inputs": {
                "image": reference_image,
            },
        },
        # Apply PuLID
        "24": {
            "class_type": "ApplyPulidFlux",
            "inputs": {
                "model": ["1", 0],
                "pulid_flux": ["20", 0],
                "eva_clip": ["22", 0],
                "face_analysis": ["21", 0],
                "image": ["23", 0],
                "weight": item.get("pulid_strength", 0.8),
                "start_at": item.get("pulid_start", 0.0),
                "end_at": item.get("pulid_end", 1.0),
            },
        },
        # PuLID Compatibility Patch
        "28": {
            "class_type": "FixPulidFluxPatch",
            "inputs": {
                "model": ["24", 0],
            },
        },
        # Prompt Encoding
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
        "6": {
            "class_type": "ConditioningZeroOut",
            "inputs": {
                "conditioning": ["5", 0],
            },
        },
        # Latent Image
        "7": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "batch_size": 1,
            },
        },
        # Sampling (Danrisi style with PuLID model)
        "8": {
            "class_type": "BetaSamplingScheduler",
            "inputs": {
                "model": ["28", 0],
                "steps": item.get("steps", 20),
                "alpha": 0.4,
                "beta": 0.4,
            },
        },
        "9": {
            "class_type": "Sigmas Rescale",
            "inputs": {
                "sigmas": ["8", 0],
                "start": 0.996,
                "end": 0,
            },
        },
        "10": {
            "class_type": "ClownsharKSampler_Beta",
            "inputs": {
                "eta": 0.5,
                "sampler_name": "linear/ralston_2s",
                "scheduler": "beta",
                "steps": item.get("steps", 20),
                "steps_to_run": -1,
                "denoise": 1.0,
                "cfg": item.get("cfg", 1.0),
                "seed": item.get("seed", 42),
                "sampler_mode": "standard",
                "bongmath": True,
                "model": ["28", 0],
                "positive": ["4", 0],
                "negative": ["6", 0],
                "latent_image": ["7", 0],
                "sigmas": ["9", 0],
            },
        },
        # Decode and Save
        "11": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["10", 0],
                "vae": ["3", 0],
            },
        },
        "12": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["11", 0],
            },
        },
    }


def build_z_image_lora_workflow(
    prompt: str,
    lora_filename: str,
    width: int = 1024,
    height: int = 1024,
    steps: int = 9,
    cfg: float = 1.0,
    seed: Optional[int] = None,
    negative_prompt: str = "",
    lora_strength: float = 1.0,
    trigger_word: Optional[str] = None,
) -> dict:
    """
    Build Z-Image Simple workflow with custom LoRA.
    
    Uses the simple workflow (built-in nodes only) with LoRA applied.
    
    Args:
        prompt: Text prompt for image generation
        lora_filename: LoRA filename (e.g., "character-123.safetensors")
        width: Image width (default: 1024)
        height: Image height (default: 1024)
        steps: Sampling steps (default: 9, Z-Image Turbo is fast)
        cfg: CFG scale (default: 1.0)
        seed: Random seed (None for random)
        negative_prompt: Negative prompt (default: "")
        lora_strength: LoRA strength (default: 1.0)
        trigger_word: Trigger word to prepend to prompt (optional)
    
    Returns:
        ComfyUI workflow dictionary
    """
    import random
    if seed is None:
        seed = random.randint(0, 2**32 - 1)
    
    # Prepend trigger word if provided
    full_prompt = f"{trigger_word} {prompt}".strip() if trigger_word else prompt
    
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        # LoRA Loader (applied to model only)
        "50": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["1", 0],
                "lora_name": lora_filename,
                "strength_model": lora_strength,
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "sd3",  # Simple workflow uses sd3
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        # Prompt Encoding
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": full_prompt,
                "clip": ["2", 0],
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
                "clip": ["2", 0],
            },
        },
        # Latent Image
        "6": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1,
            },
        },
        # Standard Sampling with LoRA-modified model
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["50", 0],  # Use LoRA-modified model
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
        },
        # Decode and Save
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


class ZImageHandler:
    """Handler for Z-Image workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _z_image_simple_impl(self, item: dict) -> Response:
        """Z-Image Simple implementation."""
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_z_image_simple_workflow(item)
        
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        image_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-simple", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(image_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _z_image_danrisi_impl(self, item: dict) -> Response:
        """Z-Image Danrisi implementation."""
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_z_image_danrisi_workflow(item)
        
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        image_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-danrisi", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(image_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _z_image_instantid_impl(self, item: dict) -> Response:
        """Z-Image InstantID implementation."""
        if "reference_image" not in item:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="reference_image is required for InstantID workflow")
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_z_image_instantid_workflow(item)
        
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        image_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-instantid", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(image_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _z_image_pulid_impl(self, item: dict) -> Response:
        """Z-Image PuLID implementation."""
        if "reference_image" not in item:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="reference_image is required for PuLID workflow")
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_z_image_pulid_workflow(item)
        
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        image_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-pulid", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(image_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _z_image_lora_impl(self, item: dict) -> Response:
        """Z-Image LoRA implementation."""
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
            lora_filename = f"character-{lora_id}.safetensors"
        
        # Check LoRA in ComfyUI loras directory
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
        
        # Check if LoRA exists
        if not comfy_lora_path.exists() and not volume_lora_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"LoRA not found: {lora_filename}. Upload to /root/models/loras/"
            )
        
        if "prompt" not in item:
            raise HTTPException(status_code=400, detail="prompt is required")
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow = build_z_image_lora_workflow(
            prompt=item["prompt"],
            lora_filename=lora_filename,
            width=item.get("width", 1024),
            height=item.get("height", 1024),
            steps=item.get("steps", 9),
            cfg=item.get("cfg", 1.0),
            seed=item.get("seed"),
            negative_prompt=item.get("negative_prompt", ""),
            lora_strength=item.get("lora_strength", 1.0),
            trigger_word=item.get("trigger_word"),
        )
        
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow, Path(workflow_file).open("w"))
        
        image_bytes = self.comfyui.infer.local(workflow_file)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-lora", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(image_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-LoRA"] = lora_filename
        return response


def setup_z_image_endpoints(fastapi, comfyui_instance):
    """
    Register Z-Image endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = ZImageHandler(comfyui_instance)
    
    @fastapi.post("/z-image-simple")
    async def z_image_simple_route(request: Request):
        item = await request.json()
        result = handler._z_image_simple_impl(item)
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/z-image-danrisi")
    async def z_image_danrisi_route(request: Request):
        item = await request.json()
        result = handler._z_image_danrisi_impl(item)
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/z-image-instantid")
    async def z_image_instantid_route(request: Request):
        item = await request.json()
        result = handler._z_image_instantid_impl(item)
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/z-image-pulid")
    async def z_image_pulid_route(request: Request):
        item = await request.json()
        result = handler._z_image_pulid_impl(item)
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/z-image-lora")
    async def z_image_lora_route(request: Request):
        """
        Generate image using Z-Image Turbo with custom character LoRA.
        
        Request body:
        - prompt: str - Text prompt (required)
        - lora_id: str - Character LoRA ID (auto-prefixed to "character-{id}.safetensors")
        - lora_name: str - Direct LoRA filename (alternative to lora_id)
        - lora_strength: float - LoRA strength (default: 1.0)
        - trigger_word: str - Trigger word to prepend to prompt (optional)
        - width: int - Image width (default: 1024)
        - height: int - Image height (default: 1024)
        - steps: int - Sampling steps (default: 9, Z-Image Turbo is fast)
        - cfg: float - CFG scale (default: 1.0)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (default: "")
        
        Returns:
        - image/jpeg with cost headers
        
        Note: LoRA must be uploaded to /root/models/loras/ on the Modal volume.
        """
        item = await request.json()
        result = handler._z_image_lora_impl(item)
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
