# Endpoint Test Final Results

**Date**: 2026-01-28  
**Status**: Testing all endpoints to generate images/videos

---

## 🧪 Test Execution

**Test Script**: `apps/modal/scripts/test-endpoints-generate.sh`  
**Output Directory**: `/tmp/ryla_test_outputs/`  
**Log File**: `/tmp/endpoint_test.log`

---

## 📊 Test Results

Results will be updated as tests complete...

### Expected Tests

1. **Flux Schnell** (`/flux`)
   - Endpoint: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux`
   - Output: `flux.jpg`

2. **Flux Dev** (`/flux-dev`)
   - Endpoint: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev`
   - Output: `flux_dev.jpg`

3. **Wan2 Video** (`/wan2`)
   - Endpoint: `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2`
   - Output: `wan2.webp`

4. **Z-Image Simple** (`/z-image-simple`)
   - Endpoint: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple`
   - Output: `zimage_simple.jpg`

5. **SeedVR2 Upscaling** (`/seedvr2`)
   - Endpoint: `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2`
   - Output: `seedvr2.png`

---

## ⏱️ Timeline

- **Cold Start**: 2-5 minutes per endpoint (first request)
- **Total Expected Time**: ~15-25 minutes for all 5 endpoints
- **Status**: Testing in progress...

---

## 📝 Notes

- First requests trigger cold starts (container initialization)
- Subsequent requests are much faster
- All endpoints are deployed and healthy
- Test script handles timeouts and validates outputs

---

**Last Updated**: 2026-01-28  
**Status**: Testing in progress...
