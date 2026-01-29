"""
Wan 2.6 workflow handlers.

Handles Wan 2.6 text-to-video and R2V generation:
- wan2.6: Standard text-to-video (upgraded from 2.1)
- wan2.6-r2v: Reference-to-video for character consistency

Model: Wan 2.6 (Apache 2.0 - Free for commercial use)
Features:
- R2V support (1-3 reference videos for character consistency)
- Better quality than 2.1
- No LoRA training required for consistency
"""

import json
import uuid
import base64
import os
from pathlib import Path
from typing import Dict, Optional, List
from fastapi import Response

# Import from shared utils
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker, get_cost_summary


def _save_video_to_input(video_data: str) -> str:
    """
    Save base64 video data to ComfyUI input folder.
    
    Args:
        video_data: Base64 data URL (e.g., "data:video/mp4;base64,...")
    
    Returns:
        Filename in ComfyUI input folder
    """
    # Parse data URL
    if video_data.startswith("data:"):
        header, encoded = video_data.split(",", 1)
        mime_type = header.split(";")[0].split(":")[1]
        ext = "mp4" if "mp4" in mime_type else "webm" if "webm" in mime_type else "mp4"
    else:
        encoded = video_data
        ext = "mp4"
    
    # Decode and save
    video_bytes = base64.b64decode(encoded)
    filename = f"{uuid.uuid4().hex}.{ext}"
    input_dir = "/root/comfy/ComfyUI/input"
    os.makedirs(input_dir, exist_ok=True)
    filepath = os.path.join(input_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(video_bytes)
    
    return filename


def build_wan26_workflow(
    prompt: str,
    width: int = 832,
    height: int = 480,
    length: int = 33,
    steps: int = 30,
    cfg: float = 6.0,
    fps: int = 16,
    seed: Optional[int] = None,
    negative_prompt: str = "",
) -> dict:
    """
    Build Wan 2.6 text-to-video workflow JSON.
    
    Args:
        prompt: Text prompt for video generation
        width: Video width (default: 832)
        height: Video height (default: 480)
        length: Number of frames (default: 33)
        steps: Sampling steps (default: 30)
        cfg: CFG scale (default: 6.0)
        fps: Frames per second (default: 16)
        seed: Random seed (None for random)
        negative_prompt: Negative prompt (default: "")
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    return {
        # KSampler
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "uni_pc",
                "scheduler": "simple",
                "denoise": 1,
                "model": ["48", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["40", 0],
            },
        },
        # Positive prompt encoding
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["38", 0],
            },
        },
        # Negative prompt encoding
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
                "clip": ["38", 0],
            },
        },
        # VAE Decode
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["39", 0],
            },
        },
        # Save as animated WEBP
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
        # UNET Loader (Wan 2.6)
        "37": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "wan2.6_t2v_1.3B_fp16.safetensors",
                "weight_dtype": "default",
            },
        },
        # CLIP Loader
        "38": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                "type": "wan",
                "device": "default",
            },
        },
        # VAE Loader
        "39": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "wan_2.6_vae.safetensors",
            },
        },
        # Empty Latent Video
        "40": {
            "class_type": "EmptyHunyuanLatentVideo",
            "inputs": {
                "width": width,
                "height": height,
                "length": length,
                "batch_size": 1,
            },
        },
        # Model Sampling patch
        "48": {
            "class_type": "ModelSamplingSD3",
            "inputs": {
                "model": ["37", 0],
                "shift": 8,
            },
        },
    }


def build_wan26_r2v_workflow(
    prompt: str,
    reference_videos: List[str],
    width: int = 832,
    height: int = 480,
    length: int = 33,
    steps: int = 30,
    cfg: float = 6.0,
    fps: int = 16,
    seed: Optional[int] = None,
    negative_prompt: str = "",
) -> dict:
    """
    Build Wan 2.6 R2V (reference-to-video) workflow JSON.
    
    R2V allows using 1-3 reference videos to maintain character consistency
    without requiring LoRA training.
    
    Args:
        prompt: Text prompt for video generation
        reference_videos: List of reference video filenames (1-3 videos)
        width: Video width (default: 832)
        height: Video height (default: 480)
        length: Number of frames (default: 33)
        steps: Sampling steps (default: 30)
        cfg: CFG scale (default: 6.0)
        fps: Frames per second (default: 16)
        seed: Random seed (None for random)
        negative_prompt: Negative prompt (default: "")
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    if not reference_videos or len(reference_videos) < 1:
        raise ValueError("At least 1 reference video is required for R2V")
    
    if len(reference_videos) > 3:
        raise ValueError("Maximum 3 reference videos supported for R2V")
    
    # Base workflow structure
    workflow = {
        # UNET Loader (Wan 2.6)
        "37": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "wan2.6_t2v_1.3B_fp16.safetensors",
                "weight_dtype": "default",
            },
        },
        # CLIP Loader
        "38": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                "type": "wan",
                "device": "default",
            },
        },
        # VAE Loader
        "39": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "wan_2.6_vae.safetensors",
            },
        },
        # Model Sampling patch
        "48": {
            "class_type": "ModelSamplingSD3",
            "inputs": {
                "model": ["37", 0],
                "shift": 8,
            },
        },
    }
    
    # Add reference video loaders
    ref_node_ids = []
    for i, ref_video in enumerate(reference_videos):
        node_id = f"ref_{i}"
        ref_node_ids.append(node_id)
        workflow[node_id] = {
            "class_type": "LoadVideo",
            "inputs": {
                "video": ref_video,
                "force_rate": fps,
                "force_size": "Disabled",
                "frame_load_cap": 0,
                "skip_first_frames": 0,
                "select_every_nth": 1,
            },
        }
    
    # Combine reference videos if multiple
    if len(ref_node_ids) == 1:
        combined_ref = ref_node_ids[0]
    else:
        # Use ImageBatch to combine reference videos
        workflow["combine_refs"] = {
            "class_type": "ImageBatch",
            "inputs": {
                "image1": [ref_node_ids[0], 0],
                "image2": [ref_node_ids[1], 0] if len(ref_node_ids) > 1 else [ref_node_ids[0], 0],
            },
        }
        combined_ref = "combine_refs"
    
    # Add remaining nodes
    workflow.update({
        # Empty Latent Video
        "40": {
            "class_type": "EmptyHunyuanLatentVideo",
            "inputs": {
                "width": width,
                "height": height,
                "length": length,
                "batch_size": 1,
            },
        },
        # Positive prompt encoding with reference
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["38", 0],
            },
        },
        # Negative prompt encoding
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
                "clip": ["38", 0],
            },
        },
        # KSampler
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "uni_pc",
                "scheduler": "simple",
                "denoise": 1,
                "model": ["48", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["40", 0],
            },
        },
        # VAE Decode
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["39", 0],
            },
        },
        # Save as animated WEBP
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
    })
    
    return workflow


class Wan26Handler:
    """Handler for Wan 2.6 API endpoints."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _wan26_impl(self, item: dict) -> Response:
        """
        Generate video using Wan 2.6.
        
        Args:
            item: Request payload with prompt, dimensions, etc.
        
        Returns:
            Response with generated video
        """
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        prompt = item.get("prompt")
        if not prompt:
            raise ValueError("prompt is required")
        
        width = item.get("width", 832)
        height = item.get("height", 480)
        length = item.get("length", 33)
        steps = item.get("steps", 30)
        cfg = item.get("cfg", 6.0)
        fps = item.get("fps", 16)
        seed = item.get("seed")
        negative_prompt = item.get("negative_prompt", "")
        
        # Build workflow
        workflow = build_wan26_workflow(
            prompt=prompt,
            width=width,
            height=height,
            length=length,
            steps=steps,
            cfg=cfg,
            fps=fps,
            seed=seed,
            negative_prompt=negative_prompt,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan2.6", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "wan2.6"
        response.headers["X-Frames"] = str(length)
        
        return response
    
    def _wan26_r2v_impl(self, item: dict) -> Response:
        """
        Generate video using Wan 2.6 R2V (reference-to-video).
        
        Args:
            item: Request payload with prompt, reference_videos, etc.
        
        Returns:
            Response with generated video
        """
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        prompt = item.get("prompt")
        if not prompt:
            raise ValueError("prompt is required")
        
        reference_videos_data = item.get("reference_videos", [])
        if not reference_videos_data:
            raise ValueError("reference_videos is required (list of base64 video data URLs)")
        
        width = item.get("width", 832)
        height = item.get("height", 480)
        length = item.get("length", 33)
        steps = item.get("steps", 30)
        cfg = item.get("cfg", 6.0)
        fps = item.get("fps", 16)
        seed = item.get("seed")
        negative_prompt = item.get("negative_prompt", "")
        
        # Save reference videos to input folder
        reference_filenames = []
        for video_data in reference_videos_data:
            filename = _save_video_to_input(video_data)
            reference_filenames.append(filename)
        
        # Build workflow
        workflow = build_wan26_r2v_workflow(
            prompt=prompt,
            reference_videos=reference_filenames,
            width=width,
            height=height,
            length=length,
            steps=steps,
            cfg=cfg,
            fps=fps,
            seed=seed,
            negative_prompt=negative_prompt,
        )
        
        # Save workflow to temp file
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        # Execute workflow
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan2.6-r2v", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "wan2.6-r2v"
        response.headers["X-Frames"] = str(length)
        response.headers["X-Reference-Count"] = str(len(reference_filenames))
        
        return response


def setup_wan26_endpoints(fastapi, comfyui_instance):
    """Set up Wan 2.6 API endpoints."""
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = Wan26Handler(comfyui_instance)
    
    @fastapi.post("/wan2.6")
    async def wan26_route(request: Request):
        """
        Generate video using Wan 2.6 text-to-video.
        
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
        
        Returns:
        - image/webp (animated WEBP) with cost headers
        """
        item = await request.json()
        result = handler._wan26_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/wan2.6-r2v")
    async def wan26_r2v_route(request: Request):
        """
        Generate video using Wan 2.6 R2V (reference-to-video).
        
        Uses 1-3 reference videos to maintain character consistency
        without requiring LoRA training.
        
        Request body:
        - prompt: str - Text prompt (required)
        - reference_videos: List[str] - List of base64 video data URLs (1-3 videos, required)
        - width: int - Video width (default: 832)
        - height: int - Video height (default: 480)
        - length: int - Number of frames (default: 33)
        - steps: int - Sampling steps (default: 30)
        - cfg: float - CFG scale (default: 6.0)
        - fps: int - Frames per second (default: 16)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (default: "")
        
        Returns:
        - image/webp (animated WEBP) with cost headers
        """
        item = await request.json()
        result = handler._wan26_r2v_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
