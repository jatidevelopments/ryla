# Endpoint Debugging Summary

**Date**: 2026-01-27  
**Status**: Debugging In Progress  
**Epic**: EP-059 (Modal Code Organization) - Endpoint Fixes

---

## Current Status

### InstantID Endpoint (`/flux-instantid`)
- ❌ **Status**: Failing (503 Service Unavailable)
- **Error**: `InstantID custom nodes not loaded: InsightFaceLoader, InstantIDModelLoader, InstantIDControlNetLoader, ApplyInstantID`
- **Root Cause**: ComfyUI is not loading the InstantID custom nodes at runtime, despite installation during image build

### SeedVR2 Endpoint (`/seedvr2`)
- ❌ **Status**: Failing (500 Internal Server Error)
- **Error**: HTTP 500 (detailed error message not captured yet)
- **Root Cause**: Workflow execution issue (likely related to custom node loading)

---

## Debugging Steps Taken

### 1. Node Verification ✅
- Added `verify_nodes_available()` utility to check if nodes are loaded
- Confirmed nodes are NOT being loaded by ComfyUI at runtime
- Node verification is working correctly and detecting missing nodes

### 2. Improved Logging ✅
- Enhanced `launch_comfy_server()` to:
  - Check custom nodes directory structure
  - Verify InstantID and SeedVR2 directories exist
  - Check for node files (nodes.py, __init__.py)
  - Query ComfyUI's `/object_info` endpoint to see loaded nodes
  - Log node count and specific node availability

### 3. Dependency Installation ✅
- Switched from `pip install` to `uv pip install --system` for consistency with Modal's Python environment
- Ensured dependencies are installed during image build
- Verified installation commands complete successfully

### 4. Error Handling ✅
- Improved error messages in handlers to show detailed tracebacks
- Updated client to display server error details
- Added proper status codes (503 for missing nodes, 500 for execution errors)

---

## Root Cause Analysis

### Why Nodes Aren't Loading

**Hypothesis 1**: Import errors during ComfyUI startup
- ComfyUI scans `custom_nodes/` at startup
- If Python import fails, nodes fail silently
- Need to capture ComfyUI startup stderr to see import errors

**Hypothesis 2**: Python path issues
- ComfyUI might use a different Python path than where dependencies are installed
- `uv pip install --system` should fix this, but need to verify

**Hypothesis 3**: Missing runtime dependencies
- Some dependencies might only be needed at runtime, not during image build
- Need to ensure all dependencies are available when ComfyUI starts

**Hypothesis 4**: Node structure issues
- ComfyUI might require specific file structure (nodes.py vs __init__.py)
- Need to verify InstantID repository structure matches ComfyUI expectations

---

## Next Steps

### Immediate (Critical)
1. **Use Modal Shell to inspect container**:
   ```bash
   modal shell ryla-comfyui
   # Then inside container:
   cd /root/comfy/ComfyUI
   python -c "import sys; sys.path.insert(0, '.'); from custom_nodes.ComfyUI_InstantID import nodes"
   ```
   This will show us the exact import error preventing nodes from loading.

2. **Check ComfyUI startup stderr**:
   - Modify `launch_comfy_server()` to properly capture and log stderr
   - ComfyUI prints import errors to stderr when loading custom nodes
   - These errors are currently being lost

3. **Verify Python environment**:
   - Ensure `insightface`, `onnxruntime-gpu` are in the same Python environment ComfyUI uses
   - Check if `comfy launch` uses a different Python interpreter

### Alternative Approaches
1. **Use ComfyUI Manager for installation**:
   - ComfyUI Manager handles dependencies and node structure automatically
   - May be more reliable than manual git clone + pip install

2. **Pre-import nodes before ComfyUI starts**:
   - Import nodes in Python before launching ComfyUI
   - This will surface import errors immediately
   - Then ComfyUI should be able to load them

3. **Check ComfyUI version compatibility**:
   - Verify InstantID and SeedVR2 nodes are compatible with ComfyUI 0.3.71
   - May need to update ComfyUI or use different node versions

### Follow-up
1. Once import errors are identified, fix missing dependencies or Python path issues
2. If structure issues, adjust node installation to match ComfyUI requirements
3. Document the solution for future custom node installations

---

## Files Modified

1. `apps/modal/utils/comfyui.py` - Enhanced logging and node verification
2. `apps/modal/handlers/instantid.py` - Node verification before execution
3. `apps/modal/handlers/seedvr2.py` - Improved error handling
4. `apps/modal/image.py` - Switched to `uv pip install --system`
5. `apps/modal/app.py` - Added node verification at startup
6. `apps/modal/ryla_client.py` - Improved error message display

---

## Related Documentation

- Endpoint Fixes Status: `apps/modal/docs/status/ENDPOINT-FIXES-STATUS.md`
- Modal Best Practices: `.cursor/rules/mcp-modal.mdc`
- Deployment Guide: `apps/modal/docs/DEPLOYMENT.md`
