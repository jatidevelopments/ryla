# Modal Endpoint Generation Time & Cost Report

**Last Benchmarked**: 2026-02-02 14:30 UTC  
**GPU Default**: L40S ($1.95/hr)  
**Pricing Source**: Modal.com (as of 2026-02-02)

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

## Benchmarked Results (2026-02-02)

**Total endpoints**: 21 working  
**All endpoints tested and verified**

### Image Generation

| Endpoint            | Path                    | Time (s) | Cost ($) | Output Size | Status |
| ------------------- | ----------------------- | -------- | -------- | ----------- | ------ |
| **Flux Schnell**    | `/flux`                 | ~29      | $0.016   | 1.3 MB      | ✅     |
| **Flux Dev**        | `/flux-dev`             | ~37      | $0.020   | 1.1 MB      | ✅     |
| **Flux Dev LoRA**   | `/flux-dev-lora`        | ~60      | $0.033   | 1.4 MB      | ✅     |
| **SDXL Turbo**      | `/sdxl-turbo`           | ~45      | $0.024   | 2.3 MB      | ✅     |
| **SDXL Lightning**  | `/sdxl-lightning`       | ~66      | $0.036   | 1.4 MB      | ✅     |
| **Qwen Image**      | `/qwen-image-2512`      | ~103     | $0.056   | 1.9 MB      | ✅     |
| **Qwen Image Fast** | `/qwen-image-2512-fast` | ~73      | $0.040   | 2.2 MB      | ✅     |
| **Qwen Image LoRA** | `/qwen-image-2512-lora` | ~143     | $0.078   | 1.9 MB      | ✅     |
| **Z-Image Simple**  | `/z-image-simple`       | ~51      | $0.028   | 1.2 MB      | ✅     |
| **Z-Image Danrisi** | `/z-image-danrisi`      | ~6       | $0.003   | 1.2 MB      | ✅     |
| **Z-Image LoRA**    | `/z-image-lora`         | ~29      | $0.016   | 102 KB      | ✅     |

### Face Consistency

| Endpoint            | Path                     | Time (s) | Cost ($) | Output Size | Status |
| ------------------- | ------------------------ | -------- | -------- | ----------- | ------ |
| **SDXL InstantID**  | `/sdxl-instantid`        | ~29      | $0.016   | 1.9 MB      | ✅     |
| **Flux PuLID**      | `/flux-pulid`            | ~83      | $0.045   | 1.2 MB      | ✅     |
| **Flux IP-Adapter** | `/flux-ipadapter-faceid` | ~60      | $0.033   | 53 KB       | ✅     |

### Video Generation

| Endpoint           | Path              | Time (s) | Cost ($) | Output Size | Status |
| ------------------ | ----------------- | -------- | -------- | ----------- | ------ |
| **Wan 2.6**        | `/wan2.6`         | ~29      | $0.016   | 646 KB      | ✅     |
| **Wan 2.6 LoRA**   | `/wan2.6-lora`    | ~47      | $0.025   | 240 KB      | ✅     |
| **Video Faceswap** | `/video-faceswap` | ~85      | $0.046   | 38 KB       | ✅     |

### Upscaling

| Endpoint    | Path       | Time (s) | Cost ($) | Output Size | Status |
| ----------- | ---------- | -------- | -------- | ----------- | ------ |
| **SeedVR2** | `/seedvr2` | ~208     | $0.113   | 1.5 MB      | ✅     |

---

## Endpoints by Category

### Primary Text-to-Image

| Use Case            | Endpoint                | Steps | Quality | Speed  | Cost   |
| ------------------- | ----------------------- | ----- | ------- | ------ | ------ |
| **Fastest preview** | `/z-image-danrisi`      | 4     | Good    | ⚡⚡⚡ | $0.003 |
| **Fast quality**    | `/qwen-image-2512-fast` | 4     | High    | ⚡⚡   | $0.040 |
| **Best quality**    | `/qwen-image-2512`      | 50    | Highest | ⚡     | $0.056 |
| **General purpose** | `/flux-dev`             | 20    | High    | ⚡⚡   | $0.020 |

### Face Consistency

| Use Case            | Endpoint                 | Face Match | Speed | Cost   |
| ------------------- | ------------------------ | ---------- | ----- | ------ |
| **Best face match** | `/sdxl-instantid`        | 85-90%     | ⚡⚡  | $0.016 |
| **Flux + face**     | `/flux-pulid`            | 80-85%     | ⚡    | $0.045 |
| **Alternative**     | `/flux-ipadapter-faceid` | 75-80%     | ⚡⚡  | $0.033 |

### SDXL (No Face)

| Use Case         | Endpoint          | Steps | Speed  | Cost   |
| ---------------- | ----------------- | ----- | ------ | ------ |
| **Ultra fast**   | `/sdxl-turbo`     | 1-4   | ⚡⚡⚡ | $0.024 |
| **Fast quality** | `/sdxl-lightning` | 4     | ⚡⚡⚡ | $0.036 |

### Video

| Use Case            | Endpoint          | Duration  | Speed | Cost   |
| ------------------- | ----------------- | --------- | ----- | ------ |
| **Text-to-video**   | `/wan2.6`         | 17 frames | ⚡⚡  | $0.016 |
| **Character video** | `/wan2.6-lora`    | 17 frames | ⚡⚡  | $0.025 |
| **Face swap**       | `/video-faceswap` | Variable  | ⚡    | $0.046 |

---

## Cost Summary by Use Case

### Quick Reference (Production Usage)

| Use Case                    | Recommended Endpoint    | Time (s) | Cost ($)   |
| --------------------------- | ----------------------- | -------- | ---------- |
| **Fastest preview**         | `/z-image-danrisi`      | ~6       | **$0.003** |
| **Fast preview**            | `/flux`                 | ~29      | **$0.016** |
| **Quality image**           | `/flux-dev`             | ~37      | **$0.020** |
| **Fast hyper-realistic**    | `/qwen-image-2512-fast` | ~73      | **$0.040** |
| **Short video**             | `/wan2.6`               | ~29      | **$0.016** |
| **Face matching (fast)**    | `/sdxl-instantid`       | ~29      | **$0.016** |
| **Face matching (quality)** | `/flux-pulid`           | ~83      | **$0.045** |
| **Hyper-realistic**         | `/qwen-image-2512`      | ~103     | **$0.056** |
| **Video faceswap**          | `/video-faceswap`       | ~85      | **$0.046** |
| **Upscaling**               | `/seedvr2`              | ~208     | **$0.113** |

### Monthly Cost Projections

| Usage Level         | Generations/month         | Avg Cost/Gen | Est. Monthly Cost |
| ------------------- | ------------------------- | ------------ | ----------------- |
| **Light**           | 500 images                | $0.020       | **$10**           |
| **Moderate**        | 2,000 images              | $0.030       | **$60**           |
| **Heavy**           | 10,000 images             | $0.025       | **$250**          |
| **Video-heavy**     | 500 videos                | $0.025       | **$12.50**        |
| **Mixed (typical)** | 1,000 images + 100 videos | ~$0.025      | **$27.50**        |

---

## Removed Endpoints

| Removed Endpoint     | Reason                                        | Alternative       |
| -------------------- | --------------------------------------------- | ----------------- |
| `/wan2`              | Wan 2.1 deprecated, model not included        | `/wan2.6`         |
| `/flux-instantid`    | Architecturally incompatible (shape mismatch) | `/sdxl-instantid` |
| `/z-image-instantid` | Qwen text encoder incompatible                | `/sdxl-instantid` |
| `/z-image-pulid`     | Qwen text encoder incompatible                | `/flux-pulid`     |

---

## Cost Tracking in API

All endpoints return cost information in response headers:

```
X-Cost-USD: 0.016541
X-Execution-Time-Sec: 30.500
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

## How to Run Benchmark

```bash
# Fast benchmark (~3-5 min) - Z-Image + Qwen Fast only
python apps/modal/scripts/benchmark-endpoints.py --fast

# Quick benchmark (~30-60 min) - all endpoints, warm runs only
python apps/modal/scripts/benchmark-endpoints.py --quick

# Full benchmark (~60-90 min) - cold + warm runs for all endpoints
python apps/modal/scripts/benchmark-endpoints.py

# Run in background (recommended for full/quick modes)
nohup python apps/modal/scripts/benchmark-endpoints.py > benchmark.log 2>&1 &
```

### Generated Reports

| File                                            | Description                    |
| ----------------------------------------------- | ------------------------------ |
| `apps/modal/docs/status/BENCHMARK-RESULTS.md`   | Human-readable markdown report |
| `apps/modal/docs/status/BENCHMARK-RESULTS.json` | Machine-readable JSON results  |

---

## Related Documentation

- Endpoint mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Cost tracking implementation: `apps/modal/utils/cost_tracker.py`
- Modal pricing: https://modal.com/pricing
- GPU configuration: `apps/modal/shared/config.py`

---

## Changelog

| Date             | Change                                           |
| ---------------- | ------------------------------------------------ |
| 2026-02-02 14:30 | All 21 endpoints verified working, /wan2 removed |
| 2026-02-01 18:39 | Updated benchmark with cold vs warm data         |
| 2026-02-01 01:21 | Complete benchmark with cold vs warm times       |
| 2026-01-31       | Initial report created                           |
