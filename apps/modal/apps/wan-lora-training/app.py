"""
RYLA Wan 2.6 LoRA Training Modal App

Train custom LoRAs for Wan 2.6 (Wan 2.1/2.2 architecture) video generation models.
Uses diffusers with PEFT for LoRA training.

Deploy: modal deploy apps/modal/apps/wan-lora-training/app.py
Test: modal run apps/modal/apps/wan-lora-training/app.py --character-id=test --trigger-word=testchar --steps=100

Requirements:
- Training videos uploaded to accessible URLs
- GPU with 24GB+ VRAM (L40S/A100 recommended)
- ~2-4 hours for 500 steps (1.3B model)
- ~4-8 hours for 500 steps (14B model)

Output:
- LoRA saved to /root/models/wan-loras/wan-character-{character_id}.safetensors
- Compatible with ryla-wan26 LoRA endpoints (/wan2.6-lora)

Model Compatibility:
- Trained LoRAs work with both Wan 2.1 and Wan 2.6 (same architecture)
- Output format compatible with ComfyUI and diffusers
"""

import modal
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum

# Modal app
app = modal.App(name="ryla-wan-lora-training")

# Shared volume for storing trained LoRAs
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# HuggingFace cache volume
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# HuggingFace secret for model downloads
huggingface_secret = modal.Secret.from_name("huggingface")

# Cloudflare R2 secret for S3 storage
cloudflare_r2_secret = modal.Secret.from_name("cloudflare-r2")


class WanModelSize(str, Enum):
    """Available Wan model sizes."""
    SMALL = "1.3B"  # Consumer-friendly, 8GB VRAM
    LARGE = "14B"   # High quality, 40GB+ VRAM


MODEL_MAP = {
    WanModelSize.SMALL: "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
    WanModelSize.LARGE: "Wan-AI/Wan2.1-T2V-14B-Diffusers",
}


@dataclass
class WanTrainingConfig:
    """Configuration for Wan LoRA training.
    
    Optimized defaults for character LoRA training on video generation.
    """
    # Model selection
    model_size: str = "1.3B"  # "1.3B" or "14B"
    
    # Video settings
    resolution: int = 480  # Video resolution (480p default, 720p available for 14B)
    num_frames: int = 17   # Number of frames per video (4N + 1 formula)
    
    # LoRA architecture
    rank: int = 32         # LoRA rank (higher = more capacity, more VRAM)
    lora_alpha: int = 32   # LoRA alpha (typically same as rank)
    
    # Training hyperparameters
    learning_rate: float = 1e-4
    train_batch_size: int = 1
    gradient_accumulation_steps: int = 4
    max_train_steps: int = 500
    checkpointing_steps: int = 100
    
    # Scheduler
    lr_scheduler: str = "cosine"
    lr_warmup_steps: int = 50
    
    # Reproducibility
    seed: int = 42
    
    # Precision
    mixed_precision: str = "bf16"
    gradient_checkpointing: bool = True
    
    # LoRA target modules for WanTransformer3DModel
    target_modules: list = field(default_factory=lambda: [
        "to_q", "to_k", "to_v", "to_out.0",
        "proj_in", "proj_out",
        "ff.net.0.proj", "ff.net.2",
    ])
    
    @property
    def base_model(self) -> str:
        """Get the HuggingFace model ID based on model_size."""
        size = WanModelSize(self.model_size)
        return MODEL_MAP[size]


# Training image with all dependencies
training_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "wget", "ffmpeg", "libgl1-mesa-glx", "libglib2.0-0")
    .pip_install(
        # Core ML
        "torch>=2.4.0",
        "torchvision>=0.19.0",
        # HuggingFace
        "transformers>=4.44.0",
        "diffusers>=0.31.0",
        "accelerate>=0.33.0",
        "peft>=0.12.0",
        "huggingface_hub>=0.24.0",
        # Video processing
        "decord",
        "opencv-python-headless",
        "imageio",
        "imageio-ffmpeg",
        # Utils
        "safetensors",
        "pillow",
        "tqdm",
        "requests",
        "ftfy",
        "sentencepiece",
        "numpy<2",
        # S3 upload
        "boto3",
    )
    .env({"HF_HOME": "/cache", "TRANSFORMERS_CACHE": "/cache", "HF_XET_HIGH_PERFORMANCE": "1"})
)


def create_training_script():
    """Create the Wan LoRA training script using diffusers + PEFT."""
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
from diffusers.training_utils import (
    compute_density_for_timestep_sampling,
    compute_loss_weighting_for_sd3,
)
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
    """Dataset for Wan video LoRA training."""
    
    def __init__(
        self, 
        data_dir: str, 
        resolution: int = 480, 
        num_frames: int = 17,
        trigger_word: str = ""
    ):
        self.data_dir = Path(data_dir)
        self.resolution = resolution
        self.num_frames = num_frames
        self.trigger_word = trigger_word
        
        # Calculate 16:9 width
        self.width = int(resolution * 16 / 9)
        
        # Find all videos
        self.videos = []
        for ext in ["*.mp4", "*.webm", "*.mov", "*.avi"]:
            self.videos.extend(list(self.data_dir.glob(ext)))
        
        # Also support image sequences (folders with images)
        for folder in self.data_dir.iterdir():
            if folder.is_dir():
                images = list(folder.glob("*.png")) + list(folder.glob("*.jpg"))
                if len(images) >= num_frames:
                    self.videos.append(folder)
        
        if len(self.videos) == 0:
            raise ValueError(f"No videos or image sequences found in {data_dir}")
        
        print(f"Found {len(self.videos)} training videos/sequences")
        
        self.transform = T.Compose([
            T.Resize((resolution, self.width)),
            T.CenterCrop((resolution, self.width)),
            T.ToTensor(),
            T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
        ])
    
    def __len__(self):
        return len(self.videos)
    
    def _load_video_decord(self, video_path: Path) -> torch.Tensor:
        """Load video using decord."""
        vr = VideoReader(str(video_path), ctx=cpu(0))
        total_frames = len(vr)
        
        # Sample frames evenly
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        frames = vr.get_batch(indices).asnumpy()
        
        # Convert to tensor
        processed_frames = []
        for frame in frames:
            pil_frame = Image.fromarray(frame)
            processed_frames.append(self.transform(pil_frame))
        
        return torch.stack(processed_frames, dim=1)  # (C, T, H, W)
    
    def _load_video_imageio(self, video_path: Path) -> torch.Tensor:
        """Load video using imageio."""
        reader = imageio.get_reader(str(video_path))
        frames = list(reader)
        total_frames = len(frames)
        
        # Sample frames evenly
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        
        processed_frames = []
        for idx in indices:
            pil_frame = Image.fromarray(frames[int(idx)])
            processed_frames.append(self.transform(pil_frame))
        
        reader.close()
        return torch.stack(processed_frames, dim=1)  # (C, T, H, W)
    
    def _load_image_sequence(self, folder: Path) -> torch.Tensor:
        """Load image sequence from folder."""
        images = sorted(list(folder.glob("*.png")) + list(folder.glob("*.jpg")))
        total_frames = len(images)
        
        # Sample frames evenly
        indices = np.linspace(0, total_frames - 1, self.num_frames, dtype=int)
        
        processed_frames = []
        for idx in indices:
            pil_frame = Image.open(images[int(idx)]).convert("RGB")
            processed_frames.append(self.transform(pil_frame))
        
        return torch.stack(processed_frames, dim=1)  # (C, T, H, W)
    
    def __getitem__(self, idx):
        video_path = self.videos[idx]
        
        # Load video frames
        if video_path.is_dir():
            pixel_values = self._load_image_sequence(video_path)
        elif HAS_DECORD:
            pixel_values = self._load_video_decord(video_path)
        else:
            pixel_values = self._load_video_imageio(video_path)
        
        # Load caption if exists
        caption_path = video_path.with_suffix(".txt") if video_path.is_file() else video_path / "caption.txt"
        if caption_path.exists():
            caption = caption_path.read_text().strip()
            if self.trigger_word and self.trigger_word not in caption:
                caption = f"{self.trigger_word} {caption}"
        else:
            caption = self.trigger_word if self.trigger_word else "a video of a person"
        
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


def train_wan_lora(args):
    """Main training function for Wan LoRA using flow matching."""
    
    # Initialize accelerator
    accelerator = Accelerator(
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        mixed_precision=args.mixed_precision,
    )
    
    set_seed(args.seed)
    weight_dtype = torch.bfloat16
    
    print(f"Loading Wan model: {args.model_path}")
    
    # Load components separately for memory efficiency
    vae = AutoencoderKLWan.from_pretrained(
        args.model_path,
        subfolder="vae",
        torch_dtype=torch.float32,  # VAE in fp32 for quality
    )
    
    transformer = WanTransformer3DModel.from_pretrained(
        args.model_path,
        subfolder="transformer",
        torch_dtype=weight_dtype,
    )
    
    # Load pipeline for tokenizer and text encoder
    pipe = WanPipeline.from_pretrained(
        args.model_path,
        vae=vae,
        transformer=transformer,
        torch_dtype=weight_dtype,
    )
    
    tokenizer = pipe.tokenizer
    text_encoder = pipe.text_encoder
    noise_scheduler = pipe.scheduler
    
    # Freeze VAE and text encoder
    vae.requires_grad_(False)
    text_encoder.requires_grad_(False)
    
    # Parse target modules
    target_modules = args.target_modules.split(",") if args.target_modules else [
        "to_q", "to_k", "to_v", "to_out.0",
        "proj_in", "proj_out",
    ]
    
    # Configure LoRA for transformer
    lora_config = LoraConfig(
        r=args.rank,
        lora_alpha=args.lora_alpha,
        init_lora_weights="gaussian",
        target_modules=target_modules,
    )
    
    noise_scheduler_copy = copy.deepcopy(noise_scheduler)
    
    # Move to device and add adapter
    transformer.to(accelerator.device, dtype=weight_dtype)
    transformer.add_adapter(lora_config)
    vae.to(accelerator.device)
    text_encoder.to(accelerator.device, dtype=weight_dtype)
    
    # Freeze non-LoRA parameters
    transformer.requires_grad_(False)
    for n, param in transformer.named_parameters():
        if "lora" in n:
            param.requires_grad = True
    
    trainable_params = sum(p.numel() for p in transformer.parameters() if p.requires_grad)
    print(f"Trainable parameters: {trainable_params / 1e6:.2f}M")
    
    if args.gradient_checkpointing:
        transformer.enable_gradient_checkpointing()
    
    # Create dataset
    dataset = WanVideoDataset(
        args.data_dir,
        resolution=args.resolution,
        num_frames=args.num_frames,
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
    transformer, optimizer, dataloader, lr_scheduler = accelerator.prepare(
        transformer, optimizer, dataloader, lr_scheduler
    )
    
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
                # pixel_values: (B, C, T, H, W)
                pixel_values = pixel_values.to(dtype=torch.float32, device=accelerator.device)
                
                # Encode video to latents
                with torch.no_grad():
                    # VAE expects (B, C, T, H, W)
                    latents = vae.encode(pixel_values).latent_dist.sample()
                    latents = latents * vae.config.scaling_factor
                    latents = latents.to(weight_dtype)
                
                bsz = latents.shape[0]
                noise = torch.randn_like(latents, device=accelerator.device, dtype=weight_dtype)
                
                # Sample timesteps using flow matching distribution
                u = compute_density_for_timestep_sampling(
                    weighting_scheme="none",
                    batch_size=bsz,
                    logit_mean=0.0,
                    logit_std=1.0,
                    mode_scale=1.29,
                )
                indices = (u * noise_scheduler_copy.config.num_train_timesteps).long()
                timesteps = noise_scheduler_copy.timesteps[indices].to(device=latents.device)
                
                # Get sigmas for flow matching
                sigmas = get_sigmas(timesteps, noise_scheduler_copy, accelerator.device, n_dim=latents.ndim, dtype=latents.dtype)
                
                # Create noisy input (flow matching interpolation)
                noisy_latents = (1.0 - sigmas) * latents + sigmas * noise
                
                # Encode text
                with torch.no_grad():
                    prompt_list = list(prompts) if isinstance(prompts, tuple) else prompts
                    text_inputs = tokenizer(
                        prompt_list,
                        padding="max_length",
                        max_length=256,
                        truncation=True,
                        return_tensors="pt",
                    ).to(accelerator.device)
                    prompt_embeds = text_encoder(**text_inputs).last_hidden_state
                
                # Forward pass
                model_pred = transformer(
                    hidden_states=noisy_latents,
                    timestep=timesteps,
                    encoder_hidden_states=prompt_embeds,
                    return_dict=False,
                )[0]
                
                # Flow matching loss
                weighting = compute_loss_weighting_for_sd3(weighting_scheme="none", sigmas=sigmas)
                target = noise - latents
                
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
                    
                    unwrapped = accelerator.unwrap_model(transformer)
                    lora_state_dict = convert_state_dict_to_diffusers(
                        get_peft_model_state_dict(unwrapped)
                    )
                    
                    save_file(lora_state_dict, save_path / "adapter_model.safetensors")
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
        
        output_path = Path(args.output_dir) / "adapter_model.safetensors"
        save_file(lora_state_dict, output_path)
        print(f"Training complete! LoRA saved to {output_path}")
        
        # Save metadata
        metadata = {
            "base_model": args.model_path,
            "trigger_word": args.trigger_word,
            "rank": args.rank,
            "lora_alpha": args.lora_alpha,
            "resolution": args.resolution,
            "num_frames": args.num_frames,
            "training_steps": args.max_train_steps,
            "target_modules": target_modules,
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
    image=training_image,
    gpu="L40S",
    timeout=14400,  # 4 hours max
    volumes={"/root/models": volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret, cloudflare_r2_secret],
)
def train_wan_lora(
    job_id: str,
    video_urls: list[str],
    trigger_word: str,
    character_id: str,
    config: dict | None = None,
) -> dict:
    """
    Train a Wan LoRA for video generation.
    
    Trained LoRAs are compatible with:
    - ryla-wan26 /wan2.6-lora endpoint (ComfyUI)
    - Diffusers WanPipeline.load_lora_weights()
    
    Args:
        job_id: Unique job identifier
        video_urls: List of URLs to training videos (3-10 recommended)
        trigger_word: Trigger word for the character (e.g., "wanchar")
        character_id: Character ID for naming the output
        config: Optional training configuration overrides:
            - model_size: "1.3B" (default) or "14B"
            - max_train_steps: Training steps (default 500)
            - rank: LoRA rank (default 32)
            - resolution: Video resolution (default 480)
            - num_frames: Frames per video (default 17)
    
    Returns:
        dict with training results and LoRA path
    """
    import os
    import time
    import subprocess
    import requests
    from pathlib import Path
    
    start_time = time.time()
    
    # Setup config
    training_config = WanTrainingConfig()
    if config:
        for key, value in config.items():
            if hasattr(training_config, key):
                setattr(training_config, key, value)
    
    # Create training directory
    train_dir = Path(f"/tmp/training/{job_id}")
    videos_dir = train_dir / "videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    # Download training videos
    print(f"📥 Downloading {len(video_urls)} training videos...")
    downloaded_count = 0
    for i, url in enumerate(video_urls):
        try:
            response = requests.get(url, timeout=300)
            response.raise_for_status()
            
            # Determine extension
            ext = ".mp4"
            if "webm" in url.lower():
                ext = ".webm"
            elif "mov" in url.lower():
                ext = ".mov"
            
            video_path = videos_dir / f"video_{i:03d}{ext}"
            video_path.write_bytes(response.content)
            
            # Create simple caption file with trigger word
            caption_path = video_path.with_suffix(".txt")
            caption_path.write_text(trigger_word)
            
            print(f"  ✓ Downloaded: {video_path.name} ({len(response.content) / 1024 / 1024:.1f} MB)")
            downloaded_count += 1
        except Exception as e:
            print(f"  ⚠️ Warning: Failed to download {url}: {e}")
    
    if downloaded_count == 0:
        raise RuntimeError("No videos could be downloaded")
    
    # Create output directory
    output_dir = Path(f"/root/models/wan-loras/character-{character_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Write training script
    script_path = Path("/tmp/train_wan_lora.py")
    script_path.write_text(create_training_script())
    
    # Build training command
    cmd = [
        "accelerate", "launch",
        "--mixed_precision", training_config.mixed_precision,
        str(script_path),
        "--model_path", training_config.base_model,
        "--data_dir", str(videos_dir),
        "--output_dir", str(output_dir),
        "--trigger_word", trigger_word,
        "--resolution", str(training_config.resolution),
        "--num_frames", str(training_config.num_frames),
        "--rank", str(training_config.rank),
        "--lora_alpha", str(training_config.lora_alpha),
        "--target_modules", ",".join(training_config.target_modules),
        "--train_batch_size", str(training_config.train_batch_size),
        "--gradient_accumulation_steps", str(training_config.gradient_accumulation_steps),
        "--learning_rate", str(training_config.learning_rate),
        "--lr_scheduler", training_config.lr_scheduler,
        "--lr_warmup_steps", str(training_config.lr_warmup_steps),
        "--max_train_steps", str(training_config.max_train_steps),
        "--checkpointing_steps", str(training_config.checkpointing_steps),
        "--seed", str(training_config.seed),
        "--mixed_precision", training_config.mixed_precision,
    ]
    
    if training_config.gradient_checkpointing:
        cmd.append("--gradient_checkpointing")
    
    print(f"\n🚀 Starting Wan LoRA training...")
    print(f"  Model: {training_config.base_model}")
    print(f"  Model size: {training_config.model_size}")
    print(f"  Videos: {downloaded_count} files")
    print(f"  Trigger word: {trigger_word}")
    print(f"  Steps: {training_config.max_train_steps}")
    print(f"  Resolution: {training_config.resolution}p")
    print(f"  Frames: {training_config.num_frames}")
    print(f"  LoRA rank: {training_config.rank}")
    print()
    
    # Run training
    result = subprocess.run(cmd, capture_output=False)
    
    if result.returncode != 0:
        raise RuntimeError(f"Training failed with exit code {result.returncode}")
    
    # Copy final LoRA to standard location
    final_lora = output_dir / "adapter_model.safetensors"
    if final_lora.exists():
        import shutil
        dest_path = Path(f"/root/models/wan-loras/wan-character-{character_id}.safetensors")
        shutil.copy(final_lora, dest_path)
        
        # Copy metadata
        metadata_src = output_dir / "metadata.json"
        if metadata_src.exists():
            metadata_dest = dest_path.with_suffix(".json")
            shutil.copy(metadata_src, metadata_dest)
        
        volume.commit()
        
        training_time = time.time() - start_time
        
        print(f"\n✅ Wan LoRA training complete!")
        print(f"   Duration: {training_time / 60:.1f} minutes")
        print(f"   LoRA saved to: {dest_path}")
        print(f"   Compatible with: ryla-wan26 /wan2.6-lora endpoint")
        
        # Upload to S3/R2 storage for persistent access
        s3_key = None
        s3_url = None
        try:
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
                
                s3_key = f"loras/wan-character-{character_id}/{job_id}.safetensors"
                
                print(f"📤 Uploading Wan LoRA to S3: {s3_key}")
                s3_client.upload_file(
                    str(dest_path),
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
            "lora_path": str(dest_path),
            "lora_filename": dest_path.name,
            "s3_key": s3_key,
            "s3_url": s3_url,
            "trigger_word": trigger_word,
            "training_time_seconds": training_time,
            "training_steps": training_config.max_train_steps,
            "video_count": downloaded_count,
            "model_type": "wan",
            "model_size": training_config.model_size,
            "compatible_endpoints": ["/wan2.6-lora"],
        }
    else:
        raise RuntimeError("Training completed but LoRA file not found")


@app.function(
    image=training_image,
    gpu="A100-80GB",  # Larger GPU for 14B model
    timeout=28800,  # 8 hours max
    volumes={"/root/models": volume, "/cache": hf_cache_vol},
    secrets=[huggingface_secret, cloudflare_r2_secret],
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
    
    Requires A100-80GB GPU. Takes longer but produces higher quality results.
    
    Args:
        Same as train_wan_lora()
    
    Returns:
        dict with training results and LoRA path
    """
    # Force 14B model
    if config is None:
        config = {}
    config["model_size"] = "14B"
    
    # Call the main training function
    return train_wan_lora.local(
        job_id=job_id,
        video_urls=video_urls,
        trigger_word=trigger_word,
        character_id=character_id,
        config=config,
    )


@app.local_entrypoint()
def main(
    character_id: str = "wan-test",
    trigger_word: str = "wanchar",
    steps: int = 100,
    model_size: str = "1.3B",
):
    """Local entrypoint for testing Wan LoRA training.
    
    Args:
        character_id: Character ID for the LoRA (default: "wan-test")
        trigger_word: Trigger word for the character (default: "wanchar")
        steps: Number of training steps (default: 100)
        model_size: Model size "1.3B" or "14B" (default: "1.3B")
    """
    import uuid
    import json
    
    # Test videos - replace with actual video URLs for real training
    # For testing, you can use sample videos from the internet
    test_videos = [
        # Placeholder - in production, use actual video URLs of your character
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    ]
    
    job_id = f"wan-test-{uuid.uuid4().hex[:8]}"
    
    print(f"🚀 Starting Wan LoRA training job: {job_id}")
    print(f"  Character ID: {character_id}")
    print(f"  Trigger word: {trigger_word}")
    print(f"  Training steps: {steps}")
    print(f"  Model size: {model_size}")
    print()
    
    result = train_wan_lora.remote(
        job_id=job_id,
        video_urls=test_videos,
        trigger_word=trigger_word,
        character_id=character_id,
        config={
            "max_train_steps": steps,
            "model_size": model_size,
        },
    )
    
    print("\n✅ Wan LoRA Training complete!")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    import json
    main()
