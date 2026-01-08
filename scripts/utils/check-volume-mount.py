#!/usr/bin/env python3
"""
Check Network Volume Mount Status
Run this in Jupyter to see where models actually are
"""

import os

print("=" * 60)
print("Network Volume Mount Check")
print("=" * 60)
print()

# Check common mount points
mount_points = {
    '/workspace/models': 'Workspace models',
    '/runpod-volume/models': 'RunPod volume models',
    '/workspace': 'Workspace root',
    '/runpod-volume': 'RunPod volume root',
}

print("1. Checking Mount Points:")
print("-" * 60)
for path, name in mount_points.items():
    exists = os.path.exists(path)
    is_dir = os.path.isdir(path) if exists else False
    print(f"{name}: {path}")
    print(f"  Exists: {'✅' if exists else '❌'}")
    if exists and is_dir:
        try:
            items = os.listdir(path)
            print(f"  Contents: {len(items)} items")
            if items:
                print(f"  First 10: {', '.join(items[:10])}")
        except Exception as e:
            print(f"  Error listing: {e}")
    print()

# Check for models in different locations
print("2. Searching for Z-Image Models:")
print("-" * 60)

search_paths = [
    '/workspace/models',
    '/runpod-volume/models',
    '/workspace',
    '/runpod-volume',
]

for base_path in search_paths:
    if not os.path.exists(base_path):
        continue
    
    print(f"\nSearching in: {base_path}")
    try:
        for root, dirs, files in os.walk(base_path):
            # Look for Z-Image model files
            for file in files:
                if any(x in file.lower() for x in ['z_image', 'qwen', 'z-image-turbo']):
                    full_path = os.path.join(root, file)
                    size = os.path.getsize(full_path) / (1024**3)
                    rel_path = os.path.relpath(full_path, base_path)
                    print(f"  ✅ Found: {rel_path} ({size:.2f} GB)")
    except Exception as e:
        print(f"  Error searching: {e}")

# Check ComfyUI location
print("\n3. ComfyUI Installation:")
print("-" * 60)
comfyui_paths = [
    '/workspace/runpod-slim/ComfyUI',
    '/workspace/ComfyUI',
    '/root/ComfyUI',
]

for path in comfyui_paths:
    if os.path.exists(path):
        models_dir = os.path.join(path, 'models')
        print(f"✅ ComfyUI found: {path}")
        if os.path.exists(models_dir):
            print(f"  Models directory: {models_dir}")
            try:
                subdirs = [d for d in os.listdir(models_dir) if os.path.isdir(os.path.join(models_dir, d))]
                print(f"  Subdirectories: {', '.join(subdirs[:10])}")
            except:
                pass
        break
else:
    print("❌ ComfyUI not found in standard locations")

