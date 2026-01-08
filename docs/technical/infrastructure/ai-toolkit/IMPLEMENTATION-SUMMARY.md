# AI Toolkit LoRA Training - Implementation Summary

> **Status**: Ready for Implementation  
> **Date**: 2025-01-27  
> **Epic**: EP-001 (Influencer Wizard), EP-005 (Content Studio)

## What We're Building

An **automated LoRA training backend** that uses **AI Toolkit** (by Ostrus AI) running on **RunPod** to train character-specific LoRA models. This enables consistent character generation with >95% face consistency.

## Why AI Toolkit?

Based on the [video analysis](../../../research/youtube-videos/PhiPASFYBmk/analysis.md):

✅ **Proven Solution**: Used successfully for One 2.1/2.2 and Flux models  
✅ **RunPod Integration**: Available as RunPod template (easy deployment)  
✅ **Cost Effective**: ~$4 per LoRA, 1.5 hours training time  
✅ **Web Interface**: HTTP API for programmatic access  
✅ **Multiple Models**: Supports One 2.1/2.2, Flux, and others  
✅ **Checkpointing**: Saves intermediate versions (useful for overtraining detection)

## Architecture Overview

```
┌─────────────────┐
│ Character Sheet │  ← User completes character sheet (7-10 images)
│   Generation    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │  ← Automatically triggers LoRA training
│ (NestJS)        │
└────────┬────────┘
         │
         ├──► Create LoRA record in DB (status: 'pending')
         │
         ├──► Deploy/Ensure AI Toolkit pod on RunPod
         │
         ├──► Create dataset in AI Toolkit (upload images)
         │
         └──► Start training job in AI Toolkit
              │
              ▼
         ┌─────────────────┐
         │  AI Toolkit Pod  │  ← Trains LoRA (1.5 hours)
         │  (RunPod)        │
         └────────┬─────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Training Done   │  ← Status: 'completed'
         │  LoRA Ready      │
         └────────┬─────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Download LoRA   │  ← Download .safetensors file
         │  Upload to S3    │
         └────────┬─────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Update DB       │  ← Status: 'ready', store S3 path
         │  Notify User     │
         └─────────────────┘
```

## Implementation Phases

### Phase 1: Infrastructure Setup ✅ (Design Complete)

**Status**: Ready to implement

**Tasks**:
1. Deploy AI Toolkit pod on RunPod (via template)
2. Discover API endpoints (via browser DevTools)
3. Test manual training flow
4. Document actual API structure

**Deliverables**:
- [ ] AI Toolkit pod deployed and accessible
- [ ] API endpoints documented
- [ ] Test training completed successfully

**Files Created**:
- `docs/technical/infrastructure/ai-toolkit/AI-TOOLKIT-SETUP-GUIDE.md`
- `libs/business/src/services/ai-toolkit-client.ts` (placeholder)

### Phase 2: API Client Implementation

**Status**: Pending Phase 1

**Tasks**:
1. Update `AIToolkitClient` with real API endpoints
2. Implement authentication flow
3. Implement dataset management
4. Implement job management
5. Implement LoRA download

**Deliverables**:
- [ ] `AIToolkitClient` fully functional
- [ ] Unit tests for client
- [ ] Integration tests with test pod

### Phase 3: Backend Service

**Status**: Pending Phase 2

**Tasks**:
1. Create `LoraTrainingService`
2. Integrate with existing `lora_models` schema
3. Implement pod management (deploy/ensure pod exists)
4. Implement status polling/updates
5. Implement LoRA download and S3 upload

**Deliverables**:
- [ ] `LoraTrainingService` implemented
- [ ] Database integration working
- [ ] Status updates working

### Phase 4: API Endpoints

**Status**: Pending Phase 3

**Tasks**:
1. Create `LoraController`
2. Add DTOs for requests/responses
3. Add authentication/authorization
4. Add error handling

**Deliverables**:
- [ ] API endpoints for starting/checking training
- [ ] API documentation
- [ ] Integration tests

### Phase 5: Automation

**Status**: Pending Phase 4

**Tasks**:
1. Hook into character sheet completion
2. Add background job for status polling
3. Add user notifications
4. Add cost tracking

**Deliverables**:
- [ ] Automatic training on character sheet completion
- [ ] Real-time status updates
- [ ] User notifications

## Key Components

### 1. AI Toolkit Client (`libs/business/src/services/ai-toolkit-client.ts`)

HTTP client for interacting with AI Toolkit web interface.

**Methods**:
- `createDataset()` - Upload images, create dataset
- `createTrainingJob()` - Start LoRA training
- `getJobStatus()` - Check training progress
- `downloadLoRA()` - Download trained LoRA file

### 2. LoRA Training Service (`apps/api/src/modules/lora/services/lora-training.service.ts`)

Orchestrates the entire training workflow.

**Methods**:
- `startTraining()` - Start training for a character
- `checkTrainingStatus()` - Get current status
- `downloadTrainedLoRA()` - Download and store LoRA

**Responsibilities**:
- Manage RunPod pod lifecycle
- Create/update LoRA records in DB
- Coordinate with AI Toolkit
- Handle errors and retries

### 3. Database Schema (`libs/data/src/schema/lora-models.schema.ts`)

Already exists! Just needs to be used.

**Key Fields**:
- `status`: pending → training → ready → failed
- `externalJobId`: AI Toolkit job ID
- `externalProvider`: 'ai-toolkit'
- `config`: Training configuration JSON
- `modelPath`: S3 path to trained LoRA

## Cost Analysis

**Per LoRA Training**:
- GPU Time: 1.5 hours
- GPU Cost: RTX 4090 ~$0.50/hour = $0.75
- Total: **~$0.75-1.50 per LoRA**

**Optimization Strategies**:
1. **On-Demand Pods**: Stop pod after training (save idle costs)
2. **Batch Training**: Train multiple LoRAs in sequence on same pod
3. **Cheaper GPUs**: Use RTX 3090 for testing (slower but cheaper)

## Security Considerations

1. **Pod Access**: AI Toolkit password-protected
2. **Image Access**: Use S3 signed URLs (time-limited)
3. **LoRA Storage**: Store in S3 with access control
4. **Cost Limits**: Per-user/per-character training limits

## Testing Strategy

1. **Unit Tests**: Mock AI Toolkit API
2. **Integration Tests**: Test with RunPod sandbox
3. **E2E Tests**: Full training flow with test character
4. **Cost Monitoring**: Track actual costs vs. estimates

## Next Steps

1. **Deploy Test Pod**: Use RunPod console to deploy AI Toolkit pod
2. **Discover API**: Use browser DevTools to find actual API endpoints
3. **Update Client**: Update `AIToolkitClient` with real endpoints
4. **Test Training**: Run a test training job manually
5. **Implement Service**: Create `LoraTrainingService` in backend
6. **Add Automation**: Hook into character sheet completion

## Files Created

- `docs/specs/integrations/AI-TOOLKIT-LORA-TRAINING.md` - Full integration spec
- `docs/technical/infrastructure/ai-toolkit/AI-TOOLKIT-SETUP-GUIDE.md` - Setup guide
- `docs/technical/infrastructure/ai-toolkit/IMPLEMENTATION-SUMMARY.md` - This file
- `libs/business/src/services/ai-toolkit-client.ts` - API client (placeholder)

## References

- [Video Analysis](../../../research/youtube-videos/PhiPASFYBmk/analysis.md)
- [Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)
- [Setup Guide](./AI-TOOLKIT-SETUP-GUIDE.md)
- [RunPod LoRA Training Plan](../../../specs/integrations/RUNPOD-LORA-TRAINING.md)

