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
    Download Z-Image-Turbo model from ModelScope during build.
    
    This downloads the complete diffusers pipeline (~25GB) and caches it
    in the ComfyUI models directory so it's available at runtime.
    """
    from pathlib import Path
    
    comfy_dir = Path("/root/comfy/ComfyUI/models")
    local_dir = comfy_dir / "diffusers" / "Z-Image-Turbo"
    
    print("📥 Downloading Z-Image-Turbo from ModelScope (this takes 10-15 minutes)...")
    
    try:
        from modelscope import snapshot_download
        
        # Download to the exact path ZImageLoader expects
        model_dir = snapshot_download(
            "Tongyi-MAI/Z-Image-Turbo",
            local_dir=str(local_dir),
        )
        
        print(f"✅ Z-Image-Turbo downloaded to {model_dir}")
        
        # Verify download
        if local_dir.exists():
            files = list(local_dir.rglob("*"))
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            print(f"   Total files: {len(files)}")
            print(f"   Total size: {total_size / 1024**3:.2f} GB")
        
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
