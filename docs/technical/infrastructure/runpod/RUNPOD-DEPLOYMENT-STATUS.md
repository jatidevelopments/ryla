# RunPod Deployment Status

> **Last Checked**: 2025-12-10  
> **Team**: Dream Companion (Verified ✅)

## Current Status: ✅ COMFYUI POD DEPLOYED

### ComfyUI Pod: Active ✅

**Pod Name**: `ryla_ai_comfy_ui_rd`

**Configuration**:
- GPU: RTX 4090 (24GB VRAM) ✅
- RAM: 30GB
- Disk: 200GB
- Status: Running

**Access**:
- ComfyUI: Port 8188 (Ready) ✅
- FileBrowser: Port 8080 (Ready)
- JupyterLab: Port 8888 (Ready)
- SSH: Available

**See**: `COMFYUI-POD-INFO.md` for full connection details

### Network Volume: Status Unknown

**Previous Issue**: Account balance too low
**Current Status**: Need to verify if network volume exists
**Action**: Check if `ryla-models-dream-companion` volume exists

## Required Actions

### 1. Switch to Team Account Context

**Option A: Get Team API Key** (Recommended for MCP/API):
1. Go to RunPod Console → Switch to "Dream Companion" team
2. Settings → API Keys → Generate new key
3. Update `RUNPOD_API_KEY` environment variable
4. Restart Cursor/MCP server

**Option B: Transfer Credits** (If credits on personal account):
1. Personal account → Billing → Generate credit code
2. Team account → Billing → Redeem code
3. Note: 2-5% transfer fee

### 2. Add Funds to RunPod Account (Team Account)

**Minimum Required**:
- $5 for Network Volume
- Additional credits for Pod rental (varies by GPU, ~$0.22/hour for RTX 3090)
- **Recommended**: Add $10-20 for initial setup

**Steps**:
1. Go to RunPod Console: https://www.runpod.io/console
2. Navigate to Billing → Add Funds
3. Add minimum $10 (recommended)
4. Verify balance appears in account

### 2. Deploy Infrastructure (Once Funded)

**Network Volume**:
```bash
# Via MCP
Create a 200GB network volume named ryla-models-dream-companion in US-OR-1
```

**ComfyUI Pod**:
```bash
# Via MCP
Create a RunPod pod named ryla-comfyui-dream-companion with GPU type NVIDIA GeForce RTX 3090
```

## Resources Status

| Resource | Name | Status | Notes |
|----------|------|--------|-------|
| ComfyUI Pod | `ryla_ai_comfy_ui_rd` | ✅ **ACTIVE** | RTX 4090, ready for testing |
| Network Volume | `ryla-models-dream-companion` | ❓ Unknown | Need to verify existence |
| Serverless Endpoint | `ryla-image-generation` | ⏸️ Pending | Deploy after ComfyUI testing |

## Codebase Status

✅ **Ready** (doesn't require funding):
- ComfyUI workflow builder
- RunPod client
- Base image generation service
- Character sheet generation service (NEW)
- API endpoints
- Database schemas

⏸️ **Pending Infrastructure**:
- Network Volume (for model storage)
- ComfyUI Pod (for visualization)
- Serverless Endpoint (for production)

## Next Steps

1. ✅ **ComfyUI Pod Deployed** - Ready for testing
2. ⏭️ **Verify Network Volume** - Check if `ryla-models-dream-companion` exists
3. ⏭️ **Download Models** - Flux Dev, Z-Image-Turbo, PuLID, ControlNet, IPAdapter
4. ⏭️ **Test Workflows** - Follow `COMFYUI-TESTING-GUIDE.md`
5. ⏭️ **Export Workflows** - Save JSON files for serverless implementation
6. ⏭️ **Create Serverless Endpoint** - After testing complete

## Verification Commands

Once funded, verify deployment:

```bash
# Check Network Volume
Get network volume: ryla-models-dream-companion

# Check Pod
List all my RunPod pods
Get pod: <pod-id>

# Check Endpoint
List all my RunPod serverless endpoints
```

