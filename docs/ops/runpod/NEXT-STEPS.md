# RunPod Setup - Next Steps

> **Status**: GHCR images built ✅ | Models downloaded ✅  
> **Next**: Verify endpoints → Test → Integrate

---

## ✅ Completed

- [x] Docker images built and pushed to GHCR
- [x] Models downloaded to network volume:
  - `flux1-schnell.safetensors` (required)
  - `z-image-turbo` directory (required)
  - `pulid_flux_v0.9.1.safetensors` (optional)
  - ControlNet, IPAdapter (optional)

---

## 🔍 Step 1: Verify Endpoint Configuration

### 1.1 Check Network Volume Attachment

**RunPod Console** → Serverless → Endpoints:

1. **Flux Endpoint** (`jpcxjab2zpro19`):
   - Open `ryla-prod-guarded-flux-dev-endpoint`
   - Verify **Network Volume** = `ryla-models-dream-companion` (`xeqfzsy4k7`)
   - If missing → Attach and **Save Endpoint**

2. **Z-Image-Turbo Endpoint** (`xqs8k7yhabwh0k`):
   - Open `ryla-prod-guarded-z-image-turbo-endpoint`
   - Verify **Network Volume** = `ryla-models-dream-companion` (`xeqfzsy4k7`)
   - If missing → Attach and **Save Endpoint**

### 1.2 Verify Docker Images

**RunPod Console** → Templates:

1. **Flux Template** (`jx2h981xwv`):
   - Open `ryla-prod-guarded-flux-dev-handler`
   - Verify **Docker Image** = `ghcr.io/jatidevelopments/ryla-prod-guarded-flux-dev-handler:latest`
   - If outdated → Update to `:latest` and **Save Template**

2. **Z-Image-Turbo Template** (`x1ua87uhrs`):
   - Open `ryla-prod-guarded-z-image-turbo-handler`
   - Verify **Docker Image** = `ghcr.io/jatidevelopments/ryla-prod-guarded-z-image-turbo-handler:latest`
   - If outdated → Update to `:latest` and **Save Template**

---

## 🧪 Step 2: Test Endpoints

### 2.1 Test Flux Endpoint

**RunPod Console** → Serverless → Endpoints → `ryla-prod-guarded-flux-dev-endpoint` → **Test Endpoint**

**Test Input**:
```json
{
  "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait",
  "nsfw": false,
  "num_images": 1,
  "seed": 42
}
```

**Expected**:
- ✅ Job status: `COMPLETED`
- ✅ Response contains `image` (base64) or `images` array
- ✅ Cold start: ~30-60s (first request)
- ✅ Warm request: ~10-20s

**If errors**:
- Check logs in RunPod Console
- Verify model path: `/workspace/models/checkpoints/flux1-schnell.safetensors`
- Verify network volume is attached

### 2.2 Test Z-Image-Turbo Endpoint

**RunPod Console** → Serverless → Endpoints → `ryla-prod-guarded-z-image-turbo-endpoint` → **Test Endpoint**

**Test Input**:
```json
{
  "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait",
  "nsfw": false,
  "num_images": 1,
  "seed": 42
}
```

**Expected**:
- ✅ Job status: `COMPLETED`
- ✅ Response contains `image` (base64) or `images` array
- ✅ Cold start: ~20-40s (first request)
- ✅ Warm request: ~5-10s (faster than Flux)

**If errors**:
- Check logs in RunPod Console
- Verify model path: `/workspace/models/checkpoints/z-image-turbo` (directory)
- Verify network volume is attached
- Check if `diffusers` from source is working (should auto-download components if local path missing)

---

## ⚙️ Step 3: Configure Backend

### 3.1 Update Environment Variables

**File**: `apps/api/.env` or `.env.local`

```bash
# RunPod
RUNPOD_API_KEY=your_runpod_api_key_here
RUNPOD_ENDPOINT_FLUX_DEV=jpcxjab2zpro19
RUNPOD_ENDPOINT_Z_IMAGE_TURBO=xqs8k7yhabwh0k
```

**Verify**:
- `RUNPOD_API_KEY` is set (from RunPod Console → Settings → API Keys)
- Endpoint IDs match RunPod Console

### 3.2 Test Backend Integration

**Option A: API Test** (if API server running):
```bash
# Test Flux endpoint
curl -X POST http://localhost:3001/api/image/generate-base \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes",
    "nsfw": false
  }'
```

**Option B: Direct Service Test**:
```typescript
// In apps/api test file or REPL
import { RunPodService } from './modules/runpod/services/runpod.service';

const service = new RunPodService(configService);
const jobId = await service.generateBaseImages({
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes",
  nsfw: false
});
console.log('Job ID:', jobId);
```

---

## 🚀 Step 4: Integration Testing

### 4.1 Test Base Image Generation

1. **Via API**:
   - POST `/api/image/generate-base`
   - Verify job created
   - Poll job status
   - Verify image returned

2. **Via Frontend** (if implemented):
   - Navigate to character creation
   - Generate base image
   - Verify image displays

### 4.2 Test Character Sheet Generation

1. **Via API**:
   - POST `/api/image/generate-character-sheet`
   - Provide base image URL
   - Verify 7-10 images generated
   - Verify PuLID/ControlNet working

### 4.3 Test Face Swap

1. **Via API**:
   - POST `/api/image/generate-face-swap`
   - Provide base image + prompt
   - Verify face consistency
   - Verify IPAdapter FaceID working

---

## 📊 Step 5: Monitor & Optimize

### 5.1 Monitor Costs

**RunPod Console** → Billing:
- Track serverless endpoint usage
- Monitor cold start frequency
- Optimize worker settings if needed

### 5.2 Performance Metrics

Track:
- **Cold start time**: First request after idle
- **Warm request time**: Subsequent requests
- **Success rate**: % of completed jobs
- **Error rate**: % of failed jobs

### 5.3 Optimize Settings

**If cold starts are frequent**:
- Increase `workersMin` from 0 to 1 (keeps 1 worker warm)
- Trade-off: Higher idle costs

**If requests are slow**:
- Verify GPU type (RTX 4090 > RTX 3090)
- Check model loading time
- Consider caching strategies

---

## 🐛 Troubleshooting

### Endpoint Not Responding

1. **Check endpoint status**: RunPod Console → Endpoints → Status
2. **Check logs**: RunPod Console → Endpoints → Logs
3. **Verify network volume**: Models accessible at `/workspace/models/checkpoints/`
4. **Verify Docker image**: Latest version from GHCR

### Model Not Found

1. **Flux**: Verify `/workspace/models/checkpoints/flux1-schnell.safetensors` exists
2. **Z-Image-Turbo**: Verify `/workspace/models/checkpoints/z-image-turbo/` directory exists
3. **Network volume**: Verify attached to endpoint
4. **Permissions**: Verify files readable (should be automatic)

### Handler Errors

1. **Check handler logs**: RunPod Console → Endpoints → Logs
2. **Verify dependencies**: `diffusers` from source (Z-Image-Turbo)
3. **Check Python version**: Should be 3.10+
4. **Verify GPU**: Should be CUDA-compatible

---

## 📝 Checklist

- [ ] Network volume attached to both endpoints
- [ ] Docker images updated to `:latest` in templates
- [ ] Flux endpoint tested successfully
- [ ] Z-Image-Turbo endpoint tested successfully
- [ ] Backend environment variables configured
- [ ] Backend integration tested
- [ ] Base image generation working
- [ ] Character sheet generation working (optional)
- [ ] Face swap working (optional)
- [ ] Monitoring setup

---

## 🎯 Success Criteria

✅ **Endpoints responding**: Both endpoints return images  
✅ **Backend integrated**: API calls succeed  
✅ **Images generated**: Base images created successfully  
✅ **Performance acceptable**: < 30s warm requests  
✅ **Costs monitored**: Usage tracked in RunPod Console

---

## Next Actions

1. **Verify endpoints** (Step 1) → ~5 min
2. **Test endpoints** (Step 2) → ~10 min
3. **Configure backend** (Step 3) → ~5 min
4. **Integration test** (Step 4) → ~15 min
5. **Monitor** (Step 5) → Ongoing

**Total time**: ~35 minutes for full verification

---

## References

- [RunPod Serverless Docs](https://docs.runpod.io/serverless)
- [Endpoint Setup Notes](./ENDPOINT-SETUP.md)
- [Resources Ledger](./RESOURCES.md)
- [Serverless Deployment Guide](../technical/RUNPOD-SERVERLESS-DEPLOYMENT.md)

