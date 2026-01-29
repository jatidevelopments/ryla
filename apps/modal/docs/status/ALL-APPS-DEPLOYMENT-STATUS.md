# All Modal Apps - Deployment Status

**Date**: 2026-01-28  
**Status**: ⏳ All 5 Apps Deploying in Parallel

---

## Deployment Status

| App | Status | App ID | Started |
|-----|--------|--------|---------|
| **Flux** | ⏳ Deploying | Multiple attempts | 15:16-15:21 CET |
| **Wan2** | ⏳ Initializing | `ap-19j0IWI4usu6GU81H84xrB` | 15:30+ CET |
| **SeedVR2** | ⏳ Initializing | - | 15:30+ CET |
| **InstantID** | ⏳ Initializing | - | 15:30+ CET |
| **Z-Image** | ⏳ Initializing | - | 15:30+ CET |

---

## Expected Endpoint URLs

Once all apps are deployed, endpoints will be available at:

### Flux App (`ryla-flux`)
- Health: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/health`
- `/flux`: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux`
- `/flux-dev`: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev`

### Wan2 App (`ryla-wan2`)
- Health: `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/health`
- `/wan2`: `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2`

### SeedVR2 App (`ryla-seedvr2`)
- Health: `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/health`
- `/seedvr2`: `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2`

### InstantID App (`ryla-instantid`)
- Health: `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/health`
- `/flux-instantid`: `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-instantid`
- `/sdxl-instantid`: `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid`
- `/flux-ipadapter-faceid`: `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid`

### Z-Image App (`ryla-z-image`)
- Health: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/health`
- `/z-image-simple`: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple`
- `/z-image-danrisi`: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi`
- `/z-image-instantid`: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-instantid`
- `/z-image-pulid`: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-pulid`

---

## Deployment Timeline

**First-time deployments** typically take 10-20 minutes per app as they need to:
1. Build base image (2-3 min)
2. Install ComfyUI (3-5 min)
3. Install custom nodes (2-3 min)
4. Download models (5-10 min, depends on model size)
5. Start ComfyUI server (1-2 min)

**Parallel deployment** allows all 5 apps to build simultaneously, saving time.

---

## Testing Once Deployments Complete

### Step 1: Verify All Apps Deployed

```bash
modal app list | grep -E "ryla-flux|ryla-wan2|ryla-seedvr2|ryla-instantid|ryla-z-image"
```

All should show "deployed" status.

### Step 2: Test Health Endpoints

```bash
# Test all health endpoints
for app in flux wan2 seedvr2 instantid z-image; do
  echo "Testing $app..."
  curl -s https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health
  echo ""
done
```

### Step 3: Run Comprehensive Test

```bash
python apps/modal/scripts/test-split-apps.py
```

This will:
- Test all endpoints across all apps
- Generate test images if needed
- Report results with app mapping
- Save results to `apps/modal/docs/status/SPLIT-APPS-TEST-RESULTS.json`

### Step 4: Test Individual Endpoints

```bash
# Flux Schnell
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4}' \
  --output test_flux.jpg

# Flux Dev
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 20}' \
  --output test_flux_dev.jpg

# Wan2
curl -X POST https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cinematic scene", "width": 512, "height": 512, "length": 16}' \
  --output test_wan2.webp
```

---

## Monitoring Deployments

### Check Status

```bash
# List all apps
modal app list

# Filter for our apps
modal app list | grep -E "ryla-flux|ryla-wan2|ryla-seedvr2|ryla-instantid|ryla-z-image"
```

### View Logs

```bash
# View logs for specific app
modal app logs ryla-flux
modal app logs ryla-wan2
# etc.
```

### Check Deployment Progress

Look for:
- ✅ "deployed" status in `modal app list`
- ✅ Health endpoint returns `{"status":"healthy","app":"ryla-{app}"}`
- ✅ No errors in logs

---

## Troubleshooting

### Issue: "modal-http: invalid function call"

**Possible causes**:
1. App still initializing (wait 2-5 minutes after deployment)
2. Cold start in progress
3. Deployment not fully complete

**Solutions**:
1. Wait for deployment to show "deployed" status
2. Wait 2-5 minutes for cold start
3. Check logs: `modal app logs ryla-{app}`

### Issue: 404 Not Found

**Possible causes**:
1. Wrong endpoint URL
2. App not deployed
3. Endpoint path incorrect

**Solutions**:
1. Verify URL pattern: `https://ryla--ryla-{app}-comfyui-fastapi-app.modal.run`
2. Check app is deployed: `modal app list`
3. Test health endpoint first

### Issue: Deployment Fails

**Check logs**:
```bash
modal app logs ryla-{app}
```

**Common issues**:
- Import errors → Check shared code paths
- Model download failures → Check HF token in secrets
- ComfyUI installation issues → Check version compatibility

---

## Next Steps After Deployment

1. ✅ **Verify all apps deployed** - Check status
2. ✅ **Test health endpoints** - Verify apps are running
3. ✅ **Run comprehensive test** - Test all endpoints
4. ⏳ **Update client script** - Point to new app URLs
5. ⏳ **Fix any failing endpoints** - Debug issues found in testing
6. ⏳ **Archive old structure** - Move old app.py to archive

---

## Related Documentation

- [Split Apps Deployment Summary](./SPLIT-APPS-DEPLOYMENT-SUMMARY.md)
- [App Splitting Complete](./APP-SPLITTING-COMPLETE.md)
- [Next Steps Testing](./NEXT-STEPS-TESTING.md)
- [Deployment and Testing](./DEPLOYMENT-AND-TESTING.md)

---

**Last Updated**: 2026-01-28  
**Status**: All 5 Apps Deploying in Parallel
