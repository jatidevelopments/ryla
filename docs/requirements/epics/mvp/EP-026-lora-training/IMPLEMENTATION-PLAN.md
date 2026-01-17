# EP-026 LoRA Training - Implementation & Testing Plan

> **Status**: Ready to Start  
> **Date**: 2026-01-27  
> **Approach**: Test training first, then integrate usage

---

## Overview

This plan focuses on **implementing and testing LoRA training first**, before integrating LoRA usage in generation. This allows us to validate the training pipeline end-to-end before building the usage layer.

**Strategy**: Build → Test → Validate → Then integrate usage

---

## Phase 1: Infrastructure Setup (Week 1)

### Goal
Deploy AI Toolkit on RunPod and discover API endpoints.

### Tasks

1. **Deploy AI Toolkit Pod on RunPod**
   - [ ] Find AI Toolkit template in RunPod console
   - [ ] Deploy pod with RTX 4090/5090 GPU
   - [ ] Set environment variables (PASSWORD)
   - [ ] Get HTTP service URL
   - [ ] Verify web UI is accessible

2. **Discover API Endpoints**
   - [ ] Access AI Toolkit web UI
   - [ ] Open browser DevTools (Network tab)
   - [ ] Perform manual actions:
     - Create dataset
     - Upload images
     - Start training job
     - Check job status
     - Download LoRA
   - [ ] Document all API endpoints
   - [ ] Document request/response formats
   - [ ] Document authentication method

3. **Test Manual Training Flow**
   - [ ] Create test dataset manually
   - [ ] Upload 5-10 test images
   - [ ] Start training job manually
   - [ ] Monitor training progress
   - [ ] Download trained LoRA
   - [ ] Verify LoRA file is valid (.safetensors)

### Deliverables
- [ ] AI Toolkit pod deployed and accessible
- [ ] API endpoints documented in `docs/technical/infrastructure/ai-toolkit/API-ENDPOINTS.md`
- [ ] Test training completed successfully
- [ ] LoRA file downloaded and verified

### Files to Create
- `docs/technical/infrastructure/ai-toolkit/API-ENDPOINTS.md` - Documented API endpoints
- `docs/technical/infrastructure/ai-toolkit/MANUAL-TEST-RESULTS.md` - Manual test results

---

## Phase 2: AI Toolkit API Client (Week 1-2)

### Goal
Build HTTP client to interact with AI Toolkit programmatically.

### Tasks

1. **Create AI Toolkit Client**
   - [ ] Create `libs/business/src/services/ai-toolkit-client.ts`
   - [ ] Implement authentication (password-based)
   - [ ] Implement `createDataset(name, imageUrls)`
   - [ ] Implement `createTrainingJob(config)`
   - [ ] Implement `getJobStatus(jobId)`
   - [ ] Implement `downloadLoRA(jobId, version)`
   - [ ] Add error handling
   - [ ] Add retry logic

2. **Unit Tests**
   - [ ] Mock HTTP requests
   - [ ] Test authentication
   - [ ] Test dataset creation
   - [ ] Test job creation
   - [ ] Test status polling
   - [ ] Test LoRA download
   - [ ] Test error handling

3. **Integration Tests**
   - [ ] Test with real AI Toolkit pod
   - [ ] Test full training flow
   - [ ] Verify LoRA file is downloaded correctly

### Deliverables
- [ ] `AIToolkitClient` fully functional
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Client documented

### Files to Create/Update
- `libs/business/src/services/ai-toolkit-client.ts` - API client
- `libs/business/src/services/ai-toolkit-client.spec.ts` - Unit tests
- `scripts/tests/test-ai-toolkit-client.ts` - Integration test script

---

## Phase 3: LoRA Training Service (Week 2)

### Goal
Build backend service to orchestrate LoRA training.

### Tasks

1. **Create LoRA Repository**
   - [ ] Create `libs/data/src/repositories/lora-models.repository.ts`
   - [ ] Implement `create()`
   - [ ] Implement `findByCharacterId()`
   - [ ] Implement `findReadyByCharacterId()`
   - [ ] Implement `updateById()`
   - [ ] Add unit tests

2. **Create LoRA Training Service**
   - [ ] Create `apps/api/src/modules/lora/services/lora-training.service.ts`
   - [ ] Implement `startTraining(input)`:
     - Validate minimum images (5)
     - Create LoRA record in DB (status: 'pending')
     - Reserve credits (not deduct yet)
     - Create dataset in AI Toolkit
     - Start training job
     - Update DB with job ID (status: 'training')
   - [ ] Implement `checkTrainingStatus(loraModelId)`:
     - Poll AI Toolkit for status
     - Update DB with progress
   - [ ] Implement `downloadTrainedLoRA(loraModelId)`:
     - Download LoRA from AI Toolkit
     - Upload to S3
     - Update DB with S3 path (status: 'ready')
     - Deduct credits (was reserved)
   - [ ] Implement `handleTrainingFailure(loraModelId)`:
     - Update DB (status: 'failed')
     - Refund reserved credits
   - [ ] Add error handling and retries

3. **Background Job for Status Polling**
   - [ ] Create background job to poll training status
   - [ ] Poll every 30 seconds for active trainings
   - [ ] Update DB when status changes
   - [ ] Trigger download when training completes
   - [ ] Handle failures

### Deliverables
- [ ] LoRA repository implemented and tested
- [ ] LoRA training service implemented
- [ ] Background polling job working
- [ ] Unit tests passing

### Files to Create/Update
- `libs/data/src/repositories/lora-models.repository.ts` - Repository
- `apps/api/src/modules/lora/services/lora-training.service.ts` - Service
- `apps/api/src/modules/lora/jobs/lora-status-poller.job.ts` - Background job
- Unit tests for all components

---

## Phase 4: API Endpoints (Week 2-3)

### Goal
Create API endpoints for manual testing and integration.

### Tasks

1. **Create LoRA Controller**
   - [ ] Create `apps/api/src/modules/lora/lora.controller.ts`
   - [ ] Implement `POST /api/influencer/[id]/lora/train`:
     - Validate user owns character
     - Validate minimum images
     - Start training
     - Return training job ID
   - [ ] Implement `GET /api/influencer/[id]/lora/status`:
     - Return current LoRA status
   - [ ] Implement `GET /api/influencer/[id]/lora/available-images`:
     - Return available images for training
   - [ ] Add authentication/authorization
   - [ ] Add error handling

2. **Create DTOs**
   - [ ] Create request DTOs
   - [ ] Create response DTOs
   - [ ] Add validation

3. **Integration Tests**
   - [ ] Test start training endpoint
   - [ ] Test status endpoint
   - [ ] Test available images endpoint
   - [ ] Test error cases

### Deliverables
- [ ] API endpoints implemented
- [ ] DTOs created
- [ ] Integration tests passing
- [ ] API documented

### Files to Create/Update
- `apps/api/src/modules/lora/lora.controller.ts` - Controller
- `apps/api/src/modules/lora/dto/` - DTOs
- `apps/api/src/modules/lora/lora.module.ts` - Module
- Integration tests

---

## Phase 5: Manual Testing & Validation (Week 3)

### Goal
Test LoRA training end-to-end manually.

### Tasks

1. **Manual Test Flow**
   - [ ] Create test character
   - [ ] Generate profile picture set (7-10 images)
   - [ ] Call training API manually:
     ```bash
     POST /api/influencer/{id}/lora/train
     {
       "baseModel": "z-image-turbo",
       "imageIds": ["img1", "img2", ...]
     }
     ```
   - [ ] Monitor training status:
     ```bash
     GET /api/influencer/{id}/lora/status
     ```
   - [ ] Verify training completes
   - [ ] Verify LoRA downloaded to S3
   - [ ] Verify database updated correctly
   - [ ] Verify credits deducted correctly

2. **Validate LoRA File**
   - [ ] Download LoRA from S3
   - [ ] Verify file is valid .safetensors
   - [ ] Check file size (should be ~50-200MB)
   - [ ] Verify trigger word stored correctly

3. **Test Error Cases**
   - [ ] Test with insufficient images (< 5)
   - [ ] Test with insufficient credits
   - [ ] Test training failure (simulate)
   - [ ] Verify credits refunded on failure

### Deliverables
- [ ] End-to-end training flow tested
- [ ] LoRA file validated
- [ ] Error cases tested
- [ ] Test results documented

### Files to Create
- `docs/testing/lora-training-test-results.md` - Test results
- `scripts/tests/test-lora-training-e2e.ts` - E2E test script

---

## Phase 6: Integration with Character Creation (Week 3-4)

### Goal
Automatically trigger LoRA training after profile set completion.

### Tasks

1. **Hook into Profile Set Completion**
   - [ ] Find where profile set generation completes
   - [ ] Add hook to check if LoRA training enabled
   - [ ] Call training service if enabled
   - [ ] Handle errors gracefully

2. **Credit System Integration**
   - [ ] Implement credit reservation
   - [ ] Implement credit deduction on success
   - [ ] Implement credit refund on failure
   - [ ] Test credit flow

3. **Notification Integration**
   - [ ] Send notification when training starts
   - [ ] Send notification when training completes
   - [ ] Send notification when training fails
   - [ ] Test notifications

### Deliverables
- [ ] Automatic training on profile set completion
- [ ] Credit system integrated
- [ ] Notifications working
- [ ] End-to-end flow tested

### Files to Update
- `apps/api/src/modules/image/services/profile-picture-set.service.ts` - Add training hook
- `apps/api/src/modules/lora/services/lora-training.service.ts` - Credit integration
- Notification service integration

---

## Phase 7: UI Integration (Week 4)

### Goal
Add UI for LoRA training toggle and status.

### Tasks

1. **Wizard Toggle (Optional for Testing)**
   - [ ] Add toggle after profile set generation
   - [ ] Show credit cost
   - [ ] Show estimated time
   - [ ] Enable/disable based on credits
   - [ ] Save preference

2. **Settings Page Integration**
   - [ ] Add LoRA section to settings
   - [ ] Show current status
   - [ ] Show training progress
   - [ ] Add retrain button
   - [ ] Test UI flow

### Deliverables
- [ ] Wizard toggle working (optional)
- [ ] Settings page integration
- [ ] UI tested

### Files to Create/Update
- `apps/web/components/wizard/` - Toggle component
- `apps/web/app/influencer/[id]/settings/` - Settings page

---

## Testing Strategy

### Unit Tests
- AI Toolkit client methods
- LoRA repository methods
- LoRA training service methods
- Credit calculation
- Error handling

### Integration Tests
- Full training flow (with test pod)
- API endpoints
- Database operations
- S3 upload/download

### Manual Testing
1. **Test Training Flow**:
   ```bash
   # 1. Create character
   # 2. Generate profile set
   # 3. Start training
   curl -X POST /api/influencer/{id}/lora/train \
     -d '{"baseModel": "z-image-turbo", "imageIds": [...]}'
   
   # 4. Check status
   curl /api/influencer/{id}/lora/status
   
   # 5. Wait for completion (~1.5 hours)
   # 6. Verify LoRA in S3
   # 7. Verify database updated
   ```

2. **Validate LoRA File**:
   - Download from S3
   - Verify .safetensors format
   - Check file size
   - Verify trigger word

3. **Test Error Cases**:
   - Insufficient images
   - Insufficient credits
   - Training failure
   - Network errors

---

## Success Criteria

### Phase 1-4 (Training Implementation)
- [ ] AI Toolkit pod deployed
- [ ] API client working
- [ ] Training service working
- [ ] API endpoints working
- [ ] Can manually trigger training via API

### Phase 5 (Testing)
- [ ] Successfully train LoRA end-to-end
- [ ] LoRA file downloaded to S3
- [ ] Database updated correctly
- [ ] Credits deducted correctly
- [ ] Error cases handled

### Phase 6-7 (Integration)
- [ ] Automatic training on profile set completion
- [ ] Notifications working
- [ ] UI integration complete
- [ ] Full flow tested

---

## Next Steps After Training Validated

Once LoRA training is working and validated:

1. **Move to EP-038**: LoRA Usage in Image Generation
2. **Implement LoRA detection** in generation service
3. **Download LoRA to ComfyUI pod** for usage
4. **Integrate with workflows** (Z-Image/Denrisi first)
5. **Test generation with LoRA**

---

## Files Structure

```
apps/api/src/modules/lora/
├── lora.module.ts
├── lora.controller.ts
├── dto/
│   ├── start-lora-training.dto.ts
│   └── lora-status.dto.ts
├── services/
│   └── lora-training.service.ts
└── jobs/
    └── lora-status-poller.job.ts

libs/business/src/services/
└── ai-toolkit-client.ts

libs/data/src/repositories/
└── lora-models.repository.ts

scripts/tests/
└── test-lora-training-e2e.ts
```

---

## Quick Start Commands

### Deploy AI Toolkit Pod
```bash
# Via RunPod Console or MCP
# Find "AI Toolkit" template
# Deploy with RTX 4090/5090
# Set PASSWORD env var
```

### Test Training Manually
```bash
# 1. Start training
curl -X POST http://localhost:3001/api/influencer/{id}/lora/train \
  -H "Content-Type: application/json" \
  -d '{
    "baseModel": "z-image-turbo",
    "imageIds": ["img1", "img2", "img3", "img4", "img5"]
  }'

# 2. Check status
curl http://localhost:3001/api/influencer/{id}/lora/status
```

---

**Last Updated**: 2026-01-27
