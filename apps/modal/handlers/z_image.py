"""
Z-Image workflow handlers.

Handles Z-Image-Turbo text-to-image generation with multiple workflow variants:
- Simple: Direct diffusers pipeline (fastest, no custom nodes needed)
- Danrisi: Same as simple (custom nodes not available)
- LoRA: Text-to-image with custom character LoRA
- InstantID: Not supported (architecture incompatibility)
- PuLID: Not supported (architecture incompatibility)

Note: Z-Image-Turbo uses a special Qwen text encoder that isn't compatible
with standard ComfyUI CLIPLoader. We use the diffusers pipeline directly.
"""

import json
import uuid
import io
import subprocess
from pathlib import Path
from typing import Dict, Optional
from fastapi import Response, HTTPException

from utils.cost_tracker import CostTracker, get_cost_summary

# Global pipeline cache
_z_image_pipeline = None
_z_image_pipeline_loading = False


def _get_z_image_pipeline():
    """
    Get the Z-Image-Turbo pipeline, loading it if necessary.
    Uses global caching to avoid reloading on each request.
    
    Note: First load takes 5-10 minutes as it downloads ~25GB of models.
    Subsequent requests use the cached pipeline.
    """
    global _z_image_pipeline, _z_image_pipeline_loading
    
    if _z_image_pipeline is not None:
        return _z_image_pipeline
    
    if _z_image_pipeline_loading:
        import time
        while _z_image_pipeline_loading:
            time.sleep(0.5)
        return _z_image_pipeline
    
    _z_image_pipeline_loading = True
    try:
        import torch
        import os
        from pathlib import Path
        
        print("--- Z-Image: Loading pipeline (first request) ---")
        
        # Check if models are cached locally
        # Primary location: volume directory (persisted across deployments)
        volume_model_dir = "/root/models/diffusers/Z-Image-Turbo"
        # Fallback location: ComfyUI directory (for legacy or symlinked models)
        comfy_model_dir = "/root/comfy/ComfyUI/models/diffusers/Z-Image-Turbo"
        
        # Check volume dir first (model is downloaded here during build)
        volume_model_file = Path(volume_model_dir) / "model_index.json"
        comfy_model_file = Path(comfy_model_dir) / "model_index.json"
        
        if volume_model_file.exists():
            model_dir = volume_model_dir
            model_file = volume_model_file
        elif comfy_model_file.exists():
            model_dir = comfy_model_dir
            model_file = comfy_model_file
        else:
            # Neither exists, will trigger download
            model_dir = volume_model_dir
            model_file = volume_model_file
        
        # Import the pipeline
        from modelscope import ZImagePipeline
        
        if model_file.exists():
            print(f"--- Z-Image: Loading cached models from {model_dir} ---")
            _z_image_pipeline = ZImagePipeline.from_pretrained(
                model_dir,
                torch_dtype=torch.bfloat16,
                low_cpu_mem_usage=False,
            )
        else:
            print("--- Z-Image: Downloading models from ModelScope (~25GB) ---")
            print("    This will take 5-10 minutes on first run...")
            
            from modelscope import snapshot_download
            
            # Create directory
            os.makedirs(model_dir, exist_ok=True)
            
            # Download to persistent volume with cache
            downloaded_dir = snapshot_download(
                "Tongyi-MAI/Z-Image-Turbo",
                local_dir=model_dir,
                cache_dir="/cache"
            )
            print(f"--- Z-Image: Models downloaded to {downloaded_dir} ---")
            
            # Load from downloaded location
            _z_image_pipeline = ZImagePipeline.from_pretrained(
                downloaded_dir,
                torch_dtype=torch.bfloat16,
                low_cpu_mem_usage=False,
            )
        
        _z_image_pipeline.to("cuda")
        print("--- Z-Image: Pipeline loaded successfully ---")
        return _z_image_pipeline
            
    except Exception as e:
        _z_image_pipeline_loading = False
        print(f"--- Z-Image: Failed to load pipeline: {e} ---")
        raise
    finally:
        _z_image_pipeline_loading = False


def _generate_z_image(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    steps: int = 4,
    guidance_scale: float = 0.0,
    seed: int = 42,
    negative_prompt: str = "",
) -> bytes:
    """
    Generate an image using Z-Image-Turbo diffusers pipeline directly.
    
    Returns:
        JPEG image bytes
    """
    import torch
    from PIL import Image
    
    pipe = _get_z_image_pipeline()
    generator = torch.Generator("cuda").manual_seed(seed)
    
    print(f"--- Z-Image: Generating {width}x{height}, steps={steps} ---")
    
    output = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        height=height,
        width=width,
        num_inference_steps=steps,
        guidance_scale=guidance_scale,
        num_images_per_prompt=1,
        max_sequence_length=512,
        generator=generator,
    )
    
    image = output.images[0]
    
    # Convert to JPEG bytes
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    
    return buffer.getvalue()


def _generate_z_image_with_lora(
    prompt: str,
    lora_path: str,
    width: int = 1024,
    height: int = 1024,
    steps: int = 8,
    guidance_scale: float = 4.5,
    seed: int = 42,
    negative_prompt: str = "",
    lora_strength: float = 1.0,
    trigger_word: Optional[str] = None,
) -> bytes:
    """
    Generate an image using Z-Image-Turbo with LoRA applied.
    
    Uses diffusers pipeline with load_lora_weights().
    
    Args:
        prompt: Text prompt
        lora_path: Path to LoRA file (.safetensors)
        width: Image width
        height: Image height
        steps: Inference steps (8 is optimal for Z-Image + LoRA)
        guidance_scale: CFG scale (4.5 is optimal for Z-Image + LoRA)
        seed: Random seed
        negative_prompt: Negative prompt
        lora_strength: LoRA strength (scale)
        trigger_word: Trigger word to prepend
    
    Returns:
        JPEG image bytes
    """
    import torch
    from PIL import Image
    
    # Prepend trigger word if provided
    full_prompt = f"{trigger_word} {prompt}".strip() if trigger_word else prompt
    
    pipe = _get_z_image_pipeline()
    
    # Load LoRA weights
    print(f"--- Z-Image: Loading LoRA from {lora_path} ---")
    try:
        pipe.load_lora_weights(lora_path)
        pipe.fuse_lora(lora_scale=lora_strength)
        print(f"--- Z-Image: LoRA loaded with strength {lora_strength} ---")
    except Exception as e:
        print(f"--- Z-Image: LoRA loading failed: {e} ---")
        raise HTTPException(status_code=500, detail=f"Failed to load LoRA: {e}")
    
    generator = torch.Generator("cuda").manual_seed(seed)
    
    print(f"--- Z-Image+LoRA: Generating {width}x{height}, steps={steps}, cfg={guidance_scale} ---")
    
    output = pipe(
        prompt=full_prompt,
        negative_prompt=negative_prompt,
        height=height,
        width=width,
        num_inference_steps=steps,
        guidance_scale=guidance_scale,
        num_images_per_prompt=1,
        max_sequence_length=512,
        generator=generator,
    )
    
    image = output.images[0]
    
    # Unload LoRA to restore base model
    try:
        pipe.unfuse_lora()
        pipe.unload_lora_weights()
        print("--- Z-Image: LoRA unloaded ---")
    except Exception as e:
        print(f"--- Z-Image: LoRA unload warning: {e} ---")
    
    # Convert to JPEG bytes
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    
    return buffer.getvalue()


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
    
    Uses ZImageLoader and ZImageSampler from ComfyUI-Z-Image-Turbo custom node.
    These handle the Qwen encoder loading internally.
    
    Note: First run downloads ~25GB from ModelScope. Subsequent runs use cache.
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    return {
        # ZImage Loader - loads pipeline (auto-downloads from ModelScope on first run)
        "1": {
            "class_type": "ZImageLoader",
            "inputs": {
                "model_id": "Tongyi-MAI/Z-Image-Turbo",
                "precision": "bf16",
                "compile_model": False,
                "attention_backend": "default",
            },
        },
        # ZImage Sampler - generates images
        "2": {
            "class_type": "ZImageSampler",
            "inputs": {
                "pipe": ["1", 0],
                "prompt": item["prompt"],
                "width": item.get("width", 1024),
                "height": item.get("height", 1024),
                "steps": item.get("steps", 4),  # Z-Image-Turbo default is 4 steps
                "guidance_scale": item.get("guidance_scale", 0.0),  # Default 0.0 for turbo
                "seed": item.get("seed", 42),
                "negative_prompt": item.get("negative_prompt", ""),
                "batch_size": 1,
                "max_sequence_length": 512,
                "cfg_normalization": False,
                "cfg_truncation": 1.0,
            },
        },
        # Save Image
        "3": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": uuid.uuid4().hex,
                "images": ["2", 0],
            },
        },
    }


def build_z_image_danrisi_workflow(item: dict) -> dict:
    """
    Build Z-Image Danrisi workflow JSON.
    
    Uses ZImageLoader and ZImageSampler custom nodes from ComfyUI-Z-Image-Turbo.
    (Original Danrisi workflow with RES4LYF custom nodes has been simplified.)
    
    Args:
        item: Request payload with prompt, dimensions, etc.
    
    Returns:
        ComfyUI workflow dictionary
    """
    # Use the same simple workflow - Danrisi optimizations require additional custom nodes
    return build_z_image_simple_workflow(item)


# NOTE: build_z_image_instantid_workflow and build_z_image_pulid_workflow removed
# Z-Image uses Qwen text encoder which is incompatible with InstantID/PuLID ControlNets.
# Use /sdxl-instantid or /flux-pulid instead for face consistency features.


class ZImageHandler:
    """Handler for Z-Image workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
        # Ensure models are symlinked from volume
        self._setup_model_symlinks()
    
    def _setup_model_symlinks(self):
        """Symlink models from volume to ComfyUI directories."""
        import os
        from pathlib import Path
        
        volume_dir = Path("/root/models")
        comfy_dir = Path("/root/comfy/ComfyUI/models")
        
        if not volume_dir.exists():
            print("⚠️  Volume not mounted at /root/models")
            return
        
        # Model mappings: volume_subdir -> comfyui_subdirs
        mappings = [
            ("checkpoints", ["checkpoints", "unet"]),
            ("clip", ["clip", "text_encoders"]),
            ("vae", ["vae"]),
        ]
        
        for vol_subdir, comfy_subdirs in mappings:
            vol_path = volume_dir / vol_subdir
            if vol_path.exists():
                for comfy_subdir in comfy_subdirs:
                    comfy_path = comfy_dir / comfy_subdir
                    comfy_path.mkdir(parents=True, exist_ok=True)
                    for model_file in vol_path.glob("*.safetensors"):
                        target = comfy_path / model_file.name
                        if not target.exists():
                            os.symlink(str(model_file), str(target))
                            print(f"✅ Symlinked {comfy_subdir}/{model_file.name}")
    
    def _z_image_simple_impl(self, item: dict) -> Response:
        """
        Z-Image Simple implementation using ComfyUI ZImageLoader workflow.
        
        Model is pre-cached during image build, so this should be fast.
        """
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Build workflow using ZImageLoader (handles Qwen encoder internally)
        workflow = build_z_image_simple_workflow(item)
        
        # Get port
        port = getattr(self.comfyui, 'port', 8000)
        
        # Execute via API
        from comfyui import execute_workflow_via_api
        img_bytes = execute_workflow_via_api(workflow, port=port, timeout=600)
        
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("z-image-simple", execution_time)
        
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        response = Response(img_bytes, media_type="image/jpeg")
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response
    
    def _z_image_danrisi_impl(self, item: dict) -> Response:
        """Z-Image Danrisi implementation (same as simple for now)."""
        # Danrisi optimizations require RES4LYF nodes
        return self._z_image_simple_impl(item)
    
    # NOTE: _z_image_instantid_impl and _z_image_pulid_impl removed - architecturally incompatible
    
    def _z_image_lora_impl(self, item: dict) -> Response:
        """
        Z-Image with LoRA implementation.
        
        Uses diffusers pipeline with load_lora_weights for character LoRA support.
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
            lora_filename = f"character-{lora_id}.safetensors"
        
        # Check LoRA paths
        volume_lora_path = Path(f"/root/models/loras/{lora_filename}")
        
        # Check if LoRA exists
        if not volume_lora_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"LoRA not found: {lora_filename}. Upload to /root/models/loras/"
            )
        
        if "prompt" not in item:
            raise HTTPException(status_code=400, detail="prompt is required")
        
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        # Generate with LoRA using diffusers pipeline
        image_bytes = _generate_z_image_with_lora(
            prompt=item["prompt"],
            lora_path=str(volume_lora_path),
            width=item.get("width", 1024),
            height=item.get("height", 1024),
            steps=item.get("steps", 8),  # 8 steps optimal for Z-Image + LoRA
            guidance_scale=item.get("guidance_scale", 4.5),  # 4.5 optimal for LoRA
            seed=item.get("seed", 42),
            negative_prompt=item.get("negative_prompt", ""),
            lora_strength=item.get("lora_strength", 1.0),
            trigger_word=item.get("trigger_word"),
        )
        
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
    
    # NOTE: /z-image-instantid and /z-image-pulid removed - Z-Image uses Qwen encoder
    # which is incompatible with InstantID/PuLID. Use /sdxl-instantid or /flux-pulid instead.
    
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
        - steps: int - Inference steps (default: 8, optimal for Z-Image + LoRA)
        - guidance_scale: float - CFG scale (default: 4.5, optimal for LoRA)
        - seed: int - Random seed (optional)
        - negative_prompt: str - Negative prompt (default: "")
        
        Returns:
        - image/jpeg with cost headers
        
        Note: LoRA must be uploaded to /root/models/loras/ on the Modal volume.
        Z-Image LoRA uses 8 steps and guidance_scale 4.5 for optimal results.
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