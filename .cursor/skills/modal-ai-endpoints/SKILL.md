---
name: modal-ai-endpoints
description: Deploys and maintains Modal.com AI endpoints for image and video generation. Modal.com is RYLA's first provider for AI inference. Use when deploying AI endpoints, maintaining Modal infrastructure, configuring models, or when the user mentions Modal.com AI endpoints or AI provider setup.
---

# Modal.com AI Endpoints

Deploys and maintains Modal.com AI endpoints for image and video generation. **Modal.com is RYLA's first provider** for AI inference infrastructure.

## Quick Start

When working with Modal.com AI endpoints:

1. **Deploy App** - `modal deploy apps/modal/app.py`
2. **Verify Endpoints** - Check Modal dashboard and test endpoints
3. **Monitor Logs** - Use `modal app logs` (with timeout)
4. **Test Endpoints** - Use `ryla_client.py` or curl
5. **Maintain Models** - Update models in volumes or image

## Provider Priority

**Modal.com is RYLA's first provider** for AI inference:
- ✅ Preferred over ComfyUI/RunPod when available
- ✅ Falls back to ComfyUI or RunPod if Modal.com is not configured
- ✅ Primary provider for all image/video generation

## Available Endpoints

### Image Generation

- `/flux-dev` - Flux Dev text-to-image (Primary MVP model, 10-20s, $0.007-0.014)
- `/flux` - Flux Schnell text-to-image (Fast, 3-5s, $0.002-0.003)
- `/flux-ipadapter-faceid` - Flux Dev + IP-Adapter FaceID (Face consistency, 12-18s)
- `/sdxl-instantid` - SDXL + InstantID (Best consistency, 15-25s)
- `/flux-lora` - Flux Dev + LoRA (High consistency >95%, requires LoRA file)

### Video Generation

- `/wan2` - Wan2.1 text-to-video (60-120s, $0.042-0.083)

### Utilities

- `/seedvr2` - SeedVR2 realistic upscaling (30-60s)
- `/workflow` - Custom ComfyUI workflow execution

**Base URL**: `https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run`

## Deployment

### Standard Deployment

```bash
# Option 1: Using deployment script (recommended)
cd apps/modal
./scripts/deploy.sh

# Option 2: Manual deployment
cd apps/modal
modal deploy app.py
```

### Verify Deployment

1. **Check Modal dashboard**: https://modal.com/apps
2. **Verify app is running**: Look for `ryla-comfyui` app
3. **Check logs**: `timeout 30 modal app logs ryla-comfyui || true`

### Endpoint URL Pattern

```
https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run
```

**Example:**
```
https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run
```

## App Structure

### Single FastAPI App

All endpoints are consolidated into a single FastAPI app:
- **Reason**: Modal free tier limits web endpoints to 8 total
- **Result**: One endpoint with multiple routes (saves 6 endpoint slots)

### File Organization

```
apps/modal/
├── app.py              # Main Modal app entry point
├── config.py           # Configuration (GPU, volumes, secrets)
├── image.py            # Docker image build configuration
├── handlers/           # Endpoint handlers
│   ├── flux.py         # Flux endpoints
│   ├── instantid.py    # InstantID endpoints
│   ├── ipadapter_faceid.py
│   ├── lora.py         # LoRA endpoints
│   ├── wan2.py         # Video endpoints
│   ├── seedvr2.py      # Upscaling endpoints
│   └── workflow.py     # Custom workflow endpoints
├── utils/              # Utilities
│   ├── comfyui.py      # ComfyUI server management
│   ├── image_utils.py  # Image processing
│   └── cost_tracker.py # Cost tracking
└── workflows/          # ComfyUI workflow JSON files
```

## Adding New Endpoints

### Step 1: Create Handler

```python
# handlers/new_endpoint.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class NewEndpointRequest(BaseModel):
    prompt: str
    # ... other fields

@router.post("/new-endpoint")
async def new_endpoint(request: NewEndpointRequest):
    # Implementation
    return {"result": "..."}
```

### Step 2: Register in App

```python
# app.py
from handlers.new_endpoint import router as new_endpoint_router

@app.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    app = FastAPI()
    
    app.include_router(new_endpoint_router)
    
    return app
```

### Step 3: Add to ComfyUI Class

```python
# app.py
@app.cls(...)
class ComfyUI:
    @modal.method()
    def new_endpoint(self, prompt: str):
        # Call ComfyUI or model
        return result
```

## Model Management

### HuggingFace Models (Recommended)

```python
# In image.py
def download_model():
    from huggingface_hub import hf_hub_download
    import os
    
    token = os.getenv("HF_TOKEN")
    
    model_path = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-dev",
        filename="flux1-dev.safetensors",
        cache_dir="/cache",  # Use HF cache volume
        token=token,
    )
    
    # Symlink to ComfyUI
    comfy_dir = Path("/root/comfy/ComfyUI")
    subprocess.run(
        f"ln -s {model_path} {comfy_dir}/models/checkpoints/flux1-dev.safetensors",
        shell=True,
    )

image = (
    modal.Image.debian_slim()
    .run_function(
        download_model,
        volumes={"/cache": hf_cache_vol},
        secrets=[modal.Secret.from_name("huggingface")],
    )
)
```

### Modal Volume Storage

```python
# For large models (>5GB)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# At runtime, symlink from volume
def setup_models():
    comfy_dir = Path("/root/comfy/ComfyUI")
    volume_dir = Path("/root/models")
    
    for model_file in (volume_dir / "checkpoints").glob("*.safetensors"):
        target = comfy_dir / "models" / "checkpoints" / model_file.name
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(f"ln -s {model_file} {target}", shell=True)
```

## Testing Endpoints

### Using ryla_client.py

```bash
# Test Flux Dev
python apps/modal/ryla_client.py flux-dev \
  --prompt "A beautiful landscape" \
  --output test_flux_dev.jpg

# Test Flux Schnell
python apps/modal/ryla_client.py flux \
  --prompt "A portrait" \
  --output test_flux.jpg

# Test IP-Adapter FaceID
python apps/modal/ryla_client.py flux-ipadapter-faceid \
  --prompt "A portrait" \
  --reference-image face.jpg \
  --output test_faceid.jpg

# Test Wan2.1
python apps/modal/ryla_client.py wan2 \
  --prompt "A video scene" \
  --output test_wan2.webp
```

### Using curl

```bash
# Get workspace
WORKSPACE=$(modal profile current)

# Test endpoint
curl -X POST \
  "https://${WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-dev" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape"}' \
  --output test.jpg
```

### Using Test Scripts

```bash
# Run all endpoint tests
cd apps/modal
./scripts/test-endpoints.sh

# Extended tests
./scripts/test-endpoints-extended.sh
```

## Monitoring & Maintenance

### View Logs

```bash
# View logs (with timeout - IMPORTANT)
timeout 30 modal app logs ryla-comfyui || true

# Follow logs
timeout 60 modal app logs ryla-comfyui -f || true

# Filter logs
modal app logs ryla-comfyui | grep "ERROR"
```

### Check Status

```bash
# App status
modal app show ryla-comfyui

# List apps
modal app list
```

### Health Checks

```bash
# Test health endpoint
curl https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run/health
```

## Cost Management

### Cost Tracking

All endpoints return cost information in response headers:
- `X-Cost-USD`: Total cost in USD
- `X-Execution-Time-Sec`: Execution time in seconds
- `X-GPU-Type`: GPU type used

### GPU Configuration

Edit `apps/modal/config.py`:

```python
GPU_TYPE = "L40S"  # Options: "L40S", "A100", "A10", "H100", "T4", "L4"
```

**GPU Pricing**: L40S = $0.000694/sec (~$2.50/hr)

### Cost Estimates

| Endpoint | Typical Time | Cost per Request |
|----------|-------------|------------------|
| `/flux` | 3-5s | $0.002-0.003 |
| `/flux-dev` | 10-20s | $0.007-0.014 |
| `/flux-ipadapter-faceid` | 12-18s | $0.008-0.012 |
| `/wan2` | 60-120s | $0.042-0.083 |

## Cold Start Handling

### Problem

First request can take 2-5 minutes:
- Container startup: ~30s
- ComfyUI installation: ~1-2 min
- Model loading: ~1-2 min
- Server startup: ~30s

### Solutions

1. **Keep-Alive Window**
```python
@app.cls(scaledown_window=300)  # Keep alive 5 minutes
```

2. **Warm-Up Requests**
```python
@app.function(schedule=modal.Cron("*/5 * * * *"))
def keep_warm():
    return {"status": "warm"}
```

3. **Client-Side Timeout**
```typescript
const response = await fetch(url, {
  signal: AbortSignal.timeout(300000)  // 5 minutes
});
```

## Error Handling

### Timeout Handling

```python
@app.function(timeout=1800)  # 30 minutes
def long_running_task():
    # ...
```

### Connection Errors

```python
import time
import requests

def poll_with_retry(url, max_retries=5, delay=2):
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
        except requests.exceptions.RequestException:
            if i < max_retries - 1:
                time.sleep(delay * (i + 1))  # Exponential backoff
            else:
                raise
```

## Best Practices

### 1. Always Use Timeouts

```bash
# ✅ Good: With timeout
timeout 30 modal app logs ryla-comfyui || true

# ❌ Bad: No timeout (can hang)
modal app logs ryla-comfyui
```

### 2. Use HuggingFace Cache Volume

```python
# ✅ Good: Use cache volume
cache_dir="/cache"  # Persists across deployments

# ❌ Bad: Download to /tmp
cache_dir="/tmp"  # Lost on container restart
```

### 3. Symlink Models (Don't Copy)

```python
# ✅ Good: Symlink
subprocess.run(f"ln -s {model_path} {target}", shell=True)

# ❌ Bad: Copy (wastes space)
shutil.copy(model_path, target)
```

### 4. Handle Missing Secrets Gracefully

```python
# ✅ Good: Check for token
token = os.getenv("HF_TOKEN")
if not token:
    print("⚠️  Warning: HF_TOKEN not set, skipping gated model download")
    return

# ❌ Bad: Fail silently
token = os.getenv("HF_TOKEN")  # May be None
```

### 5. Test Before Deploying

```bash
# ✅ Good: Test locally first
python apps/modal/ryla_client.py flux --prompt "test"

# ❌ Bad: Deploy untested changes
modal deploy app.py
```

## Troubleshooting

### Endpoint Not Responding

1. Check Modal dashboard for app status
2. View logs: `timeout 30 modal app logs ryla-comfyui || true`
3. Test health endpoint: `curl /health`
4. Check ComfyUI server status

### Model Not Found

1. Verify model in HuggingFace cache volume
2. Check symlinks in ComfyUI models directory
3. Verify HF_TOKEN is set for gated models
4. Check model paths in config

### High Costs

1. Review endpoint usage in Modal dashboard
2. Check for idle containers (reduce scaledown_window)
3. Optimize GPU type (use cheaper GPU if possible)
4. Review cost tracking headers

## Related Resources

- **Endpoints Reference**: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- **Deployment Guide**: `apps/modal/docs/DEPLOYMENT.md`
- **Best Practices**: `apps/modal/docs/BEST-PRACTICES.md`
- **Cost Tracking**: `apps/modal/docs/COST-TRACKING.md`
- **Modal Deployment**: See `mcp-modal` skill for general Modal patterns
