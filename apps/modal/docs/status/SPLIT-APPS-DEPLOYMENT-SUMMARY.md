# Modal Apps Splitting - Deployment Summary

**Date**: 2026-01-28  
**Status**: ✅ **Apps Created**, ⏳ **Deployment in Progress**  
**Initiative**: IN-031 (Agentic Workflow Deployment) + IN-027 (Multi-Agent Orchestration)

---

## ✅ Completed

### Phase 1-3: App Creation Complete

1. ✅ **Shared code extracted** to `apps/modal/shared/`
2. ✅ **All 5 apps created**:
   - `apps/flux/` - Flux Schnell & Flux Dev
   - `apps/wan2/` - Wan2.1 text-to-video
   - `apps/seedvr2/` - SeedVR2 upscaling
   - `apps/instantid/` - InstantID face consistency
   - `apps/z-image/` - Z-Image-Turbo workflows
3. ✅ **Deployment script created** (`deploy.sh`)
4. ✅ **Test script created** (`test-split-apps.py`)
5. ✅ **Import paths fixed** (nested utils directory corrected)

---

## ⏳ In Progress

### Phase 4: Deployment & Testing

**Flux App**: ⏳ Deploying
- Command: `modal deploy apps/modal/apps/flux/app.py`
- Status: Building image (ComfyUI installation in progress)
- Expected time: 10-20 minutes for first deployment

**Remaining Apps**: ⏳ Pending deployment

---

## Endpoint URL Pattern

### New Structure

Each app has its own URL based on:
- Workspace: `ryla`
- App name: `ryla-{app-name}`
- Class name: `ComfyUI` (becomes `comfyui` in URL)

**Pattern**: `https://ryla--ryla-{app-name}-comfyui-fastapi-app.modal.run`

### App URLs

| App | App Name | Base URL |
|-----|----------|----------|
| **Flux** | `ryla-flux` | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run` |
| **Wan2** | `ryla-wan2` | `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run` |
| **SeedVR2** | `ryla-seedvr2` | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run` |
| **InstantID** | `ryla-instantid` | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run` |
| **Z-Image** | `ryla-z-image` | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run` |

---

## Testing

### Test Script

**Created**: `apps/modal/scripts/test-split-apps.py`

**Usage**:
```bash
python apps/modal/scripts/test-split-apps.py
```

**Features**:
- Tests endpoints across all apps
- Maps endpoints to correct app URLs automatically
- Generates test image if needed
- Reports results with app mapping

### Manual Testing

**1. Check deployment status**:
```bash
modal app list | grep ryla-
```

**2. Test health endpoint** (once deployed):
```bash
curl https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/health
```

**3. Test Flux endpoint**:
```bash
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4}' \
  --output test_output.jpg
```

---

## Known Issues & Fixes

### ✅ Fixed

1. **Nested utils directory** - Fixed: `apps/modal/shared/utils/utils/` → `apps/modal/shared/utils/`
2. **Import paths** - Updated handlers to use `/root/utils` at runtime
3. **Image imports** - Fixed base_image import with fallback

### ⚠️ Current Issue

**"modal-http: invalid function call"** when accessing endpoints

**Possible causes**:
1. App still building (first deployment takes 10-20 minutes)
2. Cold start in progress (wait 2-5 minutes after deployment)
3. Function not properly exposed (verify `@modal.asgi_app()` decorator)

**Solutions**:
1. Wait for deployment to complete
2. Check deployment logs: `modal app logs ryla-flux` (after deployment)
3. Verify app is running: `modal app list`
4. Test after cold start completes

---

## Next Steps

### Immediate

1. ⏳ **Wait for Flux deployment** to complete (check with `modal app list`)
2. ⏳ **Test Flux endpoints** once deployment completes
3. ⏳ **Deploy remaining apps** if Flux works:
   ```bash
   ./apps/modal/deploy.sh wan2
   ./apps/modal/deploy.sh seedvr2
   ./apps/modal/deploy.sh instantid
   ./apps/modal/deploy.sh z-image
   ```

### Follow-up

4. ⏳ **Run comprehensive test**: `python apps/modal/scripts/test-split-apps.py`
5. ⏳ **Update client script** (`ryla_client.py`) with new endpoint URLs
6. ⏳ **Verify all endpoints work** across all apps
7. ⏳ **Archive old structure** (optional)

---

## Deployment Commands

### Deploy All Apps

```bash
cd apps/modal
./deploy.sh
```

### Deploy Single App

```bash
cd apps/modal
./deploy.sh flux
# or
modal deploy apps/modal/apps/flux/app.py
```

### Check Deployment Status

```bash
modal app list | grep ryla-
```

### View Logs

```bash
modal app logs ryla-flux
```

---

## Benefits Achieved

### ✅ Agent Isolation
- Each app has isolated files
- Agents can work in parallel without conflicts
- Clear file boundaries for assignment

### ✅ Independent Deployment
- Deploy one app without affecting others
- Faster iteration cycle
- Parallel testing possible

### ✅ Faster Development
- Fix one endpoint, deploy only that app
- Test endpoints independently
- Check logs per app (faster debugging)

---

## Related Documentation

- [App Splitting Complete](./APP-SPLITTING-COMPLETE.md)
- [App Splitting Migration Status](./APP-SPLITTING-MIGRATION-STATUS.md)
- [Deployment and Testing](./DEPLOYMENT-AND-TESTING.md)
- [IN-031: Agentic Workflow Deployment](../../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)

---

**Last Updated**: 2026-01-28  
**Status**: Apps Created, Deployment in Progress
