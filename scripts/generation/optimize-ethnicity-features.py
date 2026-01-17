#!/usr/bin/env python3
"""
Optimize ethnicity-specific feature images for EP-036.
Compresses WebP images to meet < 100KB target while maintaining quality.
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuration
BASE_DIR = Path(__file__).parent.parent.parent / "apps/web/public/images"
QUALITY = 75  # WebP quality (0-100, lower = smaller files)
METHOD = 6  # WebP compression method (0-6, higher = better compression)
TARGET_SIZE_KB = 100  # Target max file size in KB

# Feature directories
FEATURE_DIRS = ['hair-styles', 'eye-colors', 'hair-colors', 'face-shapes', 'age-ranges']

def optimize_image(input_path: Path, output_path: Path) -> tuple[int, int]:
    """
    Optimize a single image.
    Returns: (original_size, compressed_size) in bytes
    """
    try:
        # Open image
        with Image.open(input_path) as img:
            original_size = input_path.stat().st_size
            
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save compressed
            img.save(
                output_path,
                'WEBP',
                quality=QUALITY,
                method=METHOD,
                optimize=True
            )
            
            compressed_size = output_path.stat().st_size
            
            # If still too large, reduce quality further
            if compressed_size > TARGET_SIZE_KB * 1024:
                for q in range(QUALITY - 5, 40, -5):
                    img.save(
                        output_path,
                        'WEBP',
                        quality=q,
                        method=METHOD,
                        optimize=True
                    )
                    compressed_size = output_path.stat().st_size
                    if compressed_size <= TARGET_SIZE_KB * 1024:
                        break
            
            return original_size, compressed_size
            
    except Exception as e:
        print(f"Error optimizing {input_path}: {e}", file=sys.stderr)
        return 0, 0

def main():
    """Main optimization function"""
    if not BASE_DIR.exists():
        print(f"Error: Base directory not found: {BASE_DIR}", file=sys.stderr)
        sys.exit(1)
    
    # Find all feature images
    image_files = []
    for feature_dir in FEATURE_DIRS:
        feature_path = BASE_DIR / feature_dir
        if feature_path.exists():
            # Find all WebP images in ethnicity subdirectories
            for ethnicity_dir in feature_path.iterdir():
                if ethnicity_dir.is_dir():
                    image_files.extend(list(ethnicity_dir.glob("*.webp")))
    
    if not image_files:
        print(f"No feature images found in {BASE_DIR}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Found {len(image_files)} feature images to optimize")
    print(f"Settings: quality={QUALITY}, method={METHOD}, target={TARGET_SIZE_KB}KB\n")
    
    total_original = 0
    total_compressed = 0
    
    # Process each image
    for img_path in sorted(image_files):
        original_size, compressed_size = optimize_image(img_path, img_path)
        
        if original_size > 0:
            reduction = ((original_size - compressed_size) / original_size) * 100
            total_original += original_size
            total_compressed += compressed_size
            
            status = "✓" if compressed_size <= TARGET_SIZE_KB * 1024 else "⚠️"
            rel_path = img_path.relative_to(BASE_DIR)
            print(f"{status} {str(rel_path):50} {original_size/1024:7.1f} KB → {compressed_size/1024:7.1f} KB "
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
