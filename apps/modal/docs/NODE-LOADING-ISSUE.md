# RES4LYF Node Loading Issue

## Current Status

### ✅ What's Working
- ComfyUI Manager CLI installation is working (same method as RunPod's `comfy-node-install`)
- RES4LYF repository is being cloned correctly: `https://github.com/ClownsharkBatwing/RES4LYF`
- Nodes are installed in `/root/ComfyUI/custom_nodes/RES4LYF/beta/`
- 12 Python files found in `beta/` subdirectory
- Files are being copied to `custom_nodes/` root
- ComfyUI server starts successfully and loads 607 node types

### ❌ Current Issue
**Error**: `Cannot execute because node Sigmas Rescale does not exist.`

**Details**:
- Workflow uses `class_type: "Sigmas Rescale"` (node ID #9)
- ComfyUI loads 607 nodes but "Sigmas Rescale" is not among them
- Found similar nodes: `SplitSigmas`, `SplitSigmasDenoise`, `FlipSigmas`, `SetFirstSigma`, `ExtendIntermediateSigmas`
- But not the exact "Sigmas Rescale" node

## What We've Tried

1. ✅ Installed nodes via ComfyUI Manager CLI (same as RunPod)
2. ✅ Copied node files from `beta/` to `custom_nodes/` root
3. ✅ Created symlinks
4. ✅ Created `__init__.py` files
5. ✅ Installed nodes during image build (so they're available at ComfyUI startup)

## Possible Causes

1. **Node Class Name Mismatch**: The actual class name in the Python file might be different from "Sigmas Rescale"
2. **Import Errors**: The node files might have import errors preventing them from loading (check ComfyUI server logs)
3. **Package Structure**: ComfyUI might need the nodes in a specific package structure
4. **Node Registration**: The nodes might need to be registered differently in ComfyUI

## Next Steps

### Option 1: Check Actual Node File
Inspect the actual node file in RES4LYF to find the correct class name:
```bash
# In Modal container, check:
cat /root/ComfyUI/custom_nodes/RES4LYF/beta/*.py | grep -i "class.*rescale"
```

### Option 2: Check ComfyUI Server Logs
Look for import errors when ComfyUI tries to load the nodes:
```python
# In generate_image function, capture server stderr:
server_process = subprocess.Popen(
    ["python", "main.py", "--port", str(COMFYUI_PORT), "--listen", "127.0.0.1"],
    cwd=comfyui_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
)
# Then read stderr to see import errors
```

### Option 3: Check Node Registration
Query ComfyUI's `/object_info` endpoint to see all loaded nodes and search for variations:
```python
# Already implemented - check for "res4lyf", "beta", "clown" related nodes
```

### Option 4: Use Alternative Node
If "Sigmas Rescale" doesn't exist, check if one of the similar nodes can be used:
- `SplitSigmas`
- `SplitSigmasDenoise`
- `FlipSigmas`
- `SetFirstSigma`
- `ExtendIntermediateSigmas`

### Option 5: Check RunPod Setup
Compare how RunPod's `comfy-node-install` actually installs RES4LYF - it might do something different that we're missing.

## Reference

- Repository: https://github.com/ClownsharkBatwing/RES4LYF
- Required nodes: `ClownsharKSampler_Beta`, `Sigmas Rescale`, `BetaSamplingScheduler`
- Workflow definition: `libs/business/src/workflows/z-image-danrisi.ts`
