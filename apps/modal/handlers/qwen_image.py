"""
Qwen-Image workflow handlers.

Handles Qwen-Image 2512 text-to-image generation:
- qwen-image-2512: High quality (50 steps)
- qwen-image-2512-fast: Fast generation with Lightning LoRA (4 steps)
- qwen-image-2512-lora: Custom character LoRA support
- video-faceswap: Frame-by-frame video face swap using ReActor

Model: Qwen-Image 2512 (Apache 2.0 - Free for commercial use)
Features:
- Hyper-realistic AI influencer generation
- >95% LoRA consistency
- Multiple aspect ratios support
- Custom character LoRA loading
- Video face swap with character consistency
"""

import json
import uuid
import subprocess
import base64
import os
from pathlib import Path
from typing import Dict, Optional, List
from fastapi import Response, HTTPException

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


def build_video_faceswap_workflow(
    video_filename: str,
    face_image_filename: str,
    fps: int = 30,
    restore_face: bool = True,
    face_restore_visibility: float = 1.0,
    codeformer_weight: float = 0.5,
) -> dict:
    """
    Build video face swap workflow using ReActor.
    
    Pipeline:
    1. VHS_LoadVideo - Load source video frames
    2. LoadImage - Load reference face image
    3. ReActorFaceSwap - Swap face on each frame
    4. VHS_VideoCombine - Combine frames back to video
    
    Args:
        video_filename: Video filename in ComfyUI input folder
        face_image_filename: Face image filename in ComfyUI input folder
        fps: Output video FPS (default: 30)
        restore_face: Apply GFPGAN face restoration (default: True)
        face_restore_visibility: Face restore blend (default: 1.0)
        codeformer_weight: CodeFormer weight for restoration (default: 0.5)
    
    Returns:
        ComfyUI workflow dictionary
    """
    output_prefix = uuid.uuid4().hex
    
    workflow = {
        # Load source video
        "1": {
            "class_type": "VHS_LoadVideo",
            "inputs": {
                "video": video_filename,
                "force_rate": fps,
                "force_size": "Disabled",
                "custom_width": 0,
                "custom_height": 0,
                "frame_load_cap": 0,
                "skip_first_frames": 0,
                "select_every_nth": 1,
            },
        },
        # Load reference face image
        "2": {
            "class_type": "LoadImage",
            "inputs": {
                "image": face_image_filename,
            },
        },
        # ReActor face swap on each frame
        "3": {
            "class_type": "ReActorFaceSwap",
            "inputs": {
                "enabled": True,
                "input_image": ["1", 0],  # Video frames
                "source_image": ["2", 0],  # Face reference
                "swap_model": "inswapper_128.onnx",
                "facedetection": "retinaface_resnet50",
                "face_restore_model": "GFPGANv1.4.pth" if restore_face else "none",
                "face_restore_visibility": face_restore_visibility,
                "codeformer_weight": codeformer_weight,
                "detect_gender_input": "no",
                "detect_gender_source": "no",
                "input_faces_index": "0",
                "source_faces_index": "0",
                "console_log_level": 1,
            },
        },
        # Combine frames back to video
        "4": {
            "class_type": "VHS_VideoCombine",
            "inputs": {
                "images": ["3", 0],  # Swapped frames
                "frame_rate": fps,
                "loop_count": 0,
                "filename_prefix": output_prefix,
                "format": "video/h264-mp4",
                "pingpong": False,
                "save_output": True,
                "pix_fmt": "yuv420p",
                "crf": 19,
                "save_metadata": False,
                "audio": ["1", 2],  # Audio from original video
            },
        },
    }
    
    return workflow


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
        # Save Image (use SaveImage to properly capture output)
        "11": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["10", 0],
            },
        },
    })
    
    return workflow


def build_qwen_image_2512_lora_workflow(
    prompt: str,
    lora_filename: str,
    width: int = 1328,
    height: int = 1328,
    steps: int = 50,
    cfg: float = 4.0,
    seed: Optional[int] = None,
    negative_prompt: Optional[str] = None,
    lora_strength: float = 1.0,
    trigger_word: Optional[str] = None,
) -> dict:
    """
    Build Qwen-Image 2512 workflow with custom LoRA.
    
    Args:
        prompt: Positive prompt text
        lora_filename: LoRA filename (e.g., "character-123.safetensors")
        width: Image width (default: 1328 for 1:1)
        height: Image height (default: 1328 for 1:1)
        steps: Sampling steps (default: 50)
        cfg: CFG scale (default: 4.0)
        seed: Random seed (None for random)
        negative_prompt: Negative prompt (uses Chinese default if None)
        lora_strength: LoRA strength (default: 1.0)
        trigger_word: Trigger word to prepend to prompt (optional)
    
    Returns:
        ComfyUI workflow dictionary
    """
    if seed is None:
        import random
        seed = random.randint(0, 2**32 - 1)
    
    neg_prompt = negative_prompt if negative_prompt else DEFAULT_NEGATIVE_PROMPT
    
    # Prepend trigger word if provided
    full_prompt = f"{trigger_word} {prompt}".strip() if trigger_word else prompt
    
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
        # Custom LoRA loader (model only - Qwen uses single CLIP)
        "4": {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["1", 0],
                "lora_name": lora_filename,
                "strength_model": lora_strength,
            },
        },
        # Model sampling patch (ModelSamplingAuraFlow)
        "5": {
            "class_type": "ModelSamplingAuraFlow",
            "inputs": {
                "model": ["4", 0],  # Use LoRA-modified model
                "shift": 3.1,
            },
        },
        # Prompt Encoding - Positive
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": full_prompt,
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
                "model": ["5", 0],  # Use model after LoRA + AuraFlow
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
        # Save Image (use SaveImage to properly capture output)
        "11": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["10", 0],
            },
        },
    }
    
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
    
    def _qwen_image_2512_lora_impl(self, item: dict) -> Response:
        """
        Generate image using Qwen-Image 2512 with custom LoRA.
        
        Args:
            item: Request payload with prompt, lora_id/lora_name, etc.
        
        Returns:
            Response with generated image
        """
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
            # Check both Qwen-Image LoRA path and legacy FLUX LoRA path
            lora_filename = f"qwen-character-{lora_id}.safetensors"
        
        # Check LoRA in ComfyUI loras directory and multiple volume paths
        comfy_lora_path = Path(f"/root/comfy/ComfyUI/models/loras/{lora_filename}")
        # Qwen-specific LoRA volume path (preferred)
        qwen_volume_lora_path = Path(f"/root/models/qwen-loras/{lora_filename}")
        # Legacy FLUX LoRA volume path (fallback)
        flux_volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
        # Also check without 'qwen-' prefix for compatibility
        legacy_filename = f"character-{item.get('lora_id', '')}.safetensors"
        legacy_qwen_path = Path(f"/root/models/qwen-loras/{legacy_filename}")
        legacy_flux_path = Path(f"/root/models/loras/{legacy_filename}")
        
        # Determine which volume path has the LoRA
        volume_lora_path = None
        actual_lora_filename = lora_filename
        
        if qwen_volume_lora_path.exists():
            volume_lora_path = qwen_volume_lora_path
        elif flux_volume_lora_path.exists():
            volume_lora_path = flux_volume_lora_path
        elif legacy_qwen_path.exists():
            volume_lora_path = legacy_qwen_path
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
                detail=f"LoRA not found: {lora_filename}. Train a Qwen LoRA using /ryla-qwen-lora-training or upload to /root/models/qwen-loras/"
            )
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Parse request
        prompt = item.get("prompt", "A beautiful woman")
        width, height = self._parse_dimensions(item)
        seed = item.get("seed")
        negative_prompt = item.get("negative_prompt")
        steps = item.get("steps", 50)
        cfg = item.get("cfg", 4.0)
        lora_strength = item.get("lora_strength", 1.0)
        trigger_word = item.get("trigger_word")
        
        # Build workflow with custom LoRA
        workflow = build_qwen_image_2512_lora_workflow(
            prompt=prompt,
            lora_filename=lora_filename,
            width=width,
            height=height,
            steps=steps,
            cfg=cfg,
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
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("qwen-image-2512-lora", execution_time)
        
        # Build response
        response = Response(output_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        response.headers["X-Model"] = "qwen-image-2512-lora"
        response.headers["X-LoRA"] = lora_filename
        response.headers["X-Steps"] = str(steps)
        
        return response
    
    def _video_faceswap_impl(self, item: dict) -> Response:
        """
        Apply face swap to video using ReActor.
        
        Pipeline:
        1. Load source video frames
        2. Load reference face image
        3. Apply ReActor face swap to each frame
        4. Combine frames back to video with original audio
        
        Args:
            item: Request payload with source_video, reference_image, etc.
        
        Returns:
            Response with face-swapped video (MP4)
        """
        import glob
        import time
        import requests
        
        # Validate required parameters
        if "source_video" not in item:
            raise HTTPException(status_code=400, detail="source_video is required (base64 data URL)")
        if "reference_image" not in item:
            raise HTTPException(status_code=400, detail="reference_image is required (base64 data URL)")
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Save inputs to ComfyUI input folder
        video_filename = _save_video_to_input(item["source_video"])
        face_filename = _save_image_to_input(item["reference_image"])
        
        # Parse options
        fps = item.get("fps", 30)
        restore_face = item.get("restore_face", True)
        face_restore_visibility = item.get("face_restore_visibility", 1.0)
        codeformer_weight = item.get("codeformer_weight", 0.5)
        
        # Generate unique output prefix for finding the output video
        output_prefix = uuid.uuid4().hex
        
        try:
            # Build workflow with our output prefix
            workflow = build_video_faceswap_workflow(
                video_filename=video_filename,
                face_image_filename=face_filename,
                fps=fps,
                restore_face=restore_face,
                face_restore_visibility=face_restore_visibility,
                codeformer_weight=codeformer_weight,
            )
            
            # Override the output prefix so we can find the file
            workflow["4"]["inputs"]["filename_prefix"] = output_prefix
            
            # Queue workflow via ComfyUI API directly (skip the image-specific utility)
            comfy_port = 8000
            queue_url = f"http://127.0.0.1:{comfy_port}/prompt"
            
            prompt_id = str(uuid.uuid4())
            payload = {
                "prompt": workflow,
                "client_id": prompt_id,
            }
            
            response = requests.post(queue_url, json=payload, timeout=30)
            if response.status_code != 200:
                raise Exception(f"Failed to queue workflow: HTTP {response.status_code} - {response.text}")
            
            queue_response = response.json()
            if "error" in queue_response:
                raise Exception(f"Workflow error: {queue_response['error']}")
            
            actual_prompt_id = queue_response.get("prompt_id", prompt_id)
            
            # Poll for completion
            history_url = f"http://127.0.0.1:{comfy_port}/history/{actual_prompt_id}"
            max_wait = 600  # 10 minutes max
            poll_interval = 2
            waited = 0
            
            while waited < max_wait:
                time.sleep(poll_interval)
                waited += poll_interval
                
                try:
                    history_response = requests.get(history_url, timeout=10)
                    if history_response.status_code == 200:
                        history = history_response.json()
                        if actual_prompt_id in history:
                            outputs = history[actual_prompt_id].get("outputs", {})
                            if outputs:
                                break
                except Exception:
                    pass
            
            if waited >= max_wait:
                raise Exception("Video processing timed out after 10 minutes")
            
            # Find the output video file
            output_dir = "/root/comfy/ComfyUI/output"
            video_pattern = f"{output_dir}/{output_prefix}*.mp4"
            video_files = glob.glob(video_pattern)
            
            if not video_files:
                # Try in a subdirectory
                video_pattern = f"{output_dir}/**/{output_prefix}*.mp4"
                video_files = glob.glob(video_pattern, recursive=True)
            
            if not video_files:
                raise Exception(f"Output video not found. Searched for: {output_prefix}*.mp4")
            
            # Read the output video
            output_video_path = video_files[0]
            with open(output_video_path, "rb") as f:
                output_bytes = f.read()
            
            # Cleanup output video
            try:
                os.remove(output_video_path)
            except Exception:
                pass
            
            # Calculate cost (video processing is more expensive)
            execution_time = tracker.stop()
            cost_metrics = tracker.calculate_cost("video-faceswap", execution_time)
            
            # Build response
            response = Response(output_bytes, media_type="video/mp4")
            response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
            response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
            response.headers["X-GPU-Type"] = cost_metrics.gpu_type
            response.headers["X-Model"] = "reactor-video-faceswap"
            response.headers["X-FPS"] = str(fps)
            
            return response
            
        finally:
            # Cleanup input files
            try:
                video_path = f"/root/comfy/ComfyUI/input/{video_filename}"
                face_path = f"/root/comfy/ComfyUI/input/{face_filename}"
                if os.path.exists(video_path):
                    os.remove(video_path)
                if os.path.exists(face_path):
                    os.remove(face_path)
            except Exception as e:
                print(f"Warning: Failed to cleanup input files: {e}")


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
    
    @fastapi.post("/qwen-image-2512-lora")
    async def qwen_image_2512_lora_route(request: Request):
        """
        Generate image using Qwen-Image 2512 with custom character LoRA.
        
        Request body:
        - prompt: str - Text prompt (required)
        - lora_id: str - Character LoRA ID (e.g., "abc123") - auto-prefixed to "character-abc123.safetensors"
        - lora_name: str - Direct LoRA filename (alternative to lora_id)
        - lora_strength: float - LoRA strength (default: 1.0)
        - trigger_word: str - Trigger word to prepend to prompt (optional)
        - width: int - Image width (default: 1328)
        - height: int - Image height (default: 1328)
        - aspect_ratio: str - Aspect ratio shorthand ("1:1", "16:9", etc.)
        - steps: int - Sampling steps (default: 50)
        - cfg: float - CFG scale (default: 4.0)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (optional)
        
        Returns:
        - image/jpeg with cost headers
        
        Note: LoRA must be uploaded to /root/models/loras/ on the Modal volume.
        Use lora_id for character LoRAs (auto-prefixed) or lora_name for direct filename.
        """
        item = await request.json()
        result = handler._qwen_image_2512_lora_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response
    
    @fastapi.post("/video-faceswap")
    async def video_faceswap_route(request: Request):
        """
        Apply face swap to video using ReActor.
        
        Swaps faces in a source video with a reference face image.
        Processes frame-by-frame with optional face restoration.
        
        Request body:
        - source_video: str - Base64 data URL of source video (required)
        - reference_image: str - Base64 data URL of face to swap in (required)
        - fps: int - Output video FPS (default: 30)
        - restore_face: bool - Apply GFPGAN face restoration (default: true)
        - face_restore_visibility: float - Face restore blend 0-1 (default: 1.0)
        - codeformer_weight: float - CodeFormer weight for restoration (default: 0.5)
        
        Returns:
        - video/mp4 with cost headers
        
        Note: Processing time depends on video length. Expect ~1-2 seconds per frame.
        Short clips (< 10 seconds) recommended for optimal performance.
        """
        item = await request.json()
        result = handler._video_faceswap_impl(item)
        
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-"):
                response.headers[key] = value
        return response