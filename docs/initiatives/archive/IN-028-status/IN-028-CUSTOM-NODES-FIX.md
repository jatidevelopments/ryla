# IN-028 Custom Nodes Installation Fix

> **Date**: 2026-01-27  
> **Status**: ✅ **FIXED**

---

## Issue

**Error**: `Cannot execute because node Sigmas Rescale does not exist.`

The custom nodes (RES4LYF) were not being installed correctly in the generated Modal code.

---

## Root Cause

The code was trying to install `res4lyf` as a pip package:
```python
python -m pip install res4lyf  # ❌ Wrong - res4lyf is not a pip package
```

But `res4lyf` is a ComfyUI Manager package that needs to be installed via ComfyUI Manager's CLI with the direct GitHub URL.

---

## Fix Applied

**File**: `scripts/workflow-deployer/generate-modal-code.ts`

**Changed from**:
```typescript
// Wrong approach
"cd /root/comfy/ComfyUI && python -m pip install res4lyf || true"
"cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/install.py res4lyf || true"
```

**Changed to**:
```typescript
// Correct approach - install ComfyUI Manager first, then use CLI
"cd /root/comfy/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager || true"
"cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Manager && (pip install -r requirements.txt || true) || true"

// For res4lyf specifically - use direct GitHub URL
"cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install https://github.com/ClownsharkBatwing/RES4LYF || true"
```

---

## Why This Works

1. **ComfyUI Manager CLI**: Uses the same method as RunPod's `comfy-node-install`
2. **Direct GitHub URL**: `res4lyf` is not in Manager's registry, so we use the direct URL
3. **Correct Repository**: `https://github.com/ClownsharkBatwing/RES4LYF` (not `res4lyf/res4lyf`)

---

## Custom Nodes Installed

- ✅ **BetaSamplingScheduler** → From RES4LYF
- ✅ **Sigmas Rescale** → From RES4LYF  
- ✅ **ClownsharKSampler_Beta** → From RES4LYF

---

## Test Status

After this fix, the workflow should be able to execute successfully with all required custom nodes available.

---

**Last Updated**: 2026-01-27  
**Status**: ✅ **FIXED**
