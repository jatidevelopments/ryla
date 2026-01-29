# Endpoint Testing In Progress

**Date**: 2026-01-28  
**Status**: ⏳ Testing all endpoints to generate images/videos

---

## 🧪 Testing Strategy

**Approach**: Test endpoints sequentially with proper cold start handling (2-5 minutes per endpoint).

**Test Script**: `apps/modal/scripts/test-endpoints-generate.sh`

**Output Directory**: `/tmp/ryla_test_outputs/`

---

## 📋 Tests Running

1. **Flux Schnell** (`/flux`)
   - Prompt: "A beautiful sunset over mountains"
   - Output: `flux.jpg`

2. **Flux Dev** (`/flux-dev`)
   - Prompt: "A serene landscape with a lake"
   - Output: `flux_dev.jpg`

3. **Wan2 Video** (`/wan2`)
   - Prompt: "Waves crashing on a beach"
   - Output: `wan2.webp`

4. **Z-Image Simple** (`/z-image-simple`)
   - Prompt: "A futuristic cityscape at night"
   - Output: `zimage_simple.jpg`

5. **SeedVR2 Upscaling** (`/seedvr2`)
   - Input: Generated test image first
   - Output: `seedvr2.png`

---

## ⏱️ Expected Timeline

- **Cold Start**: 2-5 minutes per endpoint (first request)
- **Total Time**: ~15-25 minutes for all 5 endpoints
- **Subsequent Requests**: Much faster (warm containers)

---

## 📊 Monitor Progress

```bash
# Watch test log
tail -f /tmp/endpoint_test.log

# Check generated files
ls -lh /tmp/ryla_test_outputs/

# Check test script status
ps aux | grep test-endpoints-generate
```

---

## ✅ Success Criteria

Each test passes if:
- ✅ HTTP 200 response
- ✅ Output file created and non-empty
- ✅ File is valid image/video format
- ✅ File size > 1KB

---

**Last Updated**: 2026-01-28  
**Status**: Testing in progress...
