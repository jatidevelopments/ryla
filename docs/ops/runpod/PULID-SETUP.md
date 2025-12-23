# PuLID Setup Guide for Character Consistency

This guide explains how to set up PuLID on your ComfyUI pod for face/identity consistency in image generation.

## What is PuLID?

PuLID (Pure and Lightning ID Customization) preserves facial identity from a reference image across different generated images. Unlike LoRA training, it requires no training - just provide a reference face image.

## Prerequisites

- ComfyUI pod running with Z-Image-Turbo models
- SSH access to the pod or ComfyUI Manager installed
- ~3GB additional storage for PuLID models

## Installation Steps

### 1. SSH into Your Pod

```bash
ssh root@<pod-ip> -p <ssh-port>
```

Or use RunPod Web Terminal.

### 2. Install ComfyUI-PuLID Custom Nodes

```bash
cd /workspace/ComfyUI/custom_nodes
git clone https://github.com/cubiq/ComfyUI_PuLID.git
cd ComfyUI_PuLID
pip install -r requirements.txt
```

### 3. Download PuLID Model

```bash
mkdir -p /workspace/ComfyUI/models/pulid
cd /workspace/ComfyUI/models/pulid

# Download PuLID Flux model (~1.2GB)
wget https://huggingface.co/huchenlei/PuLID/resolve/main/pulid_flux_v0.9.1.safetensors
```

### 4. Download InsightFace Models

```bash
mkdir -p /workspace/ComfyUI/models/insightface/models
cd /workspace/ComfyUI/models/insightface/models

# Download antelopev2 face analysis model (~360MB)
wget https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip
unzip antelopev2.zip
rm antelopev2.zip
```

### 5. Download EVA CLIP Model

```bash
mkdir -p /workspace/ComfyUI/models/clip
cd /workspace/ComfyUI/models/clip

# Download EVA CLIP (~700MB)
wget https://huggingface.co/QuanSun/EVA-CLIP/resolve/main/EVA02_CLIP_L_336_psz14_s6B.pt -O eva02_clip_l_14_plus.safetensors
```

### 6. Install ETN_LoadImageBase64 Node (for base64 image input)

```bash
cd /workspace/ComfyUI/custom_nodes
git clone https://github.com/Extraltodeus/LoadImageBase64-ComfyUI.git
```

### 7. Restart ComfyUI

```bash
# If using systemd
systemctl restart comfyui

# Or kill and restart manually
pkill -f "python main.py"
cd /workspace/ComfyUI
python main.py --listen 0.0.0.0 --port 8188
```

## Verify Installation

Check that the nodes are available:

```bash
curl -s "${COMFYUI_POD_URL}/object_info" | python3 -c "
import sys, json
data = json.load(sys.stdin)
nodes = ['PulidFluxModelLoader', 'PulidFluxInsightFaceLoader', 'PulidFluxEvaClipLoader', 'ApplyPulidFlux', 'ETN_LoadImageBase64']
for n in nodes:
    status = '✅' if n in data else '❌'
    print(f'{status} {n}')
"
```

Expected output:
```
✅ PulidFluxModelLoader
✅ PulidFluxInsightFaceLoader
✅ PulidFluxEvaClipLoader
✅ ApplyPulidFlux
✅ ETN_LoadImageBase64
```

## Storage Requirements

| Model | Size | Path |
|-------|------|------|
| pulid_flux_v0.9.1.safetensors | 1.2GB | models/pulid/ |
| antelopev2 | 360MB | models/insightface/models/ |
| eva02_clip_l_14_plus.safetensors | 700MB | models/clip/ |
| **Total** | **~2.3GB** | |

## Usage in RYLA

Once installed, use the `z-image-pulid` workflow:

```typescript
import { buildWorkflow } from '@ryla/business/workflows';

// Generate with face consistency
const workflow = buildWorkflow('z-image-pulid', {
  prompt: 'A beautiful woman in a coffee shop, natural lighting',
  referenceImage: base64ImageData, // Face reference image
  pulidStrength: 0.8,  // How much to preserve the face (0-1)
  width: 1024,
  height: 1024,
});
```

## Troubleshooting

### "PulidFluxModelLoader not found"
- Ensure ComfyUI-PuLID is installed in custom_nodes
- Restart ComfyUI after installation

### "InsightFace model not found"
- Check the antelopev2 folder exists in models/insightface/models/
- Ensure the .onnx files are present inside the folder

### CUDA out of memory
- Use CPU provider for InsightFace: `provider: 'CPU'`
- Reduce image resolution
- Close other GPU processes

### Face not detected
- Ensure reference image shows a clear front-facing face
- Try a higher resolution reference image
- Check InsightFace is loading correctly

## Alternative: Quick Setup Script

Save and run this on your pod:

```bash
#!/bin/bash
# setup-pulid.sh

set -e
echo "Installing PuLID for ComfyUI..."

cd /workspace/ComfyUI/custom_nodes

# Clone PuLID
if [ ! -d "ComfyUI_PuLID" ]; then
  git clone https://github.com/cubiq/ComfyUI_PuLID.git
  pip install -r ComfyUI_PuLID/requirements.txt
fi

# Clone LoadImageBase64
if [ ! -d "LoadImageBase64-ComfyUI" ]; then
  git clone https://github.com/Extraltodeus/LoadImageBase64-ComfyUI.git
fi

# Download models
mkdir -p /workspace/ComfyUI/models/pulid
mkdir -p /workspace/ComfyUI/models/insightface/models
mkdir -p /workspace/ComfyUI/models/clip

cd /workspace/ComfyUI/models/pulid
[ ! -f pulid_flux_v0.9.1.safetensors ] && wget https://huggingface.co/huchenlei/PuLID/resolve/main/pulid_flux_v0.9.1.safetensors

cd /workspace/ComfyUI/models/insightface/models
[ ! -d antelopev2 ] && wget https://huggingface.co/MonsterMMORPG/tools/resolve/main/antelopev2.zip && unzip antelopev2.zip && rm antelopev2.zip

cd /workspace/ComfyUI/models/clip
[ ! -f eva02_clip_l_14_plus.safetensors ] && wget https://huggingface.co/QuanSun/EVA-CLIP/resolve/main/EVA02_CLIP_L_336_psz14_s6B.pt -O eva02_clip_l_14_plus.safetensors

echo "✅ PuLID installation complete! Restart ComfyUI to use."
```

## Related

- [ComfyUI-PuLID GitHub](https://github.com/cubiq/ComfyUI_PuLID)
- [PuLID Paper](https://arxiv.org/abs/2404.16742)
- [ADR-003: ComfyUI Pod Decision](../../../docs/decisions/ADR-003-comfyui-pod-over-serverless.md)

