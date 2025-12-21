#!/bin/bash
# =============================================================================
# Download script for Z-Image Danrisi Modified Loaders Workflow
# =============================================================================
# This script downloads all required models for the ComfyUI workflow.
# Run from the workspace directory.
#
# Requirements:
#   - wget or curl
#   - Sufficient disk space (~21 GB)
#
# Models:
#   - Diffusion model: z_image_turbo_bf16.safetensors (~12.3 GB)
#   - Text encoder: qwen_3_4b.safetensors (~8 GB)
#   - VAE: ae.safetensors -> z-image-turbo-vae.safetensors (~335 MB)
#   - LoRA: nicegirls_Zimage.safetensors (from Civitai)
# =============================================================================

set -e

echo "========================================"
echo "Z-Image Danrisi Workflow - Model Downloader"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check that we are in workspace
if [ ! -d "ComfyUI" ]; then
    echo -e "${RED}ERROR: ComfyUI folder not found!${NC}"
    echo "Make sure you run this script from the workspace directory."
    exit 1
fi

# Function for downloading with progress bar
download_model() {
    local url="$1"
    local output="$2"
    local name="$3"
    
    echo -e "${YELLOW}Downloading: ${name}${NC}"
    echo "  URL: ${url}"
    echo "  Target: ${output}"
    
    if [ -f "$output" ]; then
        echo -e "${GREEN}  ✓ File already exists, skipping.${NC}"
        return 0
    fi
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "$output")"
    
    # Download using wget with progress bar
    wget --progress=bar:force:noscroll -O "$output" "$url"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Successfully downloaded!${NC}"
    else
        echo -e "${RED}  ✗ Download error!${NC}"
        return 1
    fi
    echo ""
}

# =============================================================================
# 1. INSTALL RES4LYF CUSTOM NODE
# =============================================================================
echo ""
echo "========================================"
echo "1. Installing RES4LYF custom node"
echo "========================================"

cd ComfyUI

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠ venv/bin/activate not found, continuing without activation${NC}"
fi

cd custom_nodes

if [ -d "RES4LYF" ]; then
    echo -e "${GREEN}✓ RES4LYF already installed${NC}"
else
    echo "Cloning RES4LYF..."
    git clone https://github.com/ClownsharkBatwing/RES4LYF
    cd RES4LYF
    echo "Installing dependencies..."
    pip install -r requirements.txt
    cd ..
    echo -e "${GREEN}✓ RES4LYF installed${NC}"
fi

cd ../..

echo ""
echo "========================================"
echo "2. Downloading models"
echo "========================================"
echo ""

# =============================================================================
# 2. DIFFUSION MODEL - z_image_turbo_bf16.safetensors
# =============================================================================
download_model \
    "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors" \
    "ComfyUI/models/diffusion_models/z_image_turbo_bf16.safetensors" \
    "Z-Image Turbo BF16 Diffusion Model (~12.3 GB)"

# =============================================================================
# 3. TEXT ENCODER - qwen_3_4b.safetensors
# =============================================================================
download_model \
    "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors" \
    "ComfyUI/models/text_encoders/qwen_3_4b.safetensors" \
    "Qwen 3 4B Text Encoder (~8 GB)"

# =============================================================================
# 4. VAE - ae.safetensors (renamed to z-image-turbo-vae.safetensors)
# =============================================================================
# The workflow uses the name "z-image-turbo-vae.safetensors", but the standard
# Z-Image VAE is called "ae.safetensors". We download and rename it.

echo -e "${YELLOW}Downloading: VAE (ae.safetensors -> z-image-turbo-vae.safetensors) (~335 MB)${NC}"

VAE_PATH="ComfyUI/models/vae/z-image-turbo-vae.safetensors"
VAE_URL="https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"

if [ -f "$VAE_PATH" ]; then
    echo -e "${GREEN}  ✓ VAE file already exists, skipping.${NC}"
else
    mkdir -p "ComfyUI/models/vae"
    wget --progress=bar:force:noscroll -O "$VAE_PATH" "$VAE_URL"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ VAE successfully downloaded and renamed!${NC}"
    else
        echo -e "${RED}  ✗ Error downloading VAE!${NC}"
    fi
fi
echo ""

# =============================================================================
# 5. LoRA - nicegirls_Zimage.safetensors (from Civitai)
# =============================================================================
download_model \
    "https://civitai.com/api/download/models/2465980?type=Model&format=SafeTensor" \
    "ComfyUI/models/loras/nicegirls_Zimage.safetensors" \
    "NiceGirls Z-Image LoRA (Civitai)"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "========================================"
echo "INSTALLATION SUMMARY"
echo "========================================"
echo ""

# Check downloaded files
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2 - MISSING!"
    fi
}

echo "Downloaded models:"
check_file "ComfyUI/models/diffusion_models/z_image_turbo_bf16.safetensors" "Diffusion model (z_image_turbo_bf16.safetensors)"
check_file "ComfyUI/models/text_encoders/qwen_3_4b.safetensors" "Text encoder (qwen_3_4b.safetensors)"
check_file "ComfyUI/models/vae/z-image-turbo-vae.safetensors" "VAE (z-image-turbo-vae.safetensors)"
check_file "ComfyUI/models/loras/nicegirls_Zimage.safetensors" "LoRA (nicegirls_Zimage.safetensors)"

echo ""
echo "Custom nodes:"
check_file "ComfyUI/custom_nodes/RES4LYF/README.md" "RES4LYF"

echo ""
echo "========================================"
echo -e "${GREEN}Done!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Install other custom nodes via ComfyUI Manager"
echo "  2. Restart ComfyUI"
echo ""

