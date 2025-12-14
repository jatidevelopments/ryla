#!/bin/bash
# Download all required models for ComfyUI on RunPod
# Run this script via SSH on the ComfyUI pod

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting model download for ComfyUI...${NC}"

# Navigate to ComfyUI models directory
# Adjust path if ComfyUI is installed elsewhere
COMFYUI_DIR="${COMFYUI_DIR:-/workspace/ComfyUI}"
MODELS_DIR="${COMFYUI_DIR}/models"

if [ ! -d "$MODELS_DIR" ]; then
    echo -e "${YELLOW}ComfyUI models directory not found. Searching...${NC}"
    # Try common locations
    if [ -d "/workspace/ComfyUI/models" ]; then
        MODELS_DIR="/workspace/ComfyUI/models"
    elif [ -d "/root/ComfyUI/models" ]; then
        MODELS_DIR="/root/ComfyUI/models"
    else
        echo "Error: ComfyUI models directory not found. Please set COMFYUI_DIR environment variable."
        exit 1
    fi
fi

echo -e "${GREEN}Using models directory: ${MODELS_DIR}${NC}"

# Create subdirectories if they don't exist
mkdir -p "${MODELS_DIR}/checkpoints"
mkdir -p "${MODELS_DIR}/vae"
mkdir -p "${MODELS_DIR}/loras"
mkdir -p "${MODELS_DIR}/controlnet"
mkdir -p "${MODELS_DIR}/clip_vision"
mkdir -p "${MODELS_DIR}/ipadapter"

# Function to download with retry
download_with_retry() {
    local url=$1
    local output=$2
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Downloading ${output} (attempt $attempt/$max_attempts)...${NC}"
        if wget --progress=bar:force -O "$output" "$url" 2>&1 | grep -q "saved"; then
            echo -e "${GREEN}✓ Downloaded ${output}${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo -e "${YELLOW}⚠ Failed to download ${output} after ${max_attempts} attempts${NC}"
    return 1
}

# ============================================
# CHECKPOINTS (Base Models)
# ============================================

echo -e "\n${GREEN}=== Downloading Checkpoints ===${NC}"

# Flux Dev (uncensored) - Primary model
# Note: You may need to download from CivitAI or HuggingFace manually
# This is a placeholder - replace with actual download URL
echo -e "${YELLOW}Flux Dev (uncensored) - Please download manually from:${NC}"
echo "  - CivitAI: https://civitai.com/models/..."
echo "  - Or use: huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir ${MODELS_DIR}/checkpoints"

# Z-Image-Turbo - Alternative fast model
echo -e "\n${YELLOW}Downloading Z-Image-Turbo...${NC}"
Z_IMAGE_URL="https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors"
if download_with_retry "$Z_IMAGE_URL" "${MODELS_DIR}/checkpoints/z-image-turbo.safetensors"; then
    echo -e "${GREEN}✓ Z-Image-Turbo downloaded${NC}"
fi

# ============================================
# VAE Models
# ============================================

echo -e "\n${GREEN}=== Downloading VAE Models ===${NC}"

# Flux VAE
echo -e "${YELLOW}Downloading Flux VAE...${NC}"
FLUX_VAE_URL="https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/vae.safetensors"
if download_with_retry "$FLUX_VAE_URL" "${MODELS_DIR}/vae/flux-vae.safetensors"; then
    echo -e "${GREEN}✓ Flux VAE downloaded${NC}"
fi

# ============================================
# ControlNet Models
# ============================================

echo -e "\n${GREEN}=== Downloading ControlNet Models ===${NC}"

# ControlNet OpenPose (for pose control in character sheets)
echo -e "${YELLOW}Downloading ControlNet OpenPose...${NC}"
CONTROLNET_OPENPOSE_URL="https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth"
if download_with_retry "$CONTROLNET_OPENPOSE_URL" "${MODELS_DIR}/controlnet/controlnet-openpose.pth"; then
    echo -e "${GREEN}✓ ControlNet OpenPose downloaded${NC}"
fi

# ControlNet for Z-Image (if available)
echo -e "${YELLOW}Downloading Z-Image ControlNet...${NC}"
Z_IMAGE_CONTROLNET_URL="https://huggingface.co/alibaba-pai/Z-Image-ControlNet/resolve/main/z_image_controlnet.safetensors"
if download_with_retry "$Z_IMAGE_CONTROLNET_URL" "${MODELS_DIR}/controlnet/z-image-controlnet.safetensors"; then
    echo -e "${GREEN}✓ Z-Image ControlNet downloaded${NC}"
fi

# ============================================
# IPAdapter Models (for Face Swap)
# ============================================

echo -e "\n${GREEN}=== Downloading IPAdapter Models ===${NC}"

# IPAdapter FaceID Plus (for face swap)
echo -e "${YELLOW}Downloading IPAdapter FaceID Plus...${NC}"
IPADAPTER_FACEID_URL="https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plus_sd15.bin"
if download_with_retry "$IPADAPTER_FACEID_URL" "${MODELS_DIR}/ipadapter/ip-adapter-faceid-plus.bin"; then
    echo -e "${GREEN}✓ IPAdapter FaceID Plus downloaded${NC}"
fi

# IPAdapter FaceID Plus V2 (better quality)
echo -e "${YELLOW}Downloading IPAdapter FaceID Plus V2...${NC}"
IPADAPTER_FACEID_V2_URL="https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plusv2_sd15.bin"
if download_with_retry "$IPADAPTER_FACEID_V2_URL" "${MODELS_DIR}/ipadapter/ip-adapter-faceid-plusv2.bin"; then
    echo -e "${GREEN}✓ IPAdapter FaceID Plus V2 downloaded${NC}"
fi

# CLIP Vision model for IPAdapter
echo -e "${YELLOW}Downloading CLIP Vision model...${NC}"
CLIP_VISION_URL="https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/models/image_encoder/model.safetensors"
mkdir -p "${MODELS_DIR}/clip_vision"
if download_with_retry "$CLIP_VISION_URL" "${MODELS_DIR}/clip_vision/clip-vision.safetensors"; then
    echo -e "${GREEN}✓ CLIP Vision model downloaded${NC}"
fi

# ============================================
# PuLID Models (for face consistency)
# ============================================

echo -e "\n${GREEN}=== Downloading PuLID Models ===${NC}"

# PuLID model
echo -e "${YELLOW}Downloading PuLID model...${NC}"
PULID_URL="https://huggingface.co/pulid/pulid/resolve/main/pulid.safetensors"
if download_with_retry "$PULID_URL" "${MODELS_DIR}/checkpoints/pulid.safetensors"; then
    echo -e "${GREEN}✓ PuLID model downloaded${NC}"
fi

# ============================================
# Summary
# ============================================

echo -e "\n${GREEN}=== Download Summary ===${NC}"
echo "Models directory: ${MODELS_DIR}"
echo ""
echo "Downloaded models:"
ls -lh "${MODELS_DIR}/checkpoints/" 2>/dev/null | tail -n +2 || echo "  (none)"
ls -lh "${MODELS_DIR}/vae/" 2>/dev/null | tail -n +2 || echo "  (none)"
ls -lh "${MODELS_DIR}/controlnet/" 2>/dev/null | tail -n +2 || echo "  (none)"
ls -lh "${MODELS_DIR}/ipadapter/" 2>/dev/null | tail -n +2 || echo "  (none)"
ls -lh "${MODELS_DIR}/clip_vision/" 2>/dev/null | tail -n +2 || echo "  (none)"

echo -e "\n${YELLOW}Note: Some models may need to be downloaded manually:${NC}"
echo "  - Flux Dev (uncensored) - Download from CivitAI or HuggingFace"
echo "  - Large models may take time to download"
echo ""
echo -e "${GREEN}Model download complete!${NC}"

