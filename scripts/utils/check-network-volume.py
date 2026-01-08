#!/usr/bin/env python3
"""
Check if network volume is mounted and where models are
"""

import os

print("=" * 60)
print("Network Volume & Models Check")
print("=" * 60)
print()

# Check mount points
print("1. Mount Points:")
print("-" * 60)
print(f"/workspace exists: {os.path.exists('/workspace')}")
print(f"/runpod-volume exists: {os.path.exists('/runpod-volume')}")
print()

# Check if /workspace/models is the network volume or local
print("2. /workspace/models structure:")
print("-" * 60)
if os.path.exists('/workspace/models'):
    items = os.listdir('/workspace/models')
    print(f"Total items: {len(items)}")
    
    # Check if diffusion_models, text_encoders, vae are symlinks
    for name in ['diffusion_models', 'text_encoders', 'vae']:
        path = f'/workspace/models/{name}'
        if os.path.exists(path):
            if os.path.islink(path):
                target = os.readlink(path)
                print(f"{name}: Symlink -> {target}")
            elif os.path.isdir(path):
                file_count = len(os.listdir(path))
                print(f"{name}: Directory ({file_count} files)")
            else:
                size = os.path.getsize(path) / (1024**3)
                print(f"{name}: File ({size:.2f} GB)")
        else:
            print(f"{name}: Does not exist")
print()

# Check what's in unet and clip
print("3. Checking unet/ and clip/ directories:")
print("-" * 60)
for dir_name in ['unet', 'clip']:
    path = f'/workspace/models/{dir_name}'
    if os.path.exists(path) and os.path.isdir(path):
        files = os.listdir(path)
        print(f"{dir_name}/: {len(files)} files")
        for f in files[:5]:
            print(f"  - {f}")
print()

# The key question: Are the models on the network volume?
# Network volumes in RunPod are persistent across workers
# If models aren't here, they might not be on the network volume at all

print("4. Conclusion:")
print("-" * 60)
print("If Z-Image models are not found, they may not be on the network volume.")
print("Network volumes are shared across all workers, so if they were there,")
print("they should be accessible on any worker instance.")
print()
print("Next steps:")
print("1. Verify models are actually on the network volume (check from a pod)")
print("2. Or download models to the network volume")
print("3. Or check if models are in a different location")

