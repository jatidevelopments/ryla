# Test Status - Modal Denrisi Workflow

> **Status**: ⚠️ **TESTING IN PROGRESS** - Debugging 400 Error

---

## ✅ What's Working

- ✅ Modal app deployed
- ✅ All models uploaded (3/3, 19.22 GB)
- ✅ ComfyUI installed
- ✅ Volume configured

---

## ⚠️ Current Issue

**Error**: `HTTP Error 400: Bad Request` when queueing workflow

**Possible Causes**:

1. **Custom Nodes Not Installed**
   - `res4lyf` nodes (ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler) may not be installed
   - These are required for the Denrisi workflow
   - Custom nodes install at runtime via ComfyUI Manager

2. **ComfyUI Server Not Ready**
   - Server might not be fully started when we try to queue
   - Custom nodes might need time to load

3. **Workflow Format Issue**
   - Workflow JSON structure might not match ComfyUI API expectations
   - Node references might be incorrect

4. **Model Path Issues**
   - Models might not be in expected locations
   - ComfyUI might be looking in different directories

---

## 🔍 Debugging Steps

### Step 1: Check Server Startup

The ComfyUI server needs to:
1. Start successfully
2. Load all custom nodes
3. Discover models in the volume

**Current**: Server appears to start (no timeout), but workflow queue fails.

### Step 2: Verify Custom Nodes

The Denrisi workflow requires:
- `ClownsharKSampler_Beta` (from res4lyf)
- `Sigmas Rescale` (from res4lyf)
- `BetaSamplingScheduler` (from res4lyf)

**Issue**: These nodes might not be installed because:
- `res4lyf` repository might be private/require auth
- Installation happens at runtime, not during image build

### Step 3: Check Model Paths

Models are at:
- `/root/models/checkpoints/z_image_turbo_bf16.safetensors`
- `/root/models/clip/qwen_3_4b.safetensors`
- `/root/models/vae/z-image-turbo-vae.safetensors`

ComfyUI might expect them at:
- `/root/ComfyUI/models/checkpoints/`
- `/root/ComfyUI/models/clip/`
- `/root/ComfyUI/models/vae/`

---

## 🛠️ Next Steps to Fix

### Option 1: Create Symlinks (Quick Fix)

Create symlinks from ComfyUI's expected paths to our volume:

```python
# In generate_image function, before starting server
import os
os.makedirs("/root/ComfyUI/models/checkpoints", exist_ok=True)
os.makedirs("/root/ComfyUI/models/clip", exist_ok=True)
os.makedirs("/root/ComfyUI/models/vae", exist_ok=True)
os.symlink("/root/models/checkpoints/z_image_turbo_bf16.safetensors", 
           "/root/ComfyUI/models/checkpoints/z_image_turbo_bf16.safetensors")
# ... etc
```

### Option 2: Install Custom Nodes Properly

Ensure res4lyf nodes are installed:
- Use ComfyUI Manager API at runtime
- Or pre-install during image build (if repo is accessible)

### Option 3: Use Simpler Workflow First

Test with a basic workflow (no custom nodes) to verify:
- Server starts correctly
- Models are found
- Basic generation works

Then add custom nodes incrementally.

---

## 📝 Current Test Results

```
Status: error
Error: HTTP Error 400: Bad Request
```

**Need**: Full error message from ComfyUI to diagnose the issue.

---

## 💡 Recommendation

1. **Add symlinks** for models (Option 1) - Most likely fix
2. **Improve error logging** to see ComfyUI's actual error message
3. **Test with simpler workflow** to isolate the issue

---

**Status**: Debugging in progress. The setup is complete, but we need to resolve the workflow execution issue.
