# [EPIC] EP-038: LoRA Usage in Image Generation

**Status**: In Progress
**Phase**: P6
**Created**: 2026-01-21
**Last Updated**: 2026-02-01


> **Initiative**: [IN-006: LoRA Character Consistency System](../../../initiatives/IN-006-lora-character-consistency.md)

## Recent Progress

### ✅ S3 Storage for LoRA Files (2026-02-01)

All LoRA training apps now upload to Cloudflare R2/S3:

- **Flux Training**: `apps/modal/apps/lora-training/app.py` → `loras/character-{id}/`
- **Wan Training**: `apps/modal/apps/wan-lora-training/app.py` → `loras/wan-character-{id}/`
- **Qwen Training**: `apps/modal/apps/qwen-lora-training/app.py` → `loras/qwen-character-{id}/`
- **Webhook DTO**: Added `s3Key` and `s3Url` fields
- **Database**: `modelPath` stores S3 key, `modelUrl` stores public URL

### ✅ LoRA Usage Metadata Tracking (2026-02-01)

Generation job input now tracks LoRA usage:

- `loraModelId`: ID of LoRA model used
- `triggerWord`: Trigger word prepended to prompt

### ✅ LoRA Integration in Studio Generation (2026-02-01)

LoRA usage integrated into `StudioGenerationService`:

- **LoRA Detection**: Check for ready LoRA when character has `loraEnabled: true`
- **Trigger Word**: Automatically prepended to prompt when LoRA used
- **Modal.com Integration**: 
  - Added `submitQwenImageLora()` for Qwen models
  - Added `submitFluxLora()` for Flux models
  - Routes to `/qwen-image-2512-lora` and `/flux-lora` endpoints
- **Fallback**: Gracefully falls back to standard generation if no LoRA

**Files Modified:**
- `apps/api/src/modules/image/services/studio-generation.service.ts`
- `apps/api/src/modules/image/services/modal-job-runner.adapter.ts`
- `apps/api/src/modules/character/dto/lora-webhook.dto.ts`
- `apps/api/src/modules/character/lora-webhook.controller.ts`
- `apps/modal/apps/lora-training/app.py`
- `apps/modal/apps/wan-lora-training/app.py`
- `apps/modal/apps/qwen-lora-training/app.py`

---

## Overview

Integrate trained LoRA models into image generation workflows to achieve >95% character face consistency. This epic covers automatically detecting, loading, and applying LoRA models when generating images, with graceful fallback when LoRA is not available.

> **Prerequisite**: EP-026 (LoRA Training) must be completed first, as this epic uses the trained LoRA models.

---

## Business Impact

**Target Metric**: C - Core Value (Character Consistency)

**Hypothesis**: When trained LoRAs are automatically used in image generation, users will achieve >95% face consistency (vs ~80% without LoRA), significantly improving the core value proposition and user satisfaction.

**Success Criteria**:
- LoRA usage rate: **>90%** of generations with ready LoRA use it
- Face consistency improvement: **>95%** face match (vs ~80% without LoRA)
- Generation success rate: **>95%** when using LoRA
- User satisfaction: **>80%** of users report better consistency
- Automatic fallback: **100%** of generations work even if LoRA unavailable

---

## Features

### F1: LoRA Detection & Loading

- **Automatic Detection**: Check for ready LoRA when character has one trained
- **Database Query**: Query `lora_models` table for character's ready LoRA
- **Model Matching**: Ensure LoRA base model matches generation workflow (Z-Image LoRA for Z-Image, Flux LoRA for Flux)
- **Status Check**: Only use LoRA if status is 'ready'
- **Fallback Logic**: Gracefully fall back to face swap if LoRA not available

### F2: LoRA File Management

- **Automatic Download**: Download LoRA from S3 to ComfyUI pod if not present
- **Storage Location**: Store LoRAs in `/workspace/models/loras/` on ComfyUI pod
- **File Naming**: Use consistent naming (e.g., `{loraModelId}.safetensors`)
- **Cache Management**: Check if LoRA already exists before downloading
- **Cleanup**: Remove expired or unused LoRAs (future enhancement)

### F3: Workflow Integration

- **Z-Image/Denrisi**: Integrate LoRA into `buildZImageDanrisiWorkflow()`
- **Z-Image/PuLID**: Integrate LoRA into `buildZImagePuLIDWorkflow()`
- **Flux/PuLID**: Integrate LoRA into `buildFluxPuLIDWorkflow()`
- **Other Workflows**: Support LoRA in all relevant workflows
- **LoraLoader Node**: Insert LoraLoader node with correct configuration
- **Model/CLIP Updates**: Update workflow references to use LoRA-modified model

### F4: Trigger Word Integration

- **Automatic Inclusion**: Prepend trigger word to user prompt when LoRA is used
- **Prompt Format**: `${triggerWord}, ${userPrompt}`
- **Database Source**: Get trigger word from `lora_models.triggerWord`
- **Fallback**: Don't include trigger word if LoRA not used

### F5: Generation Service Integration

- **Service Updates**: Update `StudioGenerationService` to check for LoRA
- **LoRA Repository**: Create/use repository to query LoRA models
- **Workflow Builder**: Pass LoRA config to workflow builders
- **Metadata Tracking**: Track LoRA usage in generation job metadata
- **Error Handling**: Handle LoRA-related errors gracefully

### F6: Multi-Model Support

- **Model Registry**: Check which models support LoRA (`supportsLoRA` flag)
- **Base Model Matching**: Match LoRA base model to generation model
- **Model Selection**: Use appropriate LoRA for each model type
- **Future Expansion**: Support for Flux, One 2.1/2.2 LoRAs when available

---

## Acceptance Criteria

### AC-1: LoRA Detection

- [x] System queries `lora_models` table for character's ready LoRA
- [x] Only uses LoRA if status is 'ready'
- [x] Respects `loraEnabled` flag on character
- [x] Falls back gracefully if no LoRA available
- [x] Uses most recent ready LoRA via `getReadyByCharacterId()`

### AC-2: LoRA File Management

- [x] LoRA files uploaded to S3/R2 after training (Flux, Wan, Qwen apps)
- [x] S3 key and URL stored in `lora_models` table
- [x] File naming is consistent: `loras/{model}-character-{id}/{jobId}.safetensors`
- [x] Modal volumes also store LoRA for Modal.com generation
- [x] Upload errors handled gracefully (fallback to volume-only)

### AC-3: Workflow Integration (Modal.com - MVP)

- [x] Qwen-Image + LoRA via `/qwen-image-2512-lora` endpoint
- [x] Flux + LoRA via `/flux-lora` endpoint
- [x] LoRA ID passed to Modal endpoints for automatic loading
- [x] Generation succeeds with LoRA applied
- N/A ComfyUI pod integration (not needed for MVP - Modal.com only)

### AC-4: Trigger Word Integration

- [x] Trigger word automatically included in prompt when LoRA used
- [x] Prompt format: `${triggerWord}, ${userPrompt}`
- [x] Trigger word retrieved from database (`loraModel.triggerWord`)
- [x] No trigger word if LoRA not used

### AC-5: Generation Service Integration

- [x] `StudioGenerationService` checks for LoRA before generation
- [x] LoRA config passed to Modal.com endpoints
- [x] LoRA usage tracked in generation job metadata (`loraModelId`, `triggerWord`)
- [x] Error handling for LoRA-related issues
- [x] Fallback works correctly if LoRA unavailable

### AC-6: Multi-Model Support

- [x] System routes to LoRA endpoints based on model type (Qwen/Flux)
- [x] LoRA training stores `trainingModel` field for model matching
- [x] Appropriate LoRA used for each model type
- [ ] Base model matching validation (future enhancement)

---

## User Stories

### ST-032: Automatic LoRA Usage in Generation

**As a** user generating images  
**I want to** have my trained LoRA automatically used when available  
**So that** I get >95% face consistency without any extra steps

**AC**: AC-1, AC-2, AC-3, AC-5

---

### ST-033: LoRA Works with Z-Image/Denrisi Workflow

**As a** user generating images with Z-Image/Denrisi workflow  
**I want to** have my Z-Image LoRA automatically applied  
**So that** I get consistent faces with fast generation

**AC**: AC-3 (Z-Image/Denrisi specific)

---

### ST-034: LoRA Works with Multiple Workflows

**As a** user generating images  
**I want to** have my LoRA work with any supported workflow  
**So that** I can use different models while maintaining consistency

**AC**: AC-3, AC-6

---

## Technical Architecture

### Database Schema

**LoRA Models Table** (already exists):
```typescript
interface LoraModel {
  id: string;
  characterId: string;
  status: 'ready' | 'pending' | 'training' | 'failed';
  modelPath: string; // S3 path
  modelUrl: string; // Public URL
  triggerWord: string;
  baseModel: 'z-image-turbo' | 'flux' | 'one-2.1' | 'one-2.2';
  // ... other fields
}
```

### Service Layer

**LoRA Repository**:
```typescript
// libs/data/src/repositories/lora-models.repository.ts
export class LoraModelsRepository {
  async findByCharacterId(characterId: string): Promise<LoraModel | null>
  async findReadyByCharacterId(characterId: string): Promise<LoraModel | null>
  async findByCharacterAndModel(characterId: string, baseModel: string): Promise<LoraModel | null>
}
```

**LoRA Service**:
```typescript
// apps/api/src/modules/lora/services/lora-usage.service.ts
export class LoraUsageService {
  async getLoraForGeneration(characterId: string, modelType: string): Promise<LoraConfig | null>
  async ensureLoraOnPod(loraModel: LoraModel): Promise<string> // Returns file path
  async buildPromptWithTrigger(triggerWord: string, userPrompt: string): string
}
```

### Workflow Integration

**Workflow Builder Updates**:
```typescript
// libs/business/src/workflows/z-image-danrisi.ts
export function buildZImageDanrisiWorkflow(options: {
  // ... existing options
  lora?: {
    name: string; // File name on pod
    strength: number; // 0.0-1.0
  };
}): ComfyUIWorkflow
```

### Generation Service Updates

```typescript
// apps/api/src/modules/image/services/studio-generation.service.ts
async startStudioGeneration(input: {...}) {
  // ... existing code
  
  // Check for LoRA
  const loraModel = await this.loraUsageService.getLoraForGeneration(
    input.characterId,
    modelType // 'z-image-turbo', 'flux', etc.
  );
  
  // Ensure LoRA on pod
  let loraConfig = null;
  if (loraModel) {
    const loraPath = await this.loraUsageService.ensureLoraOnPod(loraModel);
    loraConfig = {
      name: `${loraModel.id}.safetensors`,
      strength: 1.0,
    };
    
    // Include trigger word in prompt
    prompt = this.loraUsageService.buildPromptWithTrigger(
      loraModel.triggerWord,
      prompt
    );
  }
  
  // Build workflow with LoRA
  const workflow = buildZImageDanrisiWorkflow({
    prompt,
    lora: loraConfig,
    // ... other options
  });
}
```

---

## API Endpoints

**No new endpoints required** - LoRA usage is internal to generation service.

**Existing endpoints used**:
- `POST /api/studio/generate` - Already exists, will automatically use LoRA if available

---

## Dependencies

- **EP-026**: LoRA Training (must be completed first)
- **EP-005**: Content Studio (generation workflows)
- **EP-001**: Influencer Wizard (character creation)
- **ComfyUI Pod**: Must be deployed and accessible
- **Storage**: S3-compatible storage for LoRA models

---

## Out of Scope (MVP)

- LoRA version selection (use most recent ready LoRA)
- LoRA strength configuration UI (use default 1.0)
- LoRA sharing between characters
- LoRA quality metrics/analytics
- LoRA expiration/cleanup automation
- Multiple LoRA versions per character

---

## Future Enhancements (Phase 2+)

- LoRA strength slider in UI
- LoRA version selection
- LoRA quality metrics dashboard
- Automatic LoRA cleanup for expired models
- LoRA marketplace (share/sell LoRAs)
- Advanced LoRA configuration (per-layer strength)

---

## Testing Requirements

### Unit Tests
- LoRA detection logic
- Trigger word integration
- Workflow builder LoRA insertion
- File path generation

### Integration Tests
- LoRA download to ComfyUI pod
- Workflow execution with LoRA
- Fallback when LoRA unavailable
- Multi-model LoRA matching

### E2E Tests (Playwright)
- Generate image with LoRA (Z-Image/Denrisi)
- Generate image without LoRA (fallback)
- Verify face consistency with LoRA
- Verify generation succeeds with LoRA

---

## Related Epics

- **EP-026**: LoRA Training for Character Consistency (prerequisite)
- **EP-005**: Content Studio & Generation (uses LoRA in generation)
- **EP-001**: Influencer Wizard (character creation)
- **EP-018**: Influencer Settings (LoRA management UI)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| LoRA usage rate | >90% | % of generations with ready LoRA that use it |
| Face consistency | >95% | Face match accuracy with LoRA |
| Generation success | >95% | % of generations using LoRA that succeed |
| User satisfaction | >80% | % of users reporting better consistency |
| Fallback success | 100% | % of generations that work when LoRA unavailable |

---

## Notes

- LoRA usage is automatic - users don't need to do anything
- System falls back gracefully if LoRA not available
- LoRA must match base model (Z-Image LoRA for Z-Image, etc.)
- Trigger word is automatically included in prompt
- LoRA file management is transparent to users

---

**Last Updated**: 2026-01-27
