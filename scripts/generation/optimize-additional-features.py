#!/usr/bin/env python3
"""
Optimize Additional Feature Images
Compresses WebP images to under 100KB target size.

Target: < 100KB per image
Method: Resize if needed, compress WebP
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Target file size in KB
TARGET_SIZE_KB = 100
TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024

# Compression settings
MAX_WIDTH = 800
QUALITY = 80
METHOD = 6  # WebP compression method (0-6, 6 is best compression)

def optimize_image(input_path: Path, output_path: Path) -> dict:
    """Optimize a single image file."""
    try:
        # Open image
        img = Image.open(input_path)
        
        # Get original size
        original_size = os.path.getsize(input_path)
        original_size_kb = original_size / 1024
        
        # Convert RGBA to RGB if needed (WebP supports both, but RGB is smaller)
        if img.mode == 'RGBA':
            # Create white background
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if image is too large
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
        
        # Save with compression
        img.save(
            output_path,
            'WEBP',
            quality=QUALITY,
            method=METHOD,
            optimize=True
        )
        
        # Get new size
        new_size = os.path.getsize(output_path)
        new_size_kb = new_size / 1024
        
        reduction = ((original_size - new_size) / original_size * 100) if original_size > 0 else 0
        
        return {
            'success': True,
            'original_size_kb': original_size_kb,
            'new_size_kb': new_size_kb,
            'reduction': reduction,
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
        }

def main():
    """Main optimization function."""
    script_dir = Path(__file__).parent.parent.parent
    images_dir = script_dir / 'apps' / 'web' / 'public' / 'images'
    
    # Directories to optimize
    directories = [
        'body-types',
        'breast-sizes',
        'ass-sizes',
        'piercings',
        'tattoos',
        'skin-colors',
        'skin-features',
    ]
    
    total_original = 0
    total_new = 0
    processed = 0
    failed = 0
    
    print("🔧 Optimizing Additional Feature Images")
    print("=" * 60)
    print(f"Settings: max_width={MAX_WIDTH}, quality={QUALITY}, method={METHOD}")
    print()
    
    for dir_name in directories:
        dir_path = images_dir / dir_name
        
        if not dir_path.exists():
            continue
        
        # Find all WebP files recursively
        webp_files = list(dir_path.rglob('*.webp'))
        
        if not webp_files:
            continue
        
        print(f"\n📁 Processing {dir_name}/")
        print("-" * 60)
        
        for img_path in webp_files:
            try:
                original_size = os.path.getsize(img_path)
                
                # Skip if already small enough
                if original_size < TARGET_SIZE_BYTES:
                    continue
                
                # Optimize
                result = optimize_image(img_path, img_path)
                
                if result['success']:
                    original_kb = result['original_size_kb']
                    new_kb = result['new_size_kb']
                    reduction = result['reduction']
                    
                    total_original += original_size
                    total_new += os.path.getsize(img_path)
                    processed += 1
                    
                    status = "✅" if new_kb < TARGET_SIZE_KB else "⚠️"
                    print(f"{status} {img_path.name:40s} {original_kb:6.1f} KB → {new_size_kb:6.1f} KB ({reduction:5.1f}% reduction)")
                else:
                    failed += 1
                    print(f"❌ {img_path.name:40s} Error: {result.get('error', 'Unknown')}")
            except Exception as e:
                failed += 1
                print(f"❌ {img_path.name:40s} Error: {e}")
    
    print()
    print("=" * 60)
    print(f"Processed: {processed} images")
    if failed > 0:
        print(f"Failed: {failed} images")
    
    if total_original > 0:
        total_original_mb = total_original / (1024 * 1024)
        total_new_mb = total_new / (1024 * 1024)
        total_reduction = ((total_original - total_new) / total_original * 100) if total_original > 0 else 0
        space_saved = (total_original - total_new) / (1024 * 1024)
        
        print(f"\nTotal: {total_original_mb:.2f} MB → {total_new_mb:.2f} MB")
        print(f"Total reduction: {total_reduction:.1f}%")
        print(f"Space saved: {space_saved:.2f} MB")
    
    print("\n✅ Optimization complete!")

if __name__ == '__main__':
    main()
