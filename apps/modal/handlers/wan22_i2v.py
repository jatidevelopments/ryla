"""
WAN 2.2 I2V (Image-to-Video) Handler with Face Swap.

Endpoints:
- POST /wan22-i2v - Generate video from image with WAN 2.2 GGUF
- POST /wan22-i2v-faceswap - Generate video + swap face (delegates to Qwen batch-video-faceswap)

The I2V workflow uses:
- WanVideoWrapper nodes (WanVideoModelLoader, WanVideoSampler, etc.)
- WAN 2.2 GGUF models for image-to-video generation
- Face swap runs on Qwen app (batch-video-faceswap) to avoid OOM in this container

Model: WAN 2.2 I2V (Apache 2.0 - Free for commercial use)

Handler v8: 2026-02-05 - FaceSwap via Qwen batch-video-faceswap (no in-container ReActor)
"""

import base64
import json
import os
import tempfile
import uuid
from pathlib import Path
from typing import Dict, Optional

import requests
from fastapi import HTTPException, Response

# Import from shared utils
import sys
sys.path.insert(0, "/root/utils")

from cost_tracker import CostTracker

# Qwen batch-video-faceswap URL (face swap runs there to avoid OOM with 14B model here)
BATCH_FACESWAP_URL = os.environ.get(
    "BATCH_VIDEO_FACESWAP_URL",
    "https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run/batch-video-faceswap",
)


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
        ext = "png" if "png" in mime_type else "jpg"
    else:
        encoded = image_data
        ext = "jpg"
    
    # Decode and save
    image_bytes = base64.b64decode(encoded)
    filename = f"{uuid.uuid4().hex}.{ext}"
    input_dir = "/root/comfy/ComfyUI/input"
    os.makedirs(input_dir, exist_ok=True)
    filepath = os.path.join(input_dir, filename)
    
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    
    return filename


def build_wan22_i2v_workflow(
    source_image: str,
    prompt: str = "",
    negative_prompt: str = "blur, low quality, distorted, deformed, watermark, text, ugly, disfigured",
    width: int = 832,
    height: int = 480,
    num_frames: int = 49,
    fps: int = 16,
    steps: int = 40,
    cfg: float = 5.0,
    seed: Optional[int] = None,
) -> dict:
    """
    Build WAN 2.2 I2V workflow using WanVideoWrapper nodes.
    
    Uses WanVideoWrapper's specialized nodes for proper video generation:
    - WanVideoModelLoader for loading the GGUF model
    - WanVideoTextEncodeCached for text encoding
    - WanVideoAnimateEmbeds for image conditioning
    - WanVideoSampler for video sampling
    - WanVideoDecode for decoding
    
    Args:
        source_image: Filename in ComfyUI input folder
        prompt: Text prompt for video generation
        negative_prompt: Negative prompt
        width: Output width
        height: Output height
        num_frames: Number of frames (length)
        fps: Frames per second
        steps: Sampling steps
        cfg: CFG scale
        seed: Random seed
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    output_prefix = uuid.uuid4().hex
    
    workflow = {
        # Load source image
        "1": {
            "class_type": "LoadImage",
            "inputs": {
                "image": source_image,
            },
        },
        # Resize image to target dimensions
        "2": {
            "class_type": "ImageScale",
            "inputs": {
                "image": ["1", 0],
                "upscale_method": "lanczos",
                "width": width,
                "height": height,
                "crop": "center",
            },
        },
        # Load WAN 2.2 GGUF model using WanVideoModelLoader
        # Using LowNoise variant for better image conditioning preservation
        # Model is stored in diffusion_models folder
        "10": {
            "class_type": "WanVideoModelLoader",
            "inputs": {
                "model": "wan22_i2v_low_noise.gguf",  # LowNoise for better image fidelity
                "base_precision": "bf16",
                "quantization": "disabled",  # disabled for GGUF (auto-handled)
                "load_device": "main_device",  # Better quality on A100 80GB
            },
        },
        # Load VAE for WAN video
        "11": {
            "class_type": "WanVideoVAELoader",
            "inputs": {
                "model_name": "Wan2_1_VAE_fp32.safetensors",
                "precision": "fp32",
            },
        },
        # Text encoder for prompts - full precision for better quality
        "12": {
            "class_type": "WanVideoTextEncodeCached",
            "inputs": {
                "model_name": "umt5-xxl-enc-bf16.safetensors",
                "precision": "bf16",
                "positive_prompt": prompt if prompt else "high quality, smooth motion, detailed, professional",
                "negative_prompt": negative_prompt,
                "quantization": "disabled",
                "use_disk_cache": True,
                "device": "gpu",
            },
        },
        # Load CLIP Vision for image encoding
        "13": {
            "class_type": "CLIPVisionLoader",
            "inputs": {
                "clip_name": "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors",
            },
        },
        # Encode source image with CLIP Vision - stronger conditioning
        "14": {
            "class_type": "WanVideoClipVisionEncode",
            "inputs": {
                "clip_vision": ["13", 0],
                "image_1": ["2", 0],
                "strength_1": 1.0,
                "strength_2": 1.0,
                "crop": "center",
                "combine_embeds": "average",
                "force_offload": False,  # Keep on GPU
            },
        },
        # Create image embeds using WanVideoImageToVideoEncode
        # Strong conditioning to preserve source image
        "15": {
            "class_type": "WanVideoImageToVideoEncode",
            "inputs": {
                "width": width,
                "height": height,
                "num_frames": num_frames,
                "noise_aug_strength": 0.025,  # Minimal noise for subtle motion
                "start_latent_strength": 1.0,  # Full strength at start
                "end_latent_strength": 0.8,  # Maintain most of image throughout
                "force_offload": False,  # Keep on GPU
                "vae": ["11", 0],
                "clip_embeds": ["14", 0],
                "start_image": ["2", 0],
                "fun_or_fl2v_model": False,  # Not using Fun model
            },
        },
        # Video sampler - optimized for image fidelity
        "20": {
            "class_type": "WanVideoSampler",
            "inputs": {
                "model": ["10", 0],
                "image_embeds": ["15", 0],
                "steps": steps,
                "cfg": cfg,
                "shift": 5.0,  # Standard shift value
                "seed": seed,
                "force_offload": False,  # Keep on GPU for better quality
                "scheduler": "unipc",  # Stable scheduler for image conditioning
                "riflex_freq_index": 0,
                "text_embeds": ["12", 0],
            },
        },
        # Decode video samples with VAE tiling for higher resolution
        "21": {
            "class_type": "WanVideoDecode",
            "inputs": {
                "vae": ["11", 0],
                "samples": ["20", 0],
                "enable_vae_tiling": True,  # Enable tiling for better quality at higher res
                "tile_x": 272,
                "tile_y": 272,
                "tile_stride_x": 144,
                "tile_stride_y": 128,
            },
        },
        # Save as animated WEBP
        "28": {
            "class_type": "SaveAnimatedWEBP",
            "inputs": {
                "filename_prefix": output_prefix,
                "fps": fps,
                "lossless": False,
                "quality": 90,
                "method": "default",
                "images": ["21", 0],
            },
        },
    }
    
    return workflow


def build_reactor_faceswap_workflow(
    source_image: str,
    face_image: str,
    restore_face: bool = True,
) -> dict:
    """
    Build ReActor face swap workflow for a single image.
    
    Args:
        source_image: Filename of image to swap face in
        face_image: Filename of reference face image
        restore_face: Whether to apply face restoration
    
    Returns:
        ComfyUI workflow dictionary
    """
    output_prefix = uuid.uuid4().hex
    
    workflow = {
        # Load source image (the frame to modify)
        "1": {
            "class_type": "LoadImage",
            "inputs": {
                "image": source_image,
            },
        },
        # Load face reference image (the face to swap in)
        "2": {
            "class_type": "LoadImage",
            "inputs": {
                "image": face_image,
            },
        },
        # ReActor face swap
        "3": {
            "class_type": "ReActorFaceSwap",
            "inputs": {
                "source_image": ["1", 0],  # Original frame
                "input_image": ["2", 0],   # Face to swap in
                "swap_model": "inswapper_128.onnx",
                "facedetection": "retinaface_resnet50",
                "face_restore_model": "GFPGANv1.4.pth" if restore_face else "none",
                "face_restore_visibility": 1.0,
                "codeformer_weight": 0.5,
                "detect_gender_source": "no",
                "detect_gender_input": "no",
                "source_faces_index": "0",
                "input_faces_index": "0",
                "console_log_level": 0,
            },
        },
        # Save output
        "4": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": output_prefix,
                "images": ["3", 0],
            },
        },
    }
    
    return workflow


class Wan22I2VHandler:
    """Handler for WAN 2.2 I2V API endpoints."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _wan22_i2v_impl(self, item: dict) -> Response:
        """
        Generate video from image using WAN 2.2 GGUF.
        
        Args:
            item: Request payload with source_image, prompt, etc.
        
        Returns:
            Response with generated video (WebP format)
        """
        print("🎬 WAN22 I2V v2 - Starting...")
        
        # Validate required parameters
        if "source_image" not in item:
            raise HTTPException(status_code=400, detail="source_image is required (base64 data URL)")
        
        tracker = CostTracker(gpu_type="A100")
        tracker.start()
        
        # Save source image
        source_filename = _save_image_to_input(item["source_image"])
        print(f"   Source image saved: {source_filename}")
        
        # Parse parameters
        prompt = item.get("prompt", "")
        negative_prompt = item.get("negative_prompt", "blur, low quality, distorted, deformed")
        width = item.get("width", 512)
        height = item.get("height", 768)
        num_frames = item.get("num_frames", 33)
        fps = item.get("fps", 16)
        steps = item.get("steps", 20)
        cfg = item.get("cfg", 3.5)
        seed = item.get("seed")
        
        # Build workflow
        workflow = build_wan22_i2v_workflow(
            source_image=source_filename,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_frames=num_frames,
            fps=fps,
            steps=steps,
            cfg=cfg,
            seed=seed,
        )
        
        # Log workflow nodes
        node_types = [workflow[k].get("class_type", "?") for k in workflow.keys()]
        print(f"   Workflow nodes: {node_types}")
        
        # Execute workflow
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Cleanup
        try:
            os.remove(f"/root/comfy/ComfyUI/input/{source_filename}")
        except Exception:
            pass
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan22-i2v", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/webp")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "wan22-i2v"
        response.headers["X-Frames"] = str(num_frames)
        
        return response
    
    def _wan22_i2v_faceswap_impl(self, item: dict) -> Response:
        """
        Generate video from image + swap face in all frames.
        
        Two-phase to avoid OOM (14B model + ReActor in same container):
        1. Generate video using WAN 2.2 I2V (this container).
        2. POST WebP + face to Qwen batch-video-faceswap (runs on Qwen app).
        
        Args:
            item: Request payload with source_image, face_image, prompt, etc.
        
        Returns:
            Response with face-swapped video (MP4 format)
        """
        print("🎬 WAN22 I2V + FaceSwap v3 (via Qwen) - Starting...")
        
        if "source_image" not in item:
            raise HTTPException(status_code=400, detail="source_image is required")
        if "face_image" not in item and "reference_image" not in item:
            raise HTTPException(status_code=400, detail="face_image or reference_image is required")
        
        face_image_data = item.get("face_image") or item.get("reference_image")
        tracker = CostTracker(gpu_type="A100")
        tracker.start()
        
        source_filename = _save_image_to_input(item["source_image"])
        print(f"   Source image: {source_filename}")
        
        prompt = item.get("prompt", "")
        negative_prompt = item.get("negative_prompt", "blur, low quality, distorted")
        width = item.get("width", 832)
        height = item.get("height", 480)
        num_frames = item.get("num_frames", 33)
        fps = item.get("fps", 16)
        steps = item.get("steps", 30)
        cfg = item.get("cfg", 5.0)
        seed = item.get("seed")
        
        # Step 1: Generate video (WAN 2.2 I2V)
        print("   Step 1: Generating video (WAN 2.2 I2V)...")
        workflow = build_wan22_i2v_workflow(
            source_image=source_filename,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_frames=num_frames,
            fps=fps,
            steps=steps,
            cfg=cfg,
            seed=seed,
        )
        workflow_file = f"/tmp/{uuid.uuid4().hex}.json"
        with open(workflow_file, "w") as f:
            json.dump(workflow, f)
        
        try:
            output_bytes = self.comfyui.infer.local(workflow_file)
        finally:
            try:
                os.remove(f"/root/comfy/ComfyUI/input/{source_filename}")
            except Exception:
                pass
        
        video_b64 = base64.b64encode(output_bytes).decode("utf-8")
        source_video_data_url = f"data:image/webp;base64,{video_b64}"
        
        # Step 2: Face swap via Qwen batch-video-faceswap (avoids OOM here)
        print("   Step 2: Face swap (Qwen batch-video-faceswap)...")
        payload = {
            "source_video": source_video_data_url,
            "reference_image": face_image_data,
            "fps": fps,
            "restore_face": item.get("restore_face", True),
        }
        try:
            r = requests.post(BATCH_FACESWAP_URL, json=payload, timeout=1200)
            r.raise_for_status()
            final_video_bytes = r.content
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Qwen batch-video-faceswap failed: {e}")
            if hasattr(e, "response") and e.response is not None:
                try:
                    err_body = e.response.text[:500]
                except Exception:
                    err_body = ""
                raise HTTPException(
                    status_code=502,
                    detail=f"Face swap service failed: {err_body or str(e)}",
                ) from e
            raise HTTPException(status_code=502, detail=f"Face swap service failed: {e}") from e
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("wan22-i2v-faceswap", execution_time)
        
        response = Response(final_video_bytes, media_type="video/mp4")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "wan22-i2v-faceswap"
        response.headers["X-Frames"] = str(num_frames)
        return response


def setup_wan22_i2v_endpoints(fastapi, comfyui_instance):
    """Set up WAN 2.2 I2V API endpoints."""
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = Wan22I2VHandler(comfyui_instance)
    
    @fastapi.post("/wan22-i2v")
    async def wan22_i2v_route(request: Request):
        """
        Generate video from image using WAN 2.2 I2V GGUF model.
        
        Request body:
        - source_image: str - Base64 data URL of source image (required)
        - prompt: str - Text prompt for video motion (optional)
        - negative_prompt: str - Negative prompt (default: "blur, low quality, distorted")
        - width: int - Video width (default: 512)
        - height: int - Video height (default: 768)
        - num_frames: int - Number of frames (default: 33)
        - fps: int - Frames per second (default: 16)
        - steps: int - Sampling steps (default: 20)
        - cfg: float - CFG scale (default: 3.5)
        - seed: int - Random seed (optional)
        
        Returns:
        - image/webp (animated WEBP) with cost headers
        """
        item = await request.json()
        result = handler._wan22_i2v_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/wan22-i2v-faceswap")
    async def wan22_i2v_faceswap_route(request: Request):
        """
        Generate video from image + swap face in all frames.
        
        Uses WAN 2.2 I2V for video generation, then applies ReActor
        face swap to each frame for identity transfer.
        
        Request body:
        - source_image: str - Base64 data URL of source image (required)
        - face_image: str - Base64 data URL of face to swap in (required)
        - prompt: str - Text prompt for video motion (optional)
        - negative_prompt: str - Negative prompt (default: "blur, low quality, distorted")
        - width: int - Video width (default: 512)
        - height: int - Video height (default: 768)
        - num_frames: int - Number of frames (default: 33)
        - fps: int - Frames per second (default: 16)
        - steps: int - Sampling steps (default: 20)
        - cfg: float - CFG scale (default: 3.5)
        - seed: int - Random seed (optional)
        
        Returns:
        - video/mp4 with cost headers
        
        Use cases:
        - Create video of your character in motion
        - Apply face to generated video
        - Identity-preserving video generation
        """
        item = await request.json()
        result = handler._wan22_i2v_faceswap_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
