# Crash Loop Fix - Import Path Corrections

**Date**: 2026-01-28  
**Issue**: All 5 apps were crash-looping due to incorrect import paths

---

## Root Cause

All apps were using incorrect import statements:
- ❌ `from utils.comfyui import ...`
- ❌ `from utils.image_utils import ...`

**Problem**: Since `/root/utils` is added to `sys.path`, Python looks for modules directly, not in a `utils` package.

**Solution**: Use direct imports:
- ✅ `from comfyui import ...`
- ✅ `from image_utils import ...`

---

## Files Fixed

### App Files (launch_comfy_server)
- `apps/modal/apps/flux/app.py`
- `apps/modal/apps/wan2/app.py`
- `apps/modal/apps/seedvr2/app.py`
- `apps/modal/apps/instantid/app.py`
- `apps/modal/apps/z-image/app.py`

### Handler Files
- `apps/modal/apps/seedvr2/handler.py` - Fixed `verify_nodes_available` and `execute_workflow_via_api`
- `apps/modal/apps/instantid/handler.py` - Fixed `decode_base64`, `verify_nodes_available`, `execute_workflow_via_api`
- `apps/modal/apps/instantid/ipadapter_handler.py` - Fixed `decode_base64`, `verify_nodes_available`, `execute_workflow_via_api`

---

## Changes Made

### Before (❌ Wrong)
```python
from utils.comfyui import launch_comfy_server
from utils.comfyui import verify_nodes_available
from utils.comfyui import execute_workflow_via_api
from utils.image_utils import decode_base64
```

### After (✅ Correct)
```python
import sys
sys.path.insert(0, "/root/utils")
from comfyui import launch_comfy_server
from comfyui import verify_nodes_available
from comfyui import execute_workflow_via_api
from image_utils import decode_base64
```

---

## Deployment Status

After fixes:
- ✅ Flux - Redeployed successfully
- ⏳ Wan2 - Redeploying
- ⏳ SeedVR2 - Redeploying
- ⏳ InstantID - Redeploying
- ⏳ Z-Image - Redeploying

---

## Testing

Once all apps are redeployed, test health endpoints:

```bash
for app in flux wan2 seedvr2 instantid z-image; do
  echo "Testing $app..."
  curl -s -m 30 https://ryla--ryla-$app-comfyui-fastapi-app.modal.run/health
  echo ""
done
```

---

**Last Updated**: 2026-01-28  
**Status**: Fixes applied, redeploying all apps
