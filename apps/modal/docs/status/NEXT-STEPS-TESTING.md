# Next Steps: Testing Split Apps

**Date**: 2026-01-28  
**Status**: ⏳ Waiting for Flux deployment to complete

---

## Current Status

**Flux App**: ⏳ Initializing (App ID: `ap-k6JRzV5hkXkCpH8eollmY7`)

The deployment is in progress. First-time deployments can take 10-20 minutes as they need to:
1. Build base image
2. Install ComfyUI
3. Install custom nodes
4. Download models
5. Start ComfyUI server

---

## Testing Once Deployment Completes

### Step 1: Verify Deployment

```bash
# Check app status
modal app list | grep ryla-flux

# Should show "deployed" status when ready
```

### Step 2: Test Health Endpoint

```bash
# Test health endpoint
curl https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/health

# Expected response:
# {"status":"healthy","app":"ryla-flux"}
```

### Step 3: Test Flux Endpoint

```bash
# Test Flux Schnell
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 512,
    "height": 512,
    "steps": 4
  }' \
  --output test_flux_output.jpg

# Test Flux Dev
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 512,
    "height": 512,
    "steps": 20
  }' \
  --output test_flux_dev_output.jpg
```

### Step 4: Run Comprehensive Test

```bash
# Run test script (tests all apps)
python apps/modal/scripts/test-split-apps.py
```

---

## If Deployment Fails

### Check Logs

```bash
# View deployment logs
modal app logs ap-k6JRzV5hkXkCpH8eollmY7

# Or for latest deployment
modal app logs ryla-flux
```

### Common Issues

1. **Import errors** - Check that shared code paths are correct
2. **Model download failures** - Check HF token in Modal secrets
3. **ComfyUI installation issues** - Check ComfyUI version compatibility
4. **Custom node issues** - Check node installation in image_base.py

### Redeploy

```bash
# Redeploy with fresh build
modal deploy apps/modal/apps/flux/app.py --force
```

---

## Deploy Remaining Apps

Once Flux is working, deploy the others:

```bash
# Deploy all at once
cd apps/modal
./deploy.sh

# Or one at a time
./deploy.sh wan2
./deploy.sh seedvr2
./deploy.sh instantid
./deploy.sh z-image
```

---

## Expected Endpoint URLs

Once all apps are deployed:

| Endpoint | App | URL |
|----------|-----|-----|
| `/flux` | ryla-flux | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux` |
| `/flux-dev` | ryla-flux | `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev` |
| `/wan2` | ryla-wan2 | `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2` |
| `/seedvr2` | ryla-seedvr2 | `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2` |
| `/flux-instantid` | ryla-instantid | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-instantid` |
| `/sdxl-instantid` | ryla-instantid | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid` |
| `/flux-ipadapter-faceid` | ryla-instantid | `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid` |
| `/z-image-simple` | ryla-z-image | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple` |
| `/z-image-danrisi` | ryla-z-image | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi` |
| `/z-image-instantid` | ryla-z-image | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-instantid` |
| `/z-image-pulid` | ryla-z-image | `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-pulid` |

---

## Success Criteria

✅ **Deployment successful when**:
1. App shows "deployed" status in `modal app list`
2. Health endpoint returns `{"status":"healthy","app":"ryla-flux"}`
3. Flux endpoint returns image (HTTP 200)
4. Cost headers present in response

✅ **All apps working when**:
1. All 5 apps deployed successfully
2. All endpoints return HTTP 200
3. Test script passes for all endpoints
4. No regressions from old single app

---

## Related Documentation

- [Split Apps Deployment Summary](./SPLIT-APPS-DEPLOYMENT-SUMMARY.md)
- [App Splitting Complete](./APP-SPLITTING-COMPLETE.md)
- [Deployment and Testing](./DEPLOYMENT-AND-TESTING.md)

---

**Last Updated**: 2026-01-28  
**Status**: Waiting for deployment completion
