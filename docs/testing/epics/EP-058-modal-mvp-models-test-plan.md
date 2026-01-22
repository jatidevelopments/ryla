# EP-058: Modal.com MVP Model Implementation - Test Plan

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P7 - Testing  
**Created**: 2025-01-21

---

## Testing Strategy

### Test Types

| Test Type | Coverage | Tool | Priority |
|-----------|----------|------|----------|
| **Deployment Tests** | Modal app deploys successfully | Modal CLI | P0 |
| **Integration Tests** | Each endpoint works end-to-end | Client scripts + Manual | P0 |
| **Performance Tests** | Response times, cold starts | Client scripts + Timing | P0 |
| **Error Handling Tests** | Invalid inputs, missing models | Client scripts + Manual | P1 |
| **Model Persistence Tests** | Models persist on volumes | Modal CLI + Manual | P0 |
| **Workflow Validation Tests** | Generated images are valid | Visual inspection | P0 |

---

## Test-to-AC Mapping

### ST-058-001: Flux Dev Deployment

**AC**: EP-058 ST-058-001

| Acceptance Criterion | Test Case | Status |
|---------------------|-----------|--------|
| Flux Dev models downloaded to Modal volume (~20 GB) | Verify models exist on volume after deployment | ⏳ Pending |
| Flux Dev text-to-image workflow working | Test `/flux-dev` endpoint with 10+ prompts | ⏳ Pending |
| API endpoint `/flux-dev` responding correctly | Test endpoint accessibility and response format | ⏳ Pending |
| Generates images with 100% success rate (10+ test samples) | Run 10+ generation requests, verify all succeed | ⏳ Pending |
| Supports NSFW (uncensored checkpoint) | Test with NSFW prompt, verify no censorship | ⏳ Pending |
| Response time <30s per generation | Measure and log response times | ⏳ Pending |

---

### ST-058-002: InstantID Deployment

**AC**: EP-058 ST-058-002

| Acceptance Criterion | Test Case | Status |
|---------------------|-----------|--------|
| ComfyUI_InstantID custom node installed | Verify node available in ComfyUI API | ⏳ Pending |
| InstantID models downloaded (~4 GB) | Verify models exist on volume | ⏳ Pending |
| InstantID workflow endpoint `/flux-instantid` working | Test endpoint with reference image | ⏳ Pending |
| Face consistency 85-90% match (validated vs reference images) | Generate images, compare faces visually | ⏳ Pending |
| Works with Flux Dev and Z-Image-Turbo | Test with both base models | ⏳ Pending |
| Response time <30s per generation | Measure and log response times | ⏳ Pending |

---

### ST-058-003: LoRA Loading Support

**AC**: EP-058 ST-058-003

| Acceptance Criterion | Test Case | Status |
|---------------------|-----------|--------|
| LoRA models can be loaded from Modal volume | Upload test LoRA, verify load success | ⏳ Pending |
| LoRA-enabled workflow `/flux-lora` working | Test endpoint with valid LoRA ID | ⏳ Pending |
| Supports trigger words | Test with and without trigger words | ⏳ Pending |
| Supports LoRA strength control (0.0-1.0) | Test with different strength values | ⏳ Pending |
| Works with Flux Dev | Test LoRA + Flux Dev generation | ⏳ Pending |
| 100% LoRA load success rate (test with 5+ LoRAs) | Upload multiple LoRAs, test each | ⏳ Pending |

---

### ST-058-004: Unified App Integration

**AC**: EP-058 ST-058-004

| Acceptance Criterion | Test Case | Status |
|---------------------|-----------|--------|
| All models in single `comfyui_ryla.py` app | Verify all endpoints accessible | ⏳ Pending |
| Unified API endpoints working | Test all endpoints in sequence | ⏳ Pending |
| Model persistence via volumes (no re-downloads) | Restart container, verify models still there | ⏳ Pending |
| All endpoints documented | Verify README completeness | ⏳ Pending |
| Client scripts working for all endpoints | Test all client script subcommands | ⏳ Pending |

---

## Test Cases

### TC-058-001: Deploy Modal App

**Purpose**: Verify Modal app deploys successfully

**Steps**:
1. Run `modal deploy apps/modal/comfyui_ryla.py`
2. Wait for deployment to complete
3. Verify no errors in deployment logs
4. Verify app is accessible

**Expected Result**:
- Deployment succeeds
- App name: `ryla-comfyui`
- All endpoints accessible

**Status**: ⏳ Pending

---

### TC-058-002: Flux Dev Model Download

**Purpose**: Verify Flux Dev models download correctly

**Steps**:
1. Deploy app (triggers model downloads)
2. Check deployment logs for model download progress
3. Verify models exist on volume:
   - `flux1-dev.safetensors` in `models/checkpoints/` or `models/diffusion_models/`
   - `clip_l.safetensors` in `models/clip/`
   - `t5xxl_fp16.safetensors` in `models/text_encoders/`
   - `ae.safetensors` in `models/vae/`

**Expected Result**:
- All models download successfully
- Models symlinked to correct directories
- Total size ~20 GB

**Status**: ⏳ Pending

---

### TC-058-003: InstantID Custom Node Installation

**Purpose**: Verify ComfyUI_InstantID custom node installs

**Steps**:
1. Deploy app (triggers custom node installation)
2. Check deployment logs for installation
3. Verify node directory exists: `/root/comfy/ComfyUI/custom_nodes/ComfyUI_InstantID`
4. (Optional) Check ComfyUI API for available nodes

**Expected Result**:
- Custom node directory exists
- No installation errors
- Node available in ComfyUI

**Status**: ⏳ Pending

---

### TC-058-004: InstantID Model Download

**Purpose**: Verify InstantID models download correctly

**Steps**:
1. Deploy app (triggers InstantID model downloads)
2. Check deployment logs for download progress
3. Verify models exist:
   - `ip-adapter.bin` in `models/instantid/`
   - `diffusion_pytorch_model.safetensors` in `models/controlnet/`
   - InsightFace directory structure exists

**Expected Result**:
- All InstantID models download successfully
- Models symlinked correctly
- Total size ~4.7 GB

**Status**: ⏳ Pending

---

### TC-058-005: Flux Dev Endpoint - Basic Generation

**Purpose**: Test basic Flux Dev text-to-image generation

**Steps**:
1. Deploy app
2. Run client script:
   ```bash
   python apps/modal/ryla_client.py flux-dev \
     --prompt "A beautiful landscape with mountains and a lake" \
     --output test_flux_dev_001.jpg
   ```
3. Verify image is generated
4. Verify image is valid (can be opened)
5. Measure response time

**Expected Result**:
- Image generated successfully
- Image is valid JPEG
- Response time <30s
- Image matches prompt (visual inspection)

**Status**: ⏳ Pending

---

### TC-058-006: Flux Dev Endpoint - Success Rate Test

**Purpose**: Verify 100% success rate (10+ samples)

**Steps**:
1. Create test script with 10 different prompts
2. Run each prompt through `/flux-dev` endpoint
3. Record success/failure for each
4. Calculate success rate

**Expected Result**:
- 100% success rate (10/10 successful)
- All images are valid
- No errors or timeouts

**Status**: ⏳ Pending

---

### TC-058-007: Flux Dev Endpoint - NSFW Support

**Purpose**: Verify NSFW content generation works

**Steps**:
1. Test with NSFW prompt
2. Verify image is generated (not blocked/censored)
3. Compare with SFW prompt to verify difference

**Expected Result**:
- NSFW content generated successfully
- No censorship or blocking
- Image quality maintained

**Status**: ⏳ Pending

---

### TC-058-008: InstantID Endpoint - Basic Face Consistency

**Purpose**: Test InstantID face consistency generation

**Steps**:
1. Prepare reference image (face photo)
2. Run client script:
   ```bash
   python apps/modal/ryla_client.py flux-instantid \
     --prompt "A portrait in a studio setting" \
     --reference-image reference.jpg \
     --output test_instantid_001.jpg
   ```
3. Verify image is generated
4. Compare face in output with reference image
5. Estimate face consistency (85-90% target)

**Expected Result**:
- Image generated successfully
- Face matches reference (85-90% consistency)
- Response time <30s

**Status**: ⏳ Pending

---

### TC-058-009: InstantID Endpoint - Different Strength Values

**Purpose**: Test InstantID strength parameter

**Steps**:
1. Generate images with different `instantid_strength` values (0.5, 0.8, 1.0)
2. Compare face consistency across values
3. Verify strength affects output

**Expected Result**:
- Different strength values produce different results
- Higher strength = more face consistency
- No errors with any value

**Status**: ⏳ Pending

---

### TC-058-010: InstantID Endpoint - Character Sheet Generation

**Purpose**: Test InstantID for character sheet generation (7-10 variations)

**Steps**:
1. Generate 7-10 images with same reference image
2. Use different prompts (poses, angles, expressions)
3. Compare face consistency across all images
4. Compare with PuLID if available

**Expected Result**:
- All images generated successfully
- Face consistency maintained across variations
- InstantID performs as well or better than PuLID

**Status**: ⏳ Pending

---

### TC-058-011: LoRA Endpoint - LoRA Loading

**Purpose**: Test LoRA model loading

**Steps**:
1. Upload test LoRA to volume: `character-123.safetensors`
2. Run client script:
   ```bash
   python apps/modal/ryla_client.py flux-lora \
     --prompt "A character in a fantasy setting" \
     --lora-id 123 \
     --output test_lora_001.jpg
   ```
3. Verify LoRA loads successfully
4. Verify image is generated

**Expected Result**:
- LoRA loads without errors
- Image generated successfully
- Character consistency >95% (if LoRA is well-trained)

**Status**: ⏳ Pending

---

### TC-058-012: LoRA Endpoint - Missing LoRA Error

**Purpose**: Test error handling for missing LoRA

**Steps**:
1. Try to use non-existent LoRA ID
2. Verify error response (404)
3. Verify error message is clear

**Expected Result**:
- Returns 404 status code
- Error message indicates LoRA not found
- No server crash

**Status**: ⏳ Pending

---

### TC-058-013: LoRA Endpoint - Trigger Word Support

**Purpose**: Test LoRA trigger word functionality

**Steps**:
1. Use LoRA with known trigger word
2. Generate with trigger word
3. Generate without trigger word
4. Compare results

**Expected Result**:
- Trigger word affects output
- Better consistency with trigger word
- No errors

**Status**: ⏳ Pending

---

### TC-058-014: Model Persistence Test

**Purpose**: Verify models persist on volumes (no re-downloads)

**Steps**:
1. Deploy app (first time - models download)
2. Note download time
3. Restart container or redeploy
4. Verify models still exist (no re-download)
5. Verify faster startup time

**Expected Result**:
- Models persist on volume
- No re-download on restart
- Faster startup time on subsequent deployments

**Status**: ⏳ Pending

---

### TC-058-015: Cold Start Performance

**Purpose**: Measure cold start time

**Steps**:
1. Deploy app
2. Wait for container to scale down (5 minutes)
3. Make first request
4. Measure time from request to first response

**Expected Result**:
- Cold start <60s
- Container starts and models load quickly

**Status**: ⏳ Pending

---

### TC-058-016: Generation Performance

**Purpose**: Measure generation time

**Steps**:
1. Make multiple requests to each endpoint
2. Measure time from request to image response
3. Calculate average generation time

**Expected Result**:
- Average generation time <30s
- Consistent performance across requests

**Status**: ⏳ Pending

---

### TC-058-017: Concurrent Request Handling

**Purpose**: Test concurrent request handling

**Steps**:
1. Send 5 concurrent requests to same endpoint
2. Verify all requests complete successfully
3. Measure total time vs sequential

**Expected Result**:
- All requests complete successfully
- No errors or timeouts
- Concurrent requests faster than sequential

**Status**: ⏳ Pending

---

### TC-058-018: Error Handling - Invalid Parameters

**Purpose**: Test error handling for invalid inputs

**Steps**:
1. Test missing required parameters
2. Test invalid parameter values (negative width, etc.)
3. Test invalid image formats for InstantID
4. Verify appropriate error responses

**Expected Result**:
- Returns 400 Bad Request for invalid inputs
- Error messages are clear and helpful
- No server crashes

**Status**: ⏳ Pending

---

### TC-058-019: Client Script - All Subcommands

**Purpose**: Test all client script subcommands

**Steps**:
1. Test `flux-dev` subcommand
2. Test `flux-instantid` subcommand
3. Test `flux-lora` subcommand
4. Test `flux` subcommand (Schnell)
5. Test `wan2` subcommand
6. Test `workflow` subcommand

**Expected Result**:
- All subcommands work correctly
- Help text is clear
- Error messages are helpful

**Status**: ⏳ Pending

---

### TC-058-020: End-to-End Workflow Test

**Purpose**: Test complete workflow from prompt to image

**Steps**:
1. Use client script to generate image
2. Verify image is saved correctly
3. Verify image can be opened
4. Verify image quality is acceptable

**Expected Result**:
- Complete workflow works end-to-end
- Image saved correctly
- Image quality is good

**Status**: ⏳ Pending

---

## Test Execution Plan

### Phase 1: Deployment & Model Verification (Day 1)

1. **TC-058-001**: Deploy Modal App
2. **TC-058-002**: Flux Dev Model Download
3. **TC-058-003**: InstantID Custom Node Installation
4. **TC-058-004**: InstantID Model Download
5. **TC-058-014**: Model Persistence Test

### Phase 2: Endpoint Testing (Day 2)

6. **TC-058-005**: Flux Dev Endpoint - Basic Generation
7. **TC-058-006**: Flux Dev Endpoint - Success Rate Test
8. **TC-058-007**: Flux Dev Endpoint - NSFW Support
9. **TC-058-008**: InstantID Endpoint - Basic Face Consistency
10. **TC-058-009**: InstantID Endpoint - Different Strength Values
11. **TC-058-010**: InstantID Endpoint - Character Sheet Generation

### Phase 3: LoRA Testing (Day 3)

12. **TC-058-011**: LoRA Endpoint - LoRA Loading
13. **TC-058-012**: LoRA Endpoint - Missing LoRA Error
14. **TC-058-013**: LoRA Endpoint - Trigger Word Support

### Phase 4: Performance & Error Handling (Day 4)

15. **TC-058-015**: Cold Start Performance
16. **TC-058-016**: Generation Performance
17. **TC-058-017**: Concurrent Request Handling
18. **TC-058-018**: Error Handling - Invalid Parameters

### Phase 5: Integration Testing (Day 5)

19. **TC-058-019**: Client Script - All Subcommands
20. **TC-058-020**: End-to-End Workflow Test

---

## Test Scripts

### Test Script 1: Flux Dev Success Rate Test

**File**: `apps/modal/test_flux_dev_success_rate.py`

```python
#!/usr/bin/env python3
"""Test Flux Dev endpoint success rate (10+ samples)"""

import requests
import sys
import time
from pathlib import Path

PROMPTS = [
    "A beautiful landscape with mountains",
    "A portrait of a person",
    "A futuristic city at night",
    "A cat sitting on a windowsill",
    "An abstract art piece",
    "A vintage car on a country road",
    "A space station in orbit",
    "A cozy coffee shop interior",
    "A beach at sunset",
    "A forest path in autumn",
]

def test_flux_dev_success_rate(workspace: str):
    endpoint = f"https://{workspace}--ryla-comfyui-comfyui-flux-dev.modal.run"
    
    results = []
    for i, prompt in enumerate(PROMPTS, 1):
        print(f"\n[{i}/{len(PROMPTS)}] Testing: {prompt}")
        start_time = time.time()
        
        try:
            response = requests.post(
                endpoint,
                json={"prompt": prompt, "width": 1024, "height": 1024},
                timeout=180,
            )
            response.raise_for_status()
            
            elapsed = time.time() - start_time
            image_size = len(response.content)
            
            # Save image
            output_path = Path(f"test_flux_dev_{i:02d}.jpg")
            output_path.write_bytes(response.content)
            
            results.append({
                "prompt": prompt,
                "success": True,
                "time": elapsed,
                "size": image_size,
            })
            
            print(f"  ✅ Success ({elapsed:.1f}s, {image_size/1024:.1f} KB)")
            
        except Exception as e:
            elapsed = time.time() - start_time
            results.append({
                "prompt": prompt,
                "success": False,
                "time": elapsed,
                "error": str(e),
            })
            print(f"  ❌ Failed: {e}")
    
    # Summary
    successful = sum(1 for r in results if r["success"])
    success_rate = (successful / len(results)) * 100
    avg_time = sum(r["time"] for r in results if r["success"]) / successful if successful > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"Success Rate: {successful}/{len(results)} ({success_rate:.1f}%)")
    print(f"Average Time: {avg_time:.1f}s")
    print(f"{'='*60}")
    
    if success_rate == 100:
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    if not workspace:
        import subprocess
        result = subprocess.run(["modal", "profile", "current"], capture_output=True, text=True)
        workspace = result.stdout.strip()
    
    sys.exit(test_flux_dev_success_rate(workspace))
```

---

### Test Script 2: InstantID Face Consistency Test

**File**: `apps/modal/test_instantid_consistency.py`

```python
#!/usr/bin/env python3
"""Test InstantID face consistency"""

import requests
import sys
import base64
from pathlib import Path

def test_instantid_consistency(workspace: str, reference_image: str):
    endpoint = f"https://{workspace}--ryla-comfyui-comfyui-flux-instantid.modal.run"
    
    # Load and encode reference image
    with open(reference_image, "rb") as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = "image/jpeg" if reference_image.endswith((".jpg", ".jpeg")) else "image/png"
        reference_data = f"data:{mime_type};base64,{image_b64}"
    
    prompts = [
        "A portrait in a studio setting",
        "A person in casual clothing",
        "A professional headshot",
        "A person smiling",
    ]
    
    print(f"Testing InstantID with reference: {reference_image}")
    print(f"Generating {len(prompts)} variations...\n")
    
    for i, prompt in enumerate(prompts, 1):
        print(f"[{i}/{len(prompts)}] {prompt}")
        
        try:
            response = requests.post(
                endpoint,
                json={
                    "prompt": prompt,
                    "reference_image": reference_data,
                    "instantid_strength": 0.8,
                    "controlnet_strength": 0.8,
                },
                timeout=180,
            )
            response.raise_for_status()
            
            output_path = Path(f"test_instantid_{i:02d}.jpg")
            output_path.write_bytes(response.content)
            
            print(f"  ✅ Saved to {output_path}")
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
    
    print("\n✅ Face consistency test complete!")
    print("   Please visually compare generated images with reference image")
    print("   Target: 85-90% face consistency")

if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    reference = sys.argv[2] if len(sys.argv) > 2 else "reference.jpg"
    
    if not workspace:
        import subprocess
        result = subprocess.run(["modal", "profile", "current"], capture_output=True, text=True)
        workspace = result.stdout.strip()
    
    test_instantid_consistency(workspace, reference)
```

---

### Test Script 3: Performance Benchmark

**File**: `apps/modal/test_performance.py`

```python
#!/usr/bin/env python3
"""Performance benchmark for all endpoints"""

import requests
import time
import statistics
import sys

def benchmark_endpoint(endpoint: str, payload: dict, name: str, num_requests: int = 5):
    """Benchmark an endpoint with multiple requests"""
    times = []
    successes = 0
    
    print(f"\n📊 Benchmarking {name}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Requests: {num_requests}")
    
    for i in range(num_requests):
        start = time.time()
        try:
            response = requests.post(endpoint, json=payload, timeout=180)
            response.raise_for_status()
            elapsed = time.time() - start
            times.append(elapsed)
            successes += 1
            print(f"   [{i+1}/{num_requests}] {elapsed:.1f}s ✅")
        except Exception as e:
            elapsed = time.time() - start
            print(f"   [{i+1}/{num_requests}] {elapsed:.1f}s ❌ {e}")
    
    if times:
        avg = statistics.mean(times)
        median = statistics.median(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"\n   Results:")
        print(f"   - Success Rate: {successes}/{num_requests} ({successes/num_requests*100:.1f}%)")
        print(f"   - Average: {avg:.1f}s")
        print(f"   - Median: {median:.1f}s")
        print(f"   - Min: {min_time:.1f}s")
        print(f"   - Max: {max_time:.1f}s")
        
        return {
            "name": name,
            "success_rate": successes / num_requests,
            "avg_time": avg,
            "median_time": median,
            "min_time": min_time,
            "max_time": max_time,
        }
    return None

def main(workspace: str):
    base_url = f"https://{workspace}--ryla-comfyui-comfyui"
    
    results = []
    
    # Flux Dev
    results.append(benchmark_endpoint(
        f"{base_url}-flux-dev.modal.run",
        {"prompt": "A beautiful landscape", "width": 1024, "height": 1024},
        "Flux Dev",
    ))
    
    # InstantID (requires reference image - skip if not available)
    # results.append(benchmark_endpoint(...))
    
    # Summary
    print(f"\n{'='*60}")
    print("Performance Summary")
    print(f"{'='*60}")
    
    for r in results:
        if r:
            print(f"\n{r['name']}:")
            print(f"  Success Rate: {r['success_rate']*100:.1f}%")
            print(f"  Average Time: {r['avg_time']:.1f}s")
            print(f"  Target: <30s {'✅' if r['avg_time'] < 30 else '❌'}")

if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    if not workspace:
        import subprocess
        result = subprocess.run(["modal", "profile", "current"], capture_output=True, text=True)
        workspace = result.stdout.strip()
    
    main(workspace)
```

---

## Analytics Verification

### Events to Verify

| Event | Trigger | Verification Method |
|-------|---------|-------------------|
| `modal_flux_dev_generation_requested` | `/flux-dev` called | Check PostHog events |
| `modal_flux_dev_generation_completed` | Generation succeeds | Check PostHog events |
| `modal_flux_dev_generation_failed` | Generation fails | Check PostHog events |
| `modal_instantid_generation_requested` | `/flux-instantid` called | Check PostHog events |
| `modal_instantid_generation_completed` | Generation succeeds | Check PostHog events |
| `modal_lora_loaded` | LoRA loads successfully | Check PostHog events |
| `modal_lora_generation_completed` | LoRA generation succeeds | Check PostHog events |

**Note**: Analytics events are backend-only for MVP. Frontend integration will add events in EP-005.

---

## Remaining Risks / Untested Areas

### High Risk Areas

1. **Flux Dev Workflow Format**
   - Risk: UNETLoader + DualCLIPLoader may not work as expected
   - Mitigation: Test early, have CheckpointLoaderSimple as fallback
   - Status: To be tested

2. **InstantID Custom Node Compatibility**
   - Risk: Node may not install correctly or be incompatible
   - Mitigation: Test installation early, check ComfyUI version compatibility
   - Status: To be tested

3. **InsightFace Model Download**
   - Risk: Models may not download automatically
   - Mitigation: Pre-download if needed, or manual upload
   - Status: To be tested

4. **LoRA Path Resolution**
   - Risk: LoRA may not be found in expected locations
   - Mitigation: Test with actual LoRA files, verify symlinking
   - Status: To be tested

### Medium Risk Areas

5. **Model Size / Volume Limits**
   - Risk: Models may exceed volume size limits
   - Mitigation: Monitor volume usage, optimize model sizes if needed
   - Status: To be monitored

6. **Concurrent Request Limits**
   - Risk: May hit Modal concurrency limits
   - Mitigation: Test concurrent requests, adjust `max_inputs` if needed
   - Status: To be tested

---

## Test Execution Checklist

### Pre-Testing

- [ ] Modal workspace configured
- [ ] Modal CLI authenticated
- [ ] Test images prepared (for InstantID)
- [ ] Test LoRAs prepared (for LoRA testing)
- [ ] Test scripts created

### Deployment Testing

- [ ] Deploy app successfully
- [ ] Verify all models download
- [ ] Verify custom nodes install
- [ ] Verify volumes mount correctly

### Endpoint Testing

- [ ] Test `/flux-dev` endpoint
- [ ] Test `/flux-instantid` endpoint
- [ ] Test `/flux-lora` endpoint
- [ ] Test error handling

### Performance Testing

- [ ] Measure cold start time
- [ ] Measure generation time
- [ ] Test concurrent requests
- [ ] Verify performance targets

### Integration Testing

- [ ] Test all client script subcommands
- [ ] Test end-to-end workflows
- [ ] Verify model persistence

---

## Success Criteria

### All Tests Must Pass

- [ ] 100% success rate for Flux Dev (10+ samples)
- [ ] 85-90% face consistency for InstantID
- [ ] 100% LoRA load success rate (5+ LoRAs)
- [ ] Average generation time <30s
- [ ] Cold start <60s
- [ ] All endpoints accessible
- [ ] All client scripts working
- [ ] Model persistence verified

---

## Next Steps

1. ✅ **P7: Test Plan** - Complete
2. **Execute Tests** - Run all test cases
3. **Fix Issues** - Address any failures
4. **P8: Integration** - Integrate with existing codebase
5. **P9: Deployment Prep** - Prepare for production
6. **P10: Production Validation** - Validate in production

---

## References

- Epic Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Technical Spec: `docs/specs/epics/EP-058-modal-mvp-models-tech-spec.md`
- Implementation Status: `apps/modal/IMPLEMENTATION-STATUS.md`
