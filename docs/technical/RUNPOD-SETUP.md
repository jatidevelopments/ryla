# RunPod Setup Guide

> **Status**: In Progress  
> **Last Updated**: 2025-12-10

## Prerequisites

- RunPod account with API key
- **Minimum $5 balance** required for network volumes
- API key configured in environment: `RUNPOD_API_KEY`

## Infrastructure Setup

### 1. Network Volume (Model Storage)

**Purpose**: Persistent storage for AI models (Flux Dev, PuLID, ControlNet, etc.)

**Status**: ⚠️ Requires $5 minimum balance

```bash
# Create via MCP or RunPod Console
# Name: ryla-models
# Size: 200GB (recommended)
# Data Center: US-OR-1 (or preferred location)
```

**Models to Download**:
- Flux Dev (uncensored): `flux1-dev.safetensors`
- PuLID: `pulid_model.safetensors`
- ControlNet models: `controlnet-openpose.safetensors`
- IPAdapter FaceID: `ip-adapter-faceid.safetensors`

### 2. ComfyUI Pod (Visualization/Debugging)

**Purpose**: Visual workflow building and debugging

**Template**: "ComfyFlow ComfyUI" or custom

**Configuration**:
- GPU: RTX 3090 or RTX 4090
- Container Disk: 50GB
- Network Volume: Mount `ryla-models` volume
- Ports: `8188/http` (ComfyUI default)

**Access**:
- HTTP link provided by RunPod
- Access ComfyUI web interface
- Build workflows visually
- Export workflows as JSON

### 3. Serverless Endpoint (Production)

**Purpose**: Automated image generation execution

**Configuration**:
- Template: Custom Docker image with Python + dependencies
- GPU: RTX 3090 or RTX 4090
- Network Volume: Mount `ryla-models` volume
- Workers: Min 0, Max 2 (scale to 0 when idle)

**Handler Requirements**:
- Accept workflow JSON or parameters
- Execute image generation
- Return image URLs
- Handle errors gracefully

## Setup Steps

### Step 1: Create Network Volume

```bash
# Via RunPod Console or MCP
# Ensure $5+ balance in account
```

### Step 2: Deploy ComfyUI Pod

1. Go to RunPod Console → Pods → Deploy New Pod
2. Search for "ComfyFlow ComfyUI" template
3. Select GPU type (RTX 3090/4090)
4. Mount network volume `ryla-models`
5. Deploy and wait for startup
6. Access via HTTP link

### Step 3: Download Models

**Option A: Via Model Manager (Recommended)**
- Use Model Manager tool in ComfyUI Pod
- Download pre-configured model packages
- Models automatically placed in correct directories

**Option B: Manual Download**
- SSH into ComfyUI Pod
- Download models to correct folders:
  ```
  models/checkpoints/flux1-dev.safetensors
  models/pulid/pulid_model.safetensors
  models/controlnet/controlnet-openpose.safetensors
  ```

### Step 4: Create Serverless Endpoint

1. Go to RunPod Console → Serverless → Create Endpoint
2. Create custom template with:
   - Base image: Python 3.10+
   - Install: diffusers, torch, transformers
   - Handler script for image generation
3. Configure:
   - GPU type: RTX 3090/4090
   - Network volume: `ryla-models`
   - Workers: Min 0, Max 2
4. Deploy and test

## Model Management

### Required Models

| Model | Location | Size | Purpose |
|-------|----------|------|---------|
| Flux Dev | `models/checkpoints/` | ~24GB | Base image generation |
| PuLID | `models/pulid/` | ~2GB | Face consistency |
| ControlNet OpenPose | `models/controlnet/` | ~1.5GB | Pose control |
| IPAdapter FaceID | `models/ipadapter/` | ~500MB | Face swap |

### Model Download URLs

**Flux Dev (Uncensored)**:
- HuggingFace: `black-forest-labs/FLUX.1-dev`
- Or CivitAI for uncensored variants

**PuLID**:
- HuggingFace: `yisol/IDM-VTON` (includes PuLID)

**ControlNet**:
- HuggingFace: Various ControlNet models

**IPAdapter FaceID**:
- HuggingFace: `h94/IP-Adapter-FaceID`

## Cost Estimates

| Resource | Cost | Notes |
|----------|------|-------|
| Network Volume (200GB) | ~$0.20/month | Storage cost |
| ComfyUI Pod (RTX 3090) | $0.22/hour | Only when running |
| Serverless Endpoint | $0.22/hour | Only when processing |
| Idle Serverless | $0/hour | Scales to 0 when idle |

**Recommendation**: 
- Keep ComfyUI Pod stopped when not debugging
- Serverless endpoints scale to 0 automatically
- Network volume persists (low cost)

## Troubleshooting

### Network Volume Creation Fails
- **Error**: "You must have at least $5 in your account"
- **Solution**: Add funds to RunPod account

### Models Not Found
- **Issue**: ComfyUI can't find models
- **Solution**: Verify models in Network Volume, check mount path

### Serverless Endpoint Timeout
- **Issue**: Jobs timing out
- **Solution**: Increase timeout, check handler script

## Next Steps

1. ✅ Create Network Volume (requires $5 balance)
2. ✅ Deploy ComfyUI Pod
3. ✅ Download required models
4. ✅ Create Serverless Endpoint
5. ✅ Test connectivity
6. ✅ Build first workflow in ComfyUI
7. ✅ Implement in codebase

## References

- [RunPod Documentation](https://docs.runpod.io)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [Model Manager for ComfyUI](https://weirdwonderfulai.art/model-manager-for-comfyui/)

