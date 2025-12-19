#!/bin/bash
# Setup script for downloading models to RunPod network volume
# Run this after SSH key is added to the pod

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== RunPod Model Setup Script ===${NC}\n"

# Check if network volume is mounted
echo "Checking network volume mount..."
if [ ! -d "/workspace/models" ]; then
    echo -e "${YELLOW}WARNING: /workspace/models not found. Checking alternative locations...${NC}"
    ls -lah / | grep -E "(workspace|models|volume)" || echo "No obvious mount point found"
    echo -e "\n${YELLOW}Please ensure network volume 'ryla-models-dream-companion' is attached to this pod.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Network volume found at /workspace/models${NC}\n"

# Create directory structure
echo "Creating directory structure..."
mkdir -p /workspace/models/checkpoints
mkdir -p /workspace/models/pulid
mkdir -p /workspace/models/controlnet
mkdir -p /workspace/models/ipadapter

echo -e "${GREEN}✓ Directories created${NC}\n"

# Check current models
echo "Current models in checkpoints:"
ls -lah /workspace/models/checkpoints/ 2>/dev/null || echo "  (empty)"

echo -e "\n${YELLOW}=== Models to Download ===${NC}"
echo "1. FLUX.1-schnell: flux1-schnell.safetensors (~6GB)"
echo "2. Z-Image-Turbo: z-image-turbo.safetensors (~6GB)"
echo "3. PuLID: pulid_model.safetensors (~2GB) [optional for MVP]"
echo "4. ControlNet: controlnet-openpose.safetensors [optional for MVP]"
echo "5. IPAdapter FaceID: ip-adapter-faceid.safetensors [optional for MVP]"

echo -e "\n${YELLOW}=== Download Commands ===${NC}"
echo ""
echo "# Option 1: Download FLUX.1-schnell (if you have HuggingFace token)"
echo "cd /workspace/models/checkpoints"
echo "huggingface-cli download black-forest-labs/FLUX.1-schnell --include '*.safetensors' --local-dir ."
echo ""
echo "# Option 2: Download via wget (if you have direct URLs)"
echo "cd /workspace/models/checkpoints"
echo "wget -O flux1-schnell.safetensors <URL>"
echo ""
echo "# Option 3: Use ComfyUI Manager (if ComfyUI is installed)"
echo "# Open ComfyUI web interface and use Manager to download models"
echo ""

# Check if huggingface-cli is available
if command -v huggingface-cli &> /dev/null; then
    echo -e "${GREEN}✓ huggingface-cli is available${NC}"
    echo "You can use: huggingface-cli download <model> --include '*.safetensors'"
else
    echo -e "${YELLOW}⚠ huggingface-cli not found. Install with: pip install huggingface-hub${NC}"
fi

# Check if wget is available
if command -v wget &> /dev/null; then
    echo -e "${GREEN}✓ wget is available${NC}"
else
    echo -e "${YELLOW}⚠ wget not found. Install with: apt-get update && apt-get install -y wget${NC}"
fi

echo -e "\n${GREEN}=== Verification ===${NC}"
echo "After downloading, verify with:"
echo "  ls -lh /workspace/models/checkpoints/"
echo "  du -sh /workspace/models/checkpoints/*"

echo -e "\n${GREEN}Setup script complete!${NC}"

