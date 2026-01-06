#!/bin/bash
#
# Download InstantID ControlNet Model
#
# This script lists files in the InstantID repository and downloads the ControlNet model
# Run this on your RunPod pod via SSH
#
# Usage:
#   bash scripts/download-instantid-controlnet.sh
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

COMFYUI_PATH="/workspace/runpod-slim/ComfyUI"
CONTROLNET_DIR="${COMFYUI_PATH}/models/controlnet"
REPO_ID="InstantX/InstantID"

echo -e "${BLUE}🔍 Finding InstantID ControlNet Model${NC}\n"

# Check if huggingface-cli is available
if ! command -v huggingface-cli &> /dev/null; then
  echo -e "${YELLOW}⚠️  huggingface-cli not found. Installing...${NC}"
  pip install -q huggingface-hub
fi

# Method 1: List all files in the repository to find the ControlNet model
echo -e "${YELLOW}1️⃣  Listing files in InstantID repository...${NC}"
echo "   This may take a moment..."
echo ""

# Use Python to list files (more reliable than hf CLI for this)
python3 << 'PYTHON_SCRIPT'
from huggingface_hub import list_repo_files
import sys

repo_id = "InstantX/InstantID"
try:
    files = list_repo_files(repo_id=repo_id, repo_type="model")
    
    # Filter for ControlNet-related files
    controlnet_files = [f for f in files if 'controlnet' in f.lower() or 'control' in f.lower()]
    safetensors_files = [f for f in files if f.endswith('.safetensors')]
    
    print("📋 All files in repository:")
    for f in sorted(files):
        print(f"   {f}")
    
    print("\n🎯 ControlNet-related files:")
    if controlnet_files:
        for f in controlnet_files:
            print(f"   ✅ {f}")
    else:
        print("   ⚠️  No files with 'controlnet' in name found")
    
    print("\n📦 All .safetensors files:")
    if safetensors_files:
        for f in safetensors_files:
            print(f"   {f}")
    else:
        print("   ⚠️  No .safetensors files found")
        
except Exception as e:
    print(f"❌ Error listing files: {e}")
    sys.exit(1)
PYTHON_SCRIPT

echo ""

# Method 2: Try downloading with specific known paths
echo -e "${YELLOW}2️⃣  Attempting to download ControlNet model...${NC}"
mkdir -p "${CONTROLNET_DIR}"

# Known possible paths (based on common InstantID setups)
POSSIBLE_PATHS=(
    "ControlNet/diffusion_pytorch_model.safetensors"
    "ControlNetModel/diffusion_pytorch_model.safetensors"
    "controlnet/diffusion_pytorch_model.safetensors"
    "diffusion_pytorch_model.safetensors"
    "ip-adapter/diffusion_pytorch_model.safetensors"
)

DOWNLOADED=false
for path in "${POSSIBLE_PATHS[@]}"; do
    echo -n "   Trying: ${path} ... "
    
    # Try to download using huggingface-cli
    if huggingface-cli download "${REPO_ID}" \
        --include="${path}" \
        --local-dir="${CONTROLNET_DIR}" \
        --local-dir-use-symlinks False \
        2>&1 | grep -q "Downloading"; then
        
        # Check if file was downloaded
        FILENAME=$(basename "${path}")
        if [ -f "${CONTROLNET_DIR}/${FILENAME}" ]; then
            # If it's not named correctly, rename it
            if [ "${FILENAME}" != "diffusion_pytorch_model.safetensors" ]; then
                mv "${CONTROLNET_DIR}/${FILENAME}" "${CONTROLNET_DIR}/diffusion_pytorch_model.safetensors"
            fi
            echo -e "${GREEN}✅ Success!${NC}"
            DOWNLOADED=true
            break
        fi
    else
        echo -e "${RED}❌ Not found${NC}"
    fi
done

echo ""

# Method 3: If still not found, try wget with known URLs
if [ "$DOWNLOADED" = false ]; then
    echo -e "${YELLOW}3️⃣  Trying direct download URLs...${NC}"
    
    URLS=(
        "https://huggingface.co/${REPO_ID}/resolve/main/ControlNet/diffusion_pytorch_model.safetensors"
        "https://huggingface.co/${REPO_ID}/resolve/main/ControlNetModel/diffusion_pytorch_model.safetensors"
        "https://huggingface.co/${REPO_ID}/resolve/main/controlnet/diffusion_pytorch_model.safetensors"
        "https://huggingface.co/lllyasviel/control_v11p_sd15_instantid/resolve/main/diffusion_pytorch_model.safetensors"
    )
    
    for url in "${URLS[@]}"; do
        echo -n "   Testing: $(basename $(dirname ${url}))... "
        if wget -q --spider "${url}" 2>&1; then
            echo -e "${GREEN}✅ Available${NC}"
            echo "   Downloading..."
            cd "${CONTROLNET_DIR}"
            if wget -q --show-progress "${url}" -O diffusion_pytorch_model.safetensors; then
                echo -e "   ${GREEN}✅ Downloaded successfully!${NC}"
                DOWNLOADED=true
                break
            fi
        else
            echo -e "${RED}❌ Not found${NC}"
        fi
    done
fi

echo ""

# Final check
if [ -f "${CONTROLNET_DIR}/diffusion_pytorch_model.safetensors" ]; then
    SIZE=$(du -h "${CONTROLNET_DIR}/diffusion_pytorch_model.safetensors" | cut -f1)
    echo -e "${GREEN}✅ ControlNet model installed!${NC}"
    echo "   Location: ${CONTROLNET_DIR}/diffusion_pytorch_model.safetensors"
    echo "   Size: ${SIZE}"
    echo ""
    echo "🧪 Verify installation:"
    echo "   bash scripts/check-instantid-models.sh"
else
    echo -e "${RED}❌ Failed to download ControlNet model${NC}"
    echo ""
    echo "📋 Manual download instructions:"
    echo "   1. Visit: https://huggingface.co/${REPO_ID}/tree/main"
    echo "   2. Browse the repository structure to find the ControlNet model"
    echo "   3. Download the file (usually ~2.5GB, .safetensors format)"
    echo "   4. Place it in: ${CONTROLNET_DIR}/"
    echo "   5. Rename it to: diffusion_pytorch_model.safetensors"
    echo ""
    echo "   Or use Python:"
    echo "   python3 -c \"from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='${REPO_ID}', filename='ControlNet/diffusion_pytorch_model.safetensors', local_dir='${CONTROLNET_DIR}')\""
fi

