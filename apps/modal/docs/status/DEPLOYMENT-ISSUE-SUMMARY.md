# Deployment Issue Summary

**Date**: 2026-01-28  
**Status**: ⚠️ Apps showing "invalid function call" error

---

## Issue

All 5 split apps are returning `modal-http: invalid function call` when accessing endpoints.

**Symptoms**:
- Apps show as "stopped" in `modal app list`
- Health endpoints return: `modal-http: invalid function call`
- Logs show: "Stopping app - unknown reason"

---

## Possible Causes

1. **Deployment Failed Silently**
   - Apps may have failed during image build
   - Import errors during deployment
   - Missing dependencies

2. **ASGI App Not Properly Exposed**
   - `@modal.asgi_app()` decorator issue
   - FastAPI app not returned correctly
   - Class/function naming mismatch

3. **Cold Start Issue**
   - Apps need time to initialize
   - ComfyUI server not starting
   - Import errors at runtime

4. **Modal Version/API Change**
   - Modal SDK version mismatch
   - API changes in recent Modal updates

---

## Investigation Steps

### 1. Check Deployment Logs

```bash
# Get latest app ID
APP_ID=$(modal app list | grep "ryla-flux" | head -1 | awk '{print $2}')

# View full logs
modal app logs $APP_ID
```

### 2. Verify App Structure

```bash
# Check app.py structure
cat apps/modal/apps/flux/app.py | grep -A 5 "@modal.asgi_app"
```

### 3. Test Local Import

```bash
# Try importing the app locally
cd apps/modal/apps/flux
python -c "from app import app; print(app)"
```

### 4. Check Modal SDK Version

```bash
python -c "import modal; print(modal.__version__)"
```

---

## Next Actions

1. ⏳ **Check full deployment logs** - Look for import/build errors
2. ⏳ **Verify ASGI app structure** - Compare with working app.py
3. ⏳ **Test local imports** - Ensure code is valid
4. ⏳ **Redeploy with verbose logging** - See detailed error messages
5. ⏳ **Check Modal dashboard** - Visual inspection of deployment status

---

## Comparison with Working App

**Working app** (`apps/modal/app.py`):
- Uses `@modal.asgi_app()` on `fastapi_app` method
- Returns FastAPI app instance
- Class name: `ComfyUI`
- App name: `ryla-comfyui`

**New split apps**:
- Same structure
- Same decorator
- Same return pattern
- Different app names

**Potential difference**: Image build or import paths?

---

**Last Updated**: 2026-01-28
