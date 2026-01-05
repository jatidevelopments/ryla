#!/usr/bin/env python3
"""
List all files in InstantID repository to find the ControlNet model
"""
from huggingface_hub import list_repo_files, hf_hub_download
import sys

repo_id = "InstantX/InstantID"

print("🔍 Listing all files in InstantID repository...\n")

try:
    files = list_repo_files(repo_id=repo_id, repo_type="model")
    
    print("📋 All files:")
    for f in sorted(files):
        print(f"   {f}")
    
    print("\n🎯 Looking for ControlNet model...")
    
    # Look for ControlNet-related files
    controlnet_files = [f for f in files if 'controlnet' in f.lower() or 'control' in f.lower()]
    safetensors_files = [f for f in files if f.endswith('.safetensors')]
    
    if controlnet_files:
        print("\n✅ ControlNet-related files found:")
        for f in controlnet_files:
            print(f"   - {f}")
        
        # Try to download the first one
        print(f"\n📥 Downloading: {controlnet_files[0]}")
        try:
            hf_hub_download(
                repo_id=repo_id,
                filename=controlnet_files[0],
                local_dir="/workspace/runpod-slim/ComfyUI/models/controlnet",
                local_dir_use_symlinks=False
            )
            print("✅ Download complete!")
            print(f"   File saved to: /workspace/runpod-slim/ComfyUI/models/controlnet/{controlnet_files[0].split('/')[-1]}")
            print(f"\n💡 If the filename is different, rename it to 'diffusion_pytorch_model.safetensors'")
        except Exception as e:
            print(f"❌ Download failed: {e}")
    else:
        print("⚠️  No ControlNet files found with 'controlnet' in the name")
        if safetensors_files:
            print("\n📦 Found .safetensors files (might be the ControlNet model):")
            for f in safetensors_files:
                print(f"   - {f}")
            print("\n💡 Try downloading one of these manually")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

