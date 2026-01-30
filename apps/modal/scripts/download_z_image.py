"""
One-time script to download Z-Image-Turbo model to Modal volume.

Run: modal run apps/modal/scripts/download_z_image.py
"""

import modal

app = modal.App("z-image-download")

volume = modal.Volume.from_name("ryla-models", create_if_missing=True)
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "modelscope", "torch", "diffusers>=0.30.0", "transformers", "accelerate"
)


@app.function(
    image=image,
    gpu="A100",  # Use GPU for faster download
    volumes={"/root/models": volume, "/cache": hf_cache_vol},
    timeout=3600,  # 1 hour timeout
)
def download_z_image():
    """Download Z-Image-Turbo model to volume."""
    from pathlib import Path
    import shutil
    
    volume_dir = Path("/root/models/diffusers/Z-Image-Turbo")
    
    # Remove partial download if exists
    if volume_dir.exists():
        print(f"Removing partial download at {volume_dir}...")
        shutil.rmtree(volume_dir)
    
    volume_dir.parent.mkdir(parents=True, exist_ok=True)
    
    print("📥 Downloading Z-Image-Turbo from ModelScope...")
    print("   This will take 10-20 minutes for ~25GB...")
    
    from modelscope import snapshot_download
    
    model_dir = snapshot_download(
        "Tongyi-MAI/Z-Image-Turbo",
        local_dir=str(volume_dir),
        cache_dir="/cache",
    )
    
    print(f"✅ Downloaded to {model_dir}")
    
    # Verify
    files = list(volume_dir.rglob("*"))
    total_size = sum(f.stat().st_size for f in files if f.is_file())
    print(f"   Total files: {len(files)}")
    print(f"   Total size: {total_size / 1024**3:.2f} GB")
    
    # Commit volume changes
    volume.commit()
    print("✅ Volume committed!")
    
    return {"files": len(files), "size_gb": total_size / 1024**3}


@app.local_entrypoint()
def main():
    result = download_z_image.remote()
    print(f"\n✅ Download complete: {result}")
