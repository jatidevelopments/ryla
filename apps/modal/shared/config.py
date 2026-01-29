"""
Configuration for Modal app.

Defines volumes, secrets, GPU configuration, and build settings.
"""

import modal
from pathlib import Path

# ============ VOLUMES ============
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# ============ SECRETS ============
huggingface_secret = modal.Secret.from_name("huggingface")

# ============ GPU CONFIGURATION ============
GPU_TYPE = "L40S"  # Options: "L40S", "A100", "A10", "H100", "T4", "L4"

# GPU per model (for future optimization)
GPU_CONFIG = {
    "flux": "T4",           # Flux Schnell - lightweight
    "flux-dev": "L40S",     # Flux Dev - primary model
    "instantid": "A10",     # InstantID - medium
    "lora": "T4",           # LoRA - lightweight
    "wan2": "L40S",         # Wan2.1 - video needs memory
    "seedvr2": "A10",       # SeedVR2 - medium
}

# ============ IMAGE BUILD CONFIG ============
PYTHON_VERSION = "3.11"
COMFYUI_VERSION = "0.3.71"  # Stable version
FASTAPI_VERSION = "0.115.4"
COMFY_CLI_VERSION = "1.5.3"

# ============ COMFYUI CONFIG ============
COMFYUI_PORT = 8000
COMFYUI_DIR = Path("/root/comfy/ComfyUI")

# ============ MODEL PATHS ============
MODEL_PATHS = {
    "checkpoints": "/root/comfy/ComfyUI/models/checkpoints",
    "clip": "/root/comfy/ComfyUI/models/clip",
    "text_encoders": "/root/comfy/ComfyUI/models/text_encoders",
    "vae": "/root/comfy/ComfyUI/models/vae",
    "loras": "/root/comfy/ComfyUI/models/loras",
    "controlnet": "/root/comfy/ComfyUI/models/controlnet",
    "instantid": "/root/comfy/ComfyUI/models/instantid",
}
