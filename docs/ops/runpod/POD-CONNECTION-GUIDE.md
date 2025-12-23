# ComfyUI Pod Connection Guide

How to connect RYLA API to a dedicated ComfyUI pod for instant image generation.

## Quick Setup

### 1. Get Pod URL

From RunPod Console:
1. Go to **Pods** → click your ComfyUI pod
2. Find **Connect** button → **HTTP Service [Port 8188]**
3. Copy the URL (e.g., `https://xyz-8188.proxy.runpod.net`)

### 2. Configure Environment

Add to your `.env.local`:

```bash
# ComfyUI Pod (dedicated, no cold starts)
COMFYUI_POD_URL=https://your-pod-id-8188.proxy.runpod.net
```

### 3. Verify Connection

Test the connection:

```bash
curl -s "${COMFYUI_POD_URL}/system_stats" | jq .
```

Expected response:
```json
{
  "system": {
    "os": "posix",
    "python_version": "3.10.x",
    ...
  },
  "devices": [
    {
      "name": "cuda:0",
      "type": "cuda",
      "vram_total": 25769803776,
      ...
    }
  ]
}
```

## Architecture

```
┌──────────────────┐     HTTP/JSON      ┌──────────────────┐
│   RYLA API       │ ───────────────▶   │  ComfyUI Pod     │
│   (Next.js)      │                    │  (RunPod)        │
└──────────────────┘                    └──────────────────┘
        │                                       │
        │  Uses:                                │  Has:
        │  - ComfyUIPodClient                   │  - GPU (RTX 4090)
        │  - ComfyUIJobRunner                   │  - Models on volume
        │                                       │  - Custom nodes
        ▼                                       ▼
   libs/business/                        /workspace/models/
   src/services/                         ├── checkpoints/
   ├── comfyui-pod-client.ts             ├── loras/
   └── comfyui-job-runner.ts             └── ...
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/prompt` | POST | Queue a workflow |
| `/history/{id}` | GET | Check job status |
| `/view` | GET | Download images |
| `/system_stats` | GET | Health check |
| `/object_info/{node}` | GET | Get available models |

## Usage in Code

### Option 1: Direct Client

```typescript
import { ComfyUIPodClient } from '@ryla/business';

const client = new ComfyUIPodClient({
  baseUrl: process.env.COMFYUI_POD_URL!,
});

// Check pod is alive
const isHealthy = await client.healthCheck();

// Get available models
const models = await client.getModels();
console.log('Checkpoints:', models.checkpoints);

// Execute a workflow (queue + poll until done)
const result = await client.executeWorkflow(workflowJson);
console.log('Images:', result.images);
```

### Option 2: Job Runner (Recommended)

```typescript
import { createComfyUIJobRunner } from '@ryla/business';

const runner = createComfyUIJobRunner();

// Submit base image job
const jobId = await runner.submitBaseImages({
  prompt: 'Beautiful portrait, studio lighting',
  nsfw: false,
  useZImage: true, // Uses Z-Image-Turbo (faster)
});

// Poll for status
const status = await runner.getJobStatus(jobId);
if (status.status === 'COMPLETED') {
  const images = status.output?.images;
}
```

### Option 3: Full Service (Production)

```typescript
import { ImageGenerationService, createComfyUIJobRunner } from '@ryla/business';
import { GenerationJobsRepository } from '@ryla/data';

const runner = createComfyUIJobRunner();
const repo = new GenerationJobsRepository(supabase);
const service = new ImageGenerationService(repo, runner);

// Start generation (tracks in DB)
const { jobId, prompt } = await service.startBaseImages({
  userId: 'user-uuid',
  appearance: { /* wizard data */ },
  identity: { /* identity data */ },
  nsfwEnabled: false,
  useZImage: true,
});
```

## Pod Management

### Start Pod

From RunPod Console or via API:

```bash
curl -X POST https://api.runpod.io/graphql \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { podResume(input: { podId: \"YOUR_POD_ID\" }) { id } }"}'
```

### Stop Pod (Save Costs)

```bash
curl -X POST https://api.runpod.io/graphql \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { podStop(input: { podId: \"YOUR_POD_ID\" }) { id } }"}'
```

### Check Pod Status

```bash
curl -X POST https://api.runpod.io/graphql \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { myself { pods { id name desiredStatus } } }"}'
```

## Troubleshooting

### Pod Not Responding

1. Check pod is running in RunPod Console
2. Verify URL is correct (includes port 8188)
3. Try direct access in browser

### Workflow Errors

1. Check `/history/{prompt_id}` for error messages
2. Verify models exist: `GET /object_info/CheckpointLoaderSimple`
3. Test workflow manually in ComfyUI UI

### Missing Models

Connect to pod via SSH and check:

```bash
ls -la /workspace/models/checkpoints/
ls -la /workspace/models/loras/
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `COMFYUI_POD_URL` | ✅ | Full URL to ComfyUI pod |
| `RUNPOD_API_KEY` | ⚠️ | Only for pod start/stop scripts |

## Related Docs

- [ADR-003: ComfyUI Pod Over Serverless](/docs/adr/ADR-003-comfyui-pod-over-serverless.md)
- [Network Volume Setup](/docs/ops/runpod/ENDPOINT-SETUP.md)
- [ComfyUI Testing Guide](/docs/technical/COMFYUI-TESTING-GUIDE.md)

