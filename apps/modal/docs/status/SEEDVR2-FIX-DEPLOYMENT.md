# SeedVR2 Endpoint Fix - Deployment Summary

**Date**: 2026-01-28  
**Status**: ✅ **Deployed Successfully**  
**Deployment Time**: 189.59 seconds (~3.2 minutes)

---

## Problem Fixed

**Error**: `"invalid literal for int() with base 10: 'fixed'"`

**Root Cause**: The `resolution` parameter in the SeedVR2 workflow could be a string value (e.g., "fixed") instead of an integer, causing a type conversion error when ComfyUI tried to process it.

---

## Solution Implemented

### Code Changes

**File**: `apps/modal/handlers/seedvr2.py`

**Changes**:
1. Added parameter extraction from request:
   - `resolution` (default: 1080)
   - `seed` (default: 4105349922)
   - `max_resolution` (default: 4000)
   - `max_resolution_2` (default: 4000)

2. Added type conversion logic:
   - Handles string "fixed" → converts to default 1080
   - Converts numeric strings to integers
   - Uses safe defaults if conversion fails
   - Ensures all parameters are integers before passing to workflow

3. Updates `SeedVR2VideoUpscaler` node with correct integer values

### Code Example

```python
# Get parameters from request (with defaults)
resolution = item.get("resolution", 1080)
seed = item.get("seed", 4105349922)

# Ensure resolution is an integer (handle string values like "fixed")
if isinstance(resolution, str):
    if resolution.lower() == "fixed":
        resolution = 1080  # Use default
    else:
        try:
            resolution = int(resolution)
        except ValueError:
            resolution = 1080  # Fallback to default

# Update workflow node
node["inputs"]["resolution"] = resolution
node["inputs"]["seed"] = seed
```

---

## Deployment Details

**Deployment Command**: `modal deploy apps/modal/app.py`

**Deployment Status**: ✅ Successfully deployed

**Endpoint URL**: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`

**Workflows Mounted**:
- ✅ `workflows/seedvr2_api.json` - API format workflow
- ✅ `workflows/seedvr2.json` - UI format workflow (fallback)

**Deployment Log**: `/tmp/modal_deploy_seedvr2_fix_retry.log`

---

## Testing

### Test Command

```bash
# Basic test
python apps/modal/ryla_client.py seedvr2 \
  --image test_image.png \
  --output upscaled.png

# With custom resolution
curl -X POST https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/seedvr2 \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,...",
    "resolution": 1440,
    "seed": 1234567890
  }'
```

### Expected Behavior

- ✅ Accepts `resolution` as integer or string
- ✅ Converts string "fixed" to default 1080
- ✅ Converts numeric strings to integers
- ✅ Uses defaults for invalid values
- ✅ No more "invalid literal for int()" errors

---

## Next Steps

1. **Test the endpoint** with various input images
2. **Verify parameter handling** with different resolution values
3. **Monitor for any edge cases** in production usage
4. **Update client script** if additional parameters are needed

---

## Related Files

- `apps/modal/handlers/seedvr2.py` - Handler with fix
- `workflows/seedvr2_api.json` - API format workflow
- `apps/modal/docs/status/ENDPOINT-FIXES-STATUS.md` - Status document

---

**Deployment Complete**: 2026-01-28  
**Ready for Testing**: ✅ Yes
