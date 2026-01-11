# ComfyUI Serverless Endpoint - Debug Guide

> **Issue**: ComfyUI server not starting on serverless endpoint  
> **Error**: "ComfyUI server (127.0.0.1:8188) not reachable after multiple retries"

---

## Quick Access to Logs

### Option 1: RunPod Console (Best)

1. Go to: https://www.runpod.io/console/serverless
2. Click on: `ryla-prod-guarded-comfyui-serverless -fb`
3. Click **"Logs"** tab
4. Look for:
   - ComfyUI startup errors
   - Custom node loading failures
   - Python dependency errors
   - Port binding issues

### Option 2: Job Details API

```bash
# Get job details (limited info)
pnpm tsx scripts/utils/get-runpod-job-details.ts <job_id> <endpoint_id>

# Example:
pnpm tsx scripts/utils/get-runpod-job-details.ts adb44c79-598b-4b29-9968-cec9445c9a70-e2 pwqwwai0hlhtw9
```

**Note**: API only returns error messages, not full logs.

---

## Suspected Issue: Volume Mount Path Mismatch

### Current Configuration

- **Template mount path**: `/runpod-volume` (from template `bdew7tme8c`)
- **Models location**: `/workspace/models/` (verified accessible)
- **ComfyUI location**: `/workspace/runpod-slim/ComfyUI`
- **Worker volume mount**: `/runpod-volume` (from worker info)

### The Problem

The RunPod ComfyUI worker (`runpod/worker-comfyui`) expects:
- Network volume mounted at `/runpod-volume`
- Models at `/runpod-volume/models/`
- ComfyUI at `/workspace/runpod-slim/ComfyUI`

But our setup has:
- Models at `/workspace/models/` (different location)
- Volume may be mounted at `/workspace` instead of `/runpod-volume`

### Verification Script

Run this in Jupyter on a serverless worker to check:

```python
import os

print("Volume Mount Check:")
print(f"  /runpod-volume exists: {os.path.exists('/runpod-volume')}")
print(f"  /workspace/models exists: {os.path.exists('/workspace/models')}")

if os.path.exists('/runpod-volume'):
    print(f"\n/runpod-volume contents:")
    for item in os.listdir('/runpod-volume')[:10]:
        print(f"  - {item}")

if os.path.exists('/workspace/models'):
    print(f"\n/workspace/models contents:")
    for item in os.listdir('/workspace/models')[:10]:
        print(f"  - {item}")
```

---

## Possible Solutions

### Solution 1: Update Template Volume Mount Path

If the template allows, change mount path from `/runpod-volume` to `/workspace`:

1. Check template configuration in RunPod Console
2. Update volume mount path if possible
3. Recreate endpoint with updated template

### Solution 2: Create Symlink in Dockerfile

Update `docker/comfyui-worker/Dockerfile` to create symlink:

```dockerfile
# After installing custom nodes, create symlink
RUN if [ -d "/runpod-volume/models" ] && [ ! -d "/workspace/models" ]; then \
    ln -s /runpod-volume/models /workspace/models; \
    fi
```

Then rebuild and push image.

### Solution 3: Check RunPod Worker Configuration

The `runpod/worker-comfyui` may have environment variables or config to specify model paths. Check:
- `COMFYUI_MODEL_PATH` environment variable
- Worker startup script configuration
- Network volume mount configuration

---

## Next Steps

1. **Check RunPod Console logs** for specific error messages
2. **Run verification script** on serverless worker to confirm mount paths
3. **Update Dockerfile** if symlink solution needed
4. **Rebuild and push image** if changes made
5. **Re-test** endpoint

---

## Resources

- [RunPod ComfyUI Worker Docs](https://github.com/runpod-workers/worker-comfyui)
- [Network Volumes Guide](https://docs.runpod.io/serverless/storage/network-volumes)
- Endpoint: `pwqwwai0hlhtw9` (ryla-prod-guarded-comfyui-serverless)
- Template: `bdew7tme8c` (ryla-prod-guarded-comfyui-worker)


---

## ✅ Dockerfile Fix Applied (2026-01-08)

### Changes Made

1. **Enhanced symlink script** (`/startup-link-models.sh`):
   - Now checks both `/workspace/ComfyUI` and `/workspace/runpod-slim/ComfyUI` locations
   - Better error handling and logging
   - Checks for existing symlinks before creating new ones

2. **Added entrypoint wrapper** (`/entrypoint-wrapper.sh`):
   - Runs the symlink script before starting ComfyUI
   - Preserves the base image's CMD/entrypoint behavior
   - Adds startup logging for debugging

3. **Entrypoint override**:
   - Uses our wrapper which calls the symlink script, then execs the original entrypoint

### Next Steps

1. **Rebuild Docker image**:
   ```bash
   cd docker/comfyui-worker
   docker build -t ghcr.io/jatidevelopments/ryla-comfyui-worker:latest .
   docker push ghcr.io/jatidevelopments/ryla-comfyui-worker:latest
   ```

2. **Update endpoint template** (if needed):
   - The endpoint should automatically use the new image on next deployment
   - Or manually update the template to use the new image tag

3. **Re-test endpoint**:
   ```bash
   pnpm test:comfyui-serverless
   ```

4. **Check logs**:
   - Look for "=== RYLA ComfyUI Worker Startup ===" in RunPod console logs
   - Verify symlink creation messages
   - Confirm ComfyUI server starts successfully

### Expected Log Output

When the worker starts, you should see:
```
=== RYLA ComfyUI Worker Startup ===
Running model symlink script...
Found ComfyUI at: /workspace/ComfyUI
Found models at: /runpod-volume/models
Creating symlink: /workspace/ComfyUI/models/diffusion_models -> /runpod-volume/models/diffusion_models
Creating symlink: /workspace/ComfyUI/models/text_encoders -> /runpod-volume/models/text_encoders
Creating symlink: /workspace/ComfyUI/models/vae -> /runpod-volume/models/vae
Starting ComfyUI worker...
```

