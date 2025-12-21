# ComfyUI Worker Setup for Z-Image-Turbo

> **Date**: 2025-12-21  
> **Status**: Planning  
> **Approach**: Option B - Use `runpod-workers/worker-comfyui` with Danrisi workflow

## Overview

Instead of writing custom Python handlers for Z-Image-Turbo (which uses a complex split-component architecture), we'll use RunPod's official ComfyUI worker that:
- ✅ Runs serverless (scales to zero)
- ✅ Accepts workflow JSON via API
- ✅ Supports network volumes for models
- ✅ Has built-in S3 upload support
- ✅ Community-maintained with active development

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   RYLA API      │────▶│  RunPod Endpoint     │────▶│  Network Volume │
│   (apps/api)    │     │  (worker-comfyui)    │     │  (21 GB models) │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │
        │                         ▼
        │               ┌──────────────────────┐
        │               │  ComfyUI (headless)  │
        │               │  + RES4LYF nodes     │
        │               │  + Z-Image workflow  │
        │               └──────────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐     ┌──────────────────────┐
│   Supabase      │◀────│   Output Images      │
│   Storage       │     │   (base64 or S3)     │
└─────────────────┘     └──────────────────────┘
```

## Step 1: Network Volume Model Setup

### Directory Structure (Serverless)

```
/runpod-volume/
└── models/
    ├── diffusion_models/
    │   └── z_image_turbo_bf16.safetensors     (~12.3 GB)
    ├── text_encoders/
    │   └── qwen_3_4b.safetensors              (~8 GB)
    ├── vae/
    │   └── z-image-turbo-vae.safetensors      (~335 MB)
    ├── loras/
    │   └── nicegirls_Zimage.safetensors       (optional)
    └── checkpoints/
        └── flux1-schnell.safetensors          (if using FLUX fallback)
```

### Download Commands (on RunPod Pod)

```bash
# Create directories
mkdir -p /runpod-volume/models/{diffusion_models,text_encoders,vae,loras,checkpoints}

# Download Z-Image-Turbo components (~21 GB total)
cd /runpod-volume/models/diffusion_models
wget -O z_image_turbo_bf16.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors"

cd /runpod-volume/models/text_encoders
wget -O qwen_3_4b.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors"

cd /runpod-volume/models/vae
wget -O z-image-turbo-vae.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"
```

## Step 2: Custom Dockerfile

Create a custom Docker image based on `worker-comfyui` with Z-Image custom nodes:

```dockerfile
# docker/z-image-comfyui/Dockerfile
FROM runpod/worker-comfyui:5.6.0-base

# Install Z-Image required custom nodes
RUN comfy-node-install res4lyf controlaltai-nodes

# Note: Models loaded from network volume at runtime
# No need to bake models into image
```

### Build & Push

```bash
cd /path/to/RYLA
docker build -t ghcr.io/jatidevelopments/ryla-zimage-comfyui:latest \
  -f docker/z-image-comfyui/Dockerfile .

docker push ghcr.io/jatidevelopments/ryla-zimage-comfyui:latest
```

## Step 3: Create RunPod Endpoint

1. Go to [RunPod Console > Serverless](https://www.runpod.io/console/serverless)
2. Create new endpoint:
   - **Name**: `ryla-zimage-comfyui`
   - **Docker Image**: `ghcr.io/jatidevelopments/ryla-zimage-comfyui:latest`
   - **GPU**: RTX 4090 / RTX 3090 (24GB VRAM required)
   - **Network Volume**: `ryla-models-dream-companion` (attach at `/runpod-volume`)
   - **Min Workers**: 0 (serverless)
   - **Max Workers**: 3

### Environment Variables

```
NETWORK_VOLUME_DEBUG=true  # Enable during setup, disable in production
```

## Step 4: API Integration

### Request Format

```json
{
  "input": {
    "workflow": {
      // ... Z-Image Danrisi workflow JSON ...
      // Dynamically inject prompt into node 6 (positive prompt)
    }
  }
}
```

### Workflow Modification for API

The Danrisi workflow needs slight modifications for API use:

1. **Positive Prompt** (Node 6): Inject user prompt
2. **Seed** (Node 52): Randomize or accept from request
3. **Resolution** (Node 41): Accept from request

### Example API Call

```bash
curl -X POST \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "workflow": { ... workflow JSON with injected prompt ... }
    }
  }' \
  https://api.runpod.ai/v2/<endpoint_id>/runsync
```

### Response Format

```json
{
  "id": "job-uuid",
  "status": "COMPLETED",
  "output": {
    "images": [
      {
        "filename": "Z-Image_00001_.png",
        "type": "base64",
        "data": "iVBORw0KGgo..."
      }
    ]
  }
}
```

## Step 5: RYLA Backend Integration

Update `apps/api` to call the ComfyUI endpoint:

```typescript
// apps/api/src/modules/image/services/zimage-generation.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class ZImageGenerationService {
  private readonly endpointId = process.env.RUNPOD_ZIMAGE_ENDPOINT_ID;
  private readonly apiKey = process.env.RUNPOD_API_KEY;

  async generateImage(prompt: string, options?: {
    width?: number;
    height?: number;
    seed?: number;
    loraName?: string;
    loraStrength?: number;
  }): Promise<string> {
    // Load base workflow
    const workflow = await this.loadWorkflow('z-image-danrisi');
    
    // Inject parameters
    this.injectPrompt(workflow, prompt);
    this.injectResolution(workflow, options?.width || 1024, options?.height || 1024);
    this.injectSeed(workflow, options?.seed || Math.floor(Math.random() * 999999999));
    
    if (options?.loraName) {
      this.injectLora(workflow, options.loraName, options.loraStrength || 1);
    }

    // Call RunPod
    const response = await fetch(
      `https://api.runpod.ai/v2/${this.endpointId}/runsync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: { workflow } }),
      }
    );

    const result = await response.json();
    
    if (result.status !== 'COMPLETED') {
      throw new Error(`Job failed: ${result.error || 'Unknown error'}`);
    }

    // Return base64 image
    return result.output.images[0].data;
  }

  private injectPrompt(workflow: any, prompt: string): void {
    // Node 6 is the positive prompt encoder
    workflow['6'].inputs.text = prompt;
  }

  private injectResolution(workflow: any, width: number, height: number): void {
    // Node 27 is the EmptySD3LatentImage
    workflow['27'].inputs.width = width;
    workflow['27'].inputs.height = height;
  }

  private injectSeed(workflow: any, seed: number): void {
    // Node 52 is the ClownsharKSampler_Beta
    workflow['52'].widgets_values[7] = seed;
  }

  private injectLora(workflow: any, loraName: string, strength: number): void {
    // Node 55 is the LoraLoader
    workflow['55'].widgets_values[0] = loraName;
    workflow['55'].widgets_values[1] = strength;
    workflow['55'].widgets_values[2] = strength;
  }
}
```

## Comparison: Custom Handler vs ComfyUI Worker

| Aspect | Custom Python Handler | ComfyUI Worker |
|--------|----------------------|----------------|
| **Model Loading** | Complex (split components) | Built-in (ComfyUI handles) |
| **Custom Nodes** | Must reimplement | Just install |
| **Workflow Compat** | Limited | Full ComfyUI compatibility |
| **Community** | Self-maintained | RunPod + ComfyUI community |
| **Flexibility** | Fixed logic | Any workflow via JSON |
| **Cold Start** | ~1-2 min | ~3-5 min (more models) |
| **Development** | High effort | Low effort |

**Verdict**: ComfyUI Worker is significantly easier for Z-Image-Turbo.

## Next Steps

1. [ ] Download Z-Image models to network volume (~21 GB)
2. [ ] Create custom Dockerfile with RES4LYF nodes
3. [ ] Build and push to GHCR
4. [ ] Create RunPod endpoint
5. [ ] Test with Danrisi workflow
6. [ ] Integrate into RYLA API

## References

- [worker-comfyui GitHub](https://github.com/runpod-workers/worker-comfyui)
- [Network Volumes Guide](https://github.com/runpod-workers/worker-comfyui/blob/main/docs/network-volumes.md)
- [Customization Guide](https://github.com/runpod-workers/worker-comfyui/blob/main/docs/customization.md)
- [Danrisi Workflow](/docs/research/youtube-videos/-u9VLMVwDXM/Z-Image_Danrisi_modified_loaders.json)

## Tags

#runpod #comfyui #z-image-turbo #serverless #ep-005

