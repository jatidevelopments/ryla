#!/bin/bash
#
# Check and Install InstantID Custom Nodes on RunPod ComfyUI
#
# This script:
# 1. Checks if InstantID nodes are available via ComfyUI API
# 2. Provides installation commands if nodes are missing
# 3. Can optionally install the nodes (requires SSH access)
#
# Usage:
#   ./scripts/setup/check-install-instantid.sh
#   ./scripts/setup/check-install-instantid.sh --install  # Install if missing (requires SSH)
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

COMFYUI_URL="${COMFYUI_POD_URL:-}"
INSTALL_MODE="${1:-}"

if [ -z "$COMFYUI_URL" ]; then
  echo -e "${RED}❌ COMFYUI_POD_URL not set${NC}"
  echo "Please set COMFYUI_POD_URL in .env.local or export it"
  exit 1
fi

echo -e "${GREEN}🔍 Checking InstantID Custom Nodes${NC}\n"
echo "ComfyUI URL: $COMFYUI_URL"
echo ""

# Required InstantID nodes
REQUIRED_NODES=(
  "InsightFaceLoader"
  "InstantIDModelLoader"
  "InstantIDControlNetLoader"
  "ApplyInstantID"
  "ControlNetApplyAdvanced"
  "ConditioningCombine"
)

# Check available nodes via API
echo "📡 Checking available nodes..."
NODES_JSON=$(curl -s "${COMFYUI_URL}/object_info" || echo "{}")

if [ "$NODES_JSON" = "{}" ]; then
  echo -e "${RED}❌ Failed to connect to ComfyUI${NC}"
  echo "Please verify COMFYUI_POD_URL is correct and the pod is running"
  exit 1
fi

# Check each required node
MISSING_NODES=()
AVAILABLE_NODES=()

for node in "${REQUIRED_NODES[@]}"; do
  if echo "$NODES_JSON" | grep -q "\"$node\""; then
    echo -e "  ${GREEN}✅${NC} $node"
    AVAILABLE_NODES+=("$node")
  else
    echo -e "  ${RED}❌${NC} $node"
    MISSING_NODES+=("$node")
  fi
done

echo ""

# Summary
if [ ${#MISSING_NODES[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All InstantID nodes are available!${NC}\n"
  echo "You can use the Z-Image InstantID workflow."
  exit 0
else
  echo -e "${YELLOW}⚠️  Missing ${#MISSING_NODES[@]} InstantID node(s)${NC}\n"
  echo "Missing nodes:"
  for node in "${MISSING_NODES[@]}"; do
    echo "  - $node"
  done
  echo ""
fi

# Installation instructions
echo -e "${YELLOW}📦 Installation Instructions${NC}\n"
echo "To install InstantID custom nodes, SSH into your RunPod pod and run:"
echo ""
COMFYUI_PATH="/workspace/runpod-slim/ComfyUI"

echo "1. Install ComfyUI-InstantID custom nodes:"
echo "   cd ${COMFYUI_PATH}/custom_nodes"
echo "   git clone https://github.com/cubiq/ComfyUI_InstantID.git"
echo "   cd ComfyUI_InstantID"
echo "   pip install -r requirements.txt"
echo ""
echo "2. Download required models:"
echo "   # InsightFace models (antelopev2)"
echo "   mkdir -p ${COMFYUI_PATH}/models/insightface/models"
echo "   cd ${COMFYUI_PATH}/models/insightface/models"
echo "   wget https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip"
echo "   unzip antelopev2.zip"
echo "   rm antelopev2.zip"
echo ""
echo "   # InstantID IP-Adapter model"
echo "   mkdir -p ${COMFYUI_PATH}/models/instantid"
echo "   cd ${COMFYUI_PATH}/models/instantid"
echo "   wget https://huggingface.co/InstantX/InstantID/resolve/main/ip-adapter.bin"
echo ""
echo "   # InstantID ControlNet model"
echo "   mkdir -p ${COMFYUI_PATH}/models/controlnet"
echo "   cd ${COMFYUI_PATH}/models/controlnet"
echo "   # Try root path first (correct location, not ControlNet subfolder)"
echo "   wget https://huggingface.co/InstantX/InstantID/resolve/main/diffusion_pytorch_model.safetensors || \\"
echo "   wget https://huggingface.co/lllyasviel/control_v11p_sd15_instantid/resolve/main/diffusion_pytorch_model.safetensors"
echo ""
echo "3. Restart ComfyUI:"
echo "   # If using systemd:"
echo "   systemctl restart comfyui"
echo "   # Or kill and restart:"
echo "   pkill -f 'python.*main.py' || pkill -f 'python3.*main.py'"
echo "   cd ${COMFYUI_PATH}"
echo "   python3 main.py --listen 0.0.0.0 --port 8188 & || python main.py --listen 0.0.0.0 --port 8188 &"
echo ""

# Auto-install if requested
if [ "$INSTALL_MODE" = "--install" ]; then
  echo -e "${YELLOW}⚠️  Auto-install requires SSH access to the pod${NC}"
  echo "Please provide SSH connection details:"
  read -p "Pod IP or hostname: " POD_HOST
  read -p "SSH port (default 22): " SSH_PORT
  SSH_PORT=${SSH_PORT:-22}
  
  echo ""
  echo "Connecting to pod and installing InstantID..."
  
  ssh -p "$SSH_PORT" root@"$POD_HOST" << 'EOF'
    set -e
    
    COMFYUI_PATH="/workspace/runpod-slim/ComfyUI"
    
    echo "📦 Installing ComfyUI-InstantID..."
    cd "${COMFYUI_PATH}/custom_nodes"
    
    if [ ! -d "ComfyUI_InstantID" ]; then
      git clone https://github.com/cubiq/ComfyUI_InstantID.git
      cd ComfyUI_InstantID
      pip install -r requirements.txt
      echo "✅ ComfyUI-InstantID installed"
    else
      echo "✅ ComfyUI-InstantID already exists"
    fi
    
    echo ""
    echo "📥 Downloading models..."
    
    # InsightFace models
    mkdir -p "${COMFYUI_PATH}/models/insightface/models"
    cd "${COMFYUI_PATH}/models/insightface/models"
    if [ ! -d "antelopev2" ]; then
      wget -q https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip
      unzip -q antelopev2.zip
      rm antelopev2.zip
      echo "✅ InsightFace models downloaded"
    else
      echo "✅ InsightFace models already exist"
    fi
    
    # InstantID IP-Adapter
    mkdir -p "${COMFYUI_PATH}/models/instantid"
    cd "${COMFYUI_PATH}/models/instantid"
    if [ ! -f "ip-adapter.bin" ]; then
      wget -q https://huggingface.co/InstantX/InstantID/resolve/main/ip-adapter.bin
      echo "✅ InstantID IP-Adapter downloaded"
    else
      echo "✅ InstantID IP-Adapter already exists"
    fi
    
    # InstantID ControlNet
    mkdir -p "${COMFYUI_PATH}/models/controlnet"
    cd "${COMFYUI_PATH}/models/controlnet"
    if [ ! -f "diffusion_pytorch_model.safetensors" ]; then
      # Try multiple URLs - correct one is in InstantID repo root (not ControlNet subfolder)
      if wget -q https://huggingface.co/InstantX/InstantID/resolve/main/diffusion_pytorch_model.safetensors; then
        echo "✅ InstantID ControlNet downloaded"
      elif wget -q https://huggingface.co/lllyasviel/control_v11p_sd15_instantid/resolve/main/diffusion_pytorch_model.safetensors; then
        echo "✅ InstantID ControlNet downloaded (alternative source)"
      else
        echo "❌ Failed to download ControlNet. Please download manually from https://huggingface.co/InstantX/InstantID"
      fi
    else
      echo "✅ InstantID ControlNet already exists"
    fi
    
    echo ""
    echo "🔄 Restarting ComfyUI..."
    pkill -f "python.*main.py" || pkill -f "python3.*main.py" || true
    sleep 2
    cd "${COMFYUI_PATH}"
    if command -v python3 &> /dev/null; then
      nohup python3 main.py --listen 0.0.0.0 --port 8188 > /dev/null 2>&1 &
    elif command -v python &> /dev/null; then
      nohup python main.py --listen 0.0.0.0 --port 8188 > /dev/null 2>&1 &
    else
      echo "❌ Python not found. Please restart ComfyUI manually"
    fi
    echo "✅ ComfyUI restarted"
    echo ""
    echo "⏳ Waiting 10 seconds for ComfyUI to start..."
    sleep 10
EOF

  echo ""
  echo -e "${GREEN}✅ Installation complete!${NC}"
  echo "Re-running check..."
  echo ""
  exec "$0"  # Re-run the script to check again
fi

exit 1

