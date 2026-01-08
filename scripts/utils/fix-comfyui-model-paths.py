#!/usr/bin/env python3
"""
Fix ComfyUI Model Paths for Serverless Worker
Creates symlinks so custom loaders can find Z-Image models

Run this in Jupyter on the serverless worker
"""

import os
import sys

# ComfyUI installation path
COMFYUI_BASE = '/workspace/runpod-slim/ComfyUI'
COMFYUI_MODELS = os.path.join(COMFYUI_BASE, 'models')

# Network volume model locations (where models actually are)
NETWORK_MODELS = '/workspace/models'

# Model mappings: ComfyUI directory -> Network volume directory
MODEL_MAPPINGS = {
    'diffusion_models': 'diffusion_models',  # For UNETLoader
    'text_encoders': 'text_encoders',        # For CLIPLoader
    'vae': 'vae',                            # For VAELoader
}

def create_symlink(source, target):
    """Create symlink if target doesn't exist or is wrong"""
    if os.path.exists(target):
        if os.path.islink(target):
            current_target = os.readlink(target)
            if current_target == source:
                return 'exists'
            else:
                print(f"  Removing old symlink pointing to {current_target}")
                os.remove(target)
        elif os.path.isdir(target):
            print(f"  ⚠️  Directory exists (not symlink): {target}")
            print(f"     Consider backing up and removing, then creating symlink")
            return 'directory_exists'
        else:
            print(f"  ⚠️  File exists (not directory): {target}")
            return 'file_exists'
    
    try:
        os.symlink(source, target)
        return 'created'
    except Exception as e:
        print(f"  ❌ Failed to create symlink: {e}")
        return 'failed'

def main():
    print("=" * 60)
    print("ComfyUI Model Path Fix Script")
    print("=" * 60)
    print()
    
    # Check ComfyUI installation
    if not os.path.exists(COMFYUI_BASE):
        print(f"❌ ComfyUI not found at: {COMFYUI_BASE}")
        sys.exit(1)
    
    if not os.path.exists(COMFYUI_MODELS):
        print(f"❌ ComfyUI models directory not found: {COMFYUI_MODELS}")
        sys.exit(1)
    
    print(f"✅ ComfyUI found at: {COMFYUI_BASE}")
    print(f"✅ Models directory: {COMFYUI_MODELS}")
    print()
    
    # Check network volume
    if not os.path.exists(NETWORK_MODELS):
        print(f"❌ Network volume models not found at: {NETWORK_MODELS}")
        sys.exit(1)
    
    print(f"✅ Network volume models at: {NETWORK_MODELS}")
    print()
    
    # Create symlinks
    print("🔗 Creating symlinks:")
    print("-" * 60)
    
    results = {}
    for comfy_dir, network_dir in MODEL_MAPPINGS.items():
        source = os.path.join(NETWORK_MODELS, network_dir)
        target = os.path.join(COMFYUI_MODELS, comfy_dir)
        
        if not os.path.exists(source):
            print(f"❌ {comfy_dir}: Source not found at {source}")
            results[comfy_dir] = 'source_missing'
            continue
        
        print(f"📁 {comfy_dir}:")
        print(f"   Source: {source}")
        print(f"   Target: {target}")
        
        result = create_symlink(source, target)
        results[comfy_dir] = result
        
        if result == 'created':
            print(f"   ✅ Symlink created")
        elif result == 'exists':
            print(f"   ✅ Symlink already correct")
        print()
    
    # Verify Z-Image models are accessible
    print("=" * 60)
    print("Verification:")
    print("=" * 60)
    
    models_to_check = {
        'UNET': 'diffusion_models/z_image_turbo_bf16.safetensors',
        'CLIP': 'text_encoders/qwen_3_4b.safetensors',
        'VAE': 'vae/z-image-turbo-vae.safetensors',
    }
    
    all_found = True
    for name, rel_path in models_to_check.items():
        comfyui_path = os.path.join(COMFYUI_MODELS, rel_path)
        network_path = os.path.join(NETWORK_MODELS, rel_path)
        
        if os.path.exists(comfyui_path):
            size = os.path.getsize(comfyui_path) / (1024**3)
            print(f"✅ {name}: Accessible via ComfyUI path ({size:.2f} GB)")
            print(f"   {comfyui_path}")
        elif os.path.exists(network_path):
            print(f"⚠️  {name}: Found on network but not via ComfyUI path")
            print(f"   Network: {network_path}")
            print(f"   ComfyUI: {comfyui_path} (missing)")
            all_found = False
        else:
            print(f"❌ {name}: Not found")
            all_found = False
    
    print()
    print("=" * 60)
    if all_found:
        print("✅ All models accessible! ComfyUI should now find them.")
    else:
        print("⚠️  Some models not accessible. Check symlinks above.")
    print("=" * 60)

if __name__ == '__main__':
    main()

