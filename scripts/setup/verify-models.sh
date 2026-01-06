#!/bin/bash
# Model Verification Script for RunPod Network Volume
# Verifies all models are downloaded and in correct locations

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== RYLA Model Verification Script ===${NC}\n"

# Base directory
MODELS_BASE="/workspace/models"
CHECKPOINTS_DIR="${MODELS_BASE}/checkpoints"
PULID_DIR="${MODELS_BASE}/pulid"
CONTROLNET_DIR="${MODELS_BASE}/controlnet"
IPADAPTER_DIR="${MODELS_BASE}/ipadapter"

# Expected models
declare -A REQUIRED_MODELS=(
    ["${CHECKPOINTS_DIR}/flux1-schnell.safetensors"]="~6GB"
    ["${CHECKPOINTS_DIR}/z-image-turbo.safetensors"]="~6GB"
)

declare -A OPTIONAL_MODELS=(
    ["${PULID_DIR}/pulid_model.safetensors"]="~1.1GB"
    ["${CONTROLNET_DIR}/controlnet-openpose.pth"]="~1.6GB"
    ["${CONTROLNET_DIR}/controlnet-openpose.safetensors"]="~1.6GB"
    ["${IPADAPTER_DIR}/ip-adapter-faceid.safetensors"]="~1.2GB"
    ["${IPADAPTER_DIR}/ip-adapter-faceid-plusv2_sd15.bin"]="~1.2GB"
)

# Check network volume mount
echo -e "${YELLOW}1. Checking Network Volume Mount...${NC}"
if mount | grep -q "mfs.*on /workspace"; then
    echo -e "${GREEN}✓ Network volume mounted at /workspace${NC}"
    df -h /workspace | tail -1
else
    echo -e "${RED}✗ Network volume not found at /workspace${NC}"
    echo "   Expected: mfs#euro-2.runpod.net:9421"
fi
echo ""

# Check directory structure
echo -e "${YELLOW}2. Checking Directory Structure...${NC}"
for dir in "$CHECKPOINTS_DIR" "$PULID_DIR" "$CONTROLNET_DIR" "$IPADAPTER_DIR"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${YELLOW}⚠${NC} $dir (not found, will be created if needed)"
        mkdir -p "$dir" 2>/dev/null || true
    fi
done
echo ""

# Check required models
echo -e "${YELLOW}3. Checking Required Models (MVP)...${NC}"
REQUIRED_MISSING=0
for model in "${!REQUIRED_MODELS[@]}"; do
    expected_size="${REQUIRED_MODELS[$model]}"
    if [ -f "$model" ]; then
        actual_size=$(du -h "$model" | cut -f1)
        file_size=$(stat -f%z "$model" 2>/dev/null || stat -c%s "$model" 2>/dev/null)
        file_size_gb=$(echo "scale=2; $file_size / 1073741824" | bc 2>/dev/null || echo "?")
        echo -e "${GREEN}✓${NC} $(basename "$model")"
        echo "    Location: $model"
        echo "    Size: ${actual_size} (${file_size_gb} GB)"
        echo "    Expected: ${expected_size}"
    else
        echo -e "${RED}✗${NC} $(basename "$model") - MISSING"
        echo "    Expected: $model"
        echo "    Expected size: ${expected_size}"
        REQUIRED_MISSING=$((REQUIRED_MISSING + 1))
    fi
    echo ""
done

# Check optional models
echo -e "${YELLOW}4. Checking Optional Models (Advanced Features)...${NC}"
OPTIONAL_FOUND=0
for model in "${!OPTIONAL_MODELS[@]}"; do
    expected_size="${OPTIONAL_MODELS[$model]}"
    if [ -f "$model" ]; then
        actual_size=$(du -h "$model" | cut -f1)
        file_size=$(stat -f%z "$model" 2>/dev/null || stat -c%s "$model" 2>/dev/null)
        file_size_gb=$(echo "scale=2; $file_size / 1073741824" | bc 2>/dev/null || echo "?")
        echo -e "${GREEN}✓${NC} $(basename "$model")"
        echo "    Location: $model"
        echo "    Size: ${actual_size} (${file_size_gb} GB)"
        OPTIONAL_FOUND=$((OPTIONAL_FOUND + 1))
    fi
done

if [ $OPTIONAL_FOUND -eq 0 ]; then
    echo -e "${YELLOW}  (No optional models found - this is OK for MVP)${NC}"
fi
echo ""

# Summary
echo -e "${YELLOW}5. Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Checkpoints summary
echo -e "\n${YELLOW}Checkpoints Directory:${NC}"
if [ -d "$CHECKPOINTS_DIR" ]; then
    echo "Files:"
    ls -lh "$CHECKPOINTS_DIR" 2>/dev/null | grep -v "^total" | awk '{print "  " $9 " (" $5 ")"}' || echo "  (empty)"
    echo ""
    echo "Total size:"
    du -sh "$CHECKPOINTS_DIR" 2>/dev/null || echo "  0"
else
    echo "  Directory not found"
fi

# PuLID summary
echo -e "\n${YELLOW}PuLID Directory:${NC}"
if [ -d "$PULID_DIR" ]; then
    echo "Files:"
    ls -lh "$PULID_DIR" 2>/dev/null | grep -v "^total" | awk '{print "  " $9 " (" $5 ")"}' || echo "  (empty)"
    echo ""
    echo "Total size:"
    du -sh "$PULID_DIR" 2>/dev/null || echo "  0"
else
    echo "  Directory not found"
fi

# ControlNet summary
echo -e "\n${YELLOW}ControlNet Directory:${NC}"
if [ -d "$CONTROLNET_DIR" ]; then
    echo "Files:"
    ls -lh "$CONTROLNET_DIR" 2>/dev/null | grep -v "^total" | awk '{print "  " $9 " (" $5 ")"}' || echo "  (empty)"
    echo ""
    echo "Total size:"
    du -sh "$CONTROLNET_DIR" 2>/dev/null || echo "  0"
else
    echo "  Directory not found"
fi

# IPAdapter summary
echo -e "\n${YELLOW}IPAdapter Directory:${NC}"
if [ -d "$IPADAPTER_DIR" ]; then
    echo "Files:"
    ls -lh "$IPADAPTER_DIR" 2>/dev/null | grep -v "^total" | awk '{print "  " $9 " (" $5 ")"}' || echo "  (empty)"
    echo ""
    echo "Total size:"
    du -sh "$IPADAPTER_DIR" 2>/dev/null || echo "  0"
else
    echo "  Directory not found"
fi

# Overall summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "\n${YELLOW}Overall Status:${NC}"

if [ $REQUIRED_MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All required models are present${NC}"
    echo -e "${GREEN}✓ Ready for MVP deployment${NC}"
else
    echo -e "${RED}✗ Missing $REQUIRED_MISSING required model(s)${NC}"
    echo -e "${YELLOW}⚠ Please download missing models before deployment${NC}"
fi

echo ""
echo "Total models directory size:"
du -sh "$MODELS_BASE" 2>/dev/null || echo "  Unable to calculate"

echo ""
echo -e "${GREEN}Verification complete!${NC}"

