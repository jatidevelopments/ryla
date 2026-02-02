# Modal Endpoint Benchmark Results

**Last Updated:** 2026-02-02  
**Test Method:** Comprehensive endpoint testing with actual generation

## Summary

| Metric              | Value |
| ------------------- | ----- |
| **Total Endpoints** | 21    |
| **Working**         | 21    |
| **Failed**          | 0     |
| **Success Rate**    | 100%  |

---

## All Endpoints (Verified Working)

### ryla-flux

| Endpoint         | Status | Time | Cost   | Output | Notes                  |
| ---------------- | ------ | ---- | ------ | ------ | ---------------------- |
| `/flux`          | ✅     | ~29s | $0.016 | 1.3 MB | Flux Schnell (4 steps) |
| `/flux-dev`      | ✅     | ~37s | $0.020 | 1.1 MB | Flux Dev (20 steps)    |
| `/flux-dev-lora` | ✅     | ~60s | $0.033 | 1.4 MB | Uses custom LoRA       |

### ryla-instantid

| Endpoint                 | Status | Time | Cost   | Output | Notes                    |
| ------------------------ | ------ | ---- | ------ | ------ | ------------------------ |
| `/sdxl-instantid`        | ✅     | ~29s | $0.016 | 1.9 MB | Best face match (85-90%) |
| `/sdxl-turbo`            | ✅     | ~45s | $0.024 | 2.3 MB | Fast 1-4 step            |
| `/sdxl-lightning`        | ✅     | ~66s | $0.036 | 1.4 MB | ByteDance 4-step         |
| `/flux-pulid`            | ✅     | ~83s | $0.045 | 1.2 MB | PuLID face consistency   |
| `/flux-ipadapter-faceid` | ✅     | ~60s | $0.033 | 53 KB  | XLabs IP-Adapter v2      |

### ryla-qwen-image

| Endpoint                | Status | Time  | Cost   | Output | Notes                    |
| ----------------------- | ------ | ----- | ------ | ------ | ------------------------ |
| `/qwen-image-2512`      | ✅     | ~103s | $0.056 | 1.9 MB | High quality (50 steps)  |
| `/qwen-image-2512-fast` | ✅     | ~73s  | $0.040 | 2.2 MB | Lightning LoRA (4 steps) |
| `/qwen-image-2512-lora` | ✅     | ~143s | $0.078 | 1.9 MB | Custom character LoRA    |
| `/video-faceswap`       | ✅     | ~85s  | $0.046 | 38 KB  | ReActor (requires MP4)   |

### ryla-qwen-edit

| Endpoint                   | Status | Time | Cost   | Output | Notes                  |
| -------------------------- | ------ | ---- | ------ | ------ | ---------------------- |
| `/qwen-image-edit-2511`    | ✅     | ~54s | $0.029 | 1.1 MB | Instruction-based edit |
| `/qwen-image-inpaint-2511` | ✅     | ~53s | $0.029 | 230 KB | Mask-based inpainting  |

### ryla-z-image

| Endpoint           | Status | Time | Cost   | Output | Notes              |
| ------------------ | ------ | ---- | ------ | ------ | ------------------ |
| `/z-image-simple`  | ✅     | ~51s | $0.028 | 1.2 MB | Z-Image Turbo      |
| `/z-image-danrisi` | ✅     | ~6s  | $0.003 | 1.2 MB | Minimal cold start |
| `/z-image-lora`    | ✅     | ~29s | $0.016 | 102 KB | Uses custom LoRA   |

### ryla-wan26

| Endpoint       | Status | Time | Cost   | Output | Notes                     |
| -------------- | ------ | ---- | ------ | ------ | ------------------------- |
| `/wan2.6`      | ✅     | ~29s | $0.016 | 646 KB | Text-to-video             |
| `/wan2.6-lora` | ✅     | ~47s | $0.025 | 240 KB | Video with LoRA           |
| `/wan2.6-r2v`  | ⏸️     | -    | -      | -      | Requires reference videos |

### ryla-seedvr2

| Endpoint   | Status | Time  | Cost   | Output | Notes              |
| ---------- | ------ | ----- | ------ | ------ | ------------------ |
| `/seedvr2` | ✅     | ~208s | $0.113 | 1.5 MB | 2x image upscaling |

---

## Removed Endpoints

| Endpoint             | Reason                    | Alternative       |
| -------------------- | ------------------------- | ----------------- |
| `/wan2`              | Wan 2.1 deprecated        | `/wan2.6`         |
| `/flux-instantid`    | Architecture incompatible | `/sdxl-instantid` |
| `/z-image-instantid` | Encoder incompatible      | `/sdxl-instantid` |
| `/z-image-pulid`     | Encoder incompatible      | `/flux-pulid`     |

---

## Cost Rankings

### Cheapest Endpoints

1. `/z-image-danrisi` - **$0.003** (~6s)
2. `/flux` - **$0.016** (~29s)
3. `/wan2.6` - **$0.016** (~29s)
4. `/sdxl-instantid` - **$0.016** (~29s)
5. `/z-image-lora` - **$0.016** (~29s)

### Most Expensive Endpoints

1. `/seedvr2` - **$0.113** (~208s)
2. `/qwen-image-2512-lora` - **$0.078** (~143s)
3. `/qwen-image-2512` - **$0.056** (~103s)
4. `/video-faceswap` - **$0.046** (~85s)
5. `/flux-pulid` - **$0.045** (~83s)

---

## Speed Rankings

### Fastest Endpoints

1. `/z-image-danrisi` - **~6s**
2. `/flux` - **~29s**
3. `/wan2.6` - **~29s**
4. `/sdxl-instantid` - **~29s**
5. `/z-image-lora` - **~29s**

### Slowest Endpoints

1. `/seedvr2` - **~208s**
2. `/qwen-image-2512-lora` - **~143s**
3. `/qwen-image-2512` - **~103s**
4. `/video-faceswap` - **~85s**
5. `/flux-pulid` - **~83s**

---

## Video Faceswap Notes

- **Input format**: Must be MP4 (animated WEBP not supported)
- **Processing**: Uses ReActor + GFPGAN for face restoration
- **Time**: ~1-2s per frame
- **Output**: MP4 video with swapped faces

---

## How to Run Benchmark

```bash
# Fast benchmark (~3-5 min)
python apps/modal/scripts/benchmark-endpoints.py --fast

# Quick benchmark (~30-60 min)
python apps/modal/scripts/benchmark-endpoints.py --quick

# Full benchmark (~60-90 min)
python apps/modal/scripts/benchmark-endpoints.py
```

---

## Related Documentation

- Cost Report: `docs/technical/infrastructure/MODAL-ENDPOINT-COST-REPORT.md`
- Endpoint Mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Recommendations: `docs/technical/infrastructure/MODAL-NEW-ENDPOINTS-RECOMMENDATION.md`

---

_Report generated 2026-02-02_
