# RunPod Setup for Dream Companion Team

> **Status**: Pending Account Funding  
> **Last Updated**: 2025-12-10  
> **Team**: Dream Companion (ID: `cm03tl0ve0002l408rxwspxk7`) ✅ Verified Access

## Prerequisites

- RunPod account with API key configured
- **Minimum $5 balance** for Network Volume
- **Sufficient credits** for Pod deployment (varies by GPU type)

## Infrastructure to Deploy

### 1. Network Volume: `ryla-models-dream-companion`

**Purpose**: Persistent storage for AI models

**Configuration**:
- Name: `ryla-models-dream-companion`
- Size: 200GB
- Data Center: US-OR-1 (or preferred location)

**Command** (via MCP or Console):
```bash
# Once account has $5+ balance
Create network volume: ryla-models-dream-companion, 200GB, US-OR-1
```

### 2. ComfyUI Pod: `ryla-comfyui-dream-companion`

**Purpose**: Visual workflow building and debugging

**Configuration**:
- Name: `ryla-comfyui-dream-companion`
- Image: `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel` (or ComfyUI-specific image)
- GPU: NVIDIA GeForce RTX 3090 (or RTX 4090 for better performance)
- Container Disk: 50GB
- Network Volume: Mount `ryla-models-dream-companion`
- Ports: `8188/http` (ComfyUI default)
- Cloud Type: SECURE

**Alternative**: Use RunPod's "Better Comfy Slim" template if available

**Command** (via MCP or Console):
```bash
# Once account has sufficient credits
Create pod with:
- Name: ryla-comfyui-dream-companion
- Image: runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel
- GPU: NVIDIA GeForce RTX 3090
- Container Disk: 50GB
- Ports: 8188/http
- Network Volume: ryla-models-dream-companion (mount)
```

### 3. Serverless Endpoint: `ryla-image-generation`

**Purpose**: Production image generation

**Configuration**:
- Name: `ryla-image-generation`
- Template: Custom Docker image (to be created)
- GPU: NVIDIA GeForce RTX 3090
- Workers: Min 0, Max 2 (scale to 0 when idle)
- Network Volume: Mount `ryla-models-dream-companion`

**Note**: Serverless endpoint requires a template first. We'll create the template after the pod is set up.

## Setup Steps

### Step 1: Add Funds to RunPod Account

1. Go to RunPod Console → Billing
2. Add minimum $10 (recommended for initial setup)
3. Verify balance shows in account

### Step 2: Create Network Volume

**Via RunPod Console**:
1. Navigate to Network Volumes → Create
2. Name: `ryla-models-dream-companion`
3. Size: 200GB
4. Data Center: US-OR-1
5. Create

**Via MCP** (once funded):
```bash
Create network volume: ryla-models-dream-companion, 200GB, US-OR-1
```

### Step 3: Deploy ComfyUI Pod

**Via RunPod Console**:
1. Navigate to Pods → Deploy New Pod
2. Search for "Better Comfy Slim" template (if available)
   - OR use custom image: `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel`
3. Configure:
   - Name: `ryla-comfyui-dream-companion`
   - GPU: RTX 3090 or RTX 4090
   - Container Disk: 50GB
   - Network Volume: Select `ryla-models-dream-companion`
   - Ports: Add `8188/http`
4. Deploy On-Demand
5. Wait for initialization (~5-10 minutes)

**Access ComfyUI**:
- Once pod is running, click on HTTP link (port 8188)
- ComfyUI web interface will be available

### Step 4: Download Models to Network Volume

**Via ComfyUI Pod**:
1. SSH into pod or use ComfyUI Manager
2. Download models to Network Volume (mounted at `/workspace/models` or similar):
   - FLUX.1-schnell: `models/checkpoints/flux1-schnell.safetensors`
   - PuLID: `models/pulid/pulid_model.safetensors`
   - ControlNet: `models/controlnet/controlnet-openpose.safetensors`
   - IPAdapter FaceID: `models/ipadapter/ip-adapter-faceid.safetensors`

**Via Model Manager** (if available in ComfyUI):
- Use ComfyUI Manager plugin
- Download pre-configured model packages
- Models automatically saved to Network Volume

### Step 5: Create Serverless Endpoint Template

**Create Template** (for Serverless Endpoint):
1. Go to Templates → Create Template
2. Name: `ryla-image-generation-handler`
3. Docker Image: Custom Python image with:
   - Base: `python:3.10`
   - Install: `diffusers`, `torch`, `transformers`, `accelerate`
   - Handler script for image generation
4. Save template

**Create Serverless Endpoint**:
1. Go to Serverless → Create Endpoint
2. Name: `ryla-image-generation`
3. Template: `ryla-image-generation-handler`
4. GPU: RTX 3090
5. Network Volume: `ryla-models-dream-companion`
6. Workers: Min 0, Max 2
7. Deploy

## Current Status

### Blocked ⚠️
- **Network Volume**: Requires $5 minimum balance
- **ComfyUI Pod**: Requires sufficient credits for GPU rental
- **Account**: Needs funding before deployment

### Ready ✅
- Codebase structure complete
- API integration ready
- Workflow builders implemented
- Configuration documented

## Next Actions

1. **Add funds to RunPod account** (minimum $10 recommended)
2. **Create Network Volume** (200GB)
3. **Deploy ComfyUI Pod** (RTX 3090)
4. **Download models** to Network Volume
5. **Create Serverless Endpoint** for production

## Cost Estimates

| Resource | Cost | Notes |
|----------|------|-------|
| Network Volume (200GB) | ~$0.20/month | One-time setup |
| ComfyUI Pod (RTX 3090) | $0.22/hour | Only when running |
| Serverless Endpoint | $0.22/hour | Only when processing |
| Idle Serverless | $0/hour | Scales to 0 automatically |

**Recommendation**: 
- Keep ComfyUI Pod stopped when not debugging (save costs)
- Serverless endpoints scale to 0 automatically
- Network volume persists (low monthly cost)

## Verification

Once deployed, verify:

1. **Network Volume**:
   - Visible in RunPod Console → Network Volumes
   - Size: 200GB
   - Status: Active

2. **ComfyUI Pod**:
   - Status: Running
   - HTTP link accessible (port 8188)
   - ComfyUI interface loads

3. **Models**:
   - Models visible in ComfyUI interface
   - Models accessible from Network Volume

4. **Serverless Endpoint**:
   - Endpoint visible in Console
   - Can accept jobs
   - Network Volume mounted

## Troubleshooting

### "Account balance too low"
- **Solution**: Add funds to RunPod account

### "Network Volume creation failed"
- **Solution**: Ensure $5+ balance in account

### "Pod deployment failed"
- **Solution**: Check GPU availability, try different data center

### "ComfyUI not accessible"
- **Solution**: Check pod status, verify port 8188 is open, check HTTP link

## References

- [RunPod Documentation](https://docs.runpod.io)
- [ComfyUI on RunPod Guide](https://docs.runpod.io/tutorials/pods/comfyui)
- [RunPod Pricing](https://www.runpod.io/pricing)

