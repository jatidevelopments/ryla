# RYLA Unified Modal ComfyUI

Unified Modal app for all RYLA ComfyUI workflows:
- **Flux Schnell** - Fast text-to-image generation
- **Wan2.1** - Text-to-video generation
- **Custom Workflows** - Any ComfyUI workflow JSON

## Quick Start

### 1. Deploy

```bash
modal deploy apps/modal/comfyui_ryla.py
```

### 2. Use the Client

```bash
# Flux image generation
python apps/modal/ryla_client.py flux \
  --prompt "A beautiful landscape with mountains and a lake" \
  --output flux_output.jpg

# Wan2 video generation
python apps/modal/ryla_client.py wan2 \
  --prompt "A cinematic scene with dramatic lighting" \
  --output wan2_output.webp

# Custom workflow
python apps/modal/ryla_client.py workflow \
  --workflow-file my_workflow.json \
  --prompt "Custom prompt" \
  --output custom_output.jpg
```

## API Endpoints

After deployment, you can call the APIs directly:

### Flux Schnell (Image)

```bash
curl -X POST \
  "https://$(modal profile current)--ryla-comfyui-comfyui-flux.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 1024,
    "height": 1024,
    "steps": 4,
    "cfg": 1.0
  }' \
  --output flux_output.jpg
```

### Wan2.1 (Video)

```bash
curl -X POST \
  "https://$(modal profile current)--ryla-comfyui-comfyui-wan2.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cinematic scene",
    "width": 832,
    "height": 480,
    "length": 33,
    "fps": 16
  }' \
  --output wan2_output.webp
```

### Custom Workflow

```bash
curl -X POST \
  "https://$(modal profile current)--ryla-comfyui-comfyui-workflow.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {...},
    "prompt": "Optional prompt to inject"
  }' \
  --output workflow_output
```

## Features

### Flux Schnell
- **Fast image generation** (~4 steps)
- **High quality** output
- **Configurable** size, steps, CFG, seed

### Wan2.1
- **Text-to-video** generation
- **Configurable** resolution, length, FPS
- **Animated WEBP** output

### Custom Workflows
- **Any ComfyUI workflow** JSON
- **Prompt injection** support
- **Flexible** output formats

## Performance

| Workflow | Cold Start | Warm | Output |
|----------|-----------|------|--------|
| Flux | ~1 min | ~few sec | Image (JPEG) |
| Wan2.1 | ~2-3 min | ~1-2 min | Video (WEBP) |
| Custom | Varies | Varies | Varies |

## Models

Models are automatically downloaded on first deployment:
- **Flux Schnell**: `flux1-schnell-fp8.safetensors`
- **Wan2.1**: 
  - `wan2.1_t2v_1.3B_fp16.safetensors` (diffusion)
  - `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (text encoder)
  - `wan_2.1_vae.safetensors` (VAE)

Models are cached in `hf-hub-cache` volume for faster subsequent deployments.

## Integration

### From TypeScript/JavaScript

```typescript
// Flux image
const response = await fetch(
  `https://${workspace}--ryla-comfyui-comfyui-flux.modal.run`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'A beautiful landscape',
      width: 1024,
      height: 1024,
    }),
  }
);
const imageBlob = await response.blob();
```

### From Python

```python
import requests

response = requests.post(
    f"https://{workspace}--ryla-comfyui-comfyui-flux.modal.run",
    json={
        "prompt": "A beautiful landscape",
        "width": 1024,
        "height": 1024,
    },
)
with open("output.jpg", "wb") as f:
    f.write(response.content)
```

## Troubleshooting

### Models Not Found

Models are downloaded automatically. If issues occur:
```bash
modal app logs ryla-comfyui
```

### Server Health Check Failed

Check GPU availability:
```bash
modal gpu list
```

### Workflow Errors

Check ComfyUI logs:
```bash
modal app logs ryla-comfyui
```

## Next Steps

1. **Add Z-Image-Turbo** workflow support
2. **Add LoRA** support for character consistency
3. **Add caching** for faster warm starts
4. **Add batch processing** support
5. **Integrate with RYLA API** service

## References

- [Modal.com ComfyUI Guide](https://modal.com/docs/examples/comfyui)
- [Flux Schnell Model](https://huggingface.co/Comfy-Org/flux1-schnell)
- [Wan2.1 Model](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged)
