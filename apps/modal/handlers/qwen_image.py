"""
Qwen-Image workflow handlers.

Handles Qwen-Image 2512 text-to-image generation:
- qwen-image-2512: High quality (50 steps)
- qwen-image-2512-fast: Fast generation with Lightning LoRA (4 steps)

Model: Qwen-Image 2512 (Apache 2.0 - Free for commercial use)
Features:
- Hyper-realistic AI influencer generation
- >95% LoRA consistency
- Multiple aspect ratios support
"""

import json
import uuid
from pathlib import Path
from typing import Dict, Optional
from fastapi import Response

# Import from shared utils
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


# Aspect ratio presets for Qwen-Image 2512
ASPECT_RATIOS = {
    "1:1": (1328, 1328),
    "16:9": (1664, 928),
    "9:16": (928, 1664),
    "4:3": (1472, 1104),
    "3:4": (1104, 1472),
    "3:2": (1584, 1056),
    "2:3": (1056, 1584),
}

# Default negative prompt (Chinese - model was trained on this)
DEFAULT_NEGATIVE_PROMPT = "低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲"


def build_qwen_image_2512_workflow(
    prompt: str,
    width: int = 1328,
    height: int = 1328,
    steps: int = 50,
    cfg: float = 4.0,
    seed: Optional[int] = None,
    negative_prompt: Optional[str] = None,
    use_lightning_lora: bool = False,
) -> dict:
    """
    Build Qwen-Image 2512 workflow JSON.
    
    Args:
        prompt: Positive prompt text
        width: Image width (default: 1328 for 1:1)
        height: Image height (default: 1328 for 1:1)
        steps: Sampling steps (50 for quality, 4 for fast with LoRA)
        cfg: CFG scale (4.0 recommended)
        seed: Random seed (None for random)
        negative_prompt: Negative prompt (uses Chinese default if None)
        use_lightning_lora: Whether to use Lightning 4-step LoRA
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    neg_prompt = negative_prompt if negative_prompt else DEFAULT_NEGATIVE_PROMPT
    
    workflow = {
        # Model Loaders
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "qwen_image_2512_fp8_e4m3fn.safetensors",
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
    }
    
    # Model sampling patch (ModelSamplingAuraFlow)
    if use_lightning_lora:
        # With Lightning LoRA: UNETLoader -> LoraLoaderModelOnly -> ModelSamplingAuraFlow
        workflow["4"] = {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["1", 0],
                "lora_name": "Qwen-Image-Lightning-4steps-V1.0.safetensors",
                "strength_model": 1.0,
            },
        }
        workflow["5"] = {
            "class_type": "ModelSamplingAuraFlow",
            "inputs": {
                "model": ["4", 0],
                "shift": 3.1,
            },
        }
        model_node = "5"
    else:
        # Without LoRA: UNETLoader -> ModelSamplingAuraFlow
        workflow["5"] = {
            "class_type": "ModelSamplingAuraFlow",
            "inputs": {
                "model": ["1", 0],
                "shift": 3.1,
            },
        }
        model_node = "5"
    
    # Continue with remaining nodes
    workflow.update({
        # Prompt Encoding - Positive
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": prompt,
            },
        },
        # Prompt Encoding - Negative
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": neg_prompt,
            },
        },
        # Empty Latent Image
        "8": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1,
            },
        },
        # KSampler
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "model": [model_node, 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["8", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
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
    })
    
    return workflow


class QwenImageHandler:
    """Handler for Qwen-Image API endpoints."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _parse_dimensions(self, item: dict) -> tuple:
        """Parse width/height from request, handling aspect_ratio shorthand."""
        if "aspect_ratio" in item:
            ratio = item["aspect_ratio"]
            if ratio in ASPECT_RATIOS:
                return ASPECT_RATIOS[ratio]
        
        width = item.get("width", 1328)
        height = item.get("height", 1328)
        return width, height
    
    def _qwen_image_2512_impl(self, item: dict, fast_mode: bool = False) -> Response:
        """
        Generate image using Qwen-Image 2512.
        
        Args:
            item: Request payload with prompt, dimensions, etc.
            fast_mode: If True, use Lightning LoRA with 4 steps
        
        Returns:
            Response with generated image
        """
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        prompt = item.get("prompt", "A beautiful woman")
        width, height = self._parse_dimensions(item)
        seed = item.get("seed")
        negative_prompt = item.get("negative_prompt")
        
        # Fast mode uses Lightning LoRA with 4 steps
        if fast_mode:
            steps = item.get("steps", 4)
            cfg = item.get("cfg", 1.0)
            use_lora = True
        else:
            steps = item.get("steps", 50)
            cfg = item.get("cfg", 4.0)
            use_lora = item.get("use_lightning_lora", False)
        
        # Build workflow
        workflow = build_qwen_image_2512_workflow(
            prompt=prompt,
            width=width,
            height=height,
            steps=steps,
            cfg=cfg,
            seed=seed,
            negative_prompt=negative_prompt,
            use_lightning_lora=use_lora,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        endpoint = "qwen-image-2512-fast" if fast_mode else "qwen-image-2512"
        cost_metrics = tracker.calculate_cost(endpoint, execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "qwen-image-2512"
        response.headers["X-Steps"] = str(steps)
        
        return response


def setup_qwen_image_endpoints(fastapi, comfyui_instance):
    """Set up Qwen-Image API endpoints."""
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = QwenImageHandler(comfyui_instance)
    
    @fastapi.post("/qwen-image-2512")
    async def qwen_image_2512_route(request: Request):
        """
        Generate hyper-realistic image using Qwen-Image 2512.
        
        Request body:
        - prompt: str - Text prompt (required)
        - width: int - Image width (default: 1328)
        - height: int - Image height (default: 1328)
        - aspect_ratio: str - Aspect ratio shorthand ("1:1", "16:9", "9:16", etc.)
        - steps: int - Sampling steps (default: 50)
        - cfg: float - CFG scale (default: 4.0)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (optional, uses Chinese default)
        - use_lightning_lora: bool - Use 4-step Lightning LoRA (default: false)
        
        Returns:
        - image/jpeg with cost headers
        """
        item = await request.json()
        result = handler._qwen_image_2512_impl(item, fast_mode=False)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/qwen-image-2512-fast")
    async def qwen_image_2512_fast_route(request: Request):
        """
        Generate image using Qwen-Image 2512 with Lightning LoRA (4 steps).
        
        Same parameters as /qwen-image-2512 but:
        - steps: default 4 (optimized for Lightning LoRA)
        - cfg: default 1.0 (optimized for Lightning LoRA)
        - use_lightning_lora: always true
        
        ~10x faster than standard, slightly lower quality.
        """
        item = await request.json()
        result = handler._qwen_image_2512_impl(item, fast_mode=True)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
