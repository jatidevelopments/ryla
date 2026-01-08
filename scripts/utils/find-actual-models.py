#!/usr/bin/env python3
"""
Find where Z-Image models actually are
"""

import os

print("=" * 60)
print("Finding Z-Image Models")
print("=" * 60)
print()

# Check what those "files" actually are
print("1. Checking diffusion_models, text_encoders, vae:")
print("-" * 60)
for name in ['diffusion_models', 'text_encoders', 'vae']:
    path = f'/workspace/models/{name}'
    if os.path.exists(path):
        if os.path.islink(path):
            target = os.readlink(path)
            print(f"{name}: Symlink -> {target}")
        elif os.path.isdir(path):
            print(f"{name}: Directory")
            files = os.listdir(path)
            z_files = [f for f in files if any(x in f.lower() for x in ['z_image', 'qwen', 'turbo'])]
            if z_files:
                print(f"  ✅ Z-Image files: {', '.join(z_files)}")
        else:
            size = os.path.getsize(path) / (1024**3) if os.path.isfile(path) else 0
            print(f"{name}: File ({size:.2f} GB if file)")

print()

# Check unet directory (might have diffusion models)
print("2. Checking unet/ directory:")
print("-" * 60)
unet_path = '/workspace/models/unet'
if os.path.exists(unet_path):
    files = os.listdir(unet_path)
    z_files = [f for f in files if 'z_image' in f.lower() or 'turbo' in f.lower()]
    print(f"Found {len(files)} files in unet/")
    if z_files:
        print(f"✅ Z-Image files: {', '.join(z_files)}")
    else:
        print(f"First 5 files: {', '.join(files[:5])}")
else:
    print("unet/ directory does not exist")

print()

# Check clip directory (might have text encoders)
print("3. Checking clip/ directory:")
print("-" * 60)
clip_path = '/workspace/models/clip'
if os.path.exists(clip_path):
    files = os.listdir(clip_path)
    qwen_files = [f for f in files if 'qwen' in f.lower()]
    print(f"Found {len(files)} files in clip/")
    if qwen_files:
        print(f"✅ Qwen files: {', '.join(qwen_files)}")
    else:
        print(f"First 5 files: {', '.join(files[:5])}")
else:
    print("clip/ directory does not exist")

print()

# Check vae directory
print("4. Checking vae/ directory:")
print("-" * 60)
vae_path = '/workspace/models/vae'
if os.path.exists(vae_path) and os.path.isdir(vae_path):
    files = os.listdir(vae_path)
    turbo_files = [f for f in files if 'turbo' in f.lower() or 'z-image' in f.lower()]
    print(f"Found {len(files)} files in vae/")
    if turbo_files:
        print(f"✅ Z-Image VAE files: {', '.join(turbo_files)}")
    else:
        print(f"First 5 files: {', '.join(files[:5])}")
else:
    print("vae/ directory does not exist or is not a directory")

print()

# Search more broadly
print("5. Deep search for Z-Image model files:")
print("-" * 60)
target_files = {
    'UNET': 'z_image_turbo_bf16.safetensors',
    'CLIP': 'qwen_3_4b.safetensors',
    'VAE': 'z-image-turbo-vae.safetensors',
}

for name, filename in target_files.items():
    print(f"\n{name} ({filename}):")
    found = False
    for root, dirs, files in os.walk('/workspace/models'):
        if filename in files:
            full_path = os.path.join(root, filename)
            size = os.path.getsize(full_path) / (1024**3)
            rel_path = os.path.relpath(full_path, '/workspace/models')
            print(f"  ✅ Found: {rel_path} ({size:.2f} GB)")
            found = True
            break
    if not found:
        print(f"  ❌ Not found")

