import os

# Check if models exist
models = {
    'UNET': '/workspace/models/diffusion_models/z_image_turbo_bf16.safetensors',
    'CLIP': '/workspace/models/text_encoders/qwen_3_4b.safetensors',
    'VAE': '/workspace/models/vae/z-image-turbo-vae.safetensors',
}

print("Checking for Z-Image models:")
for name, path in models.items():
    if os.path.exists(path):
        size = os.path.getsize(path) / (1024**3)
        print(f"✅ {name}: {size:.2f} GB")
    else:
        print(f"❌ {name}: NOT FOUND")
        parent = os.path.dirname(path)
        if os.path.exists(parent):
            files = os.listdir(parent)
            print(f"   Parent has {len(files)} files")

# If not found, search
if not all(os.path.exists(p) for p in models.values()):
    print("\nSearching /workspace...")
    for root, dirs, files in os.walk('/workspace'):
        for f in files:
            if 'z_image_turbo' in f.lower() or 'qwen_3_4b' in f.lower():
                full = os.path.join(root, f)
                size = os.path.getsize(full) / (1024**3)
                print(f"Found: {full} ({size:.2f} GB)")

