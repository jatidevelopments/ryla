# Modal Deployment Guide

**Last Updated**: 2026-01-21  
**Status**: Active

---

## Prerequisites

1. **Modal CLI installed**:
   ```bash
   pip install modal
   ```

2. **Modal account configured**:
   ```bash
   modal token new
   ```

3. **HuggingFace secret configured**:
   ```bash
   modal secret create huggingface HF_TOKEN=<your_token>
   ```

4. **Volumes created** (auto-created if missing):
   - `ryla-models` - Model storage
   - `hf-hub-cache` - HuggingFace cache

---

## Deployment

### Standard Deployment

**Option 1: Using deployment script (recommended)**
```bash
cd apps/modal
./scripts/deploy.sh
```

**Option 2: Manual deployment**
```bash
cd apps/modal
modal deploy app.py
```

### Verify Deployment

1. **Check Modal dashboard**: https://modal.com/apps
2. **Verify app is running**: Look for `ryla-comfyui` app
3. **Check logs**: `modal app logs ryla-comfyui`

---

## Testing

### Using ryla_client.py

**Option 1: Using test script (recommended)**
```bash
cd apps/modal
./scripts/test-endpoints.sh
```

**Option 2: Manual testing**
```bash
# Test Flux Schnell
python apps/modal/ryla_client.py flux \
  --prompt "A beautiful landscape" \
  --output test_flux.jpg

# Test Flux Dev
python apps/modal/ryla_client.py flux-dev \
  --prompt "A detailed portrait" \
  --output test_flux_dev.jpg

# Test InstantID
python apps/modal/ryla_client.py flux-instantid \
  --prompt "A portrait" \
  --reference-image face.jpg \
  --output test_instantid.jpg

# Test LoRA
python apps/modal/ryla_client.py flux-lora \
  --prompt "A character" \
  --lora-path character.safetensors \
  --output test_lora.jpg

# Test Wan2.1
python apps/modal/ryla_client.py wan2 \
  --prompt "A video scene" \
  --output test_wan2.webp

# Test SeedVR2
python apps/modal/ryla_client.py seedvr2 \
  --image input.jpg \
  --output upscaled.png

# Test Custom Workflow
python apps/modal/ryla_client.py workflow \
  --workflow-file workflow.json \
  --output output.jpg
```

### Using curl

```bash
# Get workspace name
WORKSPACE=$(modal profile current)

# Test endpoint
curl -X POST \
  "https://${WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run/flux" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape"}' \
  --output test.jpg
```

---

## Endpoints

All endpoints are available under the FastAPI app:

- `POST /flux` - Flux Schnell text-to-image
- `POST /flux-dev` - Flux Dev text-to-image
- `POST /flux-instantid` - Flux Dev + InstantID
- `POST /flux-lora` - Flux Dev + LoRA
- `POST /wan2` - Wan2.1 text-to-video
- `POST /seedvr2` - SeedVR2 upscaling
- `POST /workflow` - Custom workflow

**Base URL**: `https://{workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run`

---

## Configuration

### GPU Type

Edit `apps/modal/config.py`:

```python
GPU_TYPE = "L40S"  # Options: "L40S", "A100", "A10", "H100", "T4", "L4"
```

### Model Paths

Model paths are configured in `config.py`:

```python
MODEL_PATHS = {
    "checkpoints": "/root/comfy/ComfyUI/models/checkpoints",
    "clip": "/root/comfy/ComfyUI/models/clip",
    # ...
}
```

---

## Troubleshooting

### Deployment Fails

1. **Check Modal CLI version**: `modal --version`
2. **Verify secrets**: `modal secret list`
3. **Check volumes**: `modal volume list`
4. **Review logs**: `modal app logs ryla-comfyui`

### Endpoint Returns 500

1. **Check server logs**: `modal app logs ryla-comfyui`
2. **Verify model downloads**: Check image build logs
3. **Test ComfyUI server**: Check health endpoint

### Models Not Loading

1. **Verify HuggingFace token**: `modal secret get huggingface HF_TOKEN`
2. **Check volume mounts**: Verify volumes are attached
3. **Review model paths**: Check `config.py` paths match ComfyUI structure

### High Costs

1. **Check GPU type**: Verify `GPU_TYPE` in `config.py`
2. **Review cost headers**: Check `X-Cost-USD` in responses
3. **Optimize GPU**: See [GPU Requirements](../../specs/modal/GPU-REQUIREMENTS.md)

---

## Monitoring

### Modal Dashboard

- **App Status**: https://modal.com/apps
- **Usage Metrics**: View GPU usage, costs, request counts
- **Logs**: Real-time log streaming

### Cost Tracking

Each response includes cost headers:
- `X-Cost-USD`: Total cost in USD
- `X-Execution-Time-Sec`: Execution time in seconds
- `X-GPU-Type`: GPU type used

---

## Updates

### Redeploy After Changes

```bash
cd apps/modal
modal deploy app.py
```

### Update Models

Models are downloaded during image build. To update:
1. Clear volume cache (if needed)
2. Redeploy app
3. Models will be re-downloaded

---

## Related Documentation

- [Best Practices](./BEST-PRACTICES.md)
- [GPU Requirements](../../specs/modal/GPU-REQUIREMENTS.md)
- [Code Organization](../../requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)
