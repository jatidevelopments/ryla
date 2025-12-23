# RunPod Endpoints - Verification Status

> **Date**: 2025-12-19  
> **Status**: ✅ Configuration Verified

---

## ✅ Endpoint Configuration

### Flux Endpoint (`jpcxjab2zpro19`)

- **Name**: `ryla-prod-guarded-flux-dev-endpoint -fb`
- **Network Volume**: ✅ `xeqfzsy4k7` (ryla-models-dream-companion) - **ATTACHED**
- **Docker Image**: ✅ `ghcr.io/jatidevelopments/ryla-prod-guarded-flux-dev-handler:latest` - **LATEST**
- **GPU Types**: RTX 4090, RTX 3090
- **Workers**: Min 0, Max 1
- **Worker Status**: EXITED (normal - starts on demand)
- **Template**: `jx2h981xwv` (ryla-prod-guarded-flux-dev-handler)

### Z-Image-Turbo Endpoint (`xqs8k7yhabwh0k`)

- **Name**: `ryla-prod-guarded-z-image-turbo-endpoint -fb`
- **Network Volume**: ✅ `xeqfzsy4k7` (ryla-models-dream-companion) - **ATTACHED**
- **Docker Image**: ✅ `ghcr.io/jatidevelopments/ryla-prod-guarded-z-image-turbo-handler:latest` - **LATEST**
- **GPU Types**: RTX 4090, RTX 3090
- **Workers**: Min 0, Max 1
- **Worker Status**: EXITED (normal - starts on demand)
- **Template**: `x1ua87uhrs` (ryla-prod-guarded-z-image-turbo-handler)

---

## ✅ Configuration Summary

| Item | Status | Details |
|------|--------|---------|
| Network Volumes | ✅ | Both endpoints have `xeqfzsy4k7` attached |
| Docker Images | ✅ | Both using `:latest` from GHCR |
| GPU Configuration | ✅ | RTX 4090/3090 available |
| Worker Settings | ✅ | Min 0, Max 1 (pay-per-use) |

---

## 🧪 Next: Test Endpoints

Both endpoints are configured correctly. Now test them:

### Option 1: Automated Test Script (Recommended)

**Run the test script**:
```bash
# Test both endpoints
pnpm test:runpod

# Test only Flux
pnpm test:runpod flux

# Test only Z-Image-Turbo
pnpm test:runpod z-image
```

**Requirements**:
- `RUNPOD_API_KEY` in environment or `.env`
- Endpoint IDs (defaults to configured values)

**What it does**:
- Submits test job to endpoint(s)
- Polls for completion (up to 5 minutes)
- Reports success/failure with timing
- Shows image generation status

### Option 2: RunPod Console (Manual)

1. Go to: https://www.runpod.io/console/serverless
2. Click on endpoint: `ryla-prod-guarded-flux-dev-endpoint -fb`
3. Click **"Test Endpoint"** button
4. Paste test input (see below)
5. Click **"Run"**

### Option 3: API Test (Programmatic)

Use RunPod API or our backend service to test.

---

## 📝 Test Inputs

### Flux Endpoint Test

```json
{
  "task_type": "base_image",
  "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality",
  "nsfw": false,
  "num_images": 1,
  "seed": 42
}
```

**Expected Response**:
```json
{
  "status": "COMPLETED",
  "output": {
    "image": "base64_encoded_image_data",
    "seed": 42
  }
}
```

### Z-Image-Turbo Endpoint Test

```json
{
  "task_type": "base_image",
  "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality",
  "nsfw": false,
  "num_images": 1,
  "seed": 42
}
```

**Expected Response**:
```json
{
  "status": "COMPLETED",
  "output": {
    "image": "base64_encoded_image_data",
    "seed": 42
  }
}
```

---

## ⏱️ Expected Performance

### Cold Start (First Request)
- **Flux**: ~30-60 seconds (model loading)
- **Z-Image-Turbo**: ~20-40 seconds (model loading)

### Warm Request (Subsequent)
- **Flux**: ~10-20 seconds (generation)
- **Z-Image-Turbo**: ~5-10 seconds (generation - faster)

---

## 🐛 Troubleshooting

### If Test Fails

1. **Check Logs**: RunPod Console → Endpoint → Logs tab
2. **Verify Models**: Ensure models exist on network volume:
   - `/workspace/models/checkpoints/flux1-schnell.safetensors`
   - `/workspace/models/checkpoints/z-image-turbo/`
3. **Check Worker Status**: Worker should start automatically on first request
4. **Verify Network Volume**: Should be mounted at `/workspace/models`

### Common Issues

- **Model Not Found**: Network volume not attached or models missing
- **Timeout**: Cold start takes longer - wait 60s for first request
- **GPU Not Available**: Check RunPod Console for GPU availability
- **Docker Image Error**: Verify image exists in GHCR

---

## ✅ Success Criteria

- [x] Network volumes attached
- [x] Docker images up to date
- [ ] Flux endpoint returns images
- [ ] Z-Image-Turbo endpoint returns images
- [ ] Response time acceptable (< 60s cold, < 20s warm)

---

## Next Steps

1. **Test Flux endpoint** → Verify image generation
2. **Test Z-Image-Turbo endpoint** → Verify image generation
3. **Configure backend** → Update `.env` with endpoint IDs
4. **Test backend integration** → Verify API calls work
5. **Monitor costs** → Track usage in RunPod Console

