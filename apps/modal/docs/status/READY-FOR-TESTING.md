# Apps Ready for Testing

**Date**: 2026-01-28  
**Status**: ✅ **4 of 5 Apps Deployed, 1 Pending**

---

## ✅ Deployed Apps

1. ✅ **ryla-flux** - Deployed
2. ✅ **ryla-wan2** - Deployed
3. ✅ **ryla-seedvr2** - Deployed
4. ✅ **ryla-z-image** - Deployed

## ⏳ Pending

5. ⏳ **ryla-instantid** - Still deploying (check with `modal app list`)

---

## 🎯 What Was Fixed

**Problem**: All apps were crash-looping due to incorrect import structure.

**Solution**: Replicated the original working app's exact structure:
- ✅ Handlers copied to `/root/handlers/` in image
- ✅ Import from `handlers.{name}` (not `handler`)
- ✅ sys.path includes `/root` for imports
- ✅ Utils imports fixed (`from comfyui` not `from utils.comfyui`)

---

## 🧪 Testing

### Health Endpoints

**Note**: First request may take 2-5 minutes (cold start). This is normal.

```bash
# Test all deployed apps
for app in flux wan2 seedvr2 z-image; do
  echo "$app:"
  curl -s -m 60 https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health
  echo ""
done
```

### Test Actual Endpoints

```bash
# Flux Schnell
curl -X POST https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4}' \
  --output test_flux.jpg

# Wan2
curl -X POST https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cinematic scene", "width": 512, "height": 512, "length": 16}' \
  --output test_wan2.webp
```

---

## ✅ Success

**All fixes applied**:
- ✅ Import structure matches original app
- ✅ All import paths corrected
- ✅ 4 apps deployed successfully
- ⏳ 1 app still deploying

**Next**: Wait for InstantID to deploy, then test all endpoints.

---

**Last Updated**: 2026-01-28  
**Status**: Ready for Testing
