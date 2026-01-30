"""
RYLA LoRA Training Modal App - Train character LoRAs using Diffusers

Deploy: modal deploy apps/modal/apps/lora-training/app.py

This app handles:
- /train - Start LoRA training job
- /status/{job_id} - Get training job status
- /jobs - List training jobs

Endpoints are NOT real-time - training happens in background.
Use webhooks or polling for status updates.
"""

import modal
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
import json
import time
import uuid

# Create app with dependencies
app = modal.App(name="ryla-lora-training")

# Volumes for model storage
models_volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Secrets
huggingface_secret = modal.Secret.from_name("huggingface")

# Training image with all dependencies
# Use compatible versions that work together
training_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git")
    .pip_install(
        # Core ML - need 2.5+ for enable_gqa in scaled_dot_product_attention
        "torch>=2.5.0",
        "torchvision>=0.20.0",
        "triton>=3.0.0",
        # Training
        "accelerate>=0.34.0",  # Compatible with peft 0.17+
        "peft>=0.17.0",        # Required by diffusers main branch
        "diffusers==0.30.0",   # Stable version with Flux support
        "transformers==4.44.0",
        # Data
        "datasets>=2.14.0",
        "huggingface-hub>=0.24.0",
        # Utils
        "safetensors",
        "pillow",
        "requests",
        "ftfy",
        "numpy<2",
        "sentencepiece",
        "bitsandbytes",  # For memory-efficient training
    )
    # Clone and install diffusers from source for latest Flux training script
    .run_commands(
        "git clone --depth=1 https://github.com/huggingface/diffusers.git /root/diffusers",
        "pip install -e /root/diffusers",  # Install from source
        "pip install -r /root/diffusers/examples/dreambooth/requirements_flux.txt || true",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)


@dataclass
class TrainingConfig:
    """Configuration for LoRA training."""
    # Model settings
    base_model: str = "black-forest-labs/FLUX.1-dev"  # or "Tongyi-MAI/Z-Image-Turbo"
    
    # LoRA settings
    rank: int = 16
    lora_alpha: int = 16
    
    # Training settings
    resolution: int = 512
    train_batch_size: int = 1
    gradient_accumulation_steps: int = 4
    learning_rate: float = 1e-4
    lr_scheduler: str = "constant"
    lr_warmup_steps: int = 0
    max_train_steps: int = 500
    checkpointing_steps: int = 250
    seed: int = 42
    mixed_precision: str = "bf16"


# In-memory job tracking (for demo - use Redis in production)
_training_jobs: dict = {}


@app.function(
    image=training_image,
    gpu="A100-80GB",
    volumes={
        "/root/models": models_volume,
        "/cache": hf_cache_vol,
    },
    secrets=[huggingface_secret],
    timeout=7200,  # 2 hours max
)
def train_lora(
    job_id: str,
    image_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict,
) -> dict:
    """
    Train a LoRA model from images.
    
    Args:
        job_id: Unique job identifier
        image_urls: List of image URLs to train on
        trigger_word: Trigger word for the LoRA (e.g., character name)
        character_id: Character ID for organizing output
        config: Training configuration dict
        
    Returns:
        dict with status, lora_path, etc.
    """
    import subprocess
    import requests
    from PIL import Image
    from io import BytesIO
    from accelerate.utils import write_basic_config
    
    print(f"🚀 Starting LoRA training job: {job_id}")
    print(f"   Character: {character_id}")
    print(f"   Trigger word: {trigger_word}")
    print(f"   Images: {len(image_urls)}")
    
    # Parse config
    cfg = TrainingConfig(**config) if config else TrainingConfig()
    
    # Create directories
    data_dir = Path(f"/tmp/training/{job_id}/images")
    output_dir = Path(f"/root/models/loras/character-{character_id}")
    data_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Download images
    print("📥 Downloading training images...")
    for i, url in enumerate(image_urls):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img.save(data_dir / f"{i:04d}.png")
            print(f"   Downloaded image {i+1}/{len(image_urls)}")
        except Exception as e:
            print(f"   ⚠️ Failed to download image {i}: {e}")
    
    downloaded_count = len(list(data_dir.glob("*.png")))
    if downloaded_count < 3:
        raise ValueError(f"Not enough images downloaded: {downloaded_count}/3 minimum")
    
    print(f"✅ Downloaded {downloaded_count} images")
    
    # Set up accelerate
    write_basic_config(mixed_precision=cfg.mixed_precision)
    
    # Build training command
    instance_prompt = f"a photo of {trigger_word}"
    
    cmd = [
        "accelerate", "launch",
        "/root/diffusers/examples/dreambooth/train_dreambooth_lora_flux.py",
        f"--pretrained_model_name_or_path={cfg.base_model}",
        f"--instance_data_dir={data_dir}",
        f"--output_dir={output_dir}",
        f"--instance_prompt={instance_prompt}",
        f"--resolution={cfg.resolution}",
        f"--train_batch_size={cfg.train_batch_size}",
        f"--gradient_accumulation_steps={cfg.gradient_accumulation_steps}",
        f"--learning_rate={cfg.learning_rate}",
        f"--lr_scheduler={cfg.lr_scheduler}",
        f"--lr_warmup_steps={cfg.lr_warmup_steps}",
        f"--max_train_steps={cfg.max_train_steps}",
        f"--checkpointing_steps={cfg.checkpointing_steps}",
        f"--seed={cfg.seed}",
        f"--rank={cfg.rank}",
        f"--mixed_precision={cfg.mixed_precision}",
        "--cache_dir=/cache",
    ]
    
    print(f"🏋️ Starting training with {cfg.max_train_steps} steps...")
    print(f"   Command: {' '.join(cmd[:5])}...")
    
    start_time = time.time()
    
    # Run training
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    
    # Stream output
    for line in iter(process.stdout.readline, ""):
        print(line, end="")
    
    exit_code = process.wait()
    training_time = time.time() - start_time
    
    if exit_code != 0:
        raise RuntimeError(f"Training failed with exit code {exit_code}")
    
    # Find the trained LoRA file
    lora_files = list(output_dir.glob("*.safetensors"))
    if not lora_files:
        # Check for pytorch_lora_weights.safetensors (default output name)
        lora_file = output_dir / "pytorch_lora_weights.safetensors"
        if not lora_file.exists():
            raise FileNotFoundError(f"No LoRA file found in {output_dir}")
    else:
        lora_file = lora_files[0]
    
    # Rename to standard format
    final_lora_path = Path(f"/root/models/loras/character-{character_id}.safetensors")
    if lora_file != final_lora_path:
        import shutil
        shutil.copy(str(lora_file), str(final_lora_path))
    
    # Commit volume changes
    models_volume.commit()
    
    print(f"✅ Training complete!")
    print(f"   Duration: {training_time/60:.1f} minutes")
    print(f"   LoRA saved to: {final_lora_path}")
    
    return {
        "status": "completed",
        "job_id": job_id,
        "character_id": character_id,
        "lora_path": str(final_lora_path),
        "lora_filename": final_lora_path.name,
        "trigger_word": trigger_word,
        "training_time_seconds": training_time,
        "training_steps": cfg.max_train_steps,
        "image_count": downloaded_count,
    }


# Note: No web API to avoid hitting Modal's 8 endpoint limit.
# Training is triggered directly via train_lora.spawn() from the backend.
# 
# Usage from backend:
#   from modal import Function
#   train_fn = Function.from_name("ryla-lora-training", "train_lora")
#   call = train_fn.spawn(job_id=..., image_urls=..., ...)
#   # Later: result = call.get()


# Local entrypoint for testing
@app.local_entrypoint()
def main(
    character_id: str = "test",
    trigger_word: str = "testchar",
    steps: int = 100,
):
    """Test training locally."""
    # Use placeholder images for testing
    test_images = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=512",
    ]
    
    job_id = f"test-{uuid.uuid4().hex[:8]}"
    
    result = train_lora.remote(
        job_id=job_id,
        image_urls=test_images,
        trigger_word=trigger_word,
        character_id=character_id,
        config={"max_train_steps": steps},
    )
    
    print(f"\n✅ Training complete!")
    print(json.dumps(result, indent=2))
