# RunPod Serverless Deployment for Flux Dev & Z-Image-Turbo

> **Date**: 2025-12-10  
> **Status**: Implementation Complete  
> **Purpose**: Deploy Flux Dev and Z-Image-Turbo as serverless endpoints on RunPod

---

## Overview

**Serverless endpoints are perfect for MVP** because:
- ✅ **Pay-per-use**: Only pay when processing (scales to 0 when idle)
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Cost-effective**: No idle costs
- ✅ **Easy integration**: Simple API calls from our backend

---

## Files Created

### Handler Scripts
- `handlers/flux-dev-handler.py` - Flux Dev serverless handler
- `handlers/z-image-turbo-handler.py` - Z-Image-Turbo serverless handler

### Dockerfiles
- `docker/flux-dev-handler/Dockerfile` - Flux Dev Docker image
- `docker/z-image-turbo-handler/Dockerfile` - Z-Image-Turbo Docker image

### Updated Services
- `apps/api/src/modules/runpod/services/runpod.service.ts` - Added serverless methods

---

## Architecture

```
RYLA Backend → RunPodService → Serverless Endpoints
                                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
            Flux Dev Endpoint          Z-Image-Turbo Endpoint
            (Primary)                  (Test NSFW)
```

---

## Deployment Steps

### Step 1: Build Docker Images

```bash
# Build Flux Dev handler
cd docker/flux-dev-handler
docker build -t ryla-flux-dev-handler:latest -f Dockerfile ../..

# Build Z-Image-Turbo handler
cd ../z-image-turbo-handler
docker build -t ryla-z-image-turbo-handler:latest -f Dockerfile ../..

# Push to Docker Hub (replace with your registry)
docker tag ryla-flux-dev-handler:latest your-registry/ryla-flux-dev-handler:latest
docker push your-registry/ryla-flux-dev-handler:latest

docker tag ryla-z-image-turbo-handler:latest your-registry/ryla-z-image-turbo-handler:latest
docker push your-registry/ryla-z-image-turbo-handler:latest
```

---

### Step 2: Create RunPod Templates

**Via RunPod Console**:
1. Go to Templates → Create Template
2. **Flux Dev Template**:
   - Name: `ryla-flux-dev-handler`
   - Docker Image: `your-registry/ryla-flux-dev-handler:latest`
   - Container Disk: 50GB
   - Environment Variables: (if needed)

3. **Z-Image-Turbo Template**:
   - Name: `ryla-z-image-turbo-handler`
   - Docker Image: `your-registry/ryla-z-image-turbo-handler:latest`
   - Container Disk: 50GB

---

### Step 3: Create Serverless Endpoints

**Via RunPod Console**:
1. Go to Serverless → Create Endpoint

2. **Flux Dev Endpoint**:
   - Name: `ryla-flux-dev-serverless`
   - Template: `ryla-flux-dev-handler`
   - GPU: RTX 3090 or RTX 4090
   - Network Volume: `ryla-models-dream-companion` (mount at `/workspace/models`)
   - Workers: Min 0, Max 2
   - Timeout: 300 seconds

3. **Z-Image-Turbo Endpoint**:
   - Name: `ryla-z-image-turbo-serverless`
   - Template: `ryla-z-image-turbo-handler`
   - GPU: RTX 3090 or RTX 4090
   - Network Volume: `ryla-models-dream-companion` (mount at `/workspace/models`)
   - Workers: Min 0, Max 2
   - Timeout: 180 seconds

---

### Step 4: Download Models to Network Volume

**Via ComfyUI Pod or SSH**:
1. Access network volume (mounted at `/workspace/models`)
2. Download models:
   ```bash
   # Flux Dev
   wget -O /workspace/models/checkpoints/flux1-dev.safetensors <URL>
   
   # Z-Image-Turbo
   wget -O /workspace/models/checkpoints/z-image-turbo.safetensors <URL>
   
   # PuLID, ControlNet, IPAdapter
   # ... (download to respective folders)
   ```

---

## Environment Variables

**File**: `.env` or `apps/api/env.example`

```bash
# RunPod
RUNPOD_API_KEY=your-api-key
RUNPOD_ENDPOINT_FLUX_DEV=your-flux-endpoint-id
RUNPOD_ENDPOINT_Z_IMAGE_TURBO=your-z-image-endpoint-id
```

---

## Usage Examples

### Generate Base Images

```typescript
// Using Flux Dev
const jobId = await runpodService.generateBaseImages({
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes",
  nsfw: false,
  seed: 12345
});

// Using Z-Image-Turbo (faster)
const jobId = await runpodService.generateBaseImages({
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes",
  nsfw: false,
  useZImage: true
});

// Check status
const status = await runpodService.getJobStatus(jobId);
```

### Generate Face Swap

```typescript
const jobId = await runpodService.generateFaceSwap({
  baseImageUrl: "https://...",
  prompt: "Woman in a red dress, standing in a garden",
  nsfw: false
});
```

### Generate Final Image with LoRA

```typescript
const jobId = await runpodService.generateFinal({
  prompt: "Woman in a red dress, standing in a garden",
  loraPath: "/workspace/models/loras/character-123.safetensors",
  nsfw: false
});
```

### Generate Character Sheet

```typescript
const jobId = await runpodService.generateCharacterSheet({
  baseImageUrl: "https://...",
  angles: ["front", "side", "3/4", "back"],
  nsfw: false
});
```

---

## Cost Estimates

### Serverless Endpoint Costs

**Per Request**:
- **Cold Start**: ~10-30 seconds (model loading)
- **Warm Request**: ~5-15 seconds (Flux Dev), ~3-7 seconds (Z-Image-Turbo)
- **GPU Time**: ~$0.22/hour (RTX 3090)

**Example Costs**:
- Base image (3 images): ~$0.01-0.02 (Flux Dev), ~$0.005-0.01 (Z-Image-Turbo)
- Face swap (1 image): ~$0.005-0.01
- Final generation (1 image): ~$0.005-0.01

**Monthly (100 characters + 10k images)**:
- Flux Dev: ~$500-700
- Z-Image-Turbo: ~$300-500 (if used)
- **Total**: ~$500-700/month (using Flux Dev primarily)

**Benefits**:
- ✅ Scales to 0 when idle (no idle costs)
- ✅ Auto-scales with traffic
- ✅ Pay only for actual usage

---

## Testing Plan

### Week 1: Infrastructure

1. **Deploy Serverless Endpoints**
   - Create templates
   - Create endpoints
   - Verify network volume mounting

2. **Test Model Loading**
   - Verify models accessible from endpoints
   - Test cold start times
   - Test warm request times

3. **Test Basic Generation**
   - Test Flux Dev base image generation
   - Test Z-Image-Turbo base image generation
   - Compare quality and speed

### Week 2: Feature Testing

4. **Test NSFW Support**
   - Test Flux Dev NSFW (should work)
   - Test Z-Image-Turbo NSFW (critical test)
   - Document results

5. **Test Face Swap**
   - Test IPAdapter FaceID integration
   - Verify face consistency

6. **Test Character Sheets**
   - Test PuLID + ControlNet
   - Verify 7-10 image generation

### Week 3: Integration

7. **Backend Integration**
   - Update services to use RunPodService
   - Test API calls
   - Error handling

8. **End-to-End Testing**
   - Full character creation flow
   - Image generation flow
   - Cost monitoring

---

## Next Steps

1. ✅ **Create Docker Handlers** - Done
2. ✅ **Create Dockerfiles** - Done
3. ✅ **Update RunPodService** - Done
4. **Build and Push Docker Images** - Next
5. **Create RunPod Templates** - Next
6. **Create Serverless Endpoints** - Next
7. **Download Models to Network Volume** - Next
8. **Test Basic Generation** - Next

---

## References

- [RunPod Serverless Docs](https://docs.runpod.io/serverless)
- [RunPod Python SDK](https://github.com/runpod/runpod-python)
- [Flux Dev Model](https://huggingface.co/black-forest-labs/FLUX.1-dev)
- [Z-Image-Turbo Model](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)

---

## Tags

#runpod #serverless #flux-dev #z-image-turbo #deployment #mvp #ep-001 #ep-005

