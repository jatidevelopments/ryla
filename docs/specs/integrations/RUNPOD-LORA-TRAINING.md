# RunPod Flux LoRA Training Plan

## Overview
Based on `docs/research/youtube-videos/RESEARCH-SUMMARY.md`, we will implement a **Flux LoRA Training Pipeline** on RunPod to enable consistent character generation for the "Content Studio" (EP-005).

## Architecture

```mermaid
graph TD
    User[User] -->|1. Uploads Face| API[NestJS Backend]
    API -->|2. Saves Images| S3[Storage]
    API -->|3. Triggers Training| RunPod[RunPod Worker]
    RunPod -->|4. Pulls Images| S3
    RunPod -->|5. Trains LoRA| GPU[Flux LoRA Training]
    GPU -->|6. Uploads .safetensors| S3
    RunPod -->|7. Webhook/Status| API
    API -->|8. Updates Character| DB[Postgres]
```

## Why Backend First?
The NestJS backend acts as the **Orchestrator**. It must be set up first to:
1.  **Authenticate Users** (EP-002): Only valid users can start expensive training jobs.
2.  **Store Character Data** (EP-001): We need a `Character` entity to attach the LoRA model to.
3.  **Manage State**: Track training status (`pending` -> `training` -> `completed`).
4.  **Handle Webhooks**: Receive callbacks from RunPod when training finishes.

## RunPod Setup Plan (using MCP)

### 1. Define Worker Image
We will need a Docker image capable of:
- Running `kohya_ss` or similar training scripts for Flux.
- Accepting input images via URL/S3.
- Outputting `.safetensors` files.

*Action*: Research/Select a "Flux Training" template on RunPod or build a custom Dockerfile.

### 2. Infrastructure Management (MCP)
We will use the `runpod` MCP tool to:
- **Development**: Create/Start a "Persistent Pod" for testing training scripts manually.
- **Production**: Create a "Serverless Endpoint" (Network Volume + Worker) that scales to 0 when not in use to save costs ($0.22/hr vs $0 when idle).

### 3. Integration Logic (Backend)
- **Service**: `RunPodService` in NestJS.
- **Method**: `startTraining(characterId: string, imageUrls: string[])`
- **Implementation**:
  - Call RunPod API to start job.
  - Update DB status to `TRAINING`.

## Next Steps
1.  **Execute Backend Setup**: Initialize `apps/api` with NestJS/TypeORM.
2.  **Define RunPod Template**: Find the right template for Flux LoRA.
3.  **Implement Integration**: Connect Backend -> RunPod.

