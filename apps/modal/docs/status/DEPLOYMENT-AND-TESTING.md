# Modal Apps - Deployment and Testing Status

**Date**: 2026-01-28  
**Status**: ⏳ Deployment in Progress  
**Initiative**: IN-031 (Agentic Workflow Deployment)

---

## Deployment Status

### Apps Created

✅ All 5 apps created and ready for deployment:
- `apps/flux/` - Flux Schnell & Flux Dev
- `apps/wan2/` - Wan2.1 text-to-video
- `apps/seedvr2/` - SeedVR2 upscaling
- `apps/instantid/` - InstantID face consistency
- `apps/z-image/` - Z-Image-Turbo workflows

### Deployment Commands

```bash
# Deploy all apps
cd apps/modal
./deploy.sh

# Deploy single app
./deploy.sh flux
# or
modal deploy apps/modal/apps/flux/app.py
```

### Current Deployment

**Flux App**: ⏳ Deploying in background
- Command: `modal deploy apps/modal/apps/flux/app.py`
- Status: Building image (ComfyUI installation in progress)

---

## Endpoint URLs

### New App Structure

Each app has its own Modal URL:

| App | App Name | Base URL Pattern |
|-----|----------|-----------------|
| **Flux** | `ryla-flux` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run` |
| **Wan2** | `ryla-wan2` | `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run` |
| **SeedVR2** | `ryla-seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run` |
| **InstantID** | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run` |
| **Z-Image** | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run` |

### Endpoint Mapping

| Endpoint | App | Full URL |
|----------|-----|----------|
| `/flux` | `ryla-flux` | `{flux_url}/flux` |
| `/flux-dev` | `ryla-flux` | `{flux_url}/flux-dev` |
| `/wan2` | `ryla-wan2` | `{wan2_url}/wan2` |
| `/seedvr2` | `ryla-seedvr2` | `{seedvr2_url}/seedvr2` |
| `/flux-instantid` | `ryla-instantid` | `{instantid_url}/flux-instantid` |
| `/sdxl-instantid` | `ryla-instantid` | `{instantid_url}/sdxl-instantid` |
| `/flux-ipadapter-faceid` | `ryla-instantid` | `{instantid_url}/flux-ipadapter-faceid` |
| `/z-image-simple` | `ryla-z-image` | `{z-image_url}/z-image-simple` |
| `/z-image-danrisi` | `ryla-z-image` | `{z-image_url}/z-image-danrisi` |
| `/z-image-instantid` | `ryla-z-image` | `{z-image_url}/z-image-instantid` |
| `/z-image-pulid` | `ryla-z-image` | `{z-image_url}/z-image-pulid` |

---

## Testing

### Test Script

Created `apps/modal/scripts/test-split-apps.py` to test all endpoints across the new app structure.

**Usage**:
```bash
python apps/modal/scripts/test-split-apps.py
```

**Features**:
- Tests endpoints across all apps
- Maps endpoints to correct app URLs
- Generates test image if needed
- Reports results with app mapping

### Manual Testing

**Test Flux app**:
```bash
# Get app URL
modal app list | grep ryla-flux

# Test endpoint
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4}'
```

**Test health endpoint**:
```bash
curl https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/health
```

---

## Next Steps

1. ⏳ **Wait for Flux deployment** to complete
2. ⏳ **Test Flux endpoints** (`/flux`, `/flux-dev`)
3. ⏳ **Deploy remaining apps** (wan2, seedvr2, instantid, z-image)
4. ⏳ **Run comprehensive test** using `test-split-apps.py`
5. ⏳ **Update client script** (`ryla_client.py`) with new endpoint URLs
6. ⏳ **Verify all endpoints work** across all apps

---

## Known Issues Fixed

1. ✅ **Import paths** - Fixed nested utils directory structure
2. ✅ **Handler imports** - Updated to use `/root/utils` at runtime
3. ✅ **Image imports** - Fixed base_image import path resolution

---

## Related Documentation

- [App Splitting Complete](./APP-SPLITTING-COMPLETE.md)
- [App Splitting Migration Status](./APP-SPLITTING-MIGRATION-STATUS.md)
- [IN-031: Agentic Workflow Deployment](../../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)

---

**Last Updated**: 2026-01-28  
**Status**: Deployment in Progress
