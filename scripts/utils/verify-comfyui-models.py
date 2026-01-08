#!/usr/bin/env python3
"""
Verify ComfyUI Models on Network Volume
Run this in Jupyter on RunPod pod/serverless to check model availability
"""

import os
from pathlib import Path

# Network volume mount paths (ComfyUI worker uses /runpod-volume)
VOLUME_PATHS = [
    '/runpod-volume',  # ComfyUI worker default
    '/workspace',      # Alternative mount point
]

# Expected model locations
MODEL_PATHS = {
    'unet': [
        'models/diffusion_models/z_image_turbo_bf16.safetensors',
        'models/unet/z_image_turbo_bf16.safetensors',
        'models/checkpoints/z_image_turbo_bf16.safetensors',
    ],
    'clip': [
        'models/text_encoders/qwen_3_4b.safetensors',
        'models/clip/qwen_3_4b.safetensors',
    ],
    'vae': [
        'models/vae/z-image-turbo-vae.safetensors',
        'models/vae/ae.safetensors',
    ],
}

def format_size(size_bytes):
    """Format file size in human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"

def check_path(path):
    """Check if path exists and return info"""
    if os.path.exists(path):
        if os.path.isdir(path):
            return {'exists': True, 'type': 'directory', 'size': None}
        else:
            size = os.path.getsize(path)
            return {'exists': True, 'type': 'file', 'size': size}
    return {'exists': False, 'type': None, 'size': None}

def find_volume_root():
    """Find which volume path is mounted"""
    for vol_path in VOLUME_PATHS:
        if os.path.exists(vol_path) and os.path.isdir(vol_path):
            return vol_path
    return None

def list_directory(path, max_depth=2, current_depth=0):
    """List directory structure"""
    if current_depth >= max_depth:
        return []
    
    items = []
    try:
        for item in sorted(os.listdir(path)):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                items.append(f"{'  ' * current_depth}📁 {item}/")
                if current_depth < max_depth - 1:
                    items.extend(list_directory(item_path, max_depth, current_depth + 1))
            else:
                size = os.path.getsize(item_path)
                items.append(f"{'  ' * current_depth}📄 {item} ({format_size(size)})")
    except PermissionError:
        items.append(f"{'  ' * current_depth}❌ Permission denied")
    return items

print("=" * 60)
print("ComfyUI Model Verification Script")
print("=" * 60)
print()

# Find volume root
volume_root = find_volume_root()
if not volume_root:
    print("❌ No network volume found!")
    print(f"   Checked paths: {', '.join(VOLUME_PATHS)}")
    exit(1)

print(f"✅ Network volume found: {volume_root}")
print()

# Check volume structure
print("📂 Volume Directory Structure:")
print("-" * 60)
if os.path.exists(os.path.join(volume_root, 'models')):
    print(f"{volume_root}/")
    for line in list_directory(volume_root, max_depth=3):
        print(line)
else:
    print(f"⚠️  No 'models' directory found in {volume_root}")
    print(f"   Contents of {volume_root}:")
    for item in os.listdir(volume_root)[:10]:
        print(f"   - {item}")
print()

# Check for specific models
print("🔍 Checking for Z-Image-Turbo Models:")
print("-" * 60)

found_models = {}
for model_type, paths in MODEL_PATHS.items():
    found = False
    for rel_path in paths:
        full_path = os.path.join(volume_root, rel_path)
        info = check_path(full_path)
        if info['exists']:
            size_str = format_size(info['size']) if info['size'] else ''
            print(f"✅ {model_type.upper()}: {rel_path} ({size_str})")
            found_models[model_type] = full_path
            found = True
            break
    if not found:
        print(f"❌ {model_type.upper()}: Not found")
        print(f"   Checked: {', '.join(paths)}")

print()

# Check ComfyUI model directories (if ComfyUI is installed)
comfyui_paths = [
    '/workspace/ComfyUI/models',
    '/root/ComfyUI/models',
    '/app/ComfyUI/models',
]

print("🔍 Checking ComfyUI Standard Model Directories:")
print("-" * 60)
for comfy_path in comfyui_paths:
    if os.path.exists(comfy_path):
        print(f"✅ ComfyUI models directory: {comfy_path}")
        for subdir in ['checkpoints', 'clip', 'vae', 'unet', 'diffusion_models', 'text_encoders']:
            subdir_path = os.path.join(comfy_path, subdir)
            if os.path.exists(subdir_path):
                files = [f for f in os.listdir(subdir_path) if f.endswith(('.safetensors', '.ckpt', '.pt'))]
                if files:
                    print(f"   📁 {subdir}/ ({len(files)} files)")
                    for f in files[:3]:  # Show first 3 files
                        print(f"      - {f}")
        break
else:
    print("⚠️  ComfyUI models directory not found in standard locations")

print()
print("=" * 60)
print("Summary:")
print("=" * 60)
if len(found_models) == 3:
    print("✅ All Z-Image models found!")
    print("   Ready for ComfyUI workflow execution")
elif len(found_models) > 0:
    print(f"⚠️  Found {len(found_models)}/3 models")
    print("   Some models are missing")
else:
    print("❌ No Z-Image models found")
    print("   Models need to be downloaded to network volume")

