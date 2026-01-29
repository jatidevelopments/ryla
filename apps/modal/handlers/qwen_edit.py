"""
Qwen-Edit workflow handlers.

Handles Qwen-Image Edit 2511 instruction-based image editing:
- qwen-image-edit-2511: Instruction-driven editing
- qwen-image-inpaint-2511: Mask-based inpainting

Model: Qwen-Image Edit 2511 (Apache 2.0 - Free for commercial use)
Features:
- Instruction-driven editing (background changes, outfit changes, etc.)
- LoRA support for character consistency
- Inpainting/mask-based editing
"""

import json
import uuid
import base64
import os
from pathlib import Path
from typing import Dict, Optional
from fastapi import Response
from fastapi.responses import JSONResponse

# Import from shared utils
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


# Default negative prompt for editing
DEFAULT_NEGATIVE_PROMPT = "blurry, low quality, distorted, deformed, bad anatomy, watermark, signature"


def _save_image_to_input(image_data: str) -> str:
    """
    Save base64 image data to ComfyUI input folder.
    
    Args:
        image_data: Base64 data URL (e.g., "data:image/jpeg;base64,...")
    
    Returns:
        Filename in ComfyUI input folder
    """
    # Parse data URL
    if image_data.startswith("data:"):
        header, encoded = image_data.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
        ext = "jpg" if "jpeg" in mime_type else "png" if "png" in mime_type else "webp"
    else:
        encoded = image_data
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


def build_qwen_edit_workflow(
    source_image: str,
    instruction: str,
    steps: int = 50,
    cfg: float = 4.0,
    seed: Optional[int] = None,
    denoise: float = 0.8,
) -> dict:
    """
    Build Qwen-Image Edit 2511 workflow JSON.
    
    Args:
        source_image: Filename of source image in ComfyUI input folder
        instruction: Editing instruction (e.g., "Change the background to a beach")
        steps: Sampling steps (default: 50)
        cfg: CFG scale (default: 4.0)
        seed: Random seed (None for random)
        denoise: Denoise strength (0.0-1.0, default: 0.8)
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "qwen_image_edit_2511_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors",
                "type": "qwen_image",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "qwen_image_vae.safetensors",
            },
        },
        # Model sampling patch
        "4": {
            "class_type": "ModelSamplingAuraFlow",
            "inputs": {
                "model": ["1", 0],
                "shift": 3.1,
            },
        },
        # Load source image
        "5": {
            "class_type": "LoadImage",
            "inputs": {
                "image": source_image,
            },
        },
        # VAE Encode source image
        "6": {
            "class_type": "VAEEncode",
            "inputs": {
                "pixels": ["5", 0],
                "vae": ["3", 0],
            },
        },
        # Prompt Encoding - Instruction
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": instruction,
            },
        },
        # Prompt Encoding - Negative
        "8": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": DEFAULT_NEGATIVE_PROMPT,
            },
        },
        # KSampler
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["4", 0],
                "positive": ["7", 0],
                "negative": ["8", 0],
                "latent_image": ["6", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": denoise,
            },
        },
        # VAE Decode
        "10": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["9", 0],
                "vae": ["3", 0],
            },
        },
        # Preview/Save Image
        "11": {
            "class_type": "PreviewImage",
            "inputs": {
                "images": ["10", 0],
            },
        },
    }


def build_qwen_inpaint_workflow(
    source_image: str,
    mask_image: str,
    prompt: str,
    steps: int = 50,
    cfg: float = 4.0,
    seed: Optional[int] = None,
) -> dict:
    """
    Build Qwen-Image Inpaint workflow JSON.
    
    Args:
        source_image: Filename of source image in ComfyUI input folder
        mask_image: Filename of mask image in ComfyUI input folder (white = edit area)
        prompt: Description of what to inpaint
        steps: Sampling steps (default: 50)
        cfg: CFG scale (default: 4.0)
        seed: Random seed (None for random)
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    return {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "qwen_image_edit_2511_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors",
                "type": "qwen_image",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "qwen_image_vae.safetensors",
            },
        },
        # Model sampling patch
        "4": {
            "class_type": "ModelSamplingAuraFlow",
            "inputs": {
                "model": ["1", 0],
                "shift": 3.1,
            },
        },
        # Load source image
        "5": {
            "class_type": "LoadImage",
            "inputs": {
                "image": source_image,
            },
        },
        # Load mask image
        "6": {
            "class_type": "LoadImage",
            "inputs": {
                "image": mask_image,
            },
        },
        # VAE Encode source image (use VAEEncode instead of VAEEncodeForInpaint)
        # VAEEncodeForInpaint doesn't work with Qwen VAE (tuple downscale_ratio)
        "7": {
            "class_type": "VAEEncode",
            "inputs": {
                "pixels": ["5", 0],
                "vae": ["3", 0],
            },
        },
        # Apply mask to latent using SetLatentNoiseMask
        "13": {
            "class_type": "SetLatentNoiseMask",
            "inputs": {
                "samples": ["7", 0],
                "mask": ["6", 1],  # Mask output from LoadImage
            },
        },
        # Prompt Encoding - Positive
        "8": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": prompt,
            },
        },
        # Prompt Encoding - Negative
        "9": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": DEFAULT_NEGATIVE_PROMPT,
            },
        },
        # KSampler - now uses masked latent from node 13
        "10": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["4", 0],
                "positive": ["8", 0],
                "negative": ["9", 0],
                "latent_image": ["13", 0],  # Use masked latent
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
        },
        # VAE Decode
        "11": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["10", 0],
                "vae": ["3", 0],
            },
        },
        # Preview/Save Image
        "12": {
            "class_type": "PreviewImage",
            "inputs": {
                "images": ["11", 0],
            },
        },
    }


class QwenEditHandler:
    """Handler for Qwen-Edit API endpoints."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _edit_impl(self, item: dict) -> Response:
        """
        Edit image using Qwen-Image Edit 2511.
        
        Args:
            item: Request payload with source_image, instruction, etc.
        
        Returns:
            Response with edited image
        """
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        source_image_data = item.get("source_image")
        if not source_image_data:
            raise ValueError("source_image is required (base64 data URL)")
        
        instruction = item.get("instruction")
        if not instruction:
            raise ValueError("instruction is required (editing instruction)")
        
        steps = item.get("steps", 50)
        cfg = item.get("cfg", 4.0)
        seed = item.get("seed")
        denoise = item.get("denoise", 0.8)
        
        # Save source image to input folder
        source_filename = _save_image_to_input(source_image_data)
        
        # Build workflow
        workflow = build_qwen_edit_workflow(
            source_image=source_filename,
            instruction=instruction,
            steps=steps,
            cfg=cfg,
            seed=seed,
            denoise=denoise,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("qwen-image-edit-2511", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "qwen-image-edit-2511"
        
        return response
    
    def _inpaint_impl(self, item: dict) -> Response:
        """
        Inpaint image using Qwen-Image Edit 2511 + mask compositing.
        
        Implementation: Uses instruction-based editing then composites with mask.
        (Native ComfyUI inpaint has FP8 compatibility issues with 2511 model)
        
        Args:
            item: Request payload with source_image, mask_image, prompt, etc.
        
        Returns:
            Response with inpainted image
        """
        from PIL import Image
        import io
        import base64
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        source_image_data = item.get("source_image")
        if not source_image_data:
            raise ValueError("source_image is required (base64 data URL)")
        
        mask_image_data = item.get("mask_image")
        if not mask_image_data:
            raise ValueError("mask_image is required (base64 data URL, white = edit area)")
        
        prompt = item.get("prompt")
        if not prompt:
            raise ValueError("prompt is required (what to inpaint)")
        
        steps = item.get("steps", 50)
        cfg = item.get("cfg", 4.0)
        seed = item.get("seed")
        
        # Decode source image for later compositing
        source_b64 = source_image_data.split(",")[1] if "," in source_image_data else source_image_data
        source_bytes = base64.b64decode(source_b64)
        source_pil = Image.open(io.BytesIO(source_bytes)).convert("RGBA")
        
        # Decode mask image
        mask_b64 = mask_image_data.split(",")[1] if "," in mask_image_data else mask_image_data
        mask_bytes = base64.b64decode(mask_b64)
        mask_pil = Image.open(io.BytesIO(mask_bytes)).convert("L")
        
        # Resize mask to match source if needed
        if mask_pil.size != source_pil.size:
            mask_pil = mask_pil.resize(source_pil.size, Image.LANCZOS)
        
        # Save source image for editing workflow
        source_filename = _save_image_to_input(source_image_data)
        
        # Build instruction-based edit workflow using the prompt as instruction
        workflow = build_qwen_edit_workflow(
            source_image=source_filename,
            instruction=prompt,
            steps=steps,
            cfg=cfg,
            seed=seed,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow - get fully edited image
        edited_bytes = self.comfyui.infer.local(workflow_file)
        edited_pil = Image.open(io.BytesIO(edited_bytes)).convert("RGBA")
        
        # Resize edited to match source if needed
        if edited_pil.size != source_pil.size:
            edited_pil = edited_pil.resize(source_pil.size, Image.LANCZOS)
        
        # Composite: apply mask to blend edited areas onto original
        # White in mask = use edited, Black = use original
        result = Image.composite(edited_pil, source_pil, mask_pil)
        
        # Convert to JPEG bytes
        result_rgb = result.convert("RGB")
        output_buffer = io.BytesIO()
        result_rgb.save(output_buffer, format="JPEG", quality=95)
        output_bytes = output_buffer.getvalue()
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("qwen-image-inpaint-2511", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "qwen-image-edit-2511"
        response.headers["X-Inpaint-Method"] = "instruction-composite"
        
        return response


def setup_qwen_edit_endpoints(fastapi, comfyui_instance):
    """Set up Qwen-Edit API endpoints."""
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = QwenEditHandler(comfyui_instance)
    
    @fastapi.post("/qwen-image-edit-2511")
    async def qwen_edit_route(request: Request):
        """
        Edit image using instruction-driven Qwen-Image Edit 2511.
        
        Request body:
        - source_image: str - Base64 data URL of source image (required)
        - instruction: str - Editing instruction (required)
          Examples: "Change background to beach", "Add sunglasses", "Make hair blonde"
        - steps: int - Sampling steps (default: 50)
        - cfg: float - CFG scale (default: 4.0)
        - seed: int - Random seed (optional)
        - denoise: float - Denoise strength 0.0-1.0 (default: 0.8)
        
        Returns:
        - image/jpeg with cost headers
        """
        item = await request.json()
        result = handler._edit_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/qwen-image-inpaint-2511")
    async def qwen_inpaint_route(request: Request):
        """
        Inpaint image region using Qwen-Image Edit 2511.
        
        Uses VAEEncode + SetLatentNoiseMask instead of VAEEncodeForInpaint
        to work around Qwen VAE tuple downscale_ratio issue.
        
        Request body:
        - source_image: str - Base64 data URL of source image (required)
        - mask_image: str - Base64 data URL of mask image (required)
          White = area to edit, Black = area to keep
        - prompt: str - Description of what to inpaint (required)
        - steps: int - Sampling steps (default: 50)
        - cfg: float - CFG scale (default: 4.0)
        - seed: int - Random seed (optional)
        
        Returns:
        - image/jpeg with cost headers
        """
        item = await request.json()
        result = handler._inpaint_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
