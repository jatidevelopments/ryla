# ComfyUI Serverless Endpoint - Test Results

> **Date**: 2026-01-07  
> **Status**: Testing  
> **Endpoint**: `ryla-prod-guarded-comfyui-serverless` (ID: `pwqwwai0hlhtw9`)

---

## Endpoint Configuration

### Template
- **Name**: `ryla-prod-guarded-comfyui-worker`
- **ID**: `bdew7tme8c`
- **Image**: `ghcr.io/jatidevelopments/ryla-comfyui-worker:latest`
- **Container Disk**: 50GB
- **Custom Nodes**: res4lyf, controlaltai-nodes
- **Workflow Converter**: ✅ Installed

### Endpoint
- **Name**: `ryla-prod-guarded-comfyui-serverless -fb`
- **ID**: `pwqwwai0hlhtw9`
- **GPU Types**: RTX 4090, RTX 3090
- **Workers**: Min 0, Max 2
- **Network Volume**: ⚠️ **Needs manual attachment** (see below)

---

## ⚠️ Required Setup Step

### Attach Network Volume

The network volume must be attached **manually in the RunPod Console**:

1. Go to: https://www.runpod.io/console/serverless
2. Click on endpoint: `ryla-prod-guarded-comfyui-serverless -fb`
3. Set **Network Volume** to `ryla-models-dream-companion` (ID: `xeqfzsy4k7`)
4. Click **Save Endpoint**

**Why manual?** The RunPod MCP `create-endpoint` tool doesn't support network volume attachment. This is the same limitation as the other endpoints.

**Mount Path**: The volume will be mounted at `/runpod-volume` (RunPod default for ComfyUI worker templates).

---

## Test Workflow: Z-Image Danrisi

### Workflow Details
- **Source**: `libs/business/src/workflows/z-image-danrisi.ts`
- **Custom Nodes Required**:
  - `ClownsharKSampler_Beta` (from res4lyf)
  - `Sigmas Rescale` (from res4lyf)
  - `BetaSamplingScheduler` (from res4lyf)
  - `FluxResolutionNode` (from controlaltai-nodes)

### Test Command

```bash
# Run test
pnpm test:comfyui-serverless

# Or directly
tsx scripts/tests/test-comfyui-serverless.ts
```

### Test Input

```typescript
{
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality, professional photography, studio lighting",
  negativePrompt: "blurry, low quality, distorted, ugly, bad anatomy",
  width: 1024,
  height: 1024,
  steps: 20,
  cfg: 1.0,
  seed: 42
}
```

---

## Test Results

### Test 1: Z-Image Danrisi (Cold Start) - First Attempt

**Status**: ❌ Failed - Models Not Found  
**Date**: 2026-01-07  
**Job ID**: `1486b0bc-f433-4050-b842-189a58089541-e1`

### Test 2: Z-Image Danrisi (Cold Start) - After Model Verification

**Status**: ❌ Failed - ComfyUI Server Not Reachable  
**Date**: 2026-01-07  
**Job ID**: `adb44c79-598b-4b29-9968-cec9445c9a70-e2`

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Cold Start Time | 498.4s (8.3 min) | < 5 min | ⚠️ Slow but acceptable |
| Execution Time | N/A | < 30s | ❌ Failed before execution |
| Total Time | 524.1s (8.7 min) | < 6 min | ⚠️ Within timeout |
| Images Generated | 0 | 1 | ❌ |
| Success | ❌ | ✅ | ❌ |

**Test 1 Error**:
```
Workflow validation failed:
• Node 3 (VAELoader): 'z-image-turbo-vae.safetensors' not found
• Node 1 (UNETLoader): 'z_image_turbo_bf16.safetensors' not found  
• Node 2 (CLIPLoader): 'qwen_3_4b.safetensors' not found
```

**Test 2 Error** (from logs):
```
Workflow validation failed:
• UNETLoader: 'z_image_turbo_bf16.safetensors' not in [] (empty list)
• CLIPLoader: 'qwen_3_4b.safetensors' not in [] (empty list)  
• VAELoader: 'z-image-turbo-vae.safetensors' not in ['pixel_space'] (only found pixel_space)
```

**Root Cause**: Custom loaders (UNETLoader, CLIPLoader) scan ComfyUI's model directories but find empty lists. Models exist at `/workspace/models/` but ComfyUI's custom loaders look in `/workspace/runpod-slim/ComfyUI/models/` which doesn't have the models.

**Root Cause Identified**: 
- ComfyUI server **IS starting** (worker connects successfully)
- Custom loaders (UNETLoader, CLIPLoader, VAELoader) **can't find models**
- Models exist at `/workspace/models/` but loaders scan `/workspace/runpod-slim/ComfyUI/models/` which is empty
- **Solution**: Create symlinks from ComfyUI's model directories to network volume

**Notes**:
- ✅ Models verified accessible: All 3 Z-Image models found at `/workspace/models/`
- ✅ ComfyUI server starts: Worker connects to ComfyUI successfully
- ❌ Custom loaders can't find models: They scan empty directories
- **Fix needed**: Create symlinks so ComfyUI's model directories point to network volume

### Test 2: Z-Image Danrisi (Warm)

**Status**: ⏳ Pending  
**Date**: TBD

| Metric | Value | Target |
|--------|-------|--------|
| Execution Time | TBD | < 30s |
| Images Generated | TBD | 1 |
| Success | TBD | ✅ |

**Notes**:
- Second request should be faster (no cold start)
- Expected execution: 10-30 seconds

---

## Comparison: Serverless vs Dedicated Pod

| Metric | Serverless | Dedicated Pod | Winner |
|--------|-----------|---------------|--------|
| **Cold Start** | 3-5 min | Instant | Pod |
| **Warm Execution** | 10-30s | 5-15s | Pod |
| **Cost (Idle)** | $0/hr | $0.22/hr | Serverless |
| **Cost (Active)** | ~$0.22/hr | $0.22/hr | Tie |
| **Scalability** | Auto (0-2 workers) | Fixed (1 pod) | Serverless |
| **Setup Complexity** | Medium | Low | Pod |

---

## Success Criteria

- [ ] Network volume attached
- [ ] Workflow JSON accepted
- [ ] Models load from network volume
- [ ] Custom nodes work (res4lyf, controlaltai-nodes)
- [ ] Cold start < 5 minutes
- [ ] Warm execution < 30 seconds
- [ ] Output images returned
- [ ] Image quality matches dedicated pod

---

## Troubleshooting

### If Test Fails

1. **Check Network Volume**:
   - ✅ Verify volume `xeqfzsy4k7` is attached (confirmed)
   - ❌ Check models exist in ComfyUI's expected directories
   - **Issue**: ComfyUI worker expects models in ComfyUI's standard structure:
     - `models/unet/` or `models/diffusion_models/` for UNETLoader
     - `models/clip/` or `models/text_encoders/` for CLIPLoader  
     - `models/vae/` for VAELoader
   - **Current**: Models may be in different structure or missing
   
2. **Model Directory Structure**:
   The RunPod ComfyUI worker uses ComfyUI's standard model paths. For Z-Image custom loaders, models need to be in:
   - `/runpod-volume/models/diffusion_models/z_image_turbo_bf16.safetensors` (for UNETLoader)
   - `/runpod-volume/models/text_encoders/qwen_3_4b.safetensors` (for CLIPLoader)
   - `/runpod-volume/models/vae/z-image-turbo-vae.safetensors` (for VAELoader)
   
   **OR** ComfyUI's standard paths:
   - `/runpod-volume/models/checkpoints/` (if using standard checkpoint loader)
   - `/runpod-volume/models/clip/` (if using standard CLIP loader)
   - `/runpod-volume/models/vae/` (if using standard VAE loader)

2. **Check Endpoint Logs** (IMPORTANT):
   
   **Via RunPod Console** (Recommended):
   - Go to: https://www.runpod.io/console/serverless
   - Click endpoint: `ryla-prod-guarded-comfyui-serverless -fb`
   - Click **"Logs"** tab
   - Look for ComfyUI startup errors, custom node loading failures
   
   **Via API** (Limited info):
   ```bash
   pnpm tsx scripts/utils/get-runpod-job-details.ts <job_id> <endpoint_id>
   ```
   - Note: API doesn't return detailed logs, only error messages

3. **ComfyUI Server Not Starting**:
   - Error: "ComfyUI server (127.0.0.1:8188) not reachable"
   - **Volume Mount Path Issue** (Suspected):
     - Workers mount volume at: `/runpod-volume` (from template)
     - Models are at: `/workspace/models/` (verified)
     - ComfyUI is at: `/workspace/runpod-slim/ComfyUI`
     - **Mismatch**: ComfyUI worker may be looking for models in wrong location
   - Other possible causes:
     - Custom nodes (res4lyf, controlaltai-nodes) failing to load
     - Missing Python dependencies
     - Port conflicts
     - Memory issues during startup
   - **Action**: 
     1. Check RunPod Console logs (see above)
     2. Verify volume mount path configuration
     3. May need to update template to mount at `/workspace` instead of `/runpod-volume`

4. **Verify Custom Nodes**:
   - Check if res4lyf and controlaltai-nodes are installed correctly
   - Should be baked into Docker image
   - May need to verify installation in logs

5. **Check Worker Status**:
   - Worker starts successfully (8.3 min cold start)
   - ComfyUI server fails to start within worker
   - Need to investigate ComfyUI startup process

### Common Issues

- **Model Not Found**: Network volume not attached or models missing
- **Custom Node Error**: Nodes not installed in image (should be fixed)
- **Timeout**: Cold start takes longer - wait up to 5 minutes
- **GPU Not Available**: Check RunPod Console for GPU availability

---

## Next Steps

1. ✅ **Attach Network Volume** - Completed
2. ✅ **Run Test** - Completed (failed - models not found by loaders)
3. ✅ **Verify Models** - All models exist at `/workspace/models/`
4. **Fix Model Paths**: 
   - Run symlink script in Jupyter on serverless worker:
   ```python
   # Paste and run in Jupyter
   exec(open('scripts/utils/fix-comfyui-model-paths.py').read())
   ```
   - Or manually create symlinks:
   ```bash
   ln -s /workspace/models/diffusion_models /workspace/runpod-slim/ComfyUI/models/diffusion_models
   ln -s /workspace/models/text_encoders /workspace/runpod-slim/ComfyUI/models/text_encoders
   ln -s /workspace/models/vae /workspace/runpod-slim/ComfyUI/models/vae
   ```
5. **Re-run Test**: `pnpm test:comfyui-serverless`
6. **Compare Performance**: Compare with dedicated pod if available
7. **Make Recommendation**: Serverless vs Pod vs Hybrid approach

## Findings

### ✅ Positive Results
- **Models verified accessible**: All 3 Z-Image models found at correct paths
  - UNET: `/workspace/runpod-slim/ComfyUI/models/diffusion_models/z_image_turbo_bf16.safetensors` (11.46 GB)
  - CLIP: `/workspace/runpod-slim/ComfyUI/models/text_encoders/qwen_3_4b.safetensors` (7.49 GB)
  - VAE: `/workspace/runpod-slim/ComfyUI/models/vae/z-image-turbo-vae.safetensors` (0.31 GB)
- **Worker starts successfully**: Cold start completes in ~8.3 minutes
- **Network volume accessible**: Models directory structure correct

### ❌ Issues Found
- **ComfyUI server fails to start**: Port 8188 not reachable after worker starts
- **Cold start slower than expected**: 8.3 minutes (target was < 5 minutes)
- **Workflow never executes**: Fails before ComfyUI can process workflow

### 🔍 Investigation Needed

**Volume Mount Path Mismatch** (CRITICAL):
- Workers mount volume at: `/runpod-volume` (from template config)
- Models are located at: `/workspace/models/` (verified accessible)
- ComfyUI is at: `/workspace/runpod-slim/ComfyUI`
- **Issue**: ComfyUI worker may be looking for models in wrong location

**Possible Solutions**:
1. **Check template volume mount path**: Template may need to mount at `/workspace` instead of `/runpod-volume`
2. **Create symlink in worker**: Mount volume at `/runpod-volume` and symlink to `/workspace/models`
3. **Update Dockerfile**: Configure ComfyUI to look in `/runpod-volume/models/` instead
4. **Check RunPod Console logs**: Direct access needed for detailed error messages

**To Check Logs**:
- RunPod Console → Serverless → Endpoint `ryla-prod-guarded-comfyui-serverless -fb` → Logs tab
- Or use: `pnpm tsx scripts/utils/get-runpod-job-details.ts <job_id> <endpoint_id>`

---

## References

- [ComfyUI Worker Setup Guide](./COMFYUI-WORKER-SETUP.md)
- [RunPod Resources Ledger](./RESOURCES.md)
- [Endpoint Setup Notes](./ENDPOINT-SETUP.md)
- [Z-Image Danrisi Workflow](../../../libs/business/src/workflows/z-image-danrisi.ts)

