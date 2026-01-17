# ComfyUI Serverless Setup & Scaling Guide

> **Based on**: [RunPod ComfyUI Serverless Tutorial](https://docs.runpod.io/tutorials/serverless/comfyui)  
> **Status**: Production Ready  
> **Date**: 2026-01-27  
> **ADR**: [ADR-006: Use RunPod Serverless Over Dedicated Pods](../../../decisions/ADR-006-runpod-serverless-over-dedicated-pods.md)

---

## Overview

This guide shows how to deploy and use ComfyUI serverless endpoints on RunPod for scalable image generation. Serverless endpoints automatically scale based on demand, eliminating manual pod management.

**Key Benefits**:
- ✅ **Automatic Scaling**: Handles traffic spikes automatically
- ✅ **Pay Per Use**: No idle costs
- ✅ **Easy Deployment**: Deploy from RunPod Hub in minutes
- ✅ **Workflow JSON**: Submit any ComfyUI workflow via API
- ✅ **Shared Storage**: Models persist across workers via network volumes

---

## Quick Start

### Step 1: Deploy ComfyUI Serverless Endpoint

**Option A: From RunPod Hub (Recommended)**

1. Navigate to [RunPod Hub → ComfyUI](https://www.runpod.io/console/templates)
2. Search for "ComfyUI" template
3. Click **Deploy [VERSION_NUMBER]**
4. Click **Next** → **Create Endpoint**
5. **Save the Endpoint ID** (e.g., `32vgrms732dkwi`)

**Option B: Custom Docker Image**

If you need custom models or nodes:

1. Build your Docker image:
   ```bash
   docker build -t your-registry/ryla-comfyui:latest \
     -f docker/comfyui-worker/Dockerfile .
   docker push your-registry/ryla-comfyui:latest
   ```

2. Create endpoint via RunPod Console:
   - **Docker Image**: `your-registry/ryla-comfyui:latest`
   - **GPU**: RTX 4090 or RTX 3090 (24GB+ VRAM)
   - **Container Disk**: 50GB+
   - **Network Volume**: Attach your models volume
   - **Min Workers**: 0 (serverless)
   - **Max Workers**: 2-5 (based on expected load)

### Step 2: Configure Network Volume (Optional but Recommended)

**Why**: Models persist across cold starts, reducing startup time.

1. Create network volume in RunPod Console:
   - **Name**: `ryla-models-shared`
   - **Size**: 200GB+ (for all models)
   - **Data Center**: US-OR-1 (or preferred location)

2. Pre-load models to volume:
   - Upload via FileBrowser or SSH
   - Models should be in ComfyUI standard structure:
     ```
     /runpod-volume/models/
     ├── checkpoints/     # Base models
     ├── loras/          # LoRA models
     ├── vae/            # VAE models
     ├── clip/           # CLIP models
     └── controlnet/     # ControlNet models
     ```

3. Attach to endpoint:
   - Go to endpoint settings
   - Set **Network Volume** to your volume
   - **Mount Path**: `/runpod-volume` (default)

### Step 3: Test Endpoint

```bash
# Set your API key and endpoint ID
export RUNPOD_API_KEY="your-api-key"
export ENDPOINT_ID="your-endpoint-id"

# Test with simple workflow
curl -X POST "https://api.runpod.ai/v2/${ENDPOINT_ID}/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -d '{
    "input": {
      "workflow": {
        "6": {
          "inputs": {
            "text": "a beautiful landscape, mountains, sunset",
            "clip": ["30", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "30": {
          "inputs": {
            "ckpt_name": "flux1-dev-fp8.safetensors"
          },
          "class_type": "CheckpointLoaderSimple"
        }
      }
    }
  }'
```

---

## Workflow Structure

### ComfyUI Workflow JSON Format

ComfyUI workflows are JSON objects where each key is a node ID and the value defines the node:

```json
{
  "input": {
    "workflow": {
      "node_id": {
        "class_type": "NodeType",
        "inputs": {
          "param1": "value1",
          "param2": ["other_node_id", output_index]
        },
        "_meta": {
          "title": "Human Readable Title"
        }
      }
    }
  }
}
```

### Key Node Types

| Node Type | Purpose | Example |
|-----------|---------|---------|
| `CheckpointLoaderSimple` | Load base model | `{"ckpt_name": "flux1-dev-fp8.safetensors"}` |
| `CLIPTextEncode` | Encode prompt | `{"text": "your prompt", "clip": ["30", 1]}` |
| `KSampler` | Generate image | `{"steps": 10, "cfg": 1, "seed": 42}` |
| `VAEDecode` | Decode latent to image | `{"samples": ["31", 0], "vae": ["30", 2]}` |
| `SaveImage` | Save output | `{"images": ["8", 0]}` |
| `LoraLoader` | Load LoRA | `{"lora_name": "character.safetensors", "strength": 1.0}` |

### Example: Simple FLUX Workflow

```json
{
  "input": {
    "workflow": {
      "6": {
        "inputs": {
          "text": "a whimsical treehouse in cherry blossoms",
          "clip": ["30", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": { "title": "Positive Prompt" }
      },
      "30": {
        "inputs": {
          "ckpt_name": "flux1-dev-fp8.safetensors"
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": { "title": "Load Model" }
      },
      "31": {
        "inputs": {
          "seed": 42,
          "steps": 10,
          "cfg": 1,
          "sampler_name": "euler",
          "scheduler": "simple",
          "model": ["30", 0],
          "positive": ["6", 0],
          "negative": ["33", 0],
          "latent_image": ["27", 0]
        },
        "class_type": "KSampler",
        "_meta": { "title": "Sample" }
      },
      "27": {
        "inputs": {
          "width": 512,
          "height": 512,
          "batch_size": 1
        },
        "class_type": "EmptySD3LatentImage",
        "_meta": { "title": "Latent Image" }
      },
      "33": {
        "inputs": {
          "text": "",
          "clip": ["30", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": { "title": "Negative Prompt" }
      },
      "8": {
        "inputs": {
          "samples": ["31", 0],
          "vae": ["30", 2]
        },
        "class_type": "VAEDecode",
        "_meta": { "title": "Decode" }
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage",
        "_meta": { "title": "Save Image" }
      }
    }
  }
}
```

---

## API Usage

### Submit Job (Asynchronous)

```bash
curl -X POST "https://api.runpod.ai/v2/${ENDPOINT_ID}/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -d @workflow.json
```

**Response**:
```json
{
  "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  "status": "IN_QUEUE"
}
```

### Check Job Status

```bash
curl "https://api.runpod.ai/v2/${ENDPOINT_ID}/status/${JOB_ID}" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}"
```

**Response (In Progress)**:
```json
{
  "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  "status": "IN_PROGRESS",
  "delayTime": 2188
}
```

**Response (Completed)**:
```json
{
  "id": "c80ffee4-f315-4e25-a146-0f3d98cf024b",
  "status": "COMPLETED",
  "delayTime": 2188,
  "executionTime": 2297,
  "output": {
    "images": [
      {
        "filename": "ComfyUI_00001_.png",
        "type": "base64",
        "data": "data:image/png;base64,iVBORw0KGgo..."
      }
    ]
  }
}
```

### Decode Base64 Image

```python
import base64
from PIL import Image
import io
import json

def decode_comfyui_image(json_filepath, output_filename="output.png"):
    with open(json_filepath, 'r') as f:
        data = json.load(f)
    
    # Extract base64 string
    base64_url = data['output']['images'][0]['data']
    
    # Remove data URI prefix if present
    if "," in base64_url:
        _, encoded_data = base64_url.split(",", 1)
    else:
        encoded_data = base64_url
    
    # Decode and save
    image_data = base64.b64decode(encoded_data)
    image = Image.open(io.BytesIO(image_data))
    image.save(output_filename)
    print(f"Image saved as {output_filename}")

# Usage
decode_comfyui_image("response.json", "generated_image.png")
```

---

## Using RYLA Workflow Builders

RYLA has workflow builders in `libs/business/src/workflows/` that generate ComfyUI workflow JSON:

### Z-Image Danrisi Workflow

```typescript
import { buildZImageDanrisiWorkflow } from '@ryla/business/workflows';

const workflow = buildZImageDanrisiWorkflow({
  prompt: "A beautiful woman, 25 years old, blonde hair, blue eyes",
  negativePrompt: "blurry, low quality",
  width: 1024,
  height: 1024,
  steps: 20,
  cfg: 1.0,
  seed: 42,
  lora: {
    name: "character-lora.safetensors",
    strength: 1.0
  }
});

// Submit to serverless endpoint
const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    input: {
      workflow: workflow,
    },
  }),
});
```

### Flux PuLID Workflow

```typescript
import { buildFluxPuLIDWorkflow } from '@ryla/business/workflows';

const workflow = buildFluxPuLIDWorkflow({
  prompt: "Portrait of a character",
  baseImageUrl: "https://example.com/base-image.jpg",
  width: 1024,
  height: 1024,
  steps: 20,
  cfg: 7.0,
  seed: 42,
});
```

---

## Scaling Configuration

### Worker Scaling

Configure in RunPod Console → Endpoint Settings:

| Setting | Value | Notes |
|---------|-------|-------|
| **Min Workers** | 0 | Serverless (scale to zero) |
| **Max Workers** | 2-5 | Based on expected load |
| **GPU Type** | RTX 4090 | 24GB VRAM recommended |
| **Cloud Type** | Secure Cloud | More reliable than Community |

### Cost Optimization

**Cold Start Mitigation**:
- ✅ Use network volumes for models (pre-loaded)
- ✅ Keep min workers at 0 (pay per use)
- ⚠️ Cold starts: ~2 minutes (acceptable for async jobs)

**Warm Workers** (Optional):
- Set **Min Workers** > 0 for critical endpoints
- Trade-off: Higher cost vs. faster response
- Recommended: Min 1 for high-traffic endpoints

### Monitoring

**Track Metrics**:
- Cold start frequency
- Execution time
- Queue wait time
- Error rate
- Cost per request

**RunPod Console**:
- View endpoint metrics
- Check worker logs
- Monitor GPU usage
- Track costs

---

## Best Practices

### 1. Workflow Design

- ✅ **Keep workflows simple**: Fewer nodes = faster execution
- ✅ **Use standard nodes**: Custom nodes may not be available
- ✅ **Test locally first**: Use ComfyUI pod for development
- ✅ **Document node IDs**: Use `_meta.title` for clarity

### 2. Model Management

- ✅ **Pre-load models**: Use network volumes
- ✅ **Standard paths**: Follow ComfyUI directory structure
- ✅ **Version control**: Tag model versions
- ❌ **Don't download on cold start**: Too slow

### 3. Error Handling

- ✅ **Retry logic**: Implement exponential backoff
- ✅ **Timeout handling**: Set reasonable timeouts (5-10 min)
- ✅ **Status polling**: Poll every 2-5 seconds
- ✅ **Error logging**: Log all failures for debugging

### 4. Performance

- ✅ **Batch requests**: Submit multiple jobs if possible
- ✅ **Async processing**: Don't block on job completion
- ✅ **Cache results**: Store images in S3/MinIO
- ✅ **Optimize workflows**: Remove unnecessary nodes

---

## Troubleshooting

### Common Issues

**1. Models Not Found**

**Error**: `'model_name.safetensors' not found`

**Solution**:
- Verify network volume is attached
- Check model paths match ComfyUI structure
- Ensure models are in correct directories:
  - Checkpoints: `/runpod-volume/models/checkpoints/`
  - LoRAs: `/runpod-volume/models/loras/`
  - VAE: `/runpod-volume/models/vae/`

**2. Cold Start Timeout**

**Error**: Job times out during cold start

**Solution**:
- Increase timeout (default: 5 minutes)
- Use network volumes (faster than downloading)
- Consider warm workers (min > 0)

**3. Custom Nodes Missing**

**Error**: `Unknown node type: CustomNode`

**Solution**:
- Ensure custom nodes are in Docker image
- Check node installation in worker logs
- Use standard ComfyUI nodes when possible

**4. Workflow Validation Failed**

**Error**: `Workflow validation failed`

**Solution**:
- Verify node IDs are unique
- Check node connections (references)
- Ensure all required inputs are provided
- Test workflow in ComfyUI pod first

### Debugging

**Check Endpoint Logs**:
1. Go to RunPod Console → Serverless
2. Click your endpoint
3. Click **Logs** tab
4. Look for ComfyUI startup errors

**Test Workflow Locally**:
1. Deploy ComfyUI pod (for testing)
2. Test workflow in ComfyUI UI
3. Export workflow JSON
4. Use same JSON for serverless

**Verify Models**:
```bash
# SSH into worker (if possible) or check via FileBrowser
ls -la /runpod-volume/models/checkpoints/
ls -la /runpod-volume/models/loras/
```

---

## Example: Complete Integration

### TypeScript Service

```typescript
// apps/api/src/modules/image/services/comfyui-serverless.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildZImageDanrisiWorkflow } from '@ryla/business/workflows';

@Injectable()
export class ComfyUIServerlessService {
  private readonly apiKey: string;
  private readonly endpointId: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('RUNPOD_API_KEY')!;
    this.endpointId = this.config.get('RUNPOD_COMFYUI_ENDPOINT_ID')!;
  }

  async generateImage(options: {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    lora?: { name: string; strength: number };
  }): Promise<string> {
    // Build workflow
    const workflow = buildZImageDanrisiWorkflow({
      prompt: options.prompt,
      negativePrompt: options.negativePrompt || '',
      width: options.width || 1024,
      height: options.height || 1024,
      lora: options.lora,
    });

    // Submit job
    const jobId = await this.submitJob(workflow);

    // Poll for completion
    const result = await this.pollJob(jobId);

    // Extract image
    return result.output.images[0].data;
  }

  private async submitJob(workflow: any): Promise<string> {
    const response = await fetch(
      `https://api.runpod.ai/v2/${this.endpointId}/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: { workflow },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async pollJob(jobId: string, maxAttempts = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `https://api.runpod.ai/v2/${this.endpointId}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === 'COMPLETED') {
        return data;
      }

      if (data.status === 'FAILED') {
        throw new Error(`Job failed: ${data.error || 'Unknown error'}`);
      }

      // Wait 2 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Job timeout');
  }
}
```

---

## References

- [RunPod ComfyUI Serverless Tutorial](https://docs.runpod.io/tutorials/serverless/comfyui)
- [RunPod Serverless Documentation](https://docs.runpod.io/serverless)
- [RunPod Network Volumes](https://docs.runpod.io/serverless/network-volumes)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [RYLA Workflow Builders](../../../../libs/business/src/workflows/)
- [ADR-006: Serverless Over Pods](../../../decisions/ADR-006-runpod-serverless-over-dedicated-pods.md)

---

**Last Updated**: 2026-01-27
