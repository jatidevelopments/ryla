# Next Debugging Steps for InstantID and SeedVR2

**Date**: 2026-01-27  
**Priority**: High - Blocking endpoint functionality

---

## Current Situation

Both endpoints are failing because ComfyUI is not loading custom nodes at runtime:
- **InstantID**: Nodes installed but not loaded (503 error)
- **SeedVR2**: Nodes installed but workflow execution fails (500 error)

---

## Recommended Next Steps

### Step 1: Use Modal Shell to Inspect Container (HIGHEST PRIORITY)

This will show us the exact import errors:

```bash
# Open Modal shell
modal shell ryla-comfyui

# Inside container, test InstantID import
cd /root/comfy/ComfyUI
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from custom_nodes.ComfyUI_InstantID import nodes
    print('✅ InstantID nodes importable')
except Exception as e:
    print(f'❌ Import error: {e}')
    import traceback
    traceback.print_exc()
"

# Test SeedVR2 import
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from custom_nodes.ComfyUI_SeedVR2_VideoUpscaler import nodes
    print('✅ SeedVR2 nodes importable')
except Exception as e:
    print(f'❌ Import error: {e}')
    import traceback
    traceback.print_exc()
"

# Check if dependencies are available
python3 -c "
try:
    import insightface
    print('✅ insightface available')
except ImportError as e:
    print(f'❌ insightface not available: {e}')

try:
    import onnxruntime
    print('✅ onnxruntime available')
except ImportError as e:
    print(f'❌ onnxruntime not available: {e}')
"
```

**Expected Outcome**: This will reveal the exact import error preventing nodes from loading.

---

### Step 2: Fix Based on Import Errors

Once we know the import error, we can:

1. **If missing dependencies**: Install missing packages in image build
2. **If Python path issues**: Fix sys.path or PYTHONPATH
3. **If version conflicts**: Update package versions or ComfyUI version
4. **If structure issues**: Adjust node installation to match ComfyUI requirements

---

### Step 3: Verify ComfyUI Can Load Nodes

After fixing import errors:

1. Restart ComfyUI server
2. Check `/object_info` endpoint to verify nodes are loaded
3. Test endpoints again

---

## Alternative: Use ComfyUI Manager

If manual installation continues to fail, try using ComfyUI Manager:

```python
# In image.py, after ComfyUI installation:
.run_commands(
    "cd /root/comfy/ComfyUI && "
    "python custom_nodes/ComfyUI-Manager/install.py ComfyUI_InstantID ComfyUI-SeedVR2_VideoUpscaler"
)
```

ComfyUI Manager handles:
- Dependency installation
- Node structure requirements
- Version compatibility
- Python path setup

---

## Files to Modify

1. `apps/modal/image.py` - Fix node installation based on import errors
2. `apps/modal/utils/comfyui.py` - Improve stderr capture for ComfyUI startup
3. `apps/modal/app.py` - Add diagnostic endpoint (if needed)

---

## Success Criteria

- ✅ InstantID nodes appear in `/object_info` endpoint
- ✅ SeedVR2 nodes appear in `/object_info` endpoint
- ✅ `/flux-instantid` endpoint returns images (not 503)
- ✅ `/seedvr2` endpoint returns upscaled images (not 500)
