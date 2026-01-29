# IN-028 Endpoint Debugging

> **Date**: 2026-01-27  
> **Status**: 🔍 **Debugging In Progress**

---

## Issue Summary

**All endpoints timing out after 3+ minutes**, even after:
- ✅ FastAPI installation fixed
- ✅ comfy-cli installation fixed  
- ✅ Template string interpolation fixed
- ✅ Code regenerated and redeployed

**This suggests**: The FastAPI app is not becoming available, likely due to:
1. `@modal.enter()` blocking container initialization
2. FastAPI app failing to initialize
3. Container not becoming "ready" in Modal

---

## Test Results

### Attempts Made

| Attempt | Wait Time | Result |
|---------|-----------|--------|
| 1 | 0s | Timeout |
| 2 | 60s | Timeout |
| 3 | 120s | Timeout |
| 4 | 180s | Timeout |
| 5 | 240s | Timeout |
| 6 | 300s | Timeout |

**Total wait time**: 5+ minutes  
**Result**: All endpoints still timing out

---

## Possible Root Causes

### 1. `@modal.enter()` Blocking (Most Likely)

**Hypothesis**: Modal waits for `@modal.enter()` to complete before making FastAPI app available.

**Evidence**:
- ComfyUI startup can take 60+ seconds
- If ComfyUI fails to start, container never becomes ready
- FastAPI app can't respond until container is ready

**Solution**: Make ComfyUI startup non-blocking or handle errors gracefully

### 2. FastAPI Import Error

**Hypothesis**: FastAPI or dependencies failing to import.

**Evidence**:
- FastAPI is installed in image
- But import might fail at runtime

**Solution**: Verify imports work, add error handling

### 3. Container Initialization Failure

**Hypothesis**: Container failing to initialize for other reasons.

**Evidence**:
- No logs available (logs command times out)
- Endpoints never respond

**Solution**: Check Modal dashboard for container status

---

## Next Steps

### Immediate Actions

1. **Check Modal Dashboard**
   - Visit: https://modal.com/apps/ryla/main/deployed/ryla-z_image_danrisi
   - Check container logs
   - Verify container status
   - Look for errors

2. **Simplify FastAPI App**
   - Remove CORS middleware temporarily
   - Remove ComfyUI dependency from health endpoint
   - Make health endpoint work without ComfyUI

3. **Make ComfyUI Startup Non-Blocking**
   - Launch ComfyUI in background thread
   - Don't wait for ComfyUI in `@modal.enter()`
   - Let FastAPI app start immediately

### Alternative Approach

**Test with minimal FastAPI app** (no ComfyUI):
- Deploy simple FastAPI app
- Verify it works
- Then add ComfyUI back

---

## Comparison with Working App

### RYLA Main App (`ryla-comfyui`)
- ✅ FastAPI app works
- ✅ ComfyUI starts in background
- ✅ Endpoints respond quickly

**Key Differences**:
- Main app has established patterns
- Generated app is new
- May have initialization order issues

---

## Debugging Checklist

- [ ] Check Modal dashboard for errors
- [ ] Verify FastAPI imports work
- [ ] Test minimal FastAPI app (no ComfyUI)
- [ ] Make ComfyUI startup non-blocking
- [ ] Simplify health endpoint (no ComfyUI dependency)
- [ ] Compare with working RYLA app structure

---

**Last Updated**: 2026-01-27  
**Status**: 🔍 **Awaiting Dashboard Check**
