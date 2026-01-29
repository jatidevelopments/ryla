# Testing Guide - Split Modal Apps

**Date**: 2026-01-28  
**Status**: Apps deployed, testing in progress

---

## ⏳ Cold Start Behavior

**Important**: First request to each app takes **2-5 minutes** due to:
- ComfyUI server initialization: ~1-2 min
- Model loading: ~1-2 min
- Server ready: ~30s

This is **normal** for Modal apps with ComfyUI.

---

## 🧪 Testing Methods

### 1. Health Check (Simplest)

```bash
# Test single app
curl -s -m 60 https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/health

# Test all apps
for app in flux wan2 seedvr2 instantid z-image; do
  echo "$app:"
  curl -s -m 60 https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health
  echo ""
done
```

**Expected responses**:
- `{"status":"healthy","app":"ryla-flux"}` - ✅ Working
- `modal-http: invalid function call` - ⏳ Still cold starting
- Timeout - ⏳ Still initializing (wait longer)

---

### 2. Comprehensive Test Script

```bash
python apps/modal/scripts/test-split-apps.py
```

**Note**: This script may timeout on first run due to cold start. Wait 5-10 minutes after deployment, then run.

---

### 3. Test Individual Endpoints

#### Flux Schnell
```bash
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 512,
    "height": 512,
    "steps": 4
  }' \
  --output test_flux.jpg
```

#### Flux Dev
```bash
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 512,
    "height": 512,
    "steps": 20
  }' \
  --output test_flux_dev.jpg
```

#### Wan2
```bash
curl -X POST https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2 \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cinematic scene",
    "width": 512,
    "height": 512,
    "length": 16
  }' \
  --output test_wan2.webp
```

---

## ⏱️ Timing

**After deployment**:
- Wait **5-10 minutes** before testing
- First request triggers cold start (2-5 min)
- Subsequent requests are fast (< 10s)

**Best practice**: Test health endpoints first, wait for them to respond, then test actual endpoints.

---

## 🔍 Troubleshooting

### Issue: Timeout on health check

**Cause**: App still in cold start

**Solution**: Wait 5-10 minutes, then retry

### Issue: "modal-http: invalid function call"

**Cause**: App initializing but not ready yet

**Solution**: Wait 2-3 more minutes, then retry

### Issue: 404 Not Found

**Cause**: Wrong endpoint URL or app not deployed

**Solution**: 
1. Check app is deployed: `modal app list | grep ryla-{app}`
2. Verify URL pattern: `https://ryla--ryla-{app}-comfyui-fastapi-app.modal.run`

---

## 📊 Test Results

Once apps are ready, you should see:
- ✅ Health endpoints return `{"status":"healthy","app":"ryla-{app}"}`
- ✅ Actual endpoints return images/files
- ✅ Response times < 10s (after cold start)

---

**Last Updated**: 2026-01-28
