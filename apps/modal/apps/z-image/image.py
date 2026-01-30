"""
Z-Image-specific image build.

Extends base image with Z-Image-Turbo model downloads.
"""

import modal
import subprocess
import sys
from pathlib import Path

# Import base image from shared
# At build time: import from project shared/ directory
# At runtime: import from /root/shared/ (where Modal copies it)
import sys
from pathlib import Path

# Try runtime path first (where Modal copies files)
try:
    sys.path.insert(0, "/root/shared")
    from image_base import base_image
except ImportError:
    # Fallback to build-time path (relative to project)
    _shared_path = Path(__file__).parent.parent.parent / "shared"
    if str(_shared_path) not in sys.path:
        sys.path.insert(0, str(_shared_path))
    from image_base import base_image


def hf_download_z_image():
    """
    Download Z-Image-Turbo model from ModelScope to the persistent volume.
    
    Downloads to /root/models/diffusers/Z-Image-Turbo (on the volume) so it
    persists across deployments. Skips download if model already exists.
    """
    from pathlib import Path
    
    # Download to volume (persists across deployments)
    volume_dir = Path("/root/models/diffusers/Z-Image-Turbo")
    # Also create symlink in ComfyUI directory for ZImageLoader node
    comfy_dir = Path("/root/comfy/ComfyUI/models/diffusers/Z-Image-Turbo")
    
    # Check if model already exists on volume
    check_file = volume_dir / "model_index.json"
    if check_file.exists():
        print(f"✅ Z-Image-Turbo already exists on volume at {volume_dir}")
        # Verify size
        files = list(volume_dir.rglob("*"))
        total_size = sum(f.stat().st_size for f in files if f.is_file())
        print(f"   Total files: {len(files)}, Size: {total_size / 1024**3:.2f} GB")
        
        # Create symlink for ComfyUI
        if not comfy_dir.exists():
            comfy_dir.parent.mkdir(parents=True, exist_ok=True)
            import os
            os.symlink(str(volume_dir), str(comfy_dir))
            print(f"   Symlinked to {comfy_dir}")
        return
    
    print("📥 Downloading Z-Image-Turbo from ModelScope (this takes 10-15 minutes)...")
    
    try:
        from modelscope import snapshot_download
        
        # Ensure directory exists
        volume_dir.parent.mkdir(parents=True, exist_ok=True)
        
        # Download to volume
        model_dir = snapshot_download(
            "Tongyi-MAI/Z-Image-Turbo",
            local_dir=str(volume_dir),
        )
        
        print(f"✅ Z-Image-Turbo downloaded to {model_dir}")
        
        # Verify download
        if volume_dir.exists():
            files = list(volume_dir.rglob("*"))
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            print(f"   Total files: {len(files)}")
            print(f"   Total size: {total_size / 1024**3:.2f} GB")
        
        # Create symlink for ComfyUI
        if not comfy_dir.exists():
            comfy_dir.parent.mkdir(parents=True, exist_ok=True)
            import os
            os.symlink(str(volume_dir), str(comfy_dir))
            print(f"   Symlinked to {comfy_dir}")
        
    except Exception as e:
        print(f"❌ Failed to download Z-Image-Turbo: {e}")
        import traceback
        traceback.print_exc()


# Z-Image image extends base image with Z-Image-specific models
z_image_image = (
    base_image
    # Install ModelScope for Z-Image pipeline
    .uv_pip_install("modelscope", "diffusers>=0.30.0")
    # Copy ORIGINAL handler file (not split copy) - same as original working app
    .add_local_file("apps/modal/handlers/z_image.py", "/root/handlers/z_image.py", copy=True)
    .run_function(
        hf_download_z_image,
        volumes={
            "/cache": modal.Volume.from_name("hf-hub-cache", create_if_missing=True),
            "/root/models": modal.Volume.from_name("ryla-models", create_if_missing=True),
        },
    )
)
