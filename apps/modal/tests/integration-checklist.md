# P8: Integration Testing Checklist

**Date**: 2026-01-21  
**Phase**: P8 - Integration  
**Status**: In Progress

---

## Pre-Deployment Checks

- [x] All unit tests passing
- [x] Code structure validated
- [x] Imports working correctly
- [x] Workflow builders generating valid JSON

---

## Deployment Steps

1. **Deploy to Modal** (using script):
   ```bash
   cd apps/modal
   ./scripts/deploy.sh
   ```
   
   Or manually:
   ```bash
   cd apps/modal
   modal deploy app.py
   ```

2. **Verify Deployment**:
   - Check Modal dashboard for successful deployment
   - Verify all models are available
   - Check for any deployment errors

---

## Endpoint Testing

**Option 1: Using test script (recommended)**
```bash
cd apps/modal
./scripts/test-endpoints.sh
```

**Option 2: Manual testing**

Test each endpoint with `ryla_client.py`:

### 1. Flux Schnell (`/flux`)
```bash
python apps/modal/ryla_client.py flux \
  --prompt "A beautiful landscape with mountains" \
  --output test_flux.jpg
```
- [ ] Request succeeds (200 OK)
- [ ] Image file created
- [ ] Cost headers present (`X-Cost-USD`, `X-Execution-Time-Sec`, `X-GPU-Type`)
- [ ] Image is valid and viewable

### 2. Flux Dev (`/flux-dev`)
```bash
python apps/modal/ryla_client.py flux-dev \
  --prompt "A beautiful landscape with mountains" \
  --output test_flux_dev.jpg
```
- [ ] Request succeeds (200 OK)
- [ ] Image file created
- [ ] Cost headers present
- [ ] Image quality is good

### 3. Flux + InstantID (`/flux-instantid`)
```bash
python apps/modal/ryla_client.py flux-instantid \
  --prompt "A portrait of a person" \
  --reference-image path/to/face.jpg \
  --output test_instantid.jpg
```
- [ ] Request succeeds (200 OK)
- [ ] Image file created
- [ ] Face consistency is maintained
- [ ] Cost headers present

### 4. Flux + LoRA (`/flux-lora`)
```bash
python apps/modal/ryla_client.py flux-lora \
  --prompt "A character in a scene" \
  --lora-path path/to/lora.safetensors \
  --output test_lora.jpg
```
- [ ] Request succeeds (200 OK)
- [ ] Image file created
- [ ] Character consistency is maintained
- [ ] Cost headers present

### 5. Wan2.1 Video (`/wan2`)
```bash
python apps/modal/ryla_client.py wan2 \
  --prompt "A beautiful landscape animation" \
  --output test_wan2.webp
```
- [ ] Request succeeds (200 OK)
- [ ] Video file created
- [ ] Video plays correctly
- [ ] Cost headers present

### 6. SeedVR2 Upscaling (`/seedvr2`)
```bash
python apps/modal/ryla_client.py seedvr2 \
  --image path/to/input.jpg \
  --output test_seedvr2_upscaled.png
```
- [ ] Request succeeds (200 OK)
- [ ] Upscaled image created
- [ ] Image is larger than input
- [ ] Cost headers present

### 7. Custom Workflow (`/workflow`)
```bash
python apps/modal/ryla_client.py workflow \
  --workflow-file path/to/workflow.json \
  --output test_workflow.jpg
```
- [ ] Request succeeds (200 OK)
- [ ] Output file created
- [ ] Cost headers present

---

## Regression Checks

Compare with previous deployment:

- [ ] All endpoints respond in similar time
- [ ] Image/video quality unchanged
- [ ] Cost tracking accurate
- [ ] No new errors in logs
- [ ] Model loading works correctly

---

## Cost Verification

For each endpoint, verify:
- [ ] `X-Cost-USD` header is present and non-zero
- [ ] `X-Execution-Time-Sec` header is present
- [ ] `X-GPU-Type` header matches config (L40S)
- [ ] Cost calculation is reasonable (compare with Modal dashboard)

---

## Error Handling

Test error cases:
- [ ] Invalid prompt (empty string)
- [ ] Missing required parameters
- [ ] Invalid image format (for InstantID/SeedVR2)
- [ ] Non-existent LoRA file
- [ ] Server timeout handling

---

## Performance

- [ ] Cold start time acceptable (< 60s)
- [ ] Warm request time acceptable
- [ ] Concurrent requests handled correctly
- [ ] No memory leaks (check Modal dashboard)

---

## Next Steps

After all tests pass:
- [ ] Update deployment documentation
- [ ] Document any issues found
- [ ] Proceed to P9 (Deployment Prep)

---

**Status**: ⏳ **In Progress**
