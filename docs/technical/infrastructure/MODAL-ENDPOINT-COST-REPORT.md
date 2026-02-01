# Modal Endpoint Generation Time & Cost Report

**Last Benchmarked**: 2026-02-01 18:39 UTC  
**GPU Default**: L40S ($1.95/hr)  
**Pricing Source**: Modal.com (as of 2026-01-21)

---

## GPU Pricing Reference

| GPU           | $/second  | $/hour | Use Case                                        |
| ------------- | --------- | ------ | ----------------------------------------------- |
| **T4**        | $0.000164 | $0.59  | Lightweight inference                           |
| **L4**        | $0.000222 | $0.80  | Medium inference                                |
| **A10**       | $0.000306 | $1.10  | Medium inference, good performance              |
| **L40S**      | $0.000542 | $1.95  | Large models, high-res generation (**default**) |
| **A100-40GB** | $0.000556 | $2.00  | Large models, high throughput                   |
| **A100-80GB** | $0.000694 | $2.50  | Very large models, batch processing             |
| **H100**      | $0.001097 | $3.95  | Maximum performance, training                   |

> All RYLA production endpoints currently use **L40S** ($0.000542/sec).

---

## Benchmarked Results (Real Data)

**Benchmark Date**: 2026-02-01 18:39 UTC  
**Total endpoints tested**: 24  
**Successful**: 12 | **Failed**: 12 (mostly LoRA/deployment issues)

### Cold vs Warm Comparison

| Endpoint            | Path                       | Cold (s) | Warm (s) | Δ Savings | Cost (warm) | Size   | Status |
| ------------------- | -------------------------- | -------- | -------- | --------- | ----------- | ------ | ------ |
| **Flux Schnell**    | `/flux`                    | 58.3     | **2.5**  | 96%       | $0.001      | 1.8 MB | ✅     |
| **Flux Dev**        | `/flux-dev`                | 55.0     | **2.5**  | 95%       | $0.001      | 1.6 MB | ✅     |
| **Flux PuLID**      | `/flux-pulid`              | 75.8     | **13.2** | 83%       | $0.007      | 1.0 MB | ✅     |
| **SDXL InstantID**  | `/sdxl-instantid`          | 24.8     | **8.9**  | 64%       | $0.005      | 1.4 MB | ✅     |
| **Qwen Image 2512** | `/qwen-image-2512`         | 108.2    | **49.9** | 54%       | $0.027      | 1.5 MB | ✅     |
| **Qwen Image Fast** | `/qwen-image-2512-fast`    | 35.9     | **4.7**  | 87%       | $0.003      | 1.8 MB | ✅     |
| **Qwen Image Edit** | `/qwen-image-edit-2511`    | 154.7    | **53.6** | 65%       | $0.029      | 1.1 MB | ✅     |
| **Qwen Inpaint**    | `/qwen-image-inpaint-2511` | 67.3     | **52.9** | 21%       | $0.029      | 230 KB | ✅     |
| **Z-Image Simple**  | `/z-image-simple`          | 64.1     | **3.6**  | 94%       | $0.002      | 1.6 MB | ✅     |
| **Z-Image Danrisi** | `/z-image-danrisi`         | 2.6      | **2.3**  | 12%       | $0.001      | 1.6 MB | ✅     |
| **Wan2.6**          | `/wan2.6`                  | 42.5     | **7.3**  | 83%       | $0.004      | 305 KB | ✅     |
| **SeedVR2 Upscale** | `/seedvr2`                 | 171.4    | **38.1** | 78%       | $0.021      | 1.5 MB | ✅     |

> **Note**: Cold = first request (includes container startup). Warm = second request (container already running).  
> Cost calculated as `warm_time × $0.000542/sec` (L40S rate).

### Endpoints with Prerequisites

These endpoints are **deployed and working** but require specific inputs:

| Endpoint        | Path                    | Prerequisite | How to Use                                              |
| --------------- | ----------------------- | ------------ | ------------------------------------------------------- |
| Flux Dev LoRA   | `/flux-dev-lora`        | LoRA file    | Train LoRA via `ryla-lora-training`, then use `lora_id` |
| Flux LoRA       | `/flux-lora`            | LoRA file    | Same as above                                           |
| Qwen Image LoRA | `/qwen-image-2512-lora` | LoRA file    | Train via `ryla-qwen-lora-training`                     |
| Z-Image LoRA    | `/z-image-lora`         | LoRA file    | Upload LoRA to Modal volume                             |
| Wan2.6 LoRA     | `/wan2.6-lora`          | LoRA file    | Train via `ryla-wan-lora-training`                      |
| Wan2.6 R2V      | `/wan2.6-r2v`           | Video input  | Pass `reference_videos` array                           |
| Video Faceswap  | `/video-faceswap`       | Video URL    | Pass `video_url` with valid video                       |

### Removed Endpoints (Architecturally Incompatible)

The following endpoints were **removed** because they cannot work due to fundamental architecture incompatibilities:

| Removed Endpoint  | Path                 | Reason                                                                     | Alternative       |
| ----------------- | -------------------- | -------------------------------------------------------------------------- | ----------------- |
| Flux InstantID    | `/flux-instantid`    | Flux uses T5XXL+CLIP-L (2816 dim), InstantID expects CLIP-L only (768 dim) | `/sdxl-instantid` |
| Z-Image InstantID | `/z-image-instantid` | Z-Image uses Qwen text encoder, incompatible with InstantID ControlNet     | `/sdxl-instantid` |
| Z-Image PuLID     | `/z-image-pulid`     | Z-Image uses Qwen text encoder, incompatible with PuLID                    | `/flux-pulid`     |

### Recently Fixed

| Endpoint               | Path                     | Status   | Notes                                       |
| ---------------------- | ------------------------ | -------- | ------------------------------------------- |
| Flux IP-Adapter FaceID | `/flux-ipadapter-faceid` | ✅ Ready | Deployed in `ryla-instantid` app            |
| Wan2.1                 | `/wan2`                  | ✅ Ready | Served from `ryla-wan26` app (consolidated) |

---

## Image Generation Endpoints (Detailed)

### Flux Family

| Endpoint         | Steps | Resolution | Cold | Warm     | Warm Cost  | Notes                  |
| ---------------- | ----- | ---------- | ---- | -------- | ---------- | ---------------------- |
| `/flux`          | 4     | 1024×1024  | 58s  | **2.5s** | **$0.001** | Flux Schnell (fastest) |
| `/flux-dev`      | 20    | 1024×1024  | 55s  | **2.5s** | **$0.001** | Flux Dev (quality)     |
| `/flux-dev-lora` | 20    | 1024×1024  | —    | —        | —          | Requires LoRA file     |
| `/flux-lora`     | 20    | 1024×1024  | —    | —        | —          | Requires LoRA file     |

### Face Consistency

| Endpoint                 | Steps | Resolution | Cold | Warm      | Warm Cost  | Notes            |
| ------------------------ | ----- | ---------- | ---- | --------- | ---------- | ---------------- |
| `/flux-pulid`            | 20    | 1024×1024  | 76s  | **13.2s** | **$0.007** | Flux Dev + PuLID |
| `/sdxl-instantid`        | 20    | 1024×1024  | 25s  | **8.9s**  | **$0.005** | SDXL + InstantID |
| `/flux-instantid`        | 20    | 1024×1024  | —    | —         | —          | Not deployed     |
| `/flux-ipadapter-faceid` | 20    | 1024×1024  | —    | —         | —          | Not deployed     |

### Qwen Image

| Endpoint                | Steps | Resolution | Cold | Warm      | Warm Cost  | Notes                    |
| ----------------------- | ----- | ---------- | ---- | --------- | ---------- | ------------------------ |
| `/qwen-image-2512`      | 50    | 1024×1024  | 108s | **49.9s** | **$0.027** | High quality (50 steps)  |
| `/qwen-image-2512-fast` | 4     | 1024×1024  | 36s  | **4.7s**  | **$0.003** | Lightning LoRA (4 steps) |
| `/qwen-image-2512-lora` | 50    | 1024×1024  | —    | —         | —          | Requires LoRA file       |

### Qwen Edit

| Endpoint                   | Steps | Resolution | Cold | Warm      | Warm Cost  | Notes                  |
| -------------------------- | ----- | ---------- | ---- | --------- | ---------- | ---------------------- |
| `/qwen-image-edit-2511`    | 50    | Variable   | 155s | **53.6s** | **$0.029** | Instruction-based edit |
| `/qwen-image-inpaint-2511` | 50    | Variable   | 67s  | **52.9s** | **$0.029** | Mask-based inpainting  |

### Z-Image (Turbo)

| Endpoint             | Steps | Resolution | Cold | Warm     | Warm Cost  | Notes                    |
| -------------------- | ----- | ---------- | ---- | -------- | ---------- | ------------------------ |
| `/z-image-simple`    | 4     | 1024×1024  | 64s  | **3.6s** | **$0.002** | Basic Z-Image-Turbo      |
| `/z-image-danrisi`   | 4     | 1024×1024  | 2.6s | **2.3s** | **$0.001** | RES4LYF (no cold start!) |
| `/z-image-instantid` | 4     | 1024×1024  | —    | —        | —          | Not supported            |
| `/z-image-pulid`     | 4     | 1024×1024  | —    | —        | —          | Not supported            |
| `/z-image-lora`      | 8     | 1024×1024  | —    | —        | —          | Requires LoRA file       |

---

## Video Generation Endpoints

### Wan 2.1

| Endpoint | Steps | Resolution | Frames | Cold | Warm | Warm Cost | Notes                  |
| -------- | ----- | ---------- | ------ | ---- | ---- | --------- | ---------------------- |
| `/wan2`  | 20    | 512×512    | 16     | —    | —    | —         | Split app not deployed |

### Wan 2.6

| Endpoint       | Steps | Resolution | Frames | Cold | Warm     | Warm Cost  | Notes                |
| -------------- | ----- | ---------- | ------ | ---- | -------- | ---------- | -------------------- |
| `/wan2.6`      | 20    | 480×480    | 17     | 43s  | **7.3s** | **$0.004** | Text-to-video        |
| `/wan2.6-r2v`  | 30    | 480×480    | 17     | —    | —        | —          | Requires video input |
| `/wan2.6-lora` | 30    | 480×480    | 17     | —    | —        | —          | Requires LoRA file   |

---

## Upscaling & Post-Processing

| Endpoint   | Scale | Cold | Warm      | Warm Cost  | Notes                     |
| ---------- | ----- | ---- | --------- | ---------- | ------------------------- |
| `/seedvr2` | 2×    | 171s | **38.1s** | **$0.021** | Realistic image upscaling |

---

## Utility Endpoints

| Endpoint             | Method | Est. Time | Est. Cost | Notes                     |
| -------------------- | ------ | --------- | --------- | ------------------------- |
| `/workflow`          | POST   | Varies    | Varies    | Raw ComfyUI workflow JSON |
| `/diagnostics/nodes` | GET    | <1s       | ~$0.0005  | Node loading check        |

---

## LoRA Training (Background Jobs)

These are Modal **functions** (not HTTP endpoints), invoked via SDK.

| Function            | GPU       | Est. Time | Est. Cost  | Notes                         |
| ------------------- | --------- | --------- | ---------- | ----------------------------- |
| `train_lora` (Flux) | A100-80GB | 30–60 min | $1.25–2.50 | 500 steps, Flux LoRA training |
| `train_lora` (Qwen) | A100-80GB | 30–60 min | $1.25–2.50 | Qwen-Image LoRA training      |

---

## Cost Summary by Use Case (Based on Benchmarks)

### Quick Reference (warm container - production usage)

| Use Case                    | Recommended Endpoint       | Warm Time | Warm Cost  | Cold Time |
| --------------------------- | -------------------------- | --------- | ---------- | --------- |
| **Fastest preview**         | `/z-image-danrisi`         | **2.3s**  | **$0.001** | 2.6s      |
| **Fast preview**            | `/flux`                    | **2.5s**  | **$0.001** | 58s       |
| **Quality image**           | `/flux-dev`                | **2.5s**  | **$0.001** | 55s       |
| **Fast hyper-realistic**    | `/qwen-image-2512-fast`    | **4.7s**  | **$0.003** | 36s       |
| **Short video**             | `/wan2.6`                  | **7.3s**  | **$0.004** | 43s       |
| **Face matching (fast)**    | `/sdxl-instantid`          | **8.9s**  | **$0.005** | 25s       |
| **Face matching (quality)** | `/flux-pulid`              | **13.2s** | **$0.007** | 76s       |
| **Hyper-realistic**         | `/qwen-image-2512`         | **49.9s** | **$0.027** | 108s      |
| **Image editing**           | `/qwen-image-edit-2511`    | **53.6s** | **$0.029** | 155s      |
| **Inpainting**              | `/qwen-image-inpaint-2511` | **52.9s** | **$0.029** | 67s       |
| **Upscaling**               | `/seedvr2`                 | **38.1s** | **$0.021** | 171s      |

### Cold Start Impact

| Scenario                           | Added Time     | Added Cost  | Recommendation                            |
| ---------------------------------- | -------------- | ----------- | ----------------------------------------- |
| **First request** (container cold) | +40–150s       | +$0.02–0.08 | Keep containers warm with scheduled pings |
| **Warm container**                 | +0s            | +$0         | Optimal for production                    |
| **Container timeout** (5 min idle) | Resets to cold | —           | Adjust `scaledown_window` if needed       |

### Monthly Cost Projections (Warm Containers)

| Usage Level         | Generations/month         | Avg Cost/Gen | Est. Monthly Cost |
| ------------------- | ------------------------- | ------------ | ----------------- |
| **Light**           | 500 images                | $0.005       | **$2.50**         |
| **Moderate**        | 2,000 images              | $0.010       | **$20**           |
| **Heavy**           | 10,000 images             | $0.015       | **$150**          |
| **Video-heavy**     | 500 videos                | $0.005       | **$2.50**         |
| **Mixed (typical)** | 1,000 images + 100 videos | ~$0.01       | **$11**           |

> Based on warm container measurements. Cold starts add 40-150s per first request.

---

## Factors Affecting Cost

### Increases Cost

- Higher step count (50 vs 4 steps)
- Higher resolution (1328×1328 vs 1024×1024)
- Video (vs image)
- More frames (video length)
- Face consistency methods (InstantID, PuLID, IP-Adapter)
- LoRA loading overhead
- Cold start (first request after idle)

### Reduces Cost

- Lightning/Turbo models (4 steps)
- Lower resolution
- Warm containers (subsequent requests)
- Batch generation in same container

---

## Cold Start Considerations

| Scenario                         | Additional Time | Additional Cost |
| -------------------------------- | --------------- | --------------- |
| **Cold start** (after 5min idle) | +30–60s         | +$0.016–0.033   |
| **Warm container**               | +0s             | +$0.00          |
| **Model loading** (first use)    | +10–30s         | +$0.005–0.016   |

> Container scale-down window: 5 minutes (configurable via `scaledown_window`).

---

## Cost Tracking in API

All endpoints return cost information in response headers:

```
X-Cost-USD: 0.008541
X-Execution-Time-Sec: 15.750
X-GPU-Type: L40S
X-Model: qwen-image-2512
X-Steps: 50
```

### Accessing via Code

```python
response = requests.post(endpoint_url, json=payload)
cost = float(response.headers.get("X-Cost-USD", 0))
time = float(response.headers.get("X-Execution-Time-Sec", 0))
print(f"Cost: ${cost:.4f}, Time: {time:.1f}s")
```

---

## Related Documentation

- Cost tracking implementation: `apps/modal/utils/cost_tracker.py`
- Modal pricing: https://modal.com/pricing
- GPU configuration: `apps/modal/shared/config.py`
- Credit system: `docs/technical/systems/CREDIT-SYSTEM.md`
- ADR-007 (Modal selection): `docs/decisions/ADR-007-modal-over-runpod.md`

---

## Changelog

| Date             | Change                                                          |
| ---------------- | --------------------------------------------------------------- |
| 2026-02-01 18:39 | Updated benchmark with latest cold vs warm data                 |
| 2026-02-01 01:21 | Complete benchmark with cold vs warm times for all 24 endpoints |
| 2026-02-01 00:28 | Added real benchmark data from live endpoint tests              |
| 2026-01-31       | Initial report created with estimates                           |

---

## Benchmark Details

**Last run**: 2026-02-01 18:39 UTC  
**Total benchmark cost**: $0.029  
**Endpoints tested**: 24  
**Successful**: 12 | **Failed**: 12 (LoRA files missing, endpoints not deployed)

### Key Findings

1. **Warm containers are dramatically faster**: 2-54s vs 25-171s cold (up to 96% faster)
2. **Z-Image Danrisi has minimal cold start**: 2.6s cold → 2.3s warm (already optimized)
3. **Flux endpoints are fastest warm**: 2.5s for both Schnell and Dev
4. **Qwen models are slower but higher quality**: 50-54s warm for editing
5. **Video is surprisingly fast warm**: 7.3s for short clips (17 frames)

### Failed Endpoints Summary

- **LoRA endpoints**: Require LoRA files uploaded to Modal volume
- **InstantID variants**: Not deployed or not supported
- **Wan2.1**: Split app not deployed (use Wan2.6 instead)
- **Video Faceswap**: Not deployed

---

## How to Run This Benchmark

**Note:** Due to Modal cold starts, benchmarks take 30-90 minutes. Run in background.

```bash
# Fast benchmark (~3-5 min) - Z-Image + Qwen Fast only
python apps/modal/scripts/benchmark-endpoints.py --fast

# Quick benchmark (~30-60 min) - all endpoints, warm runs only
python apps/modal/scripts/benchmark-endpoints.py --quick

# Full benchmark (~60-90 min) - cold + warm runs for all endpoints
python apps/modal/scripts/benchmark-endpoints.py

# Run in background (recommended for full/quick modes)
nohup python apps/modal/scripts/benchmark-endpoints.py > benchmark.log 2>&1 &
tail -f benchmark.log  # Monitor progress

# Generate test resources
python apps/modal/scripts/benchmark-endpoints.py --generate       # Test image
python apps/modal/scripts/benchmark-endpoints.py --generate-video # Test video (~10 min)

# To enable LoRA endpoints, train a test LoRA first:
modal run apps/modal/apps/lora-training/app.py --character-id=test-benchmark --steps=100
```

### Test Resources

| Resource   | Location                                              | How to Generate                   |
| ---------- | ----------------------------------------------------- | --------------------------------- |
| Test Image | `apps/modal/scripts/test_resources/test_portrait.jpg` | Auto-generated on first run       |
| Test Video | `apps/modal/scripts/test_resources/test_video.mp4`    | `--generate-video` flag           |
| Test LoRA  | Modal volume `/root/models/loras/`                    | Train with LoRA training endpoint |

### Generated Reports

| File                                            | Description                    |
| ----------------------------------------------- | ------------------------------ |
| `apps/modal/docs/status/BENCHMARK-RESULTS.md`   | Human-readable markdown report |
| `apps/modal/docs/status/BENCHMARK-RESULTS.json` | Machine-readable JSON results  |

---

**API Headers**: Use `X-Cost-USD` and `X-Execution-Time-Sec` headers for actual billing values.
