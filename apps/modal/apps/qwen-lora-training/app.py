"""
RYLA Qwen-Image LoRA Training Modal App

Deploy: modal deploy apps/modal/apps/qwen-lora-training/app.py
Run:    modal run apps/modal/apps/qwen-lora-training/app.py --character-id=test --steps=100

Trains LoRA adapters for Qwen-Image model (hyper-realistic portraits).
Uses FlyMyAI training approach with diffusers.

Note: Qwen LoRAs are NOT compatible with FLUX models - different architectures.
"""

import modal
from dataclasses import dataclass
from pathlib import Path
import json
import time
import uuid

# Create app with dependencies
app = modal.App(name="ryla-qwen-lora-training")

# Volumes for model storage
models_volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Secrets
huggingface_secret = modal.Secret.from_name("huggingface")
cloudflare_r2_secret = modal.Secret.from_name("cloudflare-r2")

# Training image with Qwen-Image dependencies
training_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "wget")
    .pip_install(
        # Core ML
        "torch>=2.5.0",
        "torchvision>=0.20.0",
        "triton>=3.0.0",
        # Training
        "accelerate>=0.34.0",
        "peft>=0.17.0",
        "transformers>=4.45.0",
        # Data & Config
        "datasets>=2.14.0",
        "huggingface-hub>=0.24.0",
        "omegaconf",
        "pyyaml",
        # Utils
        "safetensors",
        "pillow",
        "requests",
        "ftfy",
        "numpy<2",
        "sentencepiece",
        "bitsandbytes",
        "einops",
        "timm",
        # S3 upload
        "boto3",
    )
    # Install diffusers from source for Qwen-Image support
    .run_commands(
        "pip install git+https://github.com/huggingface/diffusers",
        # Clone the FlyMyAI trainer for reference
        "git clone --depth=1 https://github.com/FlyMyAI/flymyai-lora-trainer /root/flymyai-trainer",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
)


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


def create_training_script():
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
    """Dataset for Qwen-Image LoRA training."""
    
    def __init__(self, data_dir: str, resolution: int = 1024, trigger_word: str = ""):
        self.data_dir = Path(data_dir)
        self.resolution = resolution
        self.trigger_word = trigger_word
        
        # Find all images
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
        
        # Load image
        image = Image.open(img_path).convert("RGB")
        pixel_values = self.transform(image)
        
        # Load caption if exists, otherwise use trigger word
        caption_path = img_path.with_suffix(".txt")
        if caption_path.exists():
            caption = caption_path.read_text().strip()
            if self.trigger_word and self.trigger_word not in caption:
                caption = f"{self.trigger_word} {caption}"
        else:
            caption = self.trigger_word if self.trigger_word else "a photo of a person"
        
        return pixel_values, caption


def get_sigmas(timesteps, scheduler, device, n_dim=5, dtype=torch.bfloat16):
    """Get sigma values for flow matching."""
    sigmas = scheduler.sigmas.to(device=device, dtype=dtype)
    schedule_timesteps = scheduler.timesteps.to(device)
    timesteps = timesteps.to(device)
    step_indices = [(schedule_timesteps == t).nonzero().item() for t in timesteps]
    sigma = sigmas[step_indices].flatten()
    while len(sigma.shape) < n_dim:
        sigma = sigma.unsqueeze(-1)
    return sigma


def train_qwen_lora(args):
    """Main training function for Qwen-Image LoRA using flow matching."""
    
    # Initialize accelerator
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision,
    )
    
    set_seed(args.seed)
    weight_dtype = torch.bfloat16
    
    print(f"Loading Qwen-Image model: {args.model_path}")
    
    # Load text encoding pipeline (no transformer/vae for encoding only)
    text_encoding_pipeline = QwenImagePipeline.from_pretrained(
        args.model_path,
        transformer=None,
        vae=None,
        torch_dtype=weight_dtype,
    )
    
    # Load VAE
    vae = AutoencoderKLQwenImage.from_pretrained(
        args.model_path,
        subfolder="vae",
    )
    vae.requires_grad_(False)
    
    # Load transformer
    transformer = QwenImageTransformer2DModel.from_pretrained(
        args.model_path,
        subfolder="transformer",
    )
    
    # Configure LoRA
    lora_config = LoraConfig(
        r=args.rank,
        lora_alpha=args.rank,
        init_lora_weights="gaussian",
        target_modules=["to_k", "to_q", "to_v", "to_out.0"],
    )
    
    # Load scheduler
    noise_scheduler = FlowMatchEulerDiscreteScheduler.from_pretrained(
        args.model_path,
        subfolder="scheduler",
    )
    noise_scheduler_copy = copy.deepcopy(noise_scheduler)
    
    # Move to device and add adapter
    transformer.to(accelerator.device, dtype=weight_dtype)
    transformer.add_adapter(lora_config)
    text_encoding_pipeline.to(accelerator.device)
    
    # Freeze non-LoRA parameters
    transformer.requires_grad_(False)
    for n, param in transformer.named_parameters():
        if "lora" in n:
            param.requires_grad = True
            print(f"  Training: {n}")
    
    trainable_params = sum(p.numel() for p in transformer.parameters() if p.requires_grad)
    print(f"Trainable parameters: {trainable_params / 1e6:.2f}M")
    
    transformer.enable_gradient_checkpointing()
    
    # Create dataset
    dataset = QwenImageDataset(
        args.data_dir,
        resolution=args.resolution,
        trigger_word=args.trigger_word,
    )
    
    dataloader = DataLoader(
        dataset,
        batch_size=args.train_batch_size,
        shuffle=True,
        num_workers=0,
    )
    
    # Optimizer (only LoRA layers)
    lora_layers = [p for p in transformer.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(
        lora_layers,
        lr=args.learning_rate,
        betas=(0.9, 0.999),
        weight_decay=0.01,
        eps=1e-8,
    )
    
    # Scheduler
    lr_scheduler = get_scheduler(
        args.lr_scheduler,
        optimizer=optimizer,
        num_warmup_steps=args.lr_warmup_steps,
        num_training_steps=args.max_train_steps,
    )
    
    # Prepare for training
    vae.to(accelerator.device, dtype=weight_dtype)
    transformer, optimizer, dataloader, lr_scheduler = accelerator.prepare(
        transformer, optimizer, dataloader, lr_scheduler
    )
    
    vae_scale_factor = 2 ** len(vae.temperal_downsample)
    
    # Training loop
    global_step = 0
    progress_bar = tqdm(
        range(args.max_train_steps),
        desc="Training",
        disable=not accelerator.is_local_main_process,
    )
    
    transformer.train()
    
    for epoch in range(1000):  # Loop until max_train_steps
        for batch in dataloader:
            with accelerator.accumulate(transformer):
                pixel_values, prompts = batch
                pixel_values = pixel_values.to(dtype=weight_dtype, device=accelerator.device)
                
                # Add frame dimension: (B, C, H, W) -> (B, C, 1, H, W)
                pixel_values = pixel_values.unsqueeze(2)
                
                # Encode images to latents
                with torch.no_grad():
                    pixel_latents = vae.encode(pixel_values).latent_dist.sample()
                    # Permute: (B, C, F, H, W) -> (B, F, C, H, W)
                    pixel_latents = pixel_latents.permute(0, 2, 1, 3, 4)
                    
                    # Normalize latents
                    latents_mean = torch.tensor(vae.config.latents_mean).view(1, 1, vae.config.z_dim, 1, 1).to(pixel_latents.device, pixel_latents.dtype)
                    latents_std = 1.0 / torch.tensor(vae.config.latents_std).view(1, 1, vae.config.z_dim, 1, 1).to(pixel_latents.device, pixel_latents.dtype)
                    pixel_latents = (pixel_latents - latents_mean) * latents_std
                
                bsz = pixel_latents.shape[0]
                noise = torch.randn_like(pixel_latents, device=accelerator.device, dtype=weight_dtype)
                
                # Sample timesteps using density sampling
                u = compute_density_for_timestep_sampling(
                    weighting_scheme="none",
                    batch_size=bsz,
                    logit_mean=0.0,
                    logit_std=1.0,
                    mode_scale=1.29,
                )
                indices = (u * noise_scheduler_copy.config.num_train_timesteps).long()
                timesteps = noise_scheduler_copy.timesteps[indices].to(device=pixel_latents.device)
                
                # Get sigmas for flow matching
                sigmas = get_sigmas(timesteps, noise_scheduler_copy, accelerator.device, n_dim=pixel_latents.ndim, dtype=pixel_latents.dtype)
                
                # Create noisy input using flow matching formula
                noisy_model_input = (1.0 - sigmas) * pixel_latents + sigmas * noise
                
                # Pack latents for transformer
                packed_noisy_model_input = QwenImagePipeline._pack_latents(
                    noisy_model_input,
                    bsz,
                    noisy_model_input.shape[2],
                    noisy_model_input.shape[3],
                    noisy_model_input.shape[4],
                )
                
                # Image shapes for RoPE
                img_shapes = [(1, noisy_model_input.shape[3] // 2, noisy_model_input.shape[4] // 2)] * bsz
                
                # Encode text
                with torch.no_grad():
                    prompt_list = list(prompts) if isinstance(prompts, tuple) else prompts
                    encode_result = text_encoding_pipeline.encode_prompt(
                        prompt=prompt_list,
                        device=packed_noisy_model_input.device,
                        num_images_per_prompt=1,
                        max_sequence_length=1024,
                    )
                    # Handle different return signatures
                    if isinstance(encode_result, tuple):
                        if len(encode_result) == 2:
                            prompt_embeds, prompt_embeds_mask = encode_result
                        else:
                            prompt_embeds = encode_result[0]
                            prompt_embeds_mask = encode_result[1] if len(encode_result) > 1 else None
                    else:
                        prompt_embeds = encode_result
                        prompt_embeds_mask = None
                    
                    # Create mask if not provided
                    if prompt_embeds_mask is None:
                        prompt_embeds_mask = torch.ones(
                            prompt_embeds.shape[:2],
                            dtype=torch.bool,
                            device=prompt_embeds.device
                        )
                
                txt_seq_lens = prompt_embeds_mask.sum(dim=1).tolist()
                
                # Forward pass
                model_pred = transformer(
                    hidden_states=packed_noisy_model_input,
                    timestep=timesteps / 1000,
                    guidance=None,
                    encoder_hidden_states_mask=prompt_embeds_mask,
                    encoder_hidden_states=prompt_embeds,
                    img_shapes=img_shapes,
                    txt_seq_lens=txt_seq_lens,
                    return_dict=False,
                )[0]
                
                # Unpack prediction
                model_pred = QwenImagePipeline._unpack_latents(
                    model_pred,
                    height=noisy_model_input.shape[3] * vae_scale_factor,
                    width=noisy_model_input.shape[4] * vae_scale_factor,
                    vae_scale_factor=vae_scale_factor,
                )
                
                # Flow matching loss: predict velocity (noise - latents)
                weighting = compute_loss_weighting_for_sd3(weighting_scheme="none", sigmas=sigmas)
                target = noise - pixel_latents
                target = target.permute(0, 2, 1, 3, 4)  # Match model_pred shape
                
                loss = torch.mean(
                    (weighting.float() * (model_pred.float() - target.float()) ** 2).reshape(target.shape[0], -1),
                    1,
                )
                loss = loss.mean()
                
                accelerator.backward(loss)
                accelerator.clip_grad_norm_(transformer.parameters(), 1.0)
                optimizer.step()
                lr_scheduler.step()
                optimizer.zero_grad()
            
            # Update progress
            if accelerator.sync_gradients:
                progress_bar.update(1)
                global_step += 1
                
                if global_step % 10 == 0:
                    print(f"Step {global_step}: loss={loss.item():.4f}")
                
                # Save checkpoint
                if global_step % args.checkpointing_steps == 0 and accelerator.is_main_process:
                    save_path = Path(args.output_dir) / f"checkpoint-{global_step}"
                    save_path.mkdir(parents=True, exist_ok=True)
                    
                    # Save LoRA weights
                    unwrapped = accelerator.unwrap_model(transformer)
                    lora_state_dict = convert_state_dict_to_diffusers(
                        get_peft_model_state_dict(unwrapped)
                    )
                    QwenImagePipeline.save_lora_weights(
                        save_path,
                        lora_state_dict,
                        safe_serialization=True,
                    )
                    print(f"Saved checkpoint to {save_path}")
            
            if global_step >= args.max_train_steps:
                break
        
        if global_step >= args.max_train_steps:
            break
    
    # Save final model
    accelerator.wait_for_everyone()
    if accelerator.is_main_process:
        unwrapped = accelerator.unwrap_model(transformer)
        lora_state_dict = convert_state_dict_to_diffusers(
            get_peft_model_state_dict(unwrapped)
        )
        QwenImagePipeline.save_lora_weights(
            args.output_dir,
            lora_state_dict,
            safe_serialization=True,
        )
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
    image=training_image,
    gpu="A100-80GB",
    volumes={
        "/root/models": models_volume,
        "/cache": hf_cache_vol,
    },
    secrets=[huggingface_secret, cloudflare_r2_secret],
    timeout=7200,  # 2 hours
)
def train_qwen_lora(
    job_id: str,
    image_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict,
) -> dict:
    """
    Train a Qwen-Image LoRA model from images.
    
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
    import requests
    from PIL import Image
    from io import BytesIO
    from accelerate.utils import write_basic_config
    
    print(f"🚀 Starting Qwen-Image LoRA training job: {job_id}")
    print(f"   Character: {character_id}")
    print(f"   Trigger word: {trigger_word}")
    print(f"   Images: {len(image_urls)}")
    
    # Parse config
    cfg = QwenTrainingConfig(**config) if config else QwenTrainingConfig()
    
    # Create directories
    data_dir = Path(f"/tmp/training/{job_id}/images")
    output_dir = Path(f"/root/models/qwen-loras/character-{character_id}")
    data_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Download images and create captions
    print("📥 Downloading training images...")
    for i, url in enumerate(image_urls):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img_path = data_dir / f"{i:04d}.png"
            img.save(img_path)
            
            # Create caption file with trigger word
            caption_path = data_dir / f"{i:04d}.txt"
            caption_path.write_text(f"{trigger_word}")
            
            print(f"   Downloaded image {i+1}/{len(image_urls)}")
        except Exception as e:
            print(f"   ⚠️ Failed to download image {i}: {e}")
    
    downloaded_count = len(list(data_dir.glob("*.png")))
    if downloaded_count < 3:
        raise ValueError(f"Not enough images downloaded: {downloaded_count}/3 minimum")
    
    print(f"✅ Downloaded {downloaded_count} images")
    
    # Write training script
    script_path = Path("/tmp/train_qwen_lora.py")
    script_path.write_text(create_training_script())
    
    # Set up accelerate
    write_basic_config(mixed_precision=cfg.mixed_precision)
    
    # Build training command
    cmd = [
        "accelerate", "launch",
        str(script_path),
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
    
    print(f"🏋️ Starting Qwen-Image LoRA training with {cfg.max_train_steps} steps...")
    print(f"   Command: {' '.join(cmd[:5])}...")
    
    start_time = time.time()
    
    # Run training
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env={
            **dict(__import__("os").environ),
            "HF_HOME": "/cache",
            "TRANSFORMERS_CACHE": "/cache",
        },
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
        # Check for adapter_model.safetensors from PEFT
        lora_file = output_dir / "adapter_model.safetensors"
        if not lora_file.exists():
            raise FileNotFoundError(f"No LoRA file found in {output_dir}")
    else:
        lora_file = lora_files[0]
    
    # Copy to standard naming
    final_lora_path = Path(f"/root/models/qwen-loras/qwen-character-{character_id}.safetensors")
    if lora_file != final_lora_path:
        import shutil
        shutil.copy(str(lora_file), str(final_lora_path))
    
    # Commit volume changes
    models_volume.commit()
    
    print(f"✅ Qwen-Image LoRA training complete!")
    print(f"   Duration: {training_time/60:.1f} minutes")
    print(f"   LoRA saved to: {final_lora_path}")
    
    # Upload to S3/R2 storage for persistent access
    s3_key = None
    s3_url = None
    try:
        import os
        import boto3
        
        r2_account_id = os.environ.get("CLOUDFLARE_R2_ACCOUNT_ID")
        r2_access_key = os.environ.get("CLOUDFLARE_R2_ACCESS_KEY_ID")
        r2_secret_key = os.environ.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
        r2_bucket = os.environ.get("CLOUDFLARE_R2_BUCKET", "ryla-storage")
        r2_public_url = os.environ.get("CLOUDFLARE_R2_PUBLIC_URL", "")
        
        if r2_account_id and r2_access_key and r2_secret_key:
            s3_client = boto3.client(
                "s3",
                endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=r2_access_key,
                aws_secret_access_key=r2_secret_key,
            )
            
            s3_key = f"loras/qwen-character-{character_id}/{job_id}.safetensors"
            
            print(f"📤 Uploading Qwen LoRA to S3: {s3_key}")
            s3_client.upload_file(
                str(final_lora_path),
                r2_bucket,
                s3_key,
                ExtraArgs={"ContentType": "application/octet-stream"}
            )
            
            if r2_public_url:
                s3_url = f"{r2_public_url.rstrip('/')}/{s3_key}"
            
            print(f"✅ Uploaded to S3: {s3_key}")
        else:
            print("⚠️ S3/R2 credentials not configured, skipping upload")
    except Exception as e:
        print(f"⚠️ Failed to upload to S3: {e}")
    
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


# Local entrypoint for testing
@app.local_entrypoint()
def main(
    character_id: str = "qwen-test",
    trigger_word: str = "testperson",
    steps: int = 100,
):
    """Test Qwen-Image LoRA training."""
    test_images = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=512",
    ]
    
    job_id = f"qwen-test-{uuid.uuid4().hex[:8]}"
    
    result = train_qwen_lora.remote(
        job_id=job_id,
        image_urls=test_images,
        trigger_word=trigger_word,
        character_id=character_id,
        config={"max_train_steps": steps},
    )
    
    print(f"\n✅ Qwen-Image LoRA Training complete!")
    print(json.dumps(result, indent=2))
