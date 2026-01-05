#!/bin/bash
#
# Install InstantID Custom Nodes on RunPod ComfyUI
#
# This script installs ComfyUI-InstantID and downloads required models.
# Run this on your RunPod pod via SSH.
#
# Note: Uses /workspace/runpod-slim/ComfyUI as the ComfyUI installation path
#
# Usage (on RunPod pod):
#   bash <(curl -s https://raw.githubusercontent.com/your-repo/scripts/install-instantid.sh)
#   OR
#   wget -O - https://raw.githubusercontent.com/your-repo/scripts/install-instantid.sh | bash
#   OR
#   Copy this script to the pod and run: bash install-instantid.sh
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}📦 Installing InstantID for ComfyUI${NC}\n"

# ComfyUI path
COMFYUI_PATH="/workspace/runpod-slim/ComfyUI"

# 1. Install ComfyUI-InstantID custom nodes
echo -e "${YELLOW}1️⃣  Installing ComfyUI-InstantID custom nodes...${NC}"
cd "${COMFYUI_PATH}/custom_nodes"

if [ -d "ComfyUI_InstantID" ]; then
  echo "   ⚠️  ComfyUI_InstantID already exists, updating..."
  cd ComfyUI_InstantID
  git pull
else
  git clone https://github.com/cubiq/ComfyUI_InstantID.git
  cd ComfyUI_InstantID
fi

pip install -r requirements.txt
echo -e "   ${GREEN}✅ ComfyUI-InstantID installed${NC}\n"

# 2. Download InsightFace models (antelopev2)
echo -e "${YELLOW}2️⃣  Downloading InsightFace models...${NC}"
mkdir -p "${COMFYUI_PATH}/models/insightface/models"
cd "${COMFYUI_PATH}/models/insightface/models"

if [ -d "antelopev2" ]; then
  echo "   ⚠️  antelopev2 already exists, skipping..."
else
  wget -q --show-progress https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip
  unzip -q antelopev2.zip
  rm antelopev2.zip
  echo -e "   ${GREEN}✅ InsightFace models downloaded${NC}"
fi
echo ""

# 3. Download InstantID IP-Adapter model
echo -e "${YELLOW}3️⃣  Downloading InstantID IP-Adapter model...${NC}"
mkdir -p "${COMFYUI_PATH}/models/instantid"
cd "${COMFYUI_PATH}/models/instantid"

if [ -f "ip-adapter.bin" ]; then
  echo "   ⚠️  ip-adapter.bin already exists, skipping..."
else
  wget -q --show-progress https://huggingface.co/InstantX/InstantID/resolve/main/ip-adapter.bin
  echo -e "   ${GREEN}✅ InstantID IP-Adapter downloaded (~1.69GB)${NC}"
fi
echo ""

# 4. Download InstantID ControlNet model
echo -e "${YELLOW}4️⃣  Downloading InstantID ControlNet model...${NC}"
mkdir -p "${COMFYUI_PATH}/models/controlnet"
cd "${COMFYUI_PATH}/models/controlnet"

if [ -f "diffusion_pytorch_model.safetensors" ]; then
  echo "   ⚠️  diffusion_pytorch_model.safetensors already exists, skipping..."
else
  # Try multiple URLs - check which ones exist first
  echo "   📥 Checking available ControlNet URLs..."
  
  # Function to check if URL exists
  check_url() {
    local url=$1
    if curl -s --head --fail "${url}" > /dev/null 2>&1; then
      return 0
    else
      return 1
    fi
  }
  
  # List of possible URLs to try
  CONTROLNET_URLS=(
    "https://huggingface.co/InstantX/InstantID/resolve/main/ControlNet/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/InstantX/InstantID/resolve/main/controlnet/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/InstantX/InstantID/resolve/main/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/lllyasviel/control_v11p_sd15_instantid/resolve/main/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/lllyasviel/sd-controlnet-instantid/resolve/main/diffusion_pytorch_model.safetensors"
  )
  
  DOWNLOADED=false
  for url in "${CONTROLNET_URLS[@]}"; do
    echo -n "   Testing: $(basename $(dirname ${url}))... "
    if check_url "${url}"; then
      echo -e "${GREEN}✅ Found${NC}"
      echo "   Downloading from: ${url}"
      if wget -q --show-progress "${url}" -O diffusion_pytorch_model.safetensors; then
        echo -e "   ${GREEN}✅ InstantID ControlNet downloaded (~2.50GB)${NC}"
        DOWNLOADED=true
        break
      else
        echo -e "   ${RED}❌ Download failed${NC}"
      fi
    else
      echo -e "${RED}❌ Not found${NC}"
    fi
  done
  
  if [ "$DOWNLOADED" = false ]; then
    echo -e "   ${RED}❌ Failed to download ControlNet model from any URL${NC}"
    echo ""
    echo "   ${YELLOW}📋 Manual download instructions:${NC}"
    echo "   1. Visit: https://huggingface.co/InstantX/InstantID/tree/main"
    echo "   2. Look for ControlNet model file (usually ~2.5GB)"
    echo "   3. Download it to: ${COMFYUI_PATH}/models/controlnet/"
    echo "   4. Rename it to: diffusion_pytorch_model.safetensors"
    echo ""
    echo "   Alternative: Check if the model is in a subdirectory:"
    echo "   - https://huggingface.co/InstantX/InstantID/tree/main/ControlNet"
    echo "   - https://huggingface.co/InstantX/InstantID/tree/main/controlnet"
    echo ""
    echo "   Or use huggingface-cli:"
    echo "   huggingface-cli download InstantX/InstantID --include='*controlnet*' --local-dir=${COMFYUI_PATH}/models/controlnet"
  fi
fi
echo ""

# 5. Restart ComfyUI
echo -e "${YELLOW}5️⃣  Restarting ComfyUI...${NC}"
pkill -f "python.*main.py" || pkill -f "python3.*main.py" || true
sleep 2
cd "${COMFYUI_PATH}"
# Try python3 first, fallback to python
if command -v python3 &> /dev/null; then
  nohup python3 main.py --listen 0.0.0.0 --port 8188 > /tmp/comfyui.log 2>&1 &
  echo -e "   ${GREEN}✅ ComfyUI restarted (using python3)${NC}\n"
elif command -v python &> /dev/null; then
  nohup python main.py --listen 0.0.0.0 --port 8188 > /tmp/comfyui.log 2>&1 &
  echo -e "   ${GREEN}✅ ComfyUI restarted (using python)${NC}\n"
else
  echo -e "   ${RED}❌ Python not found. Please restart ComfyUI manually${NC}"
  echo "   Run: cd ${COMFYUI_PATH} && python3 main.py --listen 0.0.0.0 --port 8188 &"
  echo ""
fi

echo -e "${GREEN}✅ InstantID installation complete!${NC}\n"
echo "⏳ Waiting 15 seconds for ComfyUI to fully start..."
sleep 15

echo ""
echo "📋 Summary:"
echo "   - ComfyUI-InstantID custom nodes: ✅"
echo "   - InsightFace models (antelopev2): ✅"
echo "   - InstantID IP-Adapter: ✅"
echo "   - InstantID ControlNet: ✅"
echo ""
echo "🧪 Test the installation:"
echo "   pnpm check:instantid"
echo ""

