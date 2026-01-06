#!/usr/bin/env python3
"""
Compress slider images for the landing page hero section.
Uses Pillow (PIL) to optimize WebP images for web use.
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuration
INPUT_DIR = Path(__file__).parent.parent / "apps/landing/public/images/posts"
OUTPUT_DIR = INPUT_DIR  # Overwrite originals (backup recommended)
MAX_WIDTH = 800  # Max width for slider images (they're displayed small)
QUALITY = 80  # WebP quality (0-100, 80 is good balance)
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
                # Create white background for transparency
                rgb_img = Image.new('RGB', img.size, (0, 0, 0))  # Black background for dark theme
                rgb_img.paste(img, mask=img.split()[3])  # Use alpha channel as mask
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
    """Main compression function"""
    if not INPUT_DIR.exists():
        print(f"Error: Input directory not found: {INPUT_DIR}", file=sys.stderr)
        sys.exit(1)
    
    # Find all WebP images
    image_files = list(INPUT_DIR.glob("influencer-*.webp"))
    
    if not image_files:
        print(f"No images found in {INPUT_DIR}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Found {len(image_files)} images to compress")
    print(f"Settings: max_width={MAX_WIDTH}, quality={QUALITY}, method={METHOD}\n")
    
    total_original = 0
    total_compressed = 0
    
    # Process each image
    for img_path in sorted(image_files):
        original_size, compressed_size = compress_image(img_path, img_path)
        
        if original_size > 0:
            reduction = ((original_size - compressed_size) / original_size) * 100
            total_original += original_size
            total_compressed += compressed_size
            
            print(f"{img_path.name:20} {original_size/1024:7.1f} KB → {compressed_size/1024:7.1f} KB "
                  f"({reduction:5.1f}% reduction)")
    
    # Summary
    if total_original > 0:
        total_reduction = ((total_original - total_compressed) / total_original) * 100
        print(f"\n{'='*60}")
        print(f"Total: {total_original/1024/1024:.2f} MB → {total_compressed/1024/1024:.2f} MB")
        print(f"Total reduction: {total_reduction:.1f}%")
        print(f"Space saved: {(total_original - total_compressed)/1024/1024:.2f} MB")

if __name__ == "__main__":
    main()
