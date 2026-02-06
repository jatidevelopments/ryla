"""
RYLA Combined LoRA Training Modal App

Trains LoRA adapters for multiple model types:
- Flux (image generation)
- Qwen-Image (portrait generation)  
- Wan 2.6 (video generation)

Deploy: modal deploy apps/modal/apps/lora-training/app.py
Test:   modal run apps/modal/apps/lora-training/app.py::test_flux --character-id=test

This is a FUNCTION-ONLY app (no web endpoints).
Training is triggered via Modal SDK or trigger scripts.

See LORA-WORKFLOW-GUIDE.md for integration details.
"""

import modal
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum
import json
import time
import uuid

# ============================================================================
# MODAL APP CONFIGURATION
# ============================================================================

app = modal.App(name="ryla-lora-training")

# Volumes for model storage
models_volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Secrets
huggingface_secret = modal.Secret.from_name("huggingface")
# Note: cloudflare-r2 secret is NOT required - R2 upload is optional
# If you want R2 upload, create the secret in Modal with:
#   CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
#   CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET, CLOUDFLARE_R2_PUBLIC_URL

# ============================================================================
# TRAINING IMAGES (one per model type for optimal dependencies)
# ============================================================================

# Flux training image
flux_training_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git")
    .pip_install(
        "torch>=2.5.0",
        "torchvision>=0.20.0",
        "triton>=3.0.0",
        "accelerate>=0.34.0",
        "peft>=0.17.0",
        "diffusers==0.30.0",
        "transformers==4.44.0",
        "datasets>=2.14.0",
        "huggingface-hub>=0.24.0",
        "safetensors",
        "pillow",
        "requests",
        "ftfy",
        "numpy<2",
        "sentencepiece",
        "bitsandbytes",
        "boto3",
    )
    .run_commands(
        "git clone --depth=1 https://github.com/huggingface/diffusers.git /root/diffusers",
        "pip install -e /root/diffusers",
        "pip install -r /root/diffusers/examples/dreambooth/requirements_flux.txt || true",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)

# Qwen-Image training image
qwen_training_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "wget")
    .pip_install(
        "torch>=2.5.0",
        "torchvision>=0.20.0",
        "triton>=3.0.0",
        "accelerate>=0.34.0",
        "peft>=0.17.0",
        "transformers>=4.45.0",
        "datasets>=2.14.0",
        "huggingface-hub>=0.24.0",
        "omegaconf",
        "pyyaml",
        "safetensors",
        "pillow",
        "requests",
        "ftfy",
        "numpy<2",
        "sentencepiece",
        "bitsandbytes",
        "einops",
        "timm",
        "boto3",
    )
    .run_commands(
        "pip install git+https://github.com/huggingface/diffusers",
        "git clone --depth=1 https://github.com/FlyMyAI/flymyai-lora-trainer /root/flymyai-trainer",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)

# Wan video training image
wan_training_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "wget", "ffmpeg", "libgl1-mesa-glx", "libglib2.0-0")
    .pip_install(
        "torch>=2.4.0",
        "torchvision>=0.19.0",
        "transformers>=4.44.0",
        "diffusers>=0.31.0",
        "accelerate>=0.33.0",
        "peft>=0.12.0",
        "huggingface_hub>=0.24.0",
        "decord",
        "opencv-python-headless",
        "imageio",
        "imageio-ffmpeg",
        "safetensors",
        "pillow",
        "tqdm",
        "requests",
        "ftfy",
        "sentencepiece",
        "numpy<2",
        "boto3",
    )
    .env({"HF_HOME": "/cache", "TRANSFORMERS_CACHE": "/cache", "HF_XET_HIGH_PERFORMANCE": "1"})
)

# ============================================================================
# CONFIGURATION DATACLASSES
# ============================================================================


@dataclass
class FluxTrainingConfig:
    """Configuration for Flux LoRA training."""
    base_model: str = "black-forest-labs/FLUX.1-dev"
    rank: int = 16
    lora_alpha: int = 16
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


@dataclass
class QwenTrainingConfig:
    """Configuration for Qwen-Image LoRA training."""
    base_model: str = "Qwen/Qwen-Image"
    rank: int = 16
    lora_alpha: int = 16
    resolution: int = 1024
    train_batch_size: int = 1
    gradient_accumulation_steps: int = 4
    learning_rate: float = 1e-4
    lr_scheduler: str = "cosine"
    lr_warmup_steps: int = 50
    max_train_steps: int = 500
    checkpointing_steps: int = 250
    seed: int = 42
    mixed_precision: str = "bf16"
    gradient_checkpointing: bool = True


class WanModelSize(str, Enum):
    """Available Wan model sizes."""
    SMALL = "1.3B"
    LARGE = "14B"


WAN_MODEL_MAP = {
    WanModelSize.SMALL: "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
    WanModelSize.LARGE: "Wan-AI/Wan2.1-T2V-14B-Diffusers",
}


@dataclass
class WanTrainingConfig:
    """Configuration for Wan LoRA training."""
    model_size: str = "1.3B"
    resolution: int = 480
    num_frames: int = 17
    rank: int = 32
    lora_alpha: int = 32
    learning_rate: float = 1e-4
    train_batch_size: int = 1
    gradient_accumulation_steps: int = 4
    max_train_steps: int = 500
    checkpointing_steps: int = 100
    lr_scheduler: str = "cosine"
    lr_warmup_steps: int = 50
    seed: int = 42
    mixed_precision: str = "bf16"
    gradient_checkpointing: bool = True
    target_modules: list = field(default_factory=lambda: [
        "to_q", "to_k", "to_v", "to_out.0",
        "proj_in", "proj_out",
        "ff.net.0.proj", "ff.net.2",
    ])

    @property
    def base_model(self) -> str:
        size = WanModelSize(self.model_size)
        return WAN_MODEL_MAP[size]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================


def download_images(image_urls: list[str], data_dir: Path) -> int:
    """Download training images from URLs."""
    import requests
    from PIL import Image
    from io import BytesIO
    
    data_dir.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    
    for i, url in enumerate(image_urls):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img.save(data_dir / f"{i:04d}.png")
            print(f"   Downloaded image {i+1}/{len(image_urls)}")
            downloaded += 1
        except Exception as e:
            print(f"   ⚠️ Failed to download image {i}: {e}")
    
    return downloaded


def upload_to_r2(local_path: Path, s3_key: str) -> tuple[str | None, str | None]:
    """Upload file to Cloudflare R2 and return (s3_key, public_url)."""
    import os
    import boto3
    
    r2_account_id = os.environ.get("CLOUDFLARE_R2_ACCOUNT_ID")
    r2_access_key = os.environ.get("CLOUDFLARE_R2_ACCESS_KEY_ID")
    r2_secret_key = os.environ.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
    r2_bucket = os.environ.get("CLOUDFLARE_R2_BUCKET", "ryla-storage")
    r2_public_url = os.environ.get("CLOUDFLARE_R2_PUBLIC_URL", "")
    
    if not (r2_account_id and r2_access_key and r2_secret_key):
        print("⚠️ S3/R2 credentials not configured, skipping upload")
        return None, None
    
    try:
        s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=r2_access_key,
            aws_secret_access_key=r2_secret_key,
        )
        
        print(f"📤 Uploading to S3: {s3_key}")
        s3_client.upload_file(
            str(local_path),
            r2_bucket,
            s3_key,
            ExtraArgs={"ContentType": "application/octet-stream"}
        )
        
        s3_url = f"{r2_public_url.rstrip('/')}/{s3_key}" if r2_public_url else None
        print(f"✅ Uploaded to S3: {s3_key}")
        return s3_key, s3_url
    except Exception as e:
        print(f"⚠️ Failed to upload to S3: {e}")
        return None, None


# ============================================================================
# FLUX LORA TRAINING
# ============================================================================


@app.function(
    image=flux_training_image,
    gpu="A100-80GB",
    volumes={"/root/models": models_volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret],
    timeout=7200,  # 2 hours
)
def train_flux_lora(
    job_id: str,
    image_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict | None = None,
) -> dict:
    """
    Train a Flux LoRA model from images.
    
    Args:
        job_id: Unique job identifier
        image_urls: List of image URLs to train on (min 3)
        trigger_word: Trigger word for the LoRA (e.g., character name)
        character_id: Character ID for organizing output
        config: Training configuration dict
        
    Returns:
        dict with status, lora_path, etc.
    """
    import subprocess
    from accelerate.utils import write_basic_config
    
    print(f"🚀 Starting Flux LoRA training job: {job_id}")
    print(f"   Character: {character_id}")
    print(f"   Trigger word: {trigger_word}")
    print(f"   Images: {len(image_urls)}")
    
    cfg = FluxTrainingConfig(**(config or {}))
    
    data_dir = Path(f"/tmp/training/{job_id}/images")
    output_dir = Path(f"/root/models/loras/character-{character_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("📥 Downloading training images...")
    downloaded_count = download_images(image_urls, data_dir)
    if downloaded_count < 3:
        raise ValueError(f"Not enough images downloaded: {downloaded_count}/3 minimum")
    print(f"✅ Downloaded {downloaded_count} images")
    
    write_basic_config(mixed_precision=cfg.mixed_precision)
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
    start_time = time.time()
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in iter(process.stdout.readline, ""):
        print(line, end="")
    exit_code = process.wait()
    training_time = time.time() - start_time
    
    if exit_code != 0:
        raise RuntimeError(f"Training failed with exit code {exit_code}")
    
    # Find LoRA file
    lora_files = list(output_dir.glob("*.safetensors"))
    lora_file = lora_files[0] if lora_files else output_dir / "pytorch_lora_weights.safetensors"
    if not lora_file.exists():
        raise FileNotFoundError(f"No LoRA file found in {output_dir}")
    
    final_lora_path = Path(f"/root/models/loras/flux-character-{character_id}.safetensors")
    if lora_file != final_lora_path:
        import shutil
        shutil.copy(str(lora_file), str(final_lora_path))
    
    models_volume.commit()
    
    print(f"✅ Training complete! Duration: {training_time/60:.1f} minutes")
    print(f"   LoRA saved to: {final_lora_path}")
    
    s3_key, s3_url = upload_to_r2(
        final_lora_path,
        f"loras/flux-character-{character_id}/{job_id}.safetensors"
    )
    
    return {
        "status": "completed",
        "job_id": job_id,
        "character_id": character_id,
        "lora_path": str(final_lora_path),
        "lora_filename": final_lora_path.name,
        "s3_key": s3_key,
        "s3_url": s3_url,
        "trigger_word": trigger_word,
        "training_time_seconds": training_time,
        "training_steps": cfg.max_train_steps,
        "image_count": downloaded_count,
        "model_type": "flux",
    }


# ============================================================================
# QWEN-IMAGE LORA TRAINING
# ============================================================================


def _create_qwen_training_script():
    """Create the Qwen-Image LoRA training script using flow-matching."""
    return '''
import os
import sys
import copy
import torch
import argparse
from pathlib import Path
from PIL import Image
from tqdm import tqdm
from peft import LoraConfig
from peft.utils import get_peft_model_state_dict
from diffusers import (
    AutoencoderKLQwenImage,
    QwenImagePipeline,
    QwenImageTransformer2DModel,
    FlowMatchEulerDiscreteScheduler,
)
from diffusers.optimization import get_scheduler
from diffusers.training_utils import (
    compute_density_for_timestep_sampling,
    compute_loss_weighting_for_sd3,
)
from diffusers.utils import convert_state_dict_to_diffusers
from torch.utils.data import Dataset, DataLoader
from accelerate import Accelerator
from accelerate.utils import set_seed
import torchvision.transforms as T


class QwenImageDataset(Dataset):
    def __init__(self, data_dir: str, resolution: int = 1024, trigger_word: str = ""):
        self.data_dir = Path(data_dir)
        self.resolution = resolution
        self.trigger_word = trigger_word
        
        self.images = []
        for ext in ["*.png", "*.jpg", "*.jpeg", "*.webp"]:
            self.images.extend(list(self.data_dir.glob(ext)))
        
        if len(self.images) == 0:
            raise ValueError(f"No images found in {data_dir}")
        
        print(f"Found {len(self.images)} training images")
        
        self.transform = T.Compose([
            T.Resize((resolution, resolution)),
            T.ToTensor(),
            T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
        ])
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert("RGB")
        pixel_values = self.transform(image)
        
        caption_path = img_path.with_suffix(".txt")
        if caption_path.exists():
            caption = caption_path.read_text().strip()
            if self.trigger_word and self.trigger_word not in caption:
                caption = f"{self.trigger_word} {caption}"
        else:
            caption = self.trigger_word if self.trigger_word else "a photo of a person"
        
        return pixel_values, caption


def get_sigmas(timesteps, scheduler, device, n_dim=5, dtype=torch.bfloat16):
    sigmas = scheduler.sigmas.to(device=device, dtype=dtype)
    schedule_timesteps = scheduler.timesteps.to(device)
    timesteps = timesteps.to(device)
    step_indices = [(schedule_timesteps == t).nonzero().item() for t in timesteps]
    sigma = sigmas[step_indices].flatten()
    while len(sigma.shape) < n_dim:
        sigma = sigma.unsqueeze(-1)
    return sigma


def train_qwen_lora(args):
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision,
    )
    
    set_seed(args.seed)
    weight_dtype = torch.bfloat16
    
    print(f"Loading Qwen-Image model: {args.model_path}")
    
    text_encoding_pipeline = QwenImagePipeline.from_pretrained(
        args.model_path, transformer=None, vae=None, torch_dtype=weight_dtype,
    )
    
    vae = AutoencoderKLQwenImage.from_pretrained(args.model_path, subfolder="vae")
    vae.requires_grad_(False)
    
    transformer = QwenImageTransformer2DModel.from_pretrained(
        args.model_path, subfolder="transformer",
    )
    
    lora_config = LoraConfig(
        r=args.rank, lora_alpha=args.rank, init_lora_weights="gaussian",
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
    )
    
    noise_scheduler = FlowMatchEulerDiscreteScheduler.from_pretrained(
        args.model_path, subfolder="scheduler",
    )
    noise_scheduler_copy = copy.deepcopy(noise_scheduler)
    
    transformer.to(accelerator.device, dtype=weight_dtype)
    transformer.add_adapter(lora_config)
    text_encoding_pipeline.to(accelerator.device)
    
    transformer.requires_grad_(False)
    for n, param in transformer.named_parameters():
        if "lora" in n:
            param.requires_grad = True
    
    trainable_params = sum(p.numel() for p in transformer.parameters() if p.requires_grad)
    print(f"Trainable parameters: {trainable_params / 1e6:.2f}M")
    
    transformer.enable_gradient_checkpointing()
    
    dataset = QwenImageDataset(args.data_dir, resolution=args.resolution, trigger_word=args.trigger_word)
    dataloader = DataLoader(dataset, batch_size=args.train_batch_size, shuffle=True, num_workers=0)
    
    lora_layers = [p for p in transformer.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(lora_layers, lr=args.learning_rate, betas=(0.9, 0.999), weight_decay=0.01, eps=1e-8)
    
    lr_scheduler = get_scheduler(
        args.lr_scheduler, optimizer=optimizer,
        num_warmup_steps=args.lr_warmup_steps, num_training_steps=args.max_train_steps,
    )
    
    vae.to(accelerator.device, dtype=weight_dtype)
    transformer, optimizer, dataloader, lr_scheduler = accelerator.prepare(
        transformer, optimizer, dataloader, lr_scheduler
    )
    
    vae_scale_factor = 2 ** len(vae.temperal_downsample)
    
    global_step = 0
    progress_bar = tqdm(range(args.max_train_steps), desc="Training", disable=not accelerator.is_local_main_process)
    
    transformer.train()
    
    for epoch in range(1000):
        for batch in dataloader:
            with accelerator.accumulate(transformer):
                pixel_values, prompts = batch
                pixel_values = pixel_values.to(dtype=weight_dtype, device=accelerator.device).unsqueeze(2)
                
                with torch.no_grad():
                    pixel_latents = vae.encode(pixel_values).latent_dist.sample()
                    pixel_latents = pixel_latents.permute(0, 2, 1, 3, 4)
                    latents_mean = torch.tensor(vae.config.latents_mean).view(1, 1, vae.config.z_dim, 1, 1).to(pixel_latents.device, pixel_latents.dtype)
                    latents_std = 1.0 / torch.tensor(vae.config.latents_std).view(1, 1, vae.config.z_dim, 1, 1).to(pixel_latents.device, pixel_latents.dtype)
                    pixel_latents = (pixel_latents - latents_mean) * latents_std
                
                bsz = pixel_latents.shape[0]
                noise = torch.randn_like(pixel_latents, device=accelerator.device, dtype=weight_dtype)
                
                u = compute_density_for_timestep_sampling(weighting_scheme="none", batch_size=bsz, logit_mean=0.0, logit_std=1.0, mode_scale=1.29)
                indices = (u * noise_scheduler_copy.config.num_train_timesteps).long()
                timesteps = noise_scheduler_copy.timesteps[indices].to(device=pixel_latents.device)
                
                sigmas = get_sigmas(timesteps, noise_scheduler_copy, accelerator.device, n_dim=pixel_latents.ndim, dtype=pixel_latents.dtype)
                noisy_model_input = (1.0 - sigmas) * pixel_latents + sigmas * noise
                
                packed_noisy_model_input = QwenImagePipeline._pack_latents(
                    noisy_model_input, bsz, noisy_model_input.shape[2], noisy_model_input.shape[3], noisy_model_input.shape[4],
                )
                img_shapes = [(1, noisy_model_input.shape[3] // 2, noisy_model_input.shape[4] // 2)] * bsz
                
                with torch.no_grad():
                    prompt_list = list(prompts) if isinstance(prompts, tuple) else prompts
                    encode_result = text_encoding_pipeline.encode_prompt(
                        prompt=prompt_list, device=packed_noisy_model_input.device, num_images_per_prompt=1, max_sequence_length=1024,
                    )
                    if isinstance(encode_result, tuple):
                        prompt_embeds = encode_result[0]
                        prompt_embeds_mask = encode_result[1] if len(encode_result) > 1 else None
                    else:
                        prompt_embeds = encode_result
                        prompt_embeds_mask = None
                    
                    if prompt_embeds_mask is None:
                        prompt_embeds_mask = torch.ones(prompt_embeds.shape[:2], dtype=torch.bool, device=prompt_embeds.device)
                
                txt_seq_lens = prompt_embeds_mask.sum(dim=1).tolist()
                
                model_pred = transformer(
                    hidden_states=packed_noisy_model_input, timestep=timesteps / 1000, guidance=None,
                    encoder_hidden_states_mask=prompt_embeds_mask, encoder_hidden_states=prompt_embeds,
                    img_shapes=img_shapes, txt_seq_lens=txt_seq_lens, return_dict=False,
                )[0]
                
                model_pred = QwenImagePipeline._unpack_latents(
                    model_pred, height=noisy_model_input.shape[3] * vae_scale_factor,
                    width=noisy_model_input.shape[4] * vae_scale_factor, vae_scale_factor=vae_scale_factor,
                )
                
                weighting = compute_loss_weighting_for_sd3(weighting_scheme="none", sigmas=sigmas)
                target = noise - pixel_latents
                target = target.permute(0, 2, 1, 3, 4)
                
                loss = torch.mean((weighting.float() * (model_pred.float() - target.float()) ** 2).reshape(target.shape[0], -1), 1)
                loss = loss.mean()
                
                accelerator.backward(loss)
                accelerator.clip_grad_norm_(transformer.parameters(), 1.0)
                optimizer.step()
                lr_scheduler.step()
                optimizer.zero_grad()
            
            if accelerator.sync_gradients:
                progress_bar.update(1)
                global_step += 1
                
                if global_step % 10 == 0:
                    print(f"Step {global_step}: loss={loss.item():.4f}")
                
                if global_step % args.checkpointing_steps == 0 and accelerator.is_main_process:
                    save_path = Path(args.output_dir) / f"checkpoint-{global_step}"
                    save_path.mkdir(parents=True, exist_ok=True)
                    unwrapped = accelerator.unwrap_model(transformer)
                    lora_state_dict = convert_state_dict_to_diffusers(get_peft_model_state_dict(unwrapped))
                    QwenImagePipeline.save_lora_weights(save_path, lora_state_dict, safe_serialization=True)
                    print(f"Saved checkpoint to {save_path}")
            
            if global_step >= args.max_train_steps:
                break
        
        if global_step >= args.max_train_steps:
            break
    
    accelerator.wait_for_everyone()
    if accelerator.is_main_process:
        unwrapped = accelerator.unwrap_model(transformer)
        lora_state_dict = convert_state_dict_to_diffusers(get_peft_model_state_dict(unwrapped))
        QwenImagePipeline.save_lora_weights(args.output_dir, lora_state_dict, safe_serialization=True)
        print(f"Training complete! LoRA saved to {args.output_dir}")
    
    return args.output_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, required=True)
    parser.add_argument("--trigger_word", type=str, default="")
    parser.add_argument("--resolution", type=int, default=1024)
    parser.add_argument("--rank", type=int, default=16)
    parser.add_argument("--lora_alpha", type=int, default=16)
    parser.add_argument("--train_batch_size", type=int, default=1)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--lr_scheduler", type=str, default="cosine")
    parser.add_argument("--lr_warmup_steps", type=int, default=50)
    parser.add_argument("--max_train_steps", type=int, default=500)
    parser.add_argument("--checkpointing_steps", type=int, default=250)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--mixed_precision", type=str, default="bf16")
    parser.add_argument("--gradient_checkpointing", action="store_true")
    args = parser.parse_args()
    train_qwen_lora(args)
'''


@app.function(
    image=qwen_training_image,
    gpu="A100-80GB",
    volumes={"/root/models": models_volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret],
    timeout=7200,  # 2 hours
)
def train_qwen_lora(
    job_id: str,
    image_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict | None = None,
) -> dict:
    """
    Train a Qwen-Image LoRA model from images.
    
    Args:
        job_id: Unique job identifier
        image_urls: List of image URLs to train on (min 3)
        trigger_word: Trigger word for the LoRA
        character_id: Character ID for organizing output
        config: Training configuration dict
        
    Returns:
        dict with status, lora_path, etc.
    """
    import subprocess
    from accelerate.utils import write_basic_config
    
    print(f"🚀 Starting Qwen-Image LoRA training job: {job_id}")
    print(f"   Character: {character_id}")
    print(f"   Trigger word: {trigger_word}")
    print(f"   Images: {len(image_urls)}")
    
    cfg = QwenTrainingConfig(**(config or {}))
    
    data_dir = Path(f"/tmp/training/{job_id}/images")
    output_dir = Path(f"/root/models/qwen-loras/character-{character_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("📥 Downloading training images...")
    downloaded_count = download_images(image_urls, data_dir)
    
    # Also create caption files
    for img_file in data_dir.glob("*.png"):
        caption_path = img_file.with_suffix(".txt")
        caption_path.write_text(trigger_word)
    
    if downloaded_count < 3:
        raise ValueError(f"Not enough images downloaded: {downloaded_count}/3 minimum")
    print(f"✅ Downloaded {downloaded_count} images")
    
    script_path = Path("/tmp/train_qwen_lora.py")
    script_path.write_text(_create_qwen_training_script())
    
    write_basic_config(mixed_precision=cfg.mixed_precision)
    
    cmd = [
        "accelerate", "launch", str(script_path),
        f"--model_path={cfg.base_model}",
        f"--data_dir={data_dir}",
        f"--output_dir={output_dir}",
        f"--trigger_word={trigger_word}",
        f"--resolution={cfg.resolution}",
        f"--rank={cfg.rank}",
        f"--lora_alpha={cfg.lora_alpha}",
        f"--train_batch_size={cfg.train_batch_size}",
        f"--gradient_accumulation_steps={cfg.gradient_accumulation_steps}",
        f"--learning_rate={cfg.learning_rate}",
        f"--lr_scheduler={cfg.lr_scheduler}",
        f"--lr_warmup_steps={cfg.lr_warmup_steps}",
        f"--max_train_steps={cfg.max_train_steps}",
        f"--checkpointing_steps={cfg.checkpointing_steps}",
        f"--seed={cfg.seed}",
        f"--mixed_precision={cfg.mixed_precision}",
    ]
    if cfg.gradient_checkpointing:
        cmd.append("--gradient_checkpointing")
    
    print(f"🏋️ Starting training with {cfg.max_train_steps} steps...")
    start_time = time.time()
    
    import os
    env = {**os.environ, "HF_HOME": "/cache", "TRANSFORMERS_CACHE": "/cache"}
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
    for line in iter(process.stdout.readline, ""):
        print(line, end="")
    exit_code = process.wait()
    training_time = time.time() - start_time
    
    if exit_code != 0:
        raise RuntimeError(f"Training failed with exit code {exit_code}")
    
    lora_files = list(output_dir.glob("*.safetensors"))
    lora_file = lora_files[0] if lora_files else output_dir / "adapter_model.safetensors"
    if not lora_file.exists():
        raise FileNotFoundError(f"No LoRA file found in {output_dir}")
    
    final_lora_path = Path(f"/root/models/qwen-loras/qwen-character-{character_id}.safetensors")
    if lora_file != final_lora_path:
        import shutil
        shutil.copy(str(lora_file), str(final_lora_path))
    
    models_volume.commit()
    
    print(f"✅ Training complete! Duration: {training_time/60:.1f} minutes")
    
    s3_key, s3_url = upload_to_r2(
        final_lora_path,
        f"loras/qwen-character-{character_id}/{job_id}.safetensors"
    )
    
    return {
        "status": "completed",
        "job_id": job_id,
        "character_id": character_id,
        "lora_path": str(final_lora_path),
        "lora_filename": final_lora_path.name,
        "s3_key": s3_key,
        "s3_url": s3_url,
        "trigger_word": trigger_word,
        "training_time_seconds": training_time,
        "training_steps": cfg.max_train_steps,
        "image_count": downloaded_count,
        "model_type": "qwen-image",
    }


# ============================================================================
# WAN VIDEO LORA TRAINING
# ============================================================================


def _create_wan_training_script():
    """Create the Wan LoRA training script."""
    return '''
import os
import sys
import copy
import json
import torch
import argparse
from pathlib import Path
from PIL import Image
from tqdm import tqdm
import numpy as np

from peft import LoraConfig, get_peft_model
from peft.utils import get_peft_model_state_dict
from safetensors.torch import save_file

from diffusers import WanPipeline, AutoencoderKLWan
from diffusers.models import WanTransformer3DModel
from diffusers.optimization import get_scheduler
from diffusers.training_utils import compute_density_for_timestep_sampling, compute_loss_weighting_for_sd3
from diffusers.utils import convert_state_dict_to_diffusers

from torch.utils.data import Dataset, DataLoader
from accelerate import Accelerator
from accelerate.utils import set_seed
import torchvision.transforms as T

try:
    from decord import VideoReader, cpu
    HAS_DECORD = True
except ImportError:
    HAS_DECORD = False
    import imageio


class WanVideoDataset(Dataset):
    def __init__(self, data_dir: str, resolution: int = 480, num_frames: int = 17, trigger_word: str = ""):
        self.data_dir = Path(data_dir)
        self.resolution = resolution
        self.num_frames = num_frames
        self.trigger_word = trigger_word
        self.width = int(resolution * 16 / 9)
        
        self.videos = []
        for ext in ["*.mp4", "*.webm", "*.mov", "*.avi"]:
            self.videos.extend(list(self.data_dir.glob(ext)))
        
        for folder in self.data_dir.iterdir():
            if folder.is_dir():
                images = list(folder.glob("*.png")) + list(folder.glob("*.jpg"))
                if len(images) >= num_frames:
                    self.videos.append(folder)
        
        if len(self.videos) == 0:
            raise ValueError(f"No videos found in {data_dir}")
        
        print(f"Found {len(self.videos)} training videos")
        
        self.transform = T.Compose([
            T.Resize((resolution, self.width)),
            T.CenterCrop((resolution, self.width)),
            T.ToTensor(),
            T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
        ])
    
    def __len__(self):
        return len(self.videos)
    
    def _load_video_decord(self, video_path: Path) -> torch.Tensor:
        vr = VideoReader(str(video_path), ctx=cpu(0))
        total_frames = len(vr)
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        frames = vr.get_batch(indices).asnumpy()
        processed_frames = []
        for frame in frames:
            pil_frame = Image.fromarray(frame)
            processed_frames.append(self.transform(pil_frame))
        return torch.stack(processed_frames, dim=1)
    
    def _load_video_imageio(self, video_path: Path) -> torch.Tensor:
        reader = imageio.get_reader(str(video_path))
        frames = list(reader)
        total_frames = len(frames)
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        processed_frames = []
        for idx in indices:
            pil_frame = Image.fromarray(frames[int(idx)])
            processed_frames.append(self.transform(pil_frame))
        reader.close()
        return torch.stack(processed_frames, dim=1)
    
    def _load_image_sequence(self, folder: Path) -> torch.Tensor:
        images = sorted(list(folder.glob("*.png")) + list(folder.glob("*.jpg")))
        total_frames = len(images)
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        processed_frames = []
        for idx in indices:
            pil_frame = Image.open(images[int(idx)]).convert("RGB")
            processed_frames.append(self.transform(pil_frame))
        return torch.stack(processed_frames, dim=1)
    
    def __getitem__(self, idx):
        video_path = self.videos[idx]
        
        if video_path.is_dir():
            pixel_values = self._load_image_sequence(video_path)
        elif HAS_DECORD:
            pixel_values = self._load_video_decord(video_path)
        else:
            pixel_values = self._load_video_imageio(video_path)
        
        caption_path = video_path.with_suffix(".txt") if video_path.is_file() else video_path / "caption.txt"
        if caption_path.exists():
            caption = caption_path.read_text().strip()
            if self.trigger_word and self.trigger_word not in caption:
                caption = f"{self.trigger_word} {caption}"
        else:
            caption = self.trigger_word if self.trigger_word else "a video of a person"
        
        return pixel_values, caption


def get_sigmas(timesteps, scheduler, device, n_dim=5, dtype=torch.bfloat16):
    sigmas = scheduler.sigmas.to(device=device, dtype=dtype)
    schedule_timesteps = scheduler.timesteps.to(device)
    timesteps = timesteps.to(device)
    step_indices = [(schedule_timesteps == t).nonzero().item() for t in timesteps]
    sigma = sigmas[step_indices].flatten()
    while len(sigma.shape) < n_dim:
        sigma = sigma.unsqueeze(-1)
    return sigma


def train_wan_lora(args):
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision,
    )
    
    set_seed(args.seed)
    weight_dtype = torch.bfloat16
    
    print(f"Loading Wan model: {args.model_path}")
    
    vae = AutoencoderKLWan.from_pretrained(args.model_path, subfolder="vae", torch_dtype=torch.float32)
    transformer = WanTransformer3DModel.from_pretrained(args.model_path, subfolder="transformer", torch_dtype=weight_dtype)
    
    pipe = WanPipeline.from_pretrained(args.model_path, vae=vae, transformer=transformer, torch_dtype=weight_dtype)
    
    tokenizer = pipe.tokenizer
    text_encoder = pipe.text_encoder
    noise_scheduler = pipe.scheduler
    
    vae.requires_grad_(False)
    text_encoder.requires_grad_(False)
    
    target_modules = args.target_modules.split(",") if args.target_modules else ["to_q", "to_k", "to_v", "to_out.0", "proj_in", "proj_out"]
    
    lora_config = LoraConfig(r=args.rank, lora_alpha=args.lora_alpha, init_lora_weights="gaussian", target_modules=target_modules)
    
    noise_scheduler_copy = copy.deepcopy(noise_scheduler)
    
    transformer.to(accelerator.device, dtype=weight_dtype)
    transformer.add_adapter(lora_config)
    vae.to(accelerator.device)
    text_encoder.to(accelerator.device, dtype=weight_dtype)
    
    transformer.requires_grad_(False)
    for n, param in transformer.named_parameters():
        if "lora" in n:
            param.requires_grad = True
    
    trainable_params = sum(p.numel() for p in transformer.parameters() if p.requires_grad)
    print(f"Trainable parameters: {trainable_params / 1e6:.2f}M")
    
    if args.gradient_checkpointing:
        transformer.enable_gradient_checkpointing()
    
    dataset = WanVideoDataset(args.data_dir, resolution=args.resolution, num_frames=args.num_frames, trigger_word=args.trigger_word)
    dataloader = DataLoader(dataset, batch_size=args.train_batch_size, shuffle=True, num_workers=0)
    
    lora_layers = [p for p in transformer.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(lora_layers, lr=args.learning_rate, betas=(0.9, 0.999), weight_decay=0.01, eps=1e-8)
    
    lr_scheduler = get_scheduler(args.lr_scheduler, optimizer=optimizer, num_warmup_steps=args.lr_warmup_steps, num_training_steps=args.max_train_steps)
    
    transformer, optimizer, dataloader, lr_scheduler = accelerator.prepare(transformer, optimizer, dataloader, lr_scheduler)
    
    global_step = 0
    progress_bar = tqdm(range(args.max_train_steps), desc="Training", disable=not accelerator.is_local_main_process)
    
    transformer.train()
    
    for epoch in range(1000):
        for batch in dataloader:
            with accelerator.accumulate(transformer):
                pixel_values, prompts = batch
                pixel_values = pixel_values.to(dtype=torch.float32, device=accelerator.device)
                
                with torch.no_grad():
                    latents = vae.encode(pixel_values).latent_dist.sample()
                    latents = latents * vae.config.scaling_factor
                    latents = latents.to(weight_dtype)
                
                bsz = latents.shape[0]
                noise = torch.randn_like(latents, device=accelerator.device, dtype=weight_dtype)
                
                u = compute_density_for_timestep_sampling(weighting_scheme="none", batch_size=bsz, logit_mean=0.0, logit_std=1.0, mode_scale=1.29)
                indices = (u * noise_scheduler_copy.config.num_train_timesteps).long()
                timesteps = noise_scheduler_copy.timesteps[indices].to(device=latents.device)
                
                sigmas = get_sigmas(timesteps, noise_scheduler_copy, accelerator.device, n_dim=latents.ndim, dtype=latents.dtype)
                noisy_latents = (1.0 - sigmas) * latents + sigmas * noise
                
                with torch.no_grad():
                    prompt_list = list(prompts) if isinstance(prompts, tuple) else prompts
                    text_inputs = tokenizer(prompt_list, padding="max_length", max_length=256, truncation=True, return_tensors="pt").to(accelerator.device)
                    prompt_embeds = text_encoder(**text_inputs).last_hidden_state
                
                model_pred = transformer(hidden_states=noisy_latents, timestep=timesteps, encoder_hidden_states=prompt_embeds, return_dict=False)[0]
                
                weighting = compute_loss_weighting_for_sd3(weighting_scheme="none", sigmas=sigmas)
                target = noise - latents
                
                loss = torch.mean((weighting.float() * (model_pred.float() - target.float()) ** 2).reshape(target.shape[0], -1), 1)
                loss = loss.mean()
                
                accelerator.backward(loss)
                accelerator.clip_grad_norm_(transformer.parameters(), 1.0)
                optimizer.step()
                lr_scheduler.step()
                optimizer.zero_grad()
            
            if accelerator.sync_gradients:
                progress_bar.update(1)
                global_step += 1
                
                if global_step % 10 == 0:
                    print(f"Step {global_step}: loss={loss.item():.4f}")
                
                if global_step % args.checkpointing_steps == 0 and accelerator.is_main_process:
                    save_path = Path(args.output_dir) / f"checkpoint-{global_step}"
                    save_path.mkdir(parents=True, exist_ok=True)
                    unwrapped = accelerator.unwrap_model(transformer)
                    lora_state_dict = convert_state_dict_to_diffusers(get_peft_model_state_dict(unwrapped))
                    save_file(lora_state_dict, save_path / "adapter_model.safetensors")
                    print(f"Saved checkpoint to {save_path}")
            
            if global_step >= args.max_train_steps:
                break
        
        if global_step >= args.max_train_steps:
            break
    
    accelerator.wait_for_everyone()
    if accelerator.is_main_process:
        unwrapped = accelerator.unwrap_model(transformer)
        lora_state_dict = convert_state_dict_to_diffusers(get_peft_model_state_dict(unwrapped))
        output_path = Path(args.output_dir) / "adapter_model.safetensors"
        save_file(lora_state_dict, output_path)
        print(f"Training complete! LoRA saved to {output_path}")
        
        metadata = {
            "base_model": args.model_path, "trigger_word": args.trigger_word, "rank": args.rank,
            "lora_alpha": args.lora_alpha, "resolution": args.resolution, "num_frames": args.num_frames,
            "training_steps": args.max_train_steps, "target_modules": target_modules,
        }
        with open(Path(args.output_dir) / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
    
    return args.output_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, required=True)
    parser.add_argument("--trigger_word", type=str, default="")
    parser.add_argument("--resolution", type=int, default=480)
    parser.add_argument("--num_frames", type=int, default=17)
    parser.add_argument("--rank", type=int, default=32)
    parser.add_argument("--lora_alpha", type=int, default=32)
    parser.add_argument("--target_modules", type=str, default="")
    parser.add_argument("--train_batch_size", type=int, default=1)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--lr_scheduler", type=str, default="cosine")
    parser.add_argument("--lr_warmup_steps", type=int, default=50)
    parser.add_argument("--max_train_steps", type=int, default=500)
    parser.add_argument("--checkpointing_steps", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--mixed_precision", type=str, default="bf16")
    parser.add_argument("--gradient_checkpointing", action="store_true")
    args = parser.parse_args()
    train_wan_lora(args)
'''


@app.function(
    image=wan_training_image,
    gpu="L40S",
    volumes={"/root/models": models_volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret],
    timeout=14400,  # 4 hours
)
def train_wan_lora(
    job_id: str,
    video_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict | None = None,
) -> dict:
    """
    Train a Wan LoRA for video generation (1.3B model).
    
    Args:
        job_id: Unique job identifier
        video_urls: List of URLs to training videos (3-10 recommended)
        trigger_word: Trigger word for the character
        character_id: Character ID for naming the output
        config: Optional training configuration overrides
        
    Returns:
        dict with training results and LoRA path
    """
    import subprocess
    import requests
    
    start_time = time.time()
    
    cfg = WanTrainingConfig(**(config or {}))
    
    train_dir = Path(f"/tmp/training/{job_id}")
    videos_dir = train_dir / "videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📥 Downloading {len(video_urls)} training videos...")
    downloaded_count = 0
    for i, url in enumerate(video_urls):
        try:
            response = requests.get(url, timeout=300)
            response.raise_for_status()
            
            ext = ".mp4"
            if "webm" in url.lower():
                ext = ".webm"
            elif "mov" in url.lower():
                ext = ".mov"
            
            video_path = videos_dir / f"video_{i:03d}{ext}"
            video_path.write_bytes(response.content)
            
            caption_path = video_path.with_suffix(".txt")
            caption_path.write_text(trigger_word)
            
            print(f"  ✓ Downloaded: {video_path.name} ({len(response.content) / 1024 / 1024:.1f} MB)")
            downloaded_count += 1
        except Exception as e:
            print(f"  ⚠️ Failed to download {url}: {e}")
    
    if downloaded_count == 0:
        raise RuntimeError("No videos could be downloaded")
    
    output_dir = Path(f"/root/models/wan-loras/character-{character_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    script_path = Path("/tmp/train_wan_lora.py")
    script_path.write_text(_create_wan_training_script())
    
    cmd = [
        "accelerate", "launch", "--mixed_precision", cfg.mixed_precision, str(script_path),
        "--model_path", cfg.base_model,
        "--data_dir", str(videos_dir),
        "--output_dir", str(output_dir),
        "--trigger_word", trigger_word,
        "--resolution", str(cfg.resolution),
        "--num_frames", str(cfg.num_frames),
        "--rank", str(cfg.rank),
        "--lora_alpha", str(cfg.lora_alpha),
        "--target_modules", ",".join(cfg.target_modules),
        "--train_batch_size", str(cfg.train_batch_size),
        "--gradient_accumulation_steps", str(cfg.gradient_accumulation_steps),
        "--learning_rate", str(cfg.learning_rate),
        "--lr_scheduler", cfg.lr_scheduler,
        "--lr_warmup_steps", str(cfg.lr_warmup_steps),
        "--max_train_steps", str(cfg.max_train_steps),
        "--checkpointing_steps", str(cfg.checkpointing_steps),
        "--seed", str(cfg.seed),
        "--mixed_precision", cfg.mixed_precision,
    ]
    if cfg.gradient_checkpointing:
        cmd.append("--gradient_checkpointing")
    
    print(f"\n🚀 Starting Wan LoRA training...")
    print(f"  Model: {cfg.base_model}")
    print(f"  Videos: {downloaded_count} files")
    print(f"  Trigger word: {trigger_word}")
    print(f"  Steps: {cfg.max_train_steps}")
    
    result = subprocess.run(cmd, capture_output=False)
    
    if result.returncode != 0:
        raise RuntimeError(f"Training failed with exit code {result.returncode}")
    
    final_lora = output_dir / "adapter_model.safetensors"
    if final_lora.exists():
        import shutil
        dest_path = Path(f"/root/models/wan-loras/wan-character-{character_id}.safetensors")
        shutil.copy(final_lora, dest_path)
        
        metadata_src = output_dir / "metadata.json"
        if metadata_src.exists():
            shutil.copy(metadata_src, dest_path.with_suffix(".json"))
        
        models_volume.commit()
        
        training_time = time.time() - start_time
        print(f"\n✅ Training complete! Duration: {training_time/60:.1f} minutes")
        
        s3_key, s3_url = upload_to_r2(
            dest_path,
            f"loras/wan-character-{character_id}/{job_id}.safetensors"
        )
        
        return {
            "status": "completed",
            "job_id": job_id,
            "character_id": character_id,
            "lora_path": str(dest_path),
            "lora_filename": dest_path.name,
            "s3_key": s3_key,
            "s3_url": s3_url,
            "trigger_word": trigger_word,
            "training_time_seconds": training_time,
            "training_steps": cfg.max_train_steps,
            "video_count": downloaded_count,
            "model_type": "wan",
            "model_size": cfg.model_size,
            "compatible_endpoints": ["/wan2.6-lora"],
        }
    else:
        raise RuntimeError("Training completed but LoRA file not found")


@app.function(
    image=wan_training_image,
    gpu="A100-80GB",
    volumes={"/root/models": models_volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret],
    timeout=28800,  # 8 hours
)
def train_wan_lora_14b(
    job_id: str,
    video_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict | None = None,
) -> dict:
    """
    Train a Wan LoRA using the 14B model for higher quality.
    Requires A100-80GB GPU.
    """
    if config is None:
        config = {}
    config["model_size"] = "14B"
    
    return train_wan_lora.local(
        job_id=job_id,
        video_urls=video_urls,
        trigger_word=trigger_word,
        character_id=character_id,
        config=config,
    )


# ============================================================================
# LOCAL ENTRYPOINTS FOR TESTING
# ============================================================================


@app.local_entrypoint()
def test_flux(character_id: str = "test", trigger_word: str = "testchar", steps: int = 100):
    """Test Flux LoRA training."""
    test_images = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=512",
    ]
    job_id = f"flux-test-{uuid.uuid4().hex[:8]}"
    result = train_flux_lora.remote(
        job_id=job_id, image_urls=test_images, trigger_word=trigger_word,
        character_id=character_id, config={"max_train_steps": steps},
    )
    print(f"\n✅ Flux LoRA Training complete!")
    print(json.dumps(result, indent=2))


@app.local_entrypoint()
def test_qwen(character_id: str = "qwen-test", trigger_word: str = "testperson", steps: int = 100):
    """Test Qwen-Image LoRA training."""
    test_images = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=512",
    ]
    job_id = f"qwen-test-{uuid.uuid4().hex[:8]}"
    result = train_qwen_lora.remote(
        job_id=job_id, image_urls=test_images, trigger_word=trigger_word,
        character_id=character_id, config={"max_train_steps": steps},
    )
    print(f"\n✅ Qwen-Image LoRA Training complete!")
    print(json.dumps(result, indent=2))


@app.local_entrypoint()
def test_wan(character_id: str = "wan-test", trigger_word: str = "wanchar", steps: int = 100):
    """Test Wan LoRA training."""
    test_videos = [
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    ]
    job_id = f"wan-test-{uuid.uuid4().hex[:8]}"
    result = train_wan_lora.remote(
        job_id=job_id, video_urls=test_videos, trigger_word=trigger_word,
        character_id=character_id, config={"max_train_steps": steps},
    )
    print(f"\n✅ Wan LoRA Training complete!")
    print(json.dumps(result, indent=2))
