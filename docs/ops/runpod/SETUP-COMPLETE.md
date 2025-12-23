# RunPod Setup - Complete ✅

> **Date**: 2025-12-19  
> **Status**: Ready for Testing  
> **Next**: Test endpoints → Integrate with backend

---

## ✅ Completed Setup

### 1. Docker Images
- ✅ **Flux Handler**: `ghcr.io/jatidevelopments/ryla-prod-guarded-flux-dev-handler:latest`
- ✅ **Z-Image-Turbo Handler**: `ghcr.io/jatidevelopments/ryla-prod-guarded-z-image-turbo-handler:latest`
- ✅ **Auto-build**: GitHub Actions workflow pushes to GHCR on `main` branch

### 2. RunPod Resources
- ✅ **Templates Created**:
  - `ryla-prod-guarded-flux-dev-handler` (ID: `jx2h981xwv`)
  - `ryla-prod-guarded-z-image-turbo-handler` (ID: `x1ua87uhrs`)
- ✅ **Endpoints Created**:
  - `ryla-prod-guarded-flux-dev-endpoint` (ID: `jpcxjab2zpro19`)
  - `ryla-prod-guarded-z-image-turbo-endpoint` (ID: `xqs8k7yhabwh0k`)

### 3. Network Volume
- ✅ **Volume**: `ryla-models-dream-companion` (ID: `xeqfzsy4k7`)
- ✅ **Attached to**: Both endpoints ✅
- ✅ **Mount Path**: `/workspace/models`

### 4. Models Downloaded
- ✅ **Flux 1 Schnell**: `/workspace/models/checkpoints/flux1-schnell.safetensors`
- ✅ **Z-Image-Turbo**: `/workspace/models/checkpoints/z-image-turbo/`
- ✅ **PuLID**: `/workspace/models/pulid/pulid_flux_v0.9.1.safetensors` (optional)
- ✅ **ControlNet**: Available (optional)
- ✅ **IPAdapter**: Available (optional)

### 5. Configuration Verified
- ✅ Network volumes attached to both endpoints
- ✅ Docker images using `:latest` from GHCR
- ✅ GPU types: RTX 4090/3090 configured
- ✅ Worker settings: Min 0, Max 1 (pay-per-use)

---

## 🧪 Testing

### Quick Test (Automated)

```bash
# Test both endpoints
pnpm test:runpod

# Test only Flux
pnpm test:runpod flux

# Test only Z-Image-Turbo
pnpm test:runpod z-image
```

**Requirements**:
- `RUNPOD_API_KEY` in environment or `.env` file

### Manual Test (RunPod Console)

1. Go to: https://www.runpod.io/console/serverless
2. Select endpoint → Click **"Test Endpoint"**
3. Use test input from `VERIFICATION-STATUS.md`

---

## ⚙️ Backend Integration

### 1. Environment Variables

**File**: `apps/api/.env` or `.env.local`

```bash
RUNPOD_API_KEY=your_runpod_api_key_here
RUNPOD_ENDPOINT_FLUX_DEV=jpcxjab2zpro19
RUNPOD_ENDPOINT_Z_IMAGE_TURBO=xqs8k7yhabwh0k
```

### 2. Test Backend Service

```typescript
import { RunPodService } from './modules/runpod/services/runpod.service';

const service = new RunPodService(configService);
const jobId = await service.generateBaseImages({
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes",
  nsfw: false
});
```

---

## 📊 Expected Performance

| Metric | Flux | Z-Image-Turbo |
|--------|------|---------------|
| **Cold Start** | 30-60s | 20-40s |
| **Warm Request** | 10-20s | 5-10s |
| **Image Quality** | High | High (slightly faster) |
| **NSFW Support** | ✅ | ⚠️ (needs testing) |

---

## 📝 Documentation

- **Verification Status**: `docs/ops/runpod/VERIFICATION-STATUS.md`
- **Next Steps**: `docs/ops/runpod/NEXT-STEPS.md`
- **Resources Ledger**: `docs/ops/runpod/RESOURCES.md`
- **Test Script**: `scripts/test-runpod-endpoints.ts`

---

## 🎯 Success Criteria

- [x] Docker images built and pushed
- [x] Endpoints created and configured
- [x] Network volumes attached
- [x] Models downloaded
- [ ] Endpoints tested successfully
- [ ] Backend integrated
- [ ] Images generated successfully

---

## 🚀 Next Actions

1. **Test endpoints** → `pnpm test:runpod`
2. **Configure backend** → Update `.env` with endpoint IDs
3. **Test integration** → Verify API calls work
4. **Monitor costs** → Track usage in RunPod Console

---

## 📚 References

- [RunPod Serverless Docs](https://docs.runpod.io/serverless)
- [RunPod Python SDK](https://github.com/runpod/runpod-python)
- [FLUX.1-schnell Model](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [Z-Image-Turbo Model](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)

