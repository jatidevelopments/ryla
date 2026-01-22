# EP-058: Modal MVP Models - Integration Notes

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P8 - Integration  
**Created**: 2025-01-21

---

## Integration Overview

The Modal MVP models implementation (`apps/modal/comfyui_ryla.py`) provides three new API endpoints for image generation:
- `/flux-dev` - Flux Dev text-to-image (MVP primary model)
- `/flux-instantid` - Flux Dev + InstantID face consistency
- `/flux-lora` - Flux Dev + LoRA character generation

This document outlines how to integrate these endpoints with the existing RYLA codebase.

---

## Current Architecture

### Existing Job Runner System

RYLA uses a **job runner pattern** with multiple implementations:

```
┌─────────────────────────────────────────────────────────┐
│              ImageGenerationService                      │
│              (@ryla/business)                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Uses RunPodJobRunner interface
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│ ComfyUI Pod  │ │ RunPod   │ │ Modal    │
│ (Preferred)  │ │ Serverless│ │ (New)    │
└──────────────┘ └──────────┘ └──────────┘
```

### Current Implementation

**Location**: `apps/api/src/modules/image/image.module.ts`

```typescript
{
  provide: JOB_RUNNER_TOKEN,
  useFactory: (
    comfyui: ComfyUIJobRunnerAdapter,
    runpod: RunPodJobRunnerAdapter,
  ) => {
    // Use ComfyUI if pod URL is configured
    if (process.env['COMFYUI_POD_URL']) {
      return comfyui;
    }
    // Fall back to RunPod serverless endpoints
    return runpod;
  },
  inject: [ComfyUIJobRunnerAdapter, RunPodJobRunnerAdapter],
}
```

**Priority Order**:
1. **ComfyUI Pod** (if `COMFYUI_POD_URL` set) - Instant response, always-on
2. **RunPod Serverless** (fallback) - Pay-per-use, cold starts

---

## Integration Plan

### Phase 1: Create Modal Client (Business Layer)

**File**: `libs/business/src/services/modal-client.ts`

Create a Modal client similar to `ComfyUIPodClient`:

```typescript
export interface ModalClientConfig {
  /** Modal workspace name (e.g., "ryla") */
  workspace: string;
  /** Optional timeout in milliseconds (default: 180000 = 3 minutes) */
  timeout?: number;
}

export class ModalClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ModalClientConfig) {
    this.workspace = config.workspace;
    this.baseUrl = `https://${config.workspace}--ryla-comfyui-comfyui`;
    this.timeout = config.timeout || 180000;
  }

  /**
   * Generate image using Flux Dev
   */
  async generateFluxDev(input: {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
  }): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}-flux-dev.modal.run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      throw new Error(`Modal API error: ${response.statusText}`);
    }
    
    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Generate image using Flux Dev + InstantID
   */
  async generateFluxInstantID(input: {
    prompt: string;
    referenceImage: string; // base64 data URL
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    instantidStrength?: number;
    controlnetStrength?: number;
    faceProvider?: 'CPU' | 'GPU';
  }): Promise<Buffer> {
    // Similar implementation
  }

  /**
   * Generate image using Flux Dev + LoRA
   */
  async generateFluxLoRA(input: {
    prompt: string;
    loraId: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg?: number;
    seed?: number;
    loraStrength?: number;
    triggerWord?: string;
  }): Promise<Buffer> {
    // Similar implementation
  }
}
```

---

### Phase 2: Create Modal Job Runner (Business Layer)

**File**: `libs/business/src/services/modal-job-runner.ts`

Create a Modal job runner that implements `RunPodJobRunner`:

```typescript
import { RunPodJobRunner, RunPodJobStatus } from './image-generation.service';
import { ModalClient } from './modal-client';

export class ModalJobRunner implements RunPodJobRunner {
  private client: ModalClient;

  constructor(config: { workspace: string }) {
    this.client = new ModalClient({ workspace: config.workspace });
  }

  async submitBaseImages(input: {
    prompt: string;
    nsfw: boolean;
    seed?: number;
    useZImage?: boolean;
  }): Promise<string> {
    // Use Flux Dev for base images
    const imageBuffer = await this.client.generateFluxDev({
      prompt: input.prompt,
      seed: input.seed,
      // ... other params
    });
    
    // Upload to storage and return job ID
    // (similar to ComfyUIJobRunner)
  }

  async submitFaceSwap(input: {
    baseImageUrl: string;
    prompt: string;
    nsfw: boolean;
    seed?: number;
  }): Promise<string> {
    // Use Flux Dev + InstantID for face swap
    // Download base image, convert to base64
    // Call generateFluxInstantID
  }

  async submitCharacterSheet(input: {
    baseImageUrl: string;
    nsfw: boolean;
    angles?: string[];
  }): Promise<string> {
    // Use Flux Dev + InstantID for character sheets
    // Generate multiple variations
  }

  async getJobStatus(jobId: string): Promise<RunPodJobStatus> {
    // Check job status from storage/Redis
  }
}
```

---

### Phase 3: Create Modal Job Runner Adapter (API Layer)

**File**: `apps/api/src/modules/image/services/modal-job-runner.adapter.ts`

Create NestJS adapter:

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModalJobRunner } from '@ryla/business';
import type { RunPodJobRunner, RunPodJobStatus } from '@ryla/business';

@Injectable()
export class ModalJobRunnerAdapter implements RunPodJobRunner, OnModuleInit {
  private readonly logger = new Logger(ModalJobRunnerAdapter.name);
  private runner: ModalJobRunner | null = null;
  private isInitialized = false;

  async onModuleInit() {
    const workspace = process.env['MODAL_WORKSPACE'];
    
    if (!workspace) {
      this.logger.warn(
        'MODAL_WORKSPACE not configured - Modal image generation disabled',
      );
      return;
    }

    try {
      this.runner = new ModalJobRunner({ workspace });
      this.isInitialized = true;
      this.logger.log(`Modal job runner initialized: workspace=${workspace}`);
    } catch (error) {
      this.logger.error('Failed to initialize Modal job runner:', error);
    }
  }

  // Implement RunPodJobRunner interface methods
  // (delegate to this.runner)
}
```

---

### Phase 4: Update ImageModule Factory

**File**: `apps/api/src/modules/image/image.module.ts`

Update the `JOB_RUNNER_TOKEN` factory to support Modal:

```typescript
{
  provide: JOB_RUNNER_TOKEN,
  useFactory: (
    comfyui: ComfyUIJobRunnerAdapter,
    runpod: RunPodJobRunnerAdapter,
    modal: ModalJobRunnerAdapter, // Add Modal adapter
  ) => {
    // Priority 1: ComfyUI Pod (if configured)
    if (process.env['COMFYUI_POD_URL']) {
      return comfyui;
    }
    // Priority 2: Modal (if configured)
    if (process.env['MODAL_WORKSPACE']) {
      return modal;
    }
    // Priority 3: RunPod Serverless (fallback)
    return runpod;
  },
  inject: [
    ComfyUIJobRunnerAdapter,
    RunPodJobRunnerAdapter,
    ModalJobRunnerAdapter, // Add to inject array
  ],
}
```

**Add ModalJobRunnerAdapter to providers**:

```typescript
providers: [
  // ... existing providers
  ModalJobRunnerAdapter, // Add this
],
```

---

## Environment Variables

### Required for Modal Integration

```bash
# Modal workspace name (e.g., "ryla")
MODAL_WORKSPACE=ryla
```

### Optional Configuration

```bash
# Modal API timeout (milliseconds, default: 180000)
MODAL_TIMEOUT=180000
```

### Priority Configuration

The job runner selection follows this priority:
1. `COMFYUI_POD_URL` → Use ComfyUI Pod
2. `MODAL_WORKSPACE` → Use Modal (if ComfyUI not configured)
3. Fallback → Use RunPod Serverless

---

## Integration Points

### 1. Image Generation Service

**Location**: `libs/business/src/services/image-generation.service.ts`

The `ImageGenerationService` uses `RunPodJobRunner` interface, so no changes needed. Modal integration is transparent.

### 2. Image Controller

**Location**: `apps/api/src/modules/image/image.controller.ts`

No changes needed - controller uses `ImageGenerationService` which abstracts the job runner.

### 3. Workflow Builder

**Location**: `libs/business/src/workflows/`

**Note**: Modal endpoints accept direct parameters (prompt, width, etc.) rather than ComfyUI workflow JSON. The Modal job runner will:
- Convert workflow parameters to Modal API format
- Call appropriate Modal endpoint (`/flux-dev`, `/flux-instantid`, `/flux-lora`)
- Handle response (image buffer)

**Future Enhancement**: If needed, we can add a `/workflow` endpoint that accepts ComfyUI workflow JSON directly.

---

## Migration Strategy

### Option 1: Gradual Migration (Recommended)

1. **Deploy Modal app** (already done in P6)
2. **Add Modal as fallback** - Use Modal when ComfyUI pod unavailable
3. **Test in staging** - Verify Modal endpoints work correctly
4. **Monitor performance** - Compare Modal vs ComfyUI pod
5. **Switch primary** - Make Modal primary if performance acceptable

### Option 2: Feature Flag

Add feature flag to control Modal usage:

```typescript
if (process.env['USE_MODAL'] === 'true' && process.env['MODAL_WORKSPACE']) {
  return modal;
}
```

### Option 3: A/B Testing

Use both ComfyUI and Modal, route based on user ID or other criteria.

---

## Testing Integration

### Unit Tests

**File**: `libs/business/src/services/__tests__/modal-client.spec.ts`

```typescript
describe('ModalClient', () => {
  it('should generate Flux Dev image', async () => {
    const client = new ModalClient({ workspace: 'test' });
    const image = await client.generateFluxDev({
      prompt: 'A beautiful landscape',
    });
    expect(image).toBeInstanceOf(Buffer);
    expect(image.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

**File**: `apps/api/src/modules/image/__tests__/modal-job-runner.adapter.spec.ts`

```typescript
describe('ModalJobRunnerAdapter', () => {
  it('should submit base image job', async () => {
    const adapter = new ModalJobRunnerAdapter();
    await adapter.onModuleInit();
    const jobId = await adapter.submitBaseImages({
      prompt: 'A beautiful landscape',
      nsfw: false,
    });
    expect(jobId).toBeDefined();
  });
});
```

---

## Known Issues / Limitations

### 1. Workflow JSON Not Supported

**Issue**: Modal endpoints use direct parameters, not ComfyUI workflow JSON.

**Impact**: Cannot use complex workflows that require custom node configurations.

**Mitigation**: 
- Use Modal for standard workflows (Flux Dev, InstantID, LoRA)
- Keep ComfyUI pod for complex/custom workflows
- Future: Add `/workflow` endpoint that accepts workflow JSON

### 2. No WebSocket Support

**Issue**: Modal endpoints are HTTP-only, no real-time progress updates.

**Impact**: Cannot show generation progress to users.

**Mitigation**:
- Use polling for job status
- Show estimated time based on historical data
- Future: Add WebSocket support if Modal supports it

### 3. Cold Start Latency

**Issue**: Modal has cold starts (~30-60s) when container scales to zero.

**Impact**: First request after idle period is slow.

**Mitigation**:
- Keep container warm with periodic health checks
- Use ComfyUI pod for always-on scenarios
- Accept cold starts for cost savings

### 4. LoRA Management

**Issue**: LoRAs must be uploaded to Modal volume manually.

**Impact**: Cannot dynamically upload LoRAs from RYLA.

**Mitigation**:
- Pre-upload LoRAs to Modal volume
- Use ComfyUI pod for dynamic LoRA loading
- Future: Add LoRA upload API endpoint

---

## Performance Comparison

### Expected Performance

| Metric | ComfyUI Pod | Modal | RunPod Serverless |
|--------|-------------|-------|-------------------|
| **Cold Start** | 0s (always-on) | 30-60s | 30-60s |
| **Generation Time** | 10-20s | 15-30s | 20-40s |
| **Cost (per image)** | ~$0.001 | ~$0.002 | ~$0.003 |
| **Availability** | 99.9% | 99.5% | 99% |

### Cost Analysis

**Modal**:
- GPU time: ~$2-3/hr (L40S)
- Per image: ~$0.002-0.004 (assuming 30s generation)
- Volume storage: Included

**ComfyUI Pod**:
- GPU time: ~$0.50-1.00/hr (RTX 3090)
- Per image: ~$0.001-0.002 (assuming 15s generation)
- Always-on cost: ~$12-24/day

**Recommendation**: Use Modal for variable workloads, ComfyUI pod for high-volume/always-on scenarios.

---

## Deployment Checklist

### Pre-Integration

- [ ] Modal app deployed and tested
- [ ] All three endpoints working (`/flux-dev`, `/flux-instantid`, `/flux-lora`)
- [ ] Performance benchmarks completed
- [ ] Error handling verified

### Integration

- [ ] Create `ModalClient` in `@ryla/business`
- [ ] Create `ModalJobRunner` in `@ryla/business`
- [ ] Create `ModalJobRunnerAdapter` in `apps/api`
- [ ] Update `ImageModule` factory
- [ ] Add environment variables
- [ ] Write unit tests
- [ ] Write integration tests

### Post-Integration

- [ ] Test in staging environment
- [ ] Monitor performance and errors
- [ ] Update documentation
- [ ] Deploy to production (with feature flag)

---

## Next Steps

1. ✅ **P8: Integration Notes** - Complete
2. **Implement Integration** - Create Modal client and job runner (separate story)
3. **P9: Deployment Prep** - Prepare for production
4. **P10: Production Validation** - Validate in production

---

## References

- Epic Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Architecture: `docs/architecture/epics/EP-058-modal-mvp-models-architecture.md`
- Implementation Status: `apps/modal/IMPLEMENTATION-STATUS.md`
- Test Plan: `docs/testing/epics/EP-058-modal-mvp-models-test-plan.md`
- ComfyUI Integration: `apps/api/src/modules/image/services/comfyui-job-runner.adapter.ts`
