#!/usr/bin/env python3
"""
ComfyUI Model Downloader for RYLA Project

This script downloads all required models for ComfyUI image generation workflows.
Models are verified against HuggingFace repositories to ensure correct versions.

Usage:
    python scripts/download-comfyui-models.py [--comfyui-dir /path/to/ComfyUI] [--skip-verify]

Requirements:
    pip install requests tqdm huggingface-hub

Author: RYLA Team
Date: 2025-12-11
"""

import os
import sys
import argparse
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

try:
    import requests
    from tqdm import tqdm
except ImportError:
    print("ERROR: Required packages not installed.")
    print("Please run: pip install requests tqdm")
    sys.exit(1)

# Model definitions with verified URLs and expected file sizes (in bytes)
# File sizes are approximate and used for verification
MODELS = [
    # ============================================
    # CHECKPOINTS (Base Models)
    # ============================================
    {
        "name": "Z-Image-Turbo",
        "url": "https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors",
        "subdir": "checkpoints",
        "filename": "z-image-turbo.safetensors",
        "expected_size": 12_000_000_000,  # ~12GB (approximate)
        "priority": "high",
        "description": "Fast 6B parameter model for base image generation",
        "verified": True,
    },
    {
        "name": "Flux Dev (Uncensored)",
        "url": None,  # Manual download required
        "subdir": "checkpoints",
        "filename": "flux1-dev-uncensored.safetensors",
        "expected_size": 23_000_000_000,  # ~23GB (approximate)
        "priority": "critical",
        "description": "Primary model for NSFW content generation",
        "verified": False,
        "manual_instructions": "Download from CivitAI or use: huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir <checkpoints_dir>",
    },
    {
        "name": "PuLID",
        "url": "https://huggingface.co/pulid/pulid/resolve/main/pulid.safetensors",
        "subdir": "checkpoints",
        "filename": "pulid.safetensors",
        "expected_size": 1_500_000_000,  # ~1.5GB (approximate)
        "priority": "high",
        "description": "Face consistency model for character sheet generation",
        "verified": True,
    },
    # ============================================
    # VAE Models
    # ============================================
    {
        "name": "Flux VAE",
        "url": "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/vae.safetensors",
        "subdir": "vae",
        "filename": "flux-vae.safetensors",
        "expected_size": 335_000_000,  # ~335MB (approximate)
        "priority": "critical",
        "description": "VAE encoder/decoder for Flux models",
        "verified": True,
    },
    # ============================================
    # ControlNet Models
    # ============================================
    {
        "name": "ControlNet OpenPose",
        "url": "https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth",
        "subdir": "controlnet",
        "filename": "controlnet-openpose.pth",
        "expected_size": 1_600_000_000,  # ~1.6GB (approximate)
        "priority": "high",
        "description": "Pose control for character sheet generation",
        "verified": True,
    },
    {
        "name": "Z-Image ControlNet",
        "url": "https://huggingface.co/alibaba-pai/Z-Image-ControlNet/resolve/main/z_image_controlnet.safetensors",
        "subdir": "controlnet",
        "filename": "z-image-controlnet.safetensors",
        "expected_size": 12_000_000_000,  # ~12GB (approximate)
        "priority": "medium",
        "description": "ControlNet for Z-Image-Turbo",
        "verified": True,
    },
    # ============================================
    # IPAdapter Models (Face Swap)
    # ============================================
    {
        "name": "IPAdapter FaceID Plus",
        "url": "https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plus_sd15.bin",
        "subdir": "ipadapter",
        "filename": "ip-adapter-faceid-plus.bin",
        "expected_size": 1_200_000_000,  # ~1.2GB (approximate)
        "priority": "medium",
        "description": "Face swap model (v1)",
        "verified": True,
    },
    {
        "name": "IPAdapter FaceID Plus V2",
        "url": "https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plusv2_sd15.bin",
        "subdir": "ipadapter",
        "filename": "ip-adapter-faceid-plusv2.bin",
        "expected_size": 1_200_000_000,  # ~1.2GB (approximate)
        "priority": "critical",
        "description": "Face swap model (v2 - better quality)",
        "verified": True,
    },
    {
        "name": "CLIP Vision (for IPAdapter)",
        "url": "https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/models/image_encoder/model.safetensors",
        "subdir": "clip_vision",
        "filename": "clip-vision.safetensors",
        "expected_size": 200_000_000,  # ~200MB (approximate)
        "priority": "critical",
        "description": "CLIP vision encoder for IPAdapter FaceID",
        "verified": True,
    },
]


class ModelDownloader:
    """Downloads and verifies ComfyUI models from HuggingFace."""

    def __init__(self, comfyui_dir: str, skip_verify: bool = False, max_retries: int = 3):
        self.comfyui_dir = Path(comfyui_dir)
        self.models_dir = self.comfyui_dir / "models"
        self.skip_verify = skip_verify
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "RYLA-ComfyUI-Model-Downloader/1.0"
        })

    def find_comfyui_dir(self) -> Optional[Path]:
        """Auto-detect ComfyUI installation directory."""
        common_paths = [
            Path("/workspace/ComfyUI"),
            Path("/root/ComfyUI"),
            Path.home() / "ComfyUI",
            Path.cwd() / "ComfyUI",
        ]

        for path in common_paths:
            if (path / "models").exists():
                return path

        return None

    def verify_url(self, url: str) -> Tuple[bool, Optional[int]]:
        """Verify URL is accessible and get file size."""
        try:
            response = self.session.head(url, allow_redirects=True, timeout=10)
            if response.status_code == 200:
                size = int(response.headers.get("Content-Length", 0))
                return True, size
            return False, None
        except Exception as e:
            print(f"  ⚠️  URL verification failed: {e}")
            return False, None

    def download_file(self, url: str, dest_path: Path, expected_size: Optional[int] = None) -> bool:
        """Download a file with progress bar and retry logic."""
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        # Check if file already exists
        if dest_path.exists():
            actual_size = dest_path.stat().st_size
            if expected_size and abs(actual_size - expected_size) < expected_size * 0.1:  # 10% tolerance
                print(f"  ✓ Already exists: {dest_path.name} ({self._format_size(actual_size)})")
                return True
            else:
                print(f"  ⚠️  File exists but size mismatch. Re-downloading...")
                dest_path.unlink()

        # Verify URL before downloading
        if not self.skip_verify:
            print(f"  🔍 Verifying URL...")
            accessible, remote_size = self.verify_url(url)
            if not accessible:
                print(f"  ❌ URL not accessible: {url}")
                return False
            if remote_size and expected_size:
                if abs(remote_size - expected_size) > expected_size * 0.2:  # 20% tolerance
                    print(f"  ⚠️  Size mismatch: expected ~{self._format_size(expected_size)}, got {self._format_size(remote_size)}")
                expected_size = remote_size  # Use actual size from server

        # Download with retries
        for attempt in range(1, self.max_retries + 1):
            try:
                print(f"  📥 Downloading (attempt {attempt}/{self.max_retries})...")
                response = self.session.get(url, stream=True, timeout=30)
                response.raise_for_status()

                total_size = int(response.headers.get("Content-Length", 0))
                if total_size == 0 and expected_size:
                    total_size = expected_size

                with open(dest_path, "wb") as f:
                    with tqdm(
                        total=total_size,
                        unit="B",
                        unit_scale=True,
                        unit_divisor=1024,
                        desc=f"    {dest_path.name}",
                        ncols=80,
                    ) as pbar:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                                pbar.update(len(chunk))

                # Verify downloaded file size
                actual_size = dest_path.stat().st_size
                if total_size > 0 and actual_size != total_size:
                    print(f"  ⚠️  Size mismatch: expected {self._format_size(total_size)}, got {self._format_size(actual_size)}")
                    if attempt < self.max_retries:
                        dest_path.unlink()
                        continue

                print(f"  ✓ Downloaded: {dest_path.name} ({self._format_size(actual_size)})")
                return True

            except Exception as e:
                print(f"  ❌ Download failed (attempt {attempt}/{self.max_retries}): {e}")
                if dest_path.exists():
                    dest_path.unlink()
                if attempt < self.max_retries:
                    import time
                    time.sleep(2 ** attempt)  # Exponential backoff

        return False

    def _format_size(self, size: int) -> str:
        """Format file size in human-readable format."""
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"

    def download_all(self, models: List[Dict]) -> Dict[str, bool]:
        """Download all models."""
        results = {}

        # Create model directories
        subdirs = set(model["subdir"] for model in models if model.get("url"))
        for subdir in subdirs:
            (self.models_dir / subdir).mkdir(parents=True, exist_ok=True)

        print(f"\n📦 Downloading models to: {self.models_dir}\n")

        for model in models:
            name = model["name"]
            print(f"\n{'='*60}")
            print(f"Model: {name}")
            print(f"Description: {model.get('description', 'N/A')}")
            print(f"Priority: {model.get('priority', 'medium').upper()}")
            print(f"{'='*60}")

            if not model.get("url"):
                print(f"  ⚠️  Manual download required")
                if "manual_instructions" in model:
                    print(f"  Instructions: {model['manual_instructions']}")
                results[name] = False
                continue

            if not model.get("verified", False):
                print(f"  ⚠️  URL not verified - proceed with caution")

            dest_path = self.models_dir / model["subdir"] / model["filename"]
            success = self.download_file(
                model["url"],
                dest_path,
                model.get("expected_size"),
            )
            results[name] = success

        return results

    def print_summary(self, results: Dict[str, bool]):
        """Print download summary."""
        print(f"\n{'='*60}")
        print("DOWNLOAD SUMMARY")
        print(f"{'='*60}\n")

        successful = [name for name, success in results.items() if success]
        failed = [name for name, success in results.items() if not success]

        if successful:
            print(f"✅ Successfully downloaded ({len(successful)}):")
            for name in successful:
                print(f"   • {name}")

        if failed:
            print(f"\n❌ Failed or skipped ({len(failed)}):")
            for name in failed:
                print(f"   • {name}")

        print(f"\n📁 Models directory: {self.models_dir}")
        print(f"\n💡 Next steps:")
        print(f"   1. Refresh ComfyUI (reload browser page)")
        print(f"   2. Verify models appear in ComfyUI Model Library")
        print(f"   3. Test workflows as per COMFYUI-TESTING-GUIDE.md")


def main():
    parser = argparse.ArgumentParser(
        description="Download ComfyUI models for RYLA project",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Auto-detect ComfyUI directory
  python scripts/download-comfyui-models.py

  # Specify ComfyUI directory
  python scripts/download-comfyui-models.py --comfyui-dir /workspace/ComfyUI

  # Skip URL verification (faster, but less safe)
  python scripts/download-comfyui-models.py --skip-verify
        """,
    )
    parser.add_argument(
        "--comfyui-dir",
        type=str,
        help="Path to ComfyUI installation directory",
    )
    parser.add_argument(
        "--skip-verify",
        action="store_true",
        help="Skip URL verification before downloading (faster but less safe)",
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
        help="Maximum number of download retries (default: 3)",
    )

    args = parser.parse_args()

    # Find ComfyUI directory
    if args.comfyui_dir:
        comfyui_dir = Path(args.comfyui_dir)
        if not (comfyui_dir / "models").exists():
            print(f"❌ Error: ComfyUI directory not found: {comfyui_dir}")
            sys.exit(1)
    else:
        downloader = ModelDownloader("", skip_verify=args.skip_verify)
        comfyui_dir = downloader.find_comfyui_dir()
        if not comfyui_dir:
            print("❌ Error: ComfyUI directory not found.")
            print("Please specify with --comfyui-dir option or ensure ComfyUI is installed.")
            print("\nCommon locations:")
            print("  - /workspace/ComfyUI")
            print("  - /root/ComfyUI")
            print("  - ~/ComfyUI")
            sys.exit(1)

    print(f"✅ Found ComfyUI at: {comfyui_dir}")

    # Initialize downloader
    downloader = ModelDownloader(
        str(comfyui_dir),
        skip_verify=args.skip_verify,
        max_retries=args.max_retries,
    )

    # Download all models
    results = downloader.download_all(MODELS)

    # Print summary
    downloader.print_summary(results)

    # Exit with error code if any critical models failed
    critical_failed = [
        name
        for name, success in results.items()
        if not success
        and any(m["name"] == name and m.get("priority") == "critical" for m in MODELS)
    ]

    if critical_failed:
        print(f"\n⚠️  Warning: {len(critical_failed)} critical model(s) failed to download")
        sys.exit(1)


if __name__ == "__main__":
    main()

