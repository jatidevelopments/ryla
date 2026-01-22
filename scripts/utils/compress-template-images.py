#!/usr/bin/env python3
"""
Compress template preview images for the template gallery.
Uses Pillow (PIL) to optimize WebP images for web use.

Usage:
    python3 scripts/utils/compress-template-images.py
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuration
INPUT_DIR = Path(__file__).parent.parent.parent / "apps/web/public/templates"
OUTPUT_DIR = INPUT_DIR  # Overwrite originals
MAX_WIDTH = 512  # Max width for preview images (they're already 512px)
QUALITY = 75  # WebP quality (0-100, 75 is good for smaller file sizes)
METHOD = 6  # WebP compression method (0-6, higher = slower but better compression)

def compress_image(input_path: Path, output_path: Path) -> tuple[int, int]:
    """
    Compress a single image.
    Returns: (original_size, compressed_size) in bytes
    """
    try:
        # Open image
        with Image.open(input_path) as img:
            original_size = input_path.stat().st_size
            
            # Convert RGBA to RGB if needed (WebP supports both)
            if img.mode == 'RGBA':
                # Create black background for transparency
                rgb_img = Image.new('RGB', img.size, (0, 0, 0))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large (maintain aspect ratio)
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # Save compressed
            img.save(
                output_path,
                'WEBP',
                quality=QUALITY,
                method=METHOD,
                optimize=True
            )
            
            compressed_size = output_path.stat().st_size
            return original_size, compressed_size
            
    except Exception as e:
        print(f"Error compressing {input_path}: {e}", file=sys.stderr)
        return 0, 0

def main():
    if not INPUT_DIR.exists():
        print(f"Error: Input directory does not exist: {INPUT_DIR}", file=sys.stderr)
        sys.exit(1)
    
    # Find all webp images recursively
    images = list(INPUT_DIR.rglob("*.webp"))
    
    if not images:
        print("No WebP images found in templates directory.")
        sys.exit(0)
    
    print(f"Found {len(images)} images to compress")
    print(f"Settings: max_width={MAX_WIDTH}, quality={QUALITY}, method={METHOD}\n")
    
    total_original = 0
    total_compressed = 0
    
    for img_path in sorted(images):
        original, compressed = compress_image(img_path, img_path)
        
        if original > 0:
            reduction = (1 - compressed / original) * 100
            rel_path = str(img_path.relative_to(INPUT_DIR))
            print(f"{rel_path:40s} {original/1024:>7.1f} KB → {compressed/1024:>7.1f} KB ({reduction:5.1f}% reduction)")
            
            total_original += original
            total_compressed += compressed
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Total: {total_original / 1024 / 1024:.2f} MB → {total_compressed / 1024 / 1024:.2f} MB")
    if total_original > 0:
        total_reduction = (1 - total_compressed / total_original) * 100
        print(f"Total reduction: {total_reduction:.1f}%")
        print(f"Space saved: {(total_original - total_compressed) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
