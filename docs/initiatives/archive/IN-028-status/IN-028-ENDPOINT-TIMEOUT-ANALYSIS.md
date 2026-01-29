# IN-028 Endpoint Timeout Analysis

> **Date**: 2026-01-27  
> **Status**: ⚠️ **Endpoints Timing Out - Investigation Needed**

---

## Current Issue

**All endpoints timing out after 60+ seconds**, even after waiting for cold start.

### Test Results

| Endpoint | Timeout | Status |
|----------|---------|--------|
| `/` (root) | 60s | ❌ Timeout |
| `/health` | 60s | ❌ Timeout |
| `/generate` | 60s | ❌ Timeout |

**All endpoints consistently timing out**, suggesting:
1. Cold start taking longer than expected (>5 minutes)
2. FastAPI app not initializing correctly
3. ComfyUI server startup failing
4. Container/network issue

---

## Possible Causes

### 1. Cold Start Taking Too Long
**Likelihood**: Medium  
**Reason**: ComfyUI + custom nodes + models can take 5-10 minutes  
**Solution**: Wait longer or check logs

### 2. FastAPI App Not Starting
**Likelihood**: Medium  
**Reason**: Generated code might have initialization issues  
**Solution**: Review generated code, check for errors

### 3. ComfyUI Server Startup Failing
**Likelihood**: High  
**Reason**: Custom nodes or dependencies might be failing  
**Solution**: Check ComfyUI server logs

### 4. Container/Network Issue
**Likelihood**: Low  
**Reason**: Modal infrastructure issue  
**Solution**: Check Modal status, redeploy

---

## Investigation Steps

### Step 1: Check Generated Code
```bash
# Review generated Modal code
cat scripts/generated/workflows/z_image_danrisi_modal.py
```

**Check for**:
- FastAPI app initialization
- CORS middleware setup
- Endpoint definitions
- Error handling

### Step 2: Check Modal Dashboard
- Visit: https://modal.com/apps
- Find: `ryla-z_image_danrisi`
- Check: Container logs, errors, status

### Step 3: Review Deployment Output
```bash
# Redeploy and capture full output
modal deploy scripts/generated/workflows/z_image_danrisi_modal.py 2>&1 | tee deploy.log
```

**Look for**:
- Build errors
- Image build issues
- Dependency installation failures
- Warnings

### Step 4: Test with Simpler Workflow
Create a minimal test workflow to isolate the issue:
- No custom nodes
- Basic ComfyUI workflow only
- Verify FastAPI app works

---

## Comparison with Working App

### RYLA Main App (`ryla-comfyui`)
- ✅ Endpoints working
- ✅ FastAPI app initialized
- ✅ ComfyUI server running

**Key Differences**:
- Main app has established patterns
- Generated app is new deployment
- May have different initialization sequence

---

## Next Steps

### Immediate Actions

1. **Check Modal Dashboard**
   - View container logs
   - Check for errors
   - Verify container status

2. **Review Generated Code**
   - Verify FastAPI app structure
   - Check endpoint definitions
   - Ensure CORS middleware

3. **Test with Minimal Workflow**
   - Create simple test workflow
   - Deploy and test
   - Isolate the issue

### If Issue Persists

1. **Compare with Working App**
   - Review `apps/modal/app.py`
   - Compare FastAPI setup
   - Identify differences

2. **Check ComfyUI Startup**
   - Verify `utils.comfyui` module
   - Check server launch logic
   - Review health check mechanism

3. **Consider Alternative Approach**
   - Use simpler FastAPI setup
   - Remove CORS if causing issues
   - Simplify endpoint structure

---

## Expected vs Actual

### Expected Behavior
- Cold start: 2-5 minutes
- Health endpoint: Responds after startup
- Generate endpoint: Accepts requests

### Actual Behavior
- Cold start: >5 minutes (still timing out)
- Health endpoint: Timeout after 60s
- Generate endpoint: Timeout after 60s

---

## Related Documentation

- [Endpoint Status](./IN-028-ENDPOINT-STATUS.md)
- [Endpoint Verification](./IN-028-ENDPOINT-VERIFICATION-COMPLETE.md)
- [Endpoint Check Summary](./IN-028-ENDPOINT-CHECK-SUMMARY.md)

---

**Last Updated**: 2026-01-27  
**Status**: ⚠️ **Investigation In Progress**
