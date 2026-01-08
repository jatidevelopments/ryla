#!/usr/bin/env python3
"""
Diagnose ComfyUI Model Paths
Run this in Jupyter to check symlinks and model locations
"""

import os

COMFYUI_MODELS = '/workspace/runpod-slim/ComfyUI/models'
NETWORK_MODELS = '/workspace/models'

print("=" * 60)
print("ComfyUI Model Path Diagnosis")
print("=" * 60)
print()

# Check ComfyUI models directory
print("1. ComfyUI Models Directory Structure:")
print("-" * 60)
if os.path.exists(COMFYUI_MODELS):
    for item in sorted(os.listdir(COMFYUI_MODELS)):
        item_path = os.path.join(COMFYUI_MODELS, item)
        if os.path.islink(item_path):
            target = os.readlink(item_path)
            print(f"  🔗 {item} -> {target}")
        elif os.path.isdir(item_path):
            print(f"  📁 {item}/")
            # List first few files
            try:
                files = os.listdir(item_path)[:3]
                for f in files:
                    print(f"     - {f}")
            except:
                pass
        else:
            print(f"  📄 {item}")
else:
    print(f"  ❌ {COMFYUI_MODELS} does not exist")
print()

# Check network models
print("2. Network Volume Models:")
print("-" * 60)
if os.path.exists(NETWORK_MODELS):
    for item in sorted(os.listdir(NETWORK_MODELS)):
        item_path = os.path.join(NETWORK_MODELS, item)
        if os.path.isdir(item_path):
            print(f"  📁 {item}/")
            # Check for Z-Image models
            if item == 'diffusion_models':
                files = [f for f in os.listdir(item_path) if 'z_image' in f.lower()]
                if files:
                    print(f"     ✅ Found: {', '.join(files)}")
            elif item == 'text_encoders':
                files = [f for f in os.listdir(item_path) if 'qwen' in f.lower()]
                if files:
                    print(f"     ✅ Found: {', '.join(files)}")
            elif item == 'vae':
                files = [f for f in os.listdir(item_path) if 'z-image' in f.lower() or 'turbo' in f.lower()]
                if files:
                    print(f"     ✅ Found: {', '.join(files)}")
else:
    print(f"  ❌ {NETWORK_MODELS} does not exist")
print()

# Check specific model files
print("3. Checking Specific Model Files:")
print("-" * 60)
models_to_check = {
    'UNET': [
        f'{COMFYUI_MODELS}/diffusion_models/z_image_turbo_bf16.safetensors',
        f'{NETWORK_MODELS}/diffusion_models/z_image_turbo_bf16.safetensors',
    ],
    'CLIP': [
        f'{COMFYUI_MODELS}/text_encoders/qwen_3_4b.safetensors',
        f'{NETWORK_MODELS}/text_encoders/qwen_3_4b.safetensors',
    ],
    'VAE': [
        f'{COMFYUI_MODELS}/vae/z-image-turbo-vae.safetensors',
        f'{NETWORK_MODELS}/vae/z-image-turbo-vae.safetensors',
    ],
}

for name, paths in models_to_check.items():
    print(f"{name}:")
    for path in paths:
        if os.path.exists(path):
            size = os.path.getsize(path) / (1024**3)
            print(f"  ✅ {path} ({size:.2f} GB)")
        else:
            print(f"  ❌ {path} (not found)")
    print()

# Check symlink targets
print("4. Symlink Verification:")
print("-" * 60)
for dir_name in ['diffusion_models', 'text_encoders', 'vae']:
    symlink_path = os.path.join(COMFYUI_MODELS, dir_name)
    if os.path.islink(symlink_path):
        target = os.readlink(symlink_path)
        if os.path.exists(target):
            print(f"✅ {dir_name}: Symlink -> {target} (exists)")
            # Check if target has models
            files = os.listdir(target) if os.path.isdir(target) else []
            z_image_files = [f for f in files if 'z_image' in f.lower() or 'qwen' in f.lower() or 'turbo' in f.lower()]
            if z_image_files:
                print(f"   Models found: {', '.join(z_image_files[:3])}")
        else:
            print(f"❌ {dir_name}: Symlink -> {target} (BROKEN - target doesn't exist)")
    elif os.path.exists(symlink_path):
        print(f"⚠️  {dir_name}: Exists but not a symlink")
    else:
        print(f"❌ {dir_name}: Does not exist")

