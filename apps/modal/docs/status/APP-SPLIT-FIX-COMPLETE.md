# App Split Fix Complete

**Date**: 2026-01-28
**Status**: WORKING

## Summary

The Modal app splitting architecture is now working. The split apps successfully generate images and videos.

## What Was Fixed

### 1. Use Original Handlers
Changed all `image.py` files to copy handlers from `apps/modal/handlers/` instead of the modified split handlers:
```python
# Before (broken)
.add_local_file("apps/modal/apps/flux/handler.py", "/root/handlers/flux.py", copy=True)

# After (working)
.add_local_file("apps/modal/handlers/flux.py", "/root/handlers/flux.py", copy=True)
```

### 2. Copy Full Utils Directory
Changed `base_image` to copy entire utils directory (including `__init__.py`):
```python
# Before (broken - missing __init__.py)
.add_local_file("apps/modal/shared/utils/cost_tracker.py", "/root/utils/cost_tracker.py", copy=True)

# After (working)
.add_local_dir("apps/modal/utils", "/root/utils", copy=True)
```

### 3. Fix sys.path Order
Updated all `app.py` to add paths in correct order (last inserted = first searched):
```python
sys.path.insert(0, "/root/utils")  # Last priority
sys.path.insert(0, "/root")
sys.path.insert(0, str(_modal_dir))
sys.path.insert(0, str(_shared_dir / "utils"))
sys.path.insert(0, str(_shared_dir))
sys.path.insert(0, str(_app_dir))  # First priority
```

### 4. Add `infer` Method
Added the `@modal.method() infer()` method to all split app ComfyUI classes (required by handlers):
```python
@modal.method()
def infer(self, workflow_path: str = "/root/workflow_api.json"):
    from utils.comfyui import poll_server_health as check_health, execute_workflow
    check_health(self.port)
    return execute_workflow(workflow_path)
```

### 5. Add Exception Handler
Added global exception handler to all FastAPI apps for better error visibility.

## Test Results

| App | Status | Notes |
|-----|--------|-------|
| ryla-flux | ✅ Working | Generates PNG images |
| ryla-wan2 | ✅ Working | Generates WebP videos |
| ryla-z-image | ⚠️ Model Error | CLIPLoader model mismatch (separate issue) |
| ryla-seedvr2 | 🔄 Deployed | Needs input image to test |
| ryla-instantid | 🔄 Deployed | Needs face image to test |

## Endpoints

- Flux: `https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux`
- Wan2: `https://ryla--ryla-wan2-comfyui-fastapi-app.modal.run/wan2`
- Z-Image: `https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple`
- SeedVR2: `https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2`
- InstantID: `https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/flux-instantid`

## Key Learnings

1. **Use original working code**: When splitting apps, use the exact same handler files that work in the monolithic app
2. **Python packages need `__init__.py`**: The utils directory must include `__init__.py` for `from utils.xxx import` to work
3. **sys.path order matters**: insert(0) puts items at the front, so insert in reverse order of priority
4. **Modal containers cache code**: After deploy, stop and restart to force fresh containers with new code
5. **Exception handlers help debugging**: Add global FastAPI exception handlers to see actual errors instead of "Internal Server Error"

## Files Modified

- `apps/modal/shared/image_base.py` - Use add_local_dir for utils
- `apps/modal/apps/*/image.py` - Use original handlers from handlers/
- `apps/modal/apps/*/app.py` - Fix sys.path, add infer method, add exception handler
