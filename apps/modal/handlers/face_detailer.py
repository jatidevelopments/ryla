"""
FaceDetailer post-processing handler.

Uses ComfyUI-Impact-Pack's FaceDetailer for improving face quality in generated images.
This adds realistic skin texture, fixes face artifacts, and improves overall quality.
"""

import json
import uuid
from pathlib import Path
from typing import Optional


def build_facedetailer_workflow(
    input_image: str,
    prompt: str = "",
    negative_prompt: str = "ugly, deformed, bad anatomy, blurry",
    denoise: float = 0.35,
    steps: int = 20,
    cfg: float = 7.0,
    seed: Optional[int] = None,
) -> dict:
    """
    Build FaceDetailer workflow JSON for face enhancement.
    
    Args:
        input_image: Filename of image in ComfyUI input folder
        prompt: Positive prompt (optional, enhances detail)
        negative_prompt: Negative prompt for face refinement
        denoise: Denoising strength (0.3-0.5 typical, lower = more faithful)
        steps: Sampling steps for face refinement
        cfg: CFG scale
        seed: Random seed (None for random)
    
    Returns:
        ComfyUI workflow dictionary
    """
    import random
    actual_seed = seed if seed is not None else random.randint(0, 2**32 - 1)
    
    # Default quality prompt if none provided
    if not prompt:
        prompt = "detailed realistic face, natural skin texture, sharp features, photorealistic"
    
    return {
        # Load input image
        "1": {
            "class_type": "LoadImage",
            "inputs": {
                "image": input_image,
            },
        },
        # Load SDXL model for face refinement (uses checkpoint from app)
        "2": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": "sd_xl_base_1.0.safetensors",
            },
        },
        # YOLO face detection
        "3": {
            "class_type": "UltralyticsDetectorProvider",
            "inputs": {
                "model_name": "bbox/face_yolov8m.pt",
            },
        },
        # SAM segmentation
        "4": {
            "class_type": "SAMLoader",
            "inputs": {
                "model_name": "sam_vit_l_0b3195.pth",
                "device_mode": "Prefer GPU",
            },
        },
        # Prompts
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["2", 1],
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
                "clip": ["2", 1],
            },
        },
        # FaceDetailer
        "7": {
            "class_type": "FaceDetailer",
            "inputs": {
                "image": ["1", 0],
                "model": ["2", 0],
                "clip": ["2", 1],
                "vae": ["2", 2],
                "positive": ["5", 0],
                "negative": ["6", 0],
                "bbox_detector": ["3", 0],
                "sam_model_opt": ["4", 0],
                # FaceDetailer settings
                "guide_size": 512,
                "guide_size_for": True,
                "max_size": 1024,
                "seed": actual_seed,
                "seed_mode": "fixed",
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": denoise,
                "feather": 5,
                "noise_mask": True,
                "force_inpaint": True,
                # Face detection settings
                "bbox_threshold": 0.5,
                "bbox_dilation": 10,
                "bbox_crop_factor": 3.0,
                # Drop settings (performance)
                "drop_size": 10,
                "wildcard": "",
                "cycle": 1,
            },
        },
        # Save result
        "8": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": f"facedetail_{uuid.uuid4().hex[:8]}",
                "images": ["7", 0],  # FaceDetailer output 0 = enhanced image
            },
        },
    }


def apply_facedetailer(
    comfyui_instance,
    image_bytes: bytes,
    prompt: str = "",
    negative_prompt: str = "ugly, deformed, bad anatomy, blurry",
    denoise: float = 0.35,
) -> bytes:
    """
    Apply FaceDetailer post-processing to an image.
    
    Args:
        comfyui_instance: ComfyUI server instance
        image_bytes: Raw image bytes to process
        prompt: Optional positive prompt for enhancement
        negative_prompt: Negative prompt
        denoise: Denoising strength (lower = more faithful, 0.3-0.5 typical)
    
    Returns:
        Enhanced image bytes
    """
    import io
    from PIL import Image
    
    # Save input image to ComfyUI input folder
    comfy_dir = Path("/root/comfy/ComfyUI")
    input_dir = comfy_dir / "input"
    input_dir.mkdir(parents=True, exist_ok=True)
    
    image_filename = f"facedetail_input_{uuid.uuid4().hex[:8]}.jpg"
    image_path = input_dir / image_filename
    
    # Save image
    img = Image.open(io.BytesIO(image_bytes))
    img.save(image_path, "JPEG", quality=95)
    
    # Build workflow
    workflow = build_facedetailer_workflow(
        input_image=image_filename,
        prompt=prompt,
        negative_prompt=negative_prompt,
        denoise=denoise,
    )
    
    # Execute workflow
    from utils.comfyui import run_workflow_api
    port = getattr(comfyui_instance, 'port', 8000)
    result_bytes = run_workflow_api(workflow, port=port)
    
    # Cleanup input file
    try:
        image_path.unlink()
    except:
        pass
    
    return result_bytes


# Workflow snippet for adding FaceDetailer to existing workflows
FACEDETAILER_NODES_TEMPLATE = """
# Add these nodes after your main generation workflow:

# YOLO Face Detection
"face_detect": {
    "class_type": "UltralyticsDetectorProvider",
    "inputs": {"model_name": "bbox/face_yolov8m.pt"}
},

# SAM Segmentation
"sam_loader": {
    "class_type": "SAMLoader", 
    "inputs": {"model_name": "sam_vit_l_0b3195.pth", "device_mode": "Prefer GPU"}
},

# FaceDetailer (connect image from your main workflow)
"face_detailer": {
    "class_type": "FaceDetailer",
    "inputs": {
        "image": ["YOUR_IMAGE_NODE", 0],
        "model": ["YOUR_MODEL_NODE", 0],
        "clip": ["YOUR_CLIP_NODE", 0],
        "vae": ["YOUR_VAE_NODE", 0],
        "positive": ["YOUR_POSITIVE_COND", 0],
        "negative": ["YOUR_NEGATIVE_COND", 0],
        "bbox_detector": ["face_detect", 0],
        "sam_model_opt": ["sam_loader", 0],
        "guide_size": 512,
        "guide_size_for": True,
        "max_size": 1024,
        "denoise": 0.35,
        "steps": 20,
        "cfg": 7.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "feather": 5,
        "noise_mask": True,
        "force_inpaint": True,
        "bbox_threshold": 0.5,
        "bbox_dilation": 10,
        "bbox_crop_factor": 3.0,
        "drop_size": 10,
    }
}
"""
