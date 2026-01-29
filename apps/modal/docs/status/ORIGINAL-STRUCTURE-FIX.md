# Fixed: Using Original App Structure Pattern

**Date**: 2026-01-28  
**Status**: ✅ **Fixed - Using Exact Same Pattern as Original App**

---

## Problem

All apps were failing with `ModuleNotFoundError: No module named 'handler'` because we were trying to import from `handler` (singular) which doesn't exist.

---

## Solution: Match Original App Exactly

**Original app pattern**:
1. Copies handlers to `/root/handlers/` in image: `.add_local_dir("apps/modal/handlers", "/root/handlers", copy=True)`
2. Imports: `from handlers.flux import setup_flux_endpoints`
3. Adds `/root` to sys.path: `sys.path.insert(0, "/root")`

**Applied to split apps**:
1. ✅ Copy each app's handler to `/root/handlers/{name}.py` in image
2. ✅ Import: `from handlers.{name} import setup_{name}_endpoints` (inside fastapi_app method)
3. ✅ Add `/root` to sys.path in all app.py files

---

## Changes Made

### Image Builds (image.py files)

All apps now copy handler files to `/root/handlers/`:

- **Flux**: `.add_local_file("apps/modal/apps/flux/handler.py", "/root/handlers/flux.py", copy=True)`
- **Wan2**: `.add_local_file("apps/modal/apps/wan2/handler.py", "/root/handlers/wan2.py", copy=True)`
- **SeedVR2**: `.add_local_file("apps/modal/apps/seedvr2/handler.py", "/root/handlers/seedvr2.py", copy=True)`
- **InstantID**: 
  - `.add_local_file("apps/modal/apps/instantid/handler.py", "/root/handlers/instantid.py", copy=True)`
  - `.add_local_file("apps/modal/apps/instantid/ipadapter_handler.py", "/root/handlers/ipadapter_faceid.py", copy=True)`
- **Z-Image**: `.add_local_file("apps/modal/apps/z-image/handler.py", "/root/handlers/z_image.py", copy=True)`

### App Files (app.py)

All apps now:
1. Add `/root` to sys.path (same as original)
2. Import handlers inside `fastapi_app` method (lazy import, after image is built)
3. Use same import pattern: `from handlers.{name} import setup_{name}_endpoints`

**Example (Flux)**:
```python
# At top level
sys.path.insert(0, "/root")
sys.path.insert(0, "/root/utils")

# Inside fastapi_app method
from handlers.flux import setup_flux_endpoints
setup_flux_endpoints(fastapi, self)
```

---

## Why This Works

1. **Image build time**: Handler files are copied to `/root/handlers/` in the container
2. **Runtime**: `/root` is in sys.path, so `from handlers.flux import ...` works
3. **Lazy import**: Importing inside `fastapi_app` method ensures image is built first

---

## Status

- ✅ Flux - Deployed and testing
- ⏳ Wan2 - Deploying
- ⏳ SeedVR2 - Deploying
- ⏳ InstantID - Deploying
- ⏳ Z-Image - Deploying

---

**Last Updated**: 2026-01-28  
**Status**: Using exact same pattern as original working app
