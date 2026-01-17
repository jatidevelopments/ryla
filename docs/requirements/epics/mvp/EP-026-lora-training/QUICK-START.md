# LoRA Training - Quick Start Guide

> **Goal**: Test LoRA training end-to-end before integrating usage  
> **Timeline**: 3-4 weeks  
> **Approach**: Manual testing → API integration → Automation

---

## Immediate Next Steps

### Step 1: Deploy AI Toolkit Pod (Today)

**Option A: Via RunPod Console** (Recommended for first time)
1. Go to https://www.runpod.io/console
2. Navigate to **Templates**
3. Search for "AI Toolkit" or "Ostrus"
4. Click **Deploy**
5. Configure:
   - **GPU**: RTX 4090 or RTX 5090
   - **Container Disk**: 50GB+
   - **Environment Variables**:
     - `PASSWORD`: Set a secure password (save this!)
6. Click **Deploy** and wait 2-3 minutes
7. **Save the HTTP service URL** (e.g., `https://xyz-7860.proxy.runpod.net`)

**Option B: Via MCP** (Once template ID is known)
```bash
# Use RunPod MCP to deploy
# Template ID needs to be discovered first
```

### Step 2: Discover API Endpoints (Today)

1. **Access AI Toolkit Web UI**:
   - Open HTTP service URL in browser
   - Enter password
   - You should see AI Toolkit dashboard

2. **Open Browser DevTools**:
   - Press `F12` or `Cmd+Option+I`
   - Go to **Network** tab
   - Enable **Preserve log**
   - Filter by **XHR** or **Fetch**

3. **Perform Actions & Document**:
   - **Create Dataset**: Click "New Dataset", observe API call
   - **Upload Images**: Upload test images, observe API call
   - **Start Training**: Start a training job, observe API call
   - **Check Status**: Check job status, observe API call
   - **Download LoRA**: Download trained LoRA, observe API call

4. **Document Endpoints**:
   - Create `docs/technical/infrastructure/ai-toolkit/API-ENDPOINTS.md`
   - Document each endpoint:
     - URL
     - Method (POST/GET)
     - Request body
     - Response format
     - Authentication method

### Step 3: Test Manual Training (Today-Tomorrow)

1. **Create Test Dataset**:
   - Use AI Toolkit web UI
   - Upload 5-10 test images
   - Name dataset (e.g., "test-character")

2. **Start Training Job**:
   - Configure training:
     - Base Model: Z-Image-Turbo (or available model)
     - Steps: 700-1000 (for face LoRA)
     - Trigger word: "testchar" (or character name)
   - Start training
   - Note the job ID

3. **Monitor Training**:
   - Check status every 5-10 minutes
   - Training takes ~1-1.5 hours
   - Watch for errors

4. **Download LoRA**:
   - When training completes, download LoRA
   - Verify file is `.safetensors` format
   - Check file size (~50-200MB)

5. **Document Results**:
   - Create `docs/technical/infrastructure/ai-toolkit/MANUAL-TEST-RESULTS.md`
   - Document:
     - Training time
     - File size
     - Any errors encountered
     - API endpoints used

---

## Implementation Order

### Week 1: Infrastructure & Discovery
- [x] Deploy AI Toolkit pod
- [ ] Discover API endpoints
- [ ] Test manual training
- [ ] Document API structure

### Week 2: API Client & Service
- [ ] Implement AI Toolkit client
- [ ] Create LoRA training service
- [ ] Create LoRA repository
- [ ] Unit tests

### Week 3: API Endpoints & Testing
- [ ] Create API endpoints
- [ ] Manual testing via API
- [ ] Validate end-to-end flow
- [ ] Test error cases

### Week 4: Integration & Automation
- [ ] Hook into profile set completion
- [ ] Credit system integration
- [ ] Notification integration
- [ ] UI integration (optional for testing)

---

## Testing Checklist

### Manual Testing
- [ ] Can deploy AI Toolkit pod
- [ ] Can access web UI
- [ ] Can create dataset
- [ ] Can upload images
- [ ] Can start training job
- [ ] Can check training status
- [ ] Training completes successfully
- [ ] Can download LoRA file
- [ ] LoRA file is valid (.safetensors)
- [ ] LoRA file size reasonable (~50-200MB)

### API Testing
- [ ] Can start training via API
- [ ] Can check status via API
- [ ] Database updated correctly
- [ ] Credits reserved correctly
- [ ] Credits deducted on success
- [ ] Credits refunded on failure
- [ ] LoRA uploaded to S3
- [ ] S3 URL stored in database

### Error Testing
- [ ] Insufficient images handled
- [ ] Insufficient credits handled
- [ ] Training failure handled
- [ ] Network errors handled
- [ ] API errors handled

---

## Key Files to Create

### Phase 1 (Infrastructure)
- `docs/technical/infrastructure/ai-toolkit/API-ENDPOINTS.md`
- `docs/technical/infrastructure/ai-toolkit/MANUAL-TEST-RESULTS.md`

### Phase 2 (Client)
- `libs/business/src/services/ai-toolkit-client.ts`
- `libs/business/src/services/ai-toolkit-client.spec.ts`

### Phase 3 (Service)
- `libs/data/src/repositories/lora-models.repository.ts`
- `apps/api/src/modules/lora/services/lora-training.service.ts`
- `apps/api/src/modules/lora/jobs/lora-status-poller.job.ts`

### Phase 4 (API)
- `apps/api/src/modules/lora/lora.controller.ts`
- `apps/api/src/modules/lora/dto/start-lora-training.dto.ts`
- `apps/api/src/modules/lora/lora.module.ts`

### Phase 5 (Testing)
- `scripts/tests/test-lora-training-e2e.ts`
- `docs/testing/lora-training-test-results.md`

---

## Quick Test Commands

### Test API Endpoint (Once Implemented)
```bash
# Start training
curl -X POST http://localhost:3001/api/influencer/{characterId}/lora/train \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "baseModel": "z-image-turbo",
    "imageIds": ["img1", "img2", "img3", "img4", "img5"]
  }'

# Check status
curl http://localhost:3001/api/influencer/{characterId}/lora/status \
  -H "Authorization: Bearer {token}"
```

---

## Success Criteria

**Training is working when:**
- ✅ Can start training via API
- ✅ Training completes successfully
- ✅ LoRA file downloaded to S3
- ✅ Database updated with LoRA info
- ✅ Credits deducted correctly
- ✅ Notification sent on completion

**Then move to usage (EP-038)**

---

**Last Updated**: 2026-01-27
