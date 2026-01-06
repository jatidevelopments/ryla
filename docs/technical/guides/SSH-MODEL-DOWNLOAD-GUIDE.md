# SSH Model Download Guide for ComfyUI

> **Date**: 2025-12-10  
> **Purpose**: Download all required models via SSH on RunPod ComfyUI pod

---

## Prerequisites

### Option 1: SSH with Key (Recommended)

1. **Generate SSH key** (if you don't have one):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

2. **Add public key to RunPod**:
   - Go to RunPod Console → Settings → SSH Keys
   - Add your public key: `cat ~/.ssh/id_ed25519.pub`

3. **Connect via SSH**:
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

### Option 2: Web Terminal (Easier)

1. Go to RunPod Console → Pod Details
2. Enable "Web Terminal"
3. Access terminal directly in browser

---

## Quick Start

### Method 1: Run Download Script

1. **Copy script to pod** (via SCP or paste):
```bash
# From your local machine
scp -P 41001 -i ~/.ssh/id_ed25519 scripts/download-comfyui-models.sh root@87.197.126.165:/tmp/
```

2. **SSH into pod**:
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

3. **Run script**:
```bash
chmod +x /tmp/download-comfyui-models.sh
/tmp/download-comfyui-models.sh
```

### Method 2: Manual Download

SSH into pod and run commands manually:

```bash
# Navigate to ComfyUI models directory
cd /workspace/ComfyUI/models  # or /root/ComfyUI/models

# Create directories
mkdir -p checkpoints vae controlnet ipadapter clip_vision loras

# Download models (examples)
cd checkpoints
wget https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors -O z-image-turbo.safetensors

cd ../vae
wget https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/vae.safetensors -O flux-vae.safetensors

# ... (see script for all downloads)
```

---

## Required Models

### Checkpoints (Base Models)

| Model | Size | URL | Priority |
|-------|------|-----|----------|
| **Flux Dev (uncensored)** | ~23GB | CivitAI/HuggingFace | ⭐⭐⭐ Critical |
| **Z-Image-Turbo** | ~12GB | HuggingFace | ⭐⭐⭐ Critical |

### VAE Models

| Model | Size | URL | Priority |
|-------|------|-----|----------|
| **Flux VAE** | ~335MB | HuggingFace | ⭐⭐⭐ Critical |

### ControlNet Models

| Model | Size | URL | Priority |
|-------|------|-----|----------|
| **ControlNet OpenPose** | ~1.6GB | HuggingFace | ⭐⭐ High |
| **Z-Image ControlNet** | ~12GB | HuggingFace | ⭐⭐ High |

### IPAdapter Models (Face Swap)

| Model | Size | URL | Priority |
|-------|------|-----|----------|
| **IPAdapter FaceID Plus** | ~1.2GB | HuggingFace | ⭐⭐⭐ Critical |
| **IPAdapter FaceID Plus V2** | ~1.2GB | HuggingFace | ⭐⭐⭐ Critical |
| **CLIP Vision** | ~200MB | HuggingFace | ⭐⭐⭐ Critical |

### PuLID Models (Face Consistency)

| Model | Size | URL | Priority |
|-------|------|-----|----------|
| **PuLID** | ~1.5GB | HuggingFace | ⭐⭐ High |

---

## Download URLs

### Flux Dev (Uncensored)

**⚠️ Manual Download Required**

- **CivitAI**: Search for "FLUX.1-dev uncensored"
- **HuggingFace**: `huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir /workspace/ComfyUI/models/checkpoints`

### Z-Image-Turbo

```bash
cd /workspace/ComfyUI/models/checkpoints
wget https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors -O z-image-turbo.safetensors
```

### Flux VAE

```bash
cd /workspace/ComfyUI/models/vae
wget https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/vae.safetensors -O flux-vae.safetensors
```

### ControlNet OpenPose

```bash
cd /workspace/ComfyUI/models/controlnet
wget https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth -O controlnet-openpose.pth
```

### Z-Image ControlNet

```bash
cd /workspace/ComfyUI/models/controlnet
wget https://huggingface.co/alibaba-pai/Z-Image-ControlNet/resolve/main/z_image_controlnet.safetensors -O z-image-controlnet.safetensors
```

### IPAdapter FaceID Plus

```bash
cd /workspace/ComfyUI/models/ipadapter
wget https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plus_sd15.bin -O ip-adapter-faceid-plus.bin
```

### IPAdapter FaceID Plus V2

```bash
cd /workspace/ComfyUI/models/ipadapter
wget https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plusv2_sd15.bin -O ip-adapter-faceid-plusv2.bin
```

### CLIP Vision

```bash
cd /workspace/ComfyUI/models/clip_vision
wget https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/models/image_encoder/model.safetensors -O clip-vision.safetensors
```

### PuLID

```bash
cd /workspace/ComfyUI/models/checkpoints
wget https://huggingface.co/pulid/pulid/resolve/main/pulid.safetensors -O pulid.safetensors
```

---

## Verification

After downloading, verify models are in place:

```bash
cd /workspace/ComfyUI/models

echo "=== Checkpoints ==="
ls -lh checkpoints/

echo "=== VAE ==="
ls -lh vae/

echo "=== ControlNet ==="
ls -lh controlnet/

echo "=== IPAdapter ==="
ls -lh ipadapter/

echo "=== CLIP Vision ==="
ls -lh clip_vision/
```

---

## Troubleshooting

### SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
1. Verify SSH key is added to RunPod account
2. Check key path: `-i ~/.ssh/id_ed25519`
3. Try web terminal instead

### Download Failed

**Error**: `Connection timeout` or `404 Not Found`

**Solution**:
1. Check internet connection on pod
2. Verify URLs are still valid
3. Try downloading from HuggingFace directly using `huggingface-cli`

### Out of Disk Space

**Error**: `No space left on device`

**Solution**:
1. Check disk usage: `df -h`
2. Clean up old models: `rm /workspace/ComfyUI/models/checkpoints/old-model.safetensors`
3. Consider mounting network volume for persistent storage

### Models Not Appearing in ComfyUI

**Solution**:
1. Verify models are in correct directory: `/workspace/ComfyUI/models/`
2. Check file permissions: `chmod 644 /workspace/ComfyUI/models/checkpoints/*.safetensors`
3. Restart ComfyUI (refresh browser)

---

## Using HuggingFace CLI (Alternative)

If `wget` fails, use HuggingFace CLI:

```bash
# Install huggingface-cli
pip install huggingface-hub

# Download models
huggingface-cli download Tongyi-MAI/Z-Image-Turbo --local-dir /workspace/ComfyUI/models/checkpoints/z-image-turbo
huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir /workspace/ComfyUI/models/checkpoints/flux-dev
```

---

## Next Steps

After downloading models:

1. ✅ Verify models in ComfyUI Model Library
2. ⏭️ Test base image generation (Flux Dev)
3. ⏭️ Test Z-Image-Turbo generation
4. ⏭️ Test NSFW support (critical)
5. ⏭️ Test face swap (IPAdapter)
6. ⏭️ Test character sheets (PuLID + ControlNet)

---

## References

- ComfyUI Pod Info: `docs/technical/COMFYUI-POD-INFO.md`
- Testing Guide: `docs/technical/COMFYUI-TESTING-GUIDE.md`
- Download Script: `scripts/download-comfyui-models.sh`

---

## Tags

#ssh #models #download #comfyui #runpod #ep-005

