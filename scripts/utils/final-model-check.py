#!/usr/bin/env python3
"""
Final check: Where are the Z-Image models?
"""

import os

print("=" * 60)
print("Final Z-Image Model Location Check")
print("=" * 60)
print()

# The models should be at these paths based on earlier verification
expected_paths = {
    'UNET': '/workspace/models/diffusion_models/z_image_turbo_bf16.safetensors',
    'CLIP': '/workspace/models/text_encoders/qwen_3_4b.safetensors',
    'VAE': '/workspace/models/vae/z-image-turbo-vae.safetensors',
}

print("1. Checking Expected Paths:")
print("-" * 60)
all_found = True
for name, path in expected_paths.items():
    if os.path.exists(path):
        size = os.path.getsize(path) / (1024**3)
        print(f"✅ {name}: {path} ({size:.2f} GB)")
    else:
        print(f"❌ {name}: {path} (NOT FOUND)")
        all_found = False
        
        # Check if parent directory exists
        parent = os.path.dirname(path)
        if os.path.exists(parent):
            print(f"   Parent exists: {parent}")
            if os.path.isdir(parent):
                files = os.listdir(parent)
                print(f"   Files in parent: {len(files)}")
                if files:
                    print(f"   Sample: {', '.join(files[:5])}")
        else:
            print(f"   Parent does not exist: {parent}")
    print()

if all_found:
    print("✅ All models found at expected paths!")
    print()
    print("2. Checking if directories are symlinks or real:")
    print("-" * 60)
    for dir_name in ['diffusion_models', 'text_encoders', 'vae']:
        path = f'/workspace/models/{dir_name}'
        if os.path.exists(path):
            if os.path.islink(path):
                target = os.readlink(path)
                print(f"{dir_name}: Symlink -> {target}")
                if not os.path.exists(target):
                    print(f"  ⚠️  BROKEN SYMLINK - target doesn't exist")
            elif os.path.isdir(path):
                print(f"{dir_name}: Real directory")
            else:
                print(f"{dir_name}: File (unexpected)")
else:
    print("❌ Models not found at expected paths.")
    print()
    print("2. Searching entire /workspace for Z-Image files:")
    print("-" * 60)
    import fnmatch
    found_any = False
    for root, dirs, files in os.walk('/workspace'):
        for file in files:
            if any(x in file.lower() for x in ['z_image_turbo_bf16', 'qwen_3_4b', 'z-image-turbo-vae']):
                full_path = os.path.join(root, file)
                size = os.path.getsize(full_path) / (1024**3)
                rel_path = os.path.relpath(full_path, '/workspace')
                print(f"  ✅ Found: {rel_path} ({size:.2f} GB)")
                found_any = True
    
    if not found_any:
        print("  ❌ No Z-Image model files found anywhere in /workspace")
        print()
        print("3. Conclusion:")
        print("-" * 60)
        print("Z-Image models are NOT on the network volume.")
        print("They need to be downloaded.")
        print()
        print("Download commands (run from a RunPod pod with network volume mounted):")
        print()
        print("# Create directories")
        print("mkdir -p /workspace/models/{diffusion_models,text_encoders,vae}")
        print()
        print("# Download UNET")
        print("cd /workspace/models/diffusion_models")
        print('wget -O z_image_turbo_bf16.safetensors \\')
        print('  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors"')
        print()
        print("# Download CLIP")
        print("cd /workspace/models/text_encoders")
        print('wget -O qwen_3_4b.safetensors \\')
        print('  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors"')
        print()
        print("# Download VAE")
        print("cd /workspace/models/vae")
        print('wget -O z-image-turbo-vae.safetensors \\')
        print('  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"')

