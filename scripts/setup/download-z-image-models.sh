#!/bin/bash
# Download Z-Image-Turbo models to network volume
# Run this from a RunPod POD (not serverless worker) with network volume mounted

set -e

MODELS_BASE="/workspace/models"
# If /workspace/models doesn't exist, try /runpod-volume/models
if [ ! -d "$MODELS_BASE" ]; then
    if [ -d "/runpod-volume/models" ]; then
        MODELS_BASE="/runpod-volume/models"
    else
        echo "❌ Error: Network volume not found at /workspace/models or /runpod-volume/models"
        exit 1
    fi
fi

echo "============================================================"
echo "Downloading Z-Image-Turbo Models to Network Volume"
echo "============================================================"
echo "Models base: $MODELS_BASE"
echo ""

# Create directories
echo "Creating directories..."
mkdir -p "$MODELS_BASE/diffusion_models"
mkdir -p "$MODELS_BASE/text_encoders"
mkdir -p "$MODELS_BASE/vae"
echo "✅ Directories created"
echo ""

# Download UNET (diffusion model) - ~12.3 GB
echo "Downloading UNET (z_image_turbo_bf16.safetensors) - ~12.3 GB..."
cd "$MODELS_BASE/diffusion_models"
if [ -f "z_image_turbo_bf16.safetensors" ]; then
    echo "⚠️  File already exists, skipping..."
else
    wget -O z_image_turbo_bf16.safetensors \
        "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors"
    echo "✅ UNET downloaded"
fi
echo ""

# Download CLIP (text encoder) - ~8 GB
echo "Downloading CLIP (qwen_3_4b.safetensors) - ~8 GB..."
cd "$MODELS_BASE/text_encoders"
if [ -f "qwen_3_4b.safetensors" ]; then
    echo "⚠️  File already exists, skipping..."
else
    wget -O qwen_3_4b.safetensors \
        "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors"
    echo "✅ CLIP downloaded"
fi
echo ""

# Download VAE - ~335 MB
echo "Downloading VAE (z-image-turbo-vae.safetensors) - ~335 MB..."
cd "$MODELS_BASE/vae"
if [ -f "z-image-turbo-vae.safetensors" ]; then
    echo "⚠️  File already exists, skipping..."
else
    wget -O z-image-turbo-vae.safetensors \
        "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"
    echo "✅ VAE downloaded"
fi
echo ""

# Verify downloads
echo "============================================================"
echo "Verification:"
echo "============================================================"
cd "$MODELS_BASE"

for dir in diffusion_models text_encoders vae; do
    if [ -d "$dir" ]; then
        file_count=$(ls -1 "$dir" 2>/dev/null | wc -l)
        echo "✅ $dir/: $file_count files"
        if [ "$dir" = "diffusion_models" ]; then
            if [ -f "$dir/z_image_turbo_bf16.safetensors" ]; then
                size=$(du -h "$dir/z_image_turbo_bf16.safetensors" | cut -f1)
                echo "   z_image_turbo_bf16.safetensors: $size"
            fi
        elif [ "$dir" = "text_encoders" ]; then
            if [ -f "$dir/qwen_3_4b.safetensors" ]; then
                size=$(du -h "$dir/qwen_3_4b.safetensors" | cut -f1)
                echo "   qwen_3_4b.safetensors: $size"
            fi
        elif [ "$dir" = "vae" ]; then
            if [ -f "$dir/z-image-turbo-vae.safetensors" ]; then
                size=$(du -h "$dir/z-image-turbo-vae.safetensors" | cut -f1)
                echo "   z-image-turbo-vae.safetensors: $size"
            fi
        fi
    else
        echo "❌ $dir/: Directory not found"
    fi
done

echo ""
echo "============================================================"
echo "✅ Download complete!"
echo "============================================================"
echo "Models are now on the network volume and accessible to all workers."
echo "You can now test the serverless endpoint:"
echo "  pnpm test:comfyui-serverless"

