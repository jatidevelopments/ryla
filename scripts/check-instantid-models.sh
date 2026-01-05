#!/bin/bash
#
# Check InstantID Model Installation Status
#
# This script checks:
# 1. Which InstantID models/files already exist on the pod
# 2. Verifies installation paths
# 3. Tests download URLs to find the correct ControlNet path
#
# Usage (on RunPod pod):
#   bash scripts/check-instantid-models.sh
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

COMFYUI_PATH="/workspace/runpod-slim/ComfyUI"

echo -e "${BLUE}🔍 Checking InstantID Model Installation${NC}\n"
echo "ComfyUI Path: ${COMFYUI_PATH}"
echo ""

# Check if ComfyUI directory exists
if [ ! -d "${COMFYUI_PATH}" ]; then
  echo -e "${RED}❌ ComfyUI directory not found at ${COMFYUI_PATH}${NC}"
  echo "Please verify the ComfyUI installation path"
  exit 1
fi

echo -e "${GREEN}✅ ComfyUI directory found${NC}\n"

# 1. Check custom nodes
echo -e "${YELLOW}1️⃣  Checking ComfyUI-InstantID custom nodes...${NC}"
if [ -d "${COMFYUI_PATH}/custom_nodes/ComfyUI_InstantID" ]; then
  echo -e "   ${GREEN}✅ ComfyUI_InstantID installed${NC}"
  echo "   Location: ${COMFYUI_PATH}/custom_nodes/ComfyUI_InstantID"
else
  echo -e "   ${RED}❌ ComfyUI_InstantID not found${NC}"
fi
echo ""

# 2. Check InsightFace models
echo -e "${YELLOW}2️⃣  Checking InsightFace models...${NC}"
INSIGHTFACE_PATH="${COMFYUI_PATH}/models/insightface/models/antelopev2"
if [ -d "${INSIGHTFACE_PATH}" ]; then
  echo -e "   ${GREEN}✅ antelopev2 directory exists${NC}"
  echo "   Location: ${INSIGHTFACE_PATH}"
  # Check for key files
  REQUIRED_FILES=("1k3d68.onnx" "2d106det.onnx" "genderage.onnx" "glintr100.onnx" "scrfd_10g_bnkps.onnx")
  for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "${INSIGHTFACE_PATH}/${file}" ]; then
      echo -e "      ${GREEN}✅${NC} ${file}"
    else
      echo -e "      ${RED}❌${NC} ${file} (missing)"
    fi
  done
else
  echo -e "   ${RED}❌ antelopev2 directory not found${NC}"
  echo "   Expected: ${INSIGHTFACE_PATH}"
fi
echo ""

# 3. Check InstantID IP-Adapter
echo -e "${YELLOW}3️⃣  Checking InstantID IP-Adapter model...${NC}"
IPADAPTER_PATH="${COMFYUI_PATH}/models/instantid/ip-adapter.bin"
if [ -f "${IPADAPTER_PATH}" ]; then
  SIZE=$(du -h "${IPADAPTER_PATH}" | cut -f1)
  echo -e "   ${GREEN}✅ ip-adapter.bin exists${NC} (${SIZE})"
  echo "   Location: ${IPADAPTER_PATH}"
else
  echo -e "   ${RED}❌ ip-adapter.bin not found${NC}"
  echo "   Expected: ${IPADAPTER_PATH}"
fi
echo ""

# 4. Check InstantID ControlNet
echo -e "${YELLOW}4️⃣  Checking InstantID ControlNet model...${NC}"
CONTROLNET_PATH="${COMFYUI_PATH}/models/controlnet"
CONTROLNET_FILE="${CONTROLNET_PATH}/diffusion_pytorch_model.safetensors"

if [ -f "${CONTROLNET_FILE}" ]; then
  SIZE=$(du -h "${CONTROLNET_FILE}" | cut -f1)
  echo -e "   ${GREEN}✅ diffusion_pytorch_model.safetensors exists${NC} (${SIZE})"
  echo "   Location: ${CONTROLNET_FILE}"
else
  echo -e "   ${RED}❌ diffusion_pytorch_model.safetensors not found${NC}"
  echo "   Expected: ${CONTROLNET_FILE}"
  echo ""
  echo -e "   ${YELLOW}📥 Testing download URLs...${NC}"
  
  # Function to check if URL exists
  check_url() {
    local url=$1
    if curl -s --head --fail "${url}" > /dev/null 2>&1; then
      return 0
    else
      return 1
    fi
  }
  
  # Test various possible URLs
  URLS=(
    "https://huggingface.co/InstantX/InstantID/resolve/main/ControlNet/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/InstantX/InstantID/resolve/main/controlnet/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/InstantX/InstantID/resolve/main/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/lllyasviel/control_v11p_sd15_instantid/resolve/main/diffusion_pytorch_model.safetensors"
    "https://huggingface.co/lllyasviel/sd-controlnet-instantid/resolve/main/diffusion_pytorch_model.safetensors"
  )
  
  FOUND_URL=""
  for url in "${URLS[@]}"; do
    echo -n "   Testing: $(basename $(dirname ${url}))... "
    if check_url "${url}"; then
      echo -e "${GREEN}✅ Available${NC}"
      if [ -z "$FOUND_URL" ]; then
        FOUND_URL="${url}"
      fi
    else
      echo -e "${RED}❌ Not found${NC}"
    fi
  done
  
  if [ -n "$FOUND_URL" ]; then
    echo ""
    echo -e "   ${GREEN}✅ Found working URL!${NC}"
    echo "   Download with:"
    echo "   wget ${FOUND_URL} -O ${CONTROLNET_FILE}"
    echo ""
    echo "   Or using huggingface-cli:"
    echo "   huggingface-cli download InstantX/InstantID --include='*controlnet*' --local-dir=${CONTROLNET_PATH}"
  else
    echo ""
    echo -e "   ${RED}❌ No working URLs found${NC}"
    echo "   Please check manually: https://huggingface.co/InstantX/InstantID/tree/main"
  fi
fi
echo ""

# 5. List all files in controlnet directory
echo -e "${YELLOW}5️⃣  Files in controlnet directory:${NC}"
if [ -d "${CONTROLNET_PATH}" ]; then
  if [ "$(ls -A ${CONTROLNET_PATH})" ]; then
    ls -lh "${CONTROLNET_PATH}" | tail -n +2 | while read -r line; do
      echo "   ${line}"
    done
    echo ""
    echo -e "   ${YELLOW}💡 Tip: If you see a file with 'instantid' or 'controlnet' in the name,"
    echo "   you may need to rename it to 'diffusion_pytorch_model.safetensors'${NC}"
  else
    echo -e "   ${YELLOW}⚠️  Directory exists but is empty${NC}"
  fi
else
  echo -e "   ${RED}❌ Directory does not exist${NC}"
fi
echo ""

# 6. Check InstantID model directory
echo -e "${YELLOW}6️⃣  Files in instantid directory:${NC}"
INSTANTID_DIR="${COMFYUI_PATH}/models/instantid"
if [ -d "${INSTANTID_DIR}" ]; then
  ls -lh "${INSTANTID_DIR}" | tail -n +2 | while read -r line; do
    echo "   ${line}"
  done
else
  echo -e "   ${RED}❌ Directory does not exist${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📋 Summary${NC}\n"

# Check if huggingface-cli is available
if command -v huggingface-cli &> /dev/null; then
  echo -e "${GREEN}✅ huggingface-cli is available${NC}"
  echo ""
  echo "Alternative download method (more reliable):"
  echo "   huggingface-cli download InstantX/InstantID \\"
  echo "     --include='*controlnet*' --include='*ControlNet*' \\"
  echo "     --local-dir=${COMFYUI_PATH}/models/controlnet"
  echo ""
  echo "Or download all InstantID files:"
  echo "   huggingface-cli download InstantX/InstantID \\"
  echo "     --local-dir=${COMFYUI_PATH}/models/instantid-all"
  echo ""
else
  echo -e "${YELLOW}💡 Tip: Install huggingface-cli for more reliable downloads:${NC}"
  echo "   pip install huggingface-hub"
  echo ""
fi

echo "To find the correct ControlNet URL manually, visit:"
echo "   https://huggingface.co/InstantX/InstantID/tree/main"
echo ""
echo "Look for files with 'controlnet' or 'diffusion' in the name."
echo "The file might be in a subdirectory like 'ControlNet/' or 'controlnet/'"
echo ""

